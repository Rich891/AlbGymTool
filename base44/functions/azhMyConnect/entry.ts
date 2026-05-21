import { createClientFromRequest } from 'npm:@base44/sdk@0.8.30';

const DEFAULT_BASE_URL = 'https://myconnect.azh-myyolo.info';

function getConfig() {
  const baseUrl = (Deno.env.get('AZH_MYCONNECT_BASE_URL') || DEFAULT_BASE_URL).replace(/\/$/, '');
  const version = Deno.env.get('AZH_MYCONNECT_VERSION') || '1';
  const username = Deno.env.get('AZH_MYCONNECT_USERNAME');
  const password = Deno.env.get('AZH_MYCONNECT_PASSWORD');

  if (!username || !password) {
    throw new Error('AZH myConnect ist noch nicht konfiguriert. Bitte AZH_MYCONNECT_USERNAME und AZH_MYCONNECT_PASSWORD als Base44 Function Secrets setzen.');
  }

  return { baseUrl, version, username, password };
}

function authHeader(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

async function myConnectRequest(path: string, options: { method?: string; body?: unknown } = {}) {
  const { baseUrl, version, username, password } = getConfig();
  const url = `${baseUrl}/api/v${version}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: authHeader(username, password),
  };

  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`myConnect ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function toAzhGender(value = '') {
  const normalized = String(value).toLowerCase();
  if (normalized.startsWith('m')) return 'm';
  if (normalized.startsWith('w')) return 'w';
  if (normalized.startsWith('d')) return 'd';
  return null;
}

function toAzhDate(value = '') {
  if (!value) return null;
  return `${String(value).slice(0, 10)}T00:00:00`;
}

function normalizeDigits(value = '') {
  return String(value || '').replace(/\D/g, '');
}

function normalizeInsuranceNumber(value = '') {
  return String(value || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function mapCustomerToPerson(customer: Record<string, any>, existingGuid?: string) {
  return {
    Guid: existingGuid || customer.azh_person_guid || undefined,
    Aktiv: true,
    Kundennummer: customer.azh_customer_number || 0,
    Vorname: customer.first_name || '',
    Nachname: customer.last_name || '',
    Geb_Datum: toAzhDate(customer.birthdate),
    Geschlecht: toAzhGender(customer.gender),
    PLZ: customer.postal_code || '',
    Ort: customer.city || '',
    StrasseNr: customer.street || customer.address || '',
    Telefon_1: customer.phone || '',
    Telefon_2: '',
    Mobil: customer.mobile || '',
    EMail: customer.email || '',
    Versichertennummer: normalizeInsuranceNumber(customer.insurance_number),
    Kostentraegernummer: normalizeDigits(customer.cost_carrier_number),
    Kartennummer: customer.card_number || '',
    MagicLineCustomerID: customer.magicline_customer_id || '0',
  };
}

function buildPersonQuery(customer: Record<string, any>) {
  return {
    Guids: customer.azh_person_guid ? [customer.azh_person_guid] : null,
    Kundennummern: customer.azh_customer_number ? [Number(customer.azh_customer_number)] : null,
    Nachnamen: customer.last_name ? [customer.last_name] : null,
    PLZs: customer.postal_code ? [customer.postal_code] : null,
    Orte: customer.city ? [customer.city] : null,
    Kostentraegernummern: customer.cost_carrier_number ? [normalizeDigits(customer.cost_carrier_number)] : null,
    MagicLineCustomerIDs: customer.magicline_customer_id ? [String(customer.magicline_customer_id)] : null,
    ZuletzGeaendertTimestampUTCAb: null,
  };
}

function dateOnly(value = '') {
  return String(value || '').slice(0, 10);
}

function exactMatchScore(customer: Record<string, any>, person: Record<string, any>) {
  let score = 0;
  if (customer.azh_person_guid && person.Guid === customer.azh_person_guid) score += 10;
  if (customer.first_name && person.Vorname?.toLowerCase() === String(customer.first_name).toLowerCase()) score += 2;
  if (customer.last_name && person.Nachname?.toLowerCase() === String(customer.last_name).toLowerCase()) score += 3;
  if (customer.birthdate && dateOnly(person.Geb_Datum) === dateOnly(customer.birthdate)) score += 4;
  if (customer.postal_code && person.PLZ === customer.postal_code) score += 1;
  if (customer.insurance_number && normalizeInsuranceNumber(person.Versichertennummer) === normalizeInsuranceNumber(customer.insurance_number)) score += 5;
  return score;
}

async function findExistingPersons(customer: Record<string, any>) {
  const result: any = await myConnectRequest('/personsBulkQuery', {
    method: 'POST',
    body: buildPersonQuery(customer),
  });
  const candidates = Array.isArray(result?.ResData) ? result.ResData : [];
  const ranked = candidates
    .map((person: Record<string, any>) => ({ person, score: exactMatchScore(customer, person) }))
    .sort((a, b) => b.score - a.score);
  const exactMatches = ranked.filter(item => item.score >= 7);
  return { raw: result, candidates: ranked, exactMatches };
}

async function syncCustomer(base44: any, input: Record<string, any>) {
  const customer = input.customerId
    ? await base44.asServiceRole.entities.Customer.get(input.customerId)
    : input.customer;

  if (!customer?.first_name || !customer?.last_name) {
    throw new Error('Vorname und Nachname sind fuer den myConnect-Sync erforderlich.');
  }

  const search = await findExistingPersons(customer);
  if (!customer.azh_person_guid && search.exactMatches.length > 1) {
    if (customer.id) {
      await base44.asServiceRole.entities.Customer.update(customer.id, {
        azh_sync_status: 'conflict',
        azh_last_sync_at: new Date().toISOString(),
      });
    }
    return { status: 'conflict', search };
  }

  const existingGuid = customer.azh_person_guid || search.exactMatches[0]?.person?.Guid;
  const personPayload = mapCustomerToPerson(customer, existingGuid);
  const result: any = await myConnectRequest('/persons', {
    method: 'POST',
    body: personPayload,
  });

  const syncedPerson = result?.ResData || result;
  if (customer.id) {
    await base44.asServiceRole.entities.Customer.update(customer.id, {
      azh_person_guid: syncedPerson?.Guid || existingGuid,
      azh_sync_status: result?.StatusText === 'OK' || result?.Status === 0 ? 'synced' : 'error',
      azh_last_sync_at: new Date().toISOString(),
    });
  }

  return { status: 'synced', result, search };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'configStatus') {
      const hasUsername = Boolean(Deno.env.get('AZH_MYCONNECT_USERNAME'));
      const hasPassword = Boolean(Deno.env.get('AZH_MYCONNECT_PASSWORD'));
      return Response.json({
        configured: hasUsername && hasPassword,
        baseUrl: Deno.env.get('AZH_MYCONNECT_BASE_URL') || DEFAULT_BASE_URL,
        version: Deno.env.get('AZH_MYCONNECT_VERSION') || '1',
      });
    }

    if (action === 'queryPersons') {
      const result = await myConnectRequest('/personsBulkQuery', {
        method: 'POST',
        body: body.query,
      });
      return Response.json({ result });
    }

    if (action === 'findCustomer') {
      const search = await findExistingPersons(body.customer);
      return Response.json(search);
    }

    if (action === 'upsertPerson') {
      const result = await myConnectRequest('/persons', {
        method: 'POST',
        body: body.person,
      });
      return Response.json({ result });
    }

    if (action === 'syncCustomer') {
      const result = await syncCustomer(base44, body);
      return Response.json(result);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
});
