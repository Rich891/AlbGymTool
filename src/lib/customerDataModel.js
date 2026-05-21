import { createEntity, safeFilterEntity, updateEntity } from '@/lib/entityGateway';

const EMPTY_VALUES = new Set([undefined, null, '']);

function cleanText(value) {
  if (EMPTY_VALUES.has(value)) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function compactObject(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (EMPTY_VALUES.has(value)) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
  );
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

export function splitFullName(fullName = '') {
  const parts = cleanText(fullName).split(' ').filter(Boolean);
  if (parts.length === 0) return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  };
}

export function joinCustomerName(customer = {}) {
  return cleanText(
    customer.customer_name ||
    `${customer.first_name || ''} ${customer.last_name || ''}`
  );
}

export function normalizeInsuranceNumber(value = '') {
  const clean = cleanText(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!clean) return '';
  const letter = clean[0]?.replace(/[^A-Z]/g, '') || '';
  const digits = clean.slice(1).replace(/\D/g, '').slice(0, 9);
  if (!letter) return digits;
  return [letter, digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(' ');
}

export function normalizeDate(value = '') {
  const raw = cleanText(value);
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
  if (!match) return raw;

  const [, day, month, year] = match;
  let fullYear = year;
  if (year.length === 2) {
    const yearNumber = Number(year);
    const currentYear = new Date().getFullYear() % 100;
    fullYear = `${yearNumber > currentYear + 5 ? 1900 + yearNumber : 2000 + yearNumber}`;
  }
  return `${fullYear.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function normalizeGender(value = '') {
  const raw = cleanText(value).toLowerCase();
  if (!raw) return '';
  if (['m', 'mann', 'maennlich', 'mannlich', 'm\u00e4nnlich'].includes(raw)) return 'm\u00e4nnlich';
  if (['w', 'frau', 'weiblich'].includes(raw)) return 'weiblich';
  if (raw.includes('div')) return 'divers';
  return raw;
}

export function combineAddress({ address, street, postal_code, city } = {}) {
  const direct = cleanText(address);
  if (direct) return direct;
  return [cleanText(street), [cleanText(postal_code), cleanText(city)].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
}

export function calculateDataQualityScore(customer = {}) {
  const fields = [
    'first_name',
    'last_name',
    'birthdate',
    'gender',
    'address',
    'phone',
    'email',
    'health_insurance',
    'insurance_number',
  ];
  const filled = fields.filter(field => cleanText(customer[field])).length;
  return Math.round((filled / fields.length) * 100);
}

export function buildUnifiedCustomerPayload(input = {}, { source = 'manual', sourceSystem = 'albgym' } = {}) {
  const nameParts = splitFullName(input.customer_name || input.name);
  const firstName = cleanText(input.first_name || nameParts.first_name);
  const lastName = cleanText(input.last_name || nameParts.last_name);
  const address = combineAddress(input);
  const insuranceNumber = normalizeInsuranceNumber(input.insurance_number || input.versichertennummer);
  const payload = compactObject({
    customer_name: cleanText(input.customer_name || `${firstName} ${lastName}`),
    first_name: firstName,
    last_name: lastName,
    birthdate: normalizeDate(input.birthdate || input.date_of_birth),
    gender: normalizeGender(input.gender),
    phone: cleanText(input.phone),
    email: cleanText(input.email).toLowerCase(),
    address,
    street: cleanText(input.street),
    postal_code: cleanText(input.postal_code),
    city: cleanText(input.city),
    health_insurance: cleanText(input.health_insurance),
    insurance_number: insuranceNumber,
    cost_carrier_number: cleanText(input.cost_carrier_number),
    insured_status: cleanText(input.insured_status),
    customer_status: input.customer_status || 'lead',
    customer_source: source,
    source_systems: unique([sourceSystem, ...(input.source_systems || [])]),
    active_lead_id: input.active_lead_id,
    last_prescription_scan_id: input.last_prescription_scan_id,
    last_rehasport_consultation_id: input.last_rehasport_consultation_id,
    azh_person_guid: input.azh_person_guid,
    azh_sync_status: input.azh_sync_status || 'not_started',
    azh_last_sync_at: input.azh_last_sync_at,
    consent_health: input.consent_health,
    consent_prescription_scan: input.consent_prescription_scan,
    notes: cleanText(input.notes),
  });

  return {
    ...payload,
    data_quality_score: calculateDataQualityScore(payload),
  };
}

export function buildCustomerPayloadFromPrescription(prescription = {}) {
  return buildUnifiedCustomerPayload({
    first_name: prescription.patient_first_name,
    last_name: prescription.patient_last_name,
    birthdate: prescription.birthdate,
    gender: prescription.gender,
    street: prescription.street,
    postal_code: prescription.postal_code,
    city: prescription.city,
    address: prescription.address,
    phone: prescription.phone,
    email: prescription.email,
    health_insurance: prescription.health_insurance,
    insurance_number: prescription.insurance_number,
    cost_carrier_number: prescription.cost_carrier_number,
    insured_status: prescription.insured_status,
    customer_status: 'lead',
    azh_sync_status: 'not_started',
    consent_health: true,
    consent_prescription_scan: true,
  }, {
    source: 'prescription_scan',
    sourceSystem: 'prescription_intake',
  });
}

export function buildRehasportConsultationFromPrescription({ customer, prescription, prescriptionScanId }) {
  return compactObject({
    customer_id: customer?.id,
    customer_name: joinCustomerName(customer),
    birthdate: customer?.birthdate || normalizeDate(prescription.birthdate),
    gender: customer?.gender || normalizeGender(prescription.gender),
    address: customer?.address || combineAddress(prescription),
    email: customer?.email || cleanText(prescription.email).toLowerCase(),
    phone: customer?.phone || cleanText(prescription.phone),
    health_insurance: customer?.health_insurance || cleanText(prescription.health_insurance),
    insurance_number: customer?.insurance_number || normalizeInsuranceNumber(prescription.insurance_number),
    cost_carrier_number: cleanText(prescription.cost_carrier_number),
    insured_status: cleanText(prescription.insured_status),
    prescription_scan_id: prescriptionScanId,
    prescription_status: 'scan_saved',
    prescription_date: normalizeDate(prescription.prescription_date),
    prescription_valid_from: normalizeDate(prescription.valid_from),
    prescription_valid_to: normalizeDate(prescription.valid_to),
    form_type: cleanText(prescription.form_type),
    form_number: cleanText(prescription.form_number),
    form_version: cleanText(prescription.form_version),
    practice_site_number: cleanText(prescription.practice_site_number),
    doctor_number: cleanText(prescription.doctor_number),
    prescribed_units: Number(prescription.prescribed_units) || undefined,
    duration_months: Number(prescription.duration_months) || undefined,
    prescription_frequency: cleanText(prescription.frequency),
    prescribed_service: cleanText(prescription.prescribed_service),
    sport_type: cleanText(prescription.sport_type),
    functional_training_type: cleanText(prescription.functional_training_type),
    diagnosis_text: cleanText(prescription.diagnosis_text),
    icd_codes: Array.isArray(prescription.icd_codes) ? prescription.icd_codes.filter(Boolean) : [],
    impairment_text: cleanText(prescription.impairment_text),
    rehab_goal: cleanText(prescription.rehab_goal),
    follow_up_prescription: Boolean(prescription.follow_up_prescription),
    follow_up_reason: cleanText(prescription.follow_up_reason),
    prf_number: cleanText(prescription.prf_number),
    physician_name: cleanText(prescription.physician_name),
    physician_lanr: cleanText(prescription.physician_lanr),
    status: 'rezept_erfasst',
    notes: cleanText(prescription.notes),
  });
}

export function buildPrescriptionScanPayload({ customer, rehasportConsultation, prescription, fileMeta, extraction }) {
  return compactObject({
    customer_id: customer?.id,
    rehasport_consultation_id: rehasportConsultation?.id,
    customer_name: joinCustomerName(customer),
    file_name: fileMeta?.file_name,
    file_type: fileMeta?.file_type,
    file_size: fileMeta?.file_size,
    file_uri: fileMeta?.file_uri,
    file_url: fileMeta?.file_url,
    storage_mode: fileMeta?.storage_mode || 'private',
    extraction_mode: extraction?.url_mode || fileMeta?.extraction_mode,
    extraction_status: extraction?.status || 'manual_review',
    extraction_confidence: extraction?.confidence || 'needs_review',
    extracted_data: prescription,
    raw_extraction: extraction?.raw || null,
    verified_data: prescription,
    prescription_date: normalizeDate(prescription.prescription_date),
    health_insurance: cleanText(prescription.health_insurance),
    insurance_number: normalizeInsuranceNumber(prescription.insurance_number),
    cost_carrier_number: cleanText(prescription.cost_carrier_number),
    insured_status: cleanText(prescription.insured_status),
    form_type: cleanText(prescription.form_type),
    form_number: cleanText(prescription.form_number),
    form_version: cleanText(prescription.form_version),
    practice_site_number: cleanText(prescription.practice_site_number),
    doctor_number: cleanText(prescription.doctor_number),
    diagnosis_text: cleanText(prescription.diagnosis_text),
    icd_codes: Array.isArray(prescription.icd_codes) ? prescription.icd_codes.filter(Boolean) : [],
    impairment_text: cleanText(prescription.impairment_text),
    rehab_goal: cleanText(prescription.rehab_goal),
    prescribed_units: Number(prescription.prescribed_units) || undefined,
    duration_months: Number(prescription.duration_months) || undefined,
    prescribed_service: cleanText(prescription.prescribed_service),
    sport_type: cleanText(prescription.sport_type),
    functional_training_type: cleanText(prescription.functional_training_type),
    follow_up_prescription: Boolean(prescription.follow_up_prescription),
    follow_up_reason: cleanText(prescription.follow_up_reason),
    prf_number: cleanText(prescription.prf_number),
    azh_sync_status: 'not_started',
    status: 'verified',
  });
}

function stripEntityMetadata(record = {}) {
  const {
    id,
    created_date,
    updated_date,
    created_by,
    updated_by,
    ...rest
  } = record;
  return rest;
}

function mergeCustomerData(existing = {}, incoming = {}) {
  const merged = {
    ...stripEntityMetadata(existing),
    ...compactObject(incoming),
    source_systems: unique([...(existing.source_systems || []), ...(incoming.source_systems || [])]),
  };
  merged.data_quality_score = calculateDataQualityScore(merged);
  return merged;
}

export async function findMatchingCustomers(base44, customerDraft) {
  const queries = [];

  if (customerDraft.insurance_number) {
    queries.push({ insurance_number: customerDraft.insurance_number });
  }
  if (customerDraft.email) {
    queries.push({ email: customerDraft.email });
  }
  if (customerDraft.phone) {
    queries.push({ phone: customerDraft.phone });
  }
  if (customerDraft.first_name && customerDraft.last_name && customerDraft.birthdate) {
    queries.push({
      first_name: customerDraft.first_name,
      last_name: customerDraft.last_name,
      birthdate: customerDraft.birthdate,
    });
  }

  for (const query of queries) {
    const matches = await safeFilterEntity(base44, 'Customer', query, '-created_date', 5);
    if (matches.length > 0) return matches;
  }

  return [];
}

export async function upsertUnifiedCustomer(base44, customerDraft, { existingCustomerId } = {}) {
  if (!customerDraft.first_name || !customerDraft.last_name) {
    throw new Error('Vorname und Nachname sind fuer die Kundendatei erforderlich.');
  }

  if (existingCustomerId) {
    const updated = await updateEntity(base44, 'Customer', existingCustomerId, customerDraft);
    return { customer: updated, created: false, matchedBy: 'selected_customer' };
  }

  const matches = await findMatchingCustomers(base44, customerDraft);
  const existing = matches[0];

  if (existing?.id) {
    const updated = await updateEntity(base44, 'Customer', existing.id, mergeCustomerData(existing, customerDraft));
    return { customer: updated, created: false, matchedBy: 'identity_match' };
  }

  const created = await createEntity(base44, 'Customer', customerDraft);
  return { customer: created, created: true, matchedBy: 'new_customer' };
}
