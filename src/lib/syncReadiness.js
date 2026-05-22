/**
 * Sync-Readiness-Logik fuer Personen-Cockpit (Phase 4).
 *
 * Reine Funktionen - kein Side-Effect, keine echten API-Calls.
 * Bewertet, ob ein Customer-Datensatz bereit fuer den jeweiligen Zielsystem-Sync ist,
 * und erzeugt Badge-Informationen fuer die UI.
 */

/**
 * Zielsysteme fuer spaetere Synchronisation.
 * @readonly
 * @enum {string}
 */
export const SYNC_TARGET_SYSTEMS = Object.freeze({
  AZH: 'azh',
  THEMISOFT: 'themisoft',
  MYYOLO: 'myyolo',
});

/**
 * Menschenlesbare Labels fuer Customer-Felder (fuer Blocker-Listen + Tooltips).
 * @readonly
 */
const FIELD_LABELS = Object.freeze({
  customer_name: 'Name',
  birthdate: 'Geburtsdatum',
  insurance_number: 'Versichertennummer',
  health_insurance: 'Krankenkasse',
  street: 'Strasse',
  postal_code: 'PLZ',
  city: 'Ort',
  email: 'E-Mail',
  phone: 'Telefon',
  contact_email_or_phone: 'E-Mail oder Telefon',
  privacy_consent: 'Datenschutz-Einwilligung',
  data_quality_score: 'Datenqualitaet',
  last_prescription_scan_id: 'Rezeptscan',
});

/**
 * Pflichtfelder je Zielsystem. Spezialeintraege:
 *  - `__min_data_quality__:N` -> data_quality_score muss >= N sein
 *  - `__contact_email_or_phone__` -> email ODER phone muss vorhanden sein
 * @readonly
 */
export const SYNC_REQUIRED_FIELDS_BY_SYSTEM = Object.freeze({
  [SYNC_TARGET_SYSTEMS.AZH]: Object.freeze([
    'customer_name',
    'birthdate',
    'insurance_number',
    'health_insurance',
    'street',
    'privacy_consent',
  ]),
  [SYNC_TARGET_SYSTEMS.THEMISOFT]: Object.freeze([
    'customer_name',
    'street',
    'postal_code',
    'city',
    '__contact_email_or_phone__',
    '__min_data_quality__:60',
  ]),
  [SYNC_TARGET_SYSTEMS.MYYOLO]: Object.freeze([
    'customer_name',
    'birthdate',
    'insurance_number',
    'health_insurance',
    'street',
    'privacy_consent',
    'last_prescription_scan_id',
  ]),
});

/**
 * Sync-Status-Werte, die als "Sync ist explizit am Laufen / abgeschlossen / fehlgeschlagen"
 * interpretiert werden und damit die Readiness-Heuristik ueberstimmen.
 * @readonly
 */
const EXPLICIT_STATUS_MAP = Object.freeze({
  pending: 'syncing',
  ready: 'ready',
  sent: 'syncing',
  synced: 'synced',
  conflict: 'failed',
  error: 'failed',
  blocked_missing_data: 'blocked',
});

/**
 * Pruefen, ob ein Customer-Feldwert als vorhanden zaehlt.
 * @param {*} value
 * @returns {boolean}
 */
function hasValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'boolean') return value === true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

/**
 * Liefert das menschenlesbare Label fuer einen Feldnamen.
 * @param {string} field
 * @returns {string}
 */
function labelFor(field) {
  return FIELD_LABELS[field] || field;
}

/**
 * Liest den Sync-Status fuer ein Zielsystem aus dem Customer.
 * @param {object|undefined|null} customer
 * @param {string} system - SYNC_TARGET_SYSTEMS-Wert
 * @returns {string} roher Status oder leerer String
 */
function readRawSyncStatus(customer, system) {
  if (!customer) return '';
  const key = `${system}_sync_status`;
  const raw = customer[key];
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

/**
 * Prueft ein einzelnes Sync-Requirement.
 * @param {object} customer
 * @param {string} requirement
 * @returns {{ ok: boolean, blockerLabel?: string }}
 */
function checkRequirement(customer, requirement) {
  if (requirement === '__contact_email_or_phone__') {
    const ok = hasValue(customer.email) || hasValue(customer.phone);
    return ok ? { ok: true } : { ok: false, blockerLabel: labelFor('contact_email_or_phone') };
  }

  if (requirement.startsWith('__min_data_quality__:')) {
    const threshold = Number(requirement.split(':')[1]);
    const score = Number(customer.data_quality_score);
    const ok = Number.isFinite(score) && score >= threshold;
    return ok
      ? { ok: true }
      : { ok: false, blockerLabel: `${labelFor('data_quality_score')} >= ${threshold}` };
  }

  const ok = hasValue(customer[requirement]);
  return ok ? { ok: true } : { ok: false, blockerLabel: labelFor(requirement) };
}

/**
 * Bewertet die Sync-Readiness fuer alle Zielsysteme.
 *
 * @param {object|undefined|null} customer - Customer-Entity (kann undefined sein)
 * @returns {{ azh: { ready: boolean, blockers: string[] }, themisoft: { ready: boolean, blockers: string[] }, myyolo: { ready: boolean, blockers: string[] } }}
 */
export function evaluateSyncReadiness(customer) {
  const safeCustomer = customer && typeof customer === 'object' ? customer : {};
  const result = {};

  for (const system of Object.values(SYNC_TARGET_SYSTEMS)) {
    const requirements = SYNC_REQUIRED_FIELDS_BY_SYSTEM[system] || [];
    const blockers = [];

    for (const req of requirements) {
      const check = checkRequirement(safeCustomer, req);
      if (!check.ok && check.blockerLabel) {
        blockers.push(check.blockerLabel);
      }
    }

    result[system] = {
      ready: blockers.length === 0,
      blockers,
    };
  }

  return result;
}

/**
 * Anzeige-Label je System (fuer Badges).
 * @param {string} system
 * @returns {string}
 */
function systemLabel(system) {
  switch (system) {
    case SYNC_TARGET_SYSTEMS.AZH:
      return 'AZH';
    case SYNC_TARGET_SYSTEMS.THEMISOFT:
      return 'ThemiSoft';
    case SYNC_TARGET_SYSTEMS.MYYOLO:
      return 'myYOLO';
    default:
      return system;
  }
}

/**
 * Tooltip-Hilfstext aus Blocker-Liste.
 * @param {string[]} blockers
 * @returns {string}
 */
function blockerTooltip(blockers) {
  if (!blockers || blockers.length === 0) return 'Keine fehlenden Felder.';
  return `Fehlend: ${blockers.join(', ')}`;
}

/**
 * Mapped Status auf Badge-Farbe.
 * @param {string} status
 * @returns {'green'|'amber'|'red'|'gray'}
 */
function colorForStatus(status) {
  switch (status) {
    case 'ready':
    case 'synced':
      return 'green';
    case 'syncing':
    case 'blocked':
      return 'amber';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Status-Text fuer Badge-Label.
 * @param {string} status
 * @returns {string}
 */
function statusLabel(status) {
  switch (status) {
    case 'ready':
      return 'bereit';
    case 'syncing':
      return 'syncing';
    case 'synced':
      return 'synced';
    case 'failed':
      return 'fehler';
    case 'blocked':
      return 'blockiert';
    default:
      return 'unbekannt';
  }
}

/**
 * Erzeugt Badge-Daten fuer alle Zielsysteme. Robust gegen undefined customer.
 *
 * Status-Ableitung:
 *  - Wenn customer.<system>_sync_status einen expliziten Wert hat (synced/error/conflict/sent/pending/...),
 *    wird dieser benutzt.
 *  - Andernfalls (leer/unbekannt) wird aus evaluateSyncReadiness abgeleitet:
 *      ready  -> status 'ready', color 'green'
 *      !ready -> status 'blocked', color 'amber'
 *
 * @param {object|undefined|null} customer
 * @returns {Array<{ system: 'azh'|'themisoft'|'myyolo', label: string, color: 'green'|'amber'|'red'|'gray', status: 'ready'|'blocked'|'syncing'|'synced'|'failed'|'unknown', tooltip: string }>}
 */
export function summarizeSyncBadges(customer) {
  const readiness = evaluateSyncReadiness(customer);
  const safeCustomer = customer && typeof customer === 'object' ? customer : {};

  return Object.values(SYNC_TARGET_SYSTEMS).map((system) => {
    const rawStatus = readRawSyncStatus(safeCustomer, system);
    const readinessEntry = readiness[system] || { ready: false, blockers: [] };

    let status;
    let tooltip;

    const explicit = EXPLICIT_STATUS_MAP[rawStatus];
    if (explicit) {
      status = explicit;
      if (status === 'blocked') {
        tooltip = blockerTooltip(readinessEntry.blockers);
      } else if (status === 'failed') {
        tooltip = `Letzter Sync mit Fehler (${rawStatus}).`;
      } else if (status === 'syncing') {
        tooltip = 'Sync laeuft oder wartet auf Uebertragung.';
      } else if (status === 'synced') {
        tooltip = 'Erfolgreich synchronisiert.';
      } else if (status === 'ready') {
        tooltip = 'Bereit fuer Sync.';
      } else {
        tooltip = '';
      }
    } else if (rawStatus === '' || rawStatus === 'not_started' || rawStatus === 'unknown') {
      if (readinessEntry.ready) {
        status = 'ready';
        tooltip = 'Bereit fuer Sync.';
      } else {
        status = 'blocked';
        tooltip = blockerTooltip(readinessEntry.blockers);
      }
    } else {
      status = 'unknown';
      tooltip = `Unbekannter Sync-Status: ${rawStatus}`;
    }

    return {
      system,
      label: systemLabel(system),
      color: colorForStatus(status),
      status,
      tooltip,
    };
  });
}
