const SNAPSHOT_START = '[ALBGYM_CUSTOMER_SNAPSHOT_V1]';
const SNAPSHOT_END = '[/ALBGYM_CUSTOMER_SNAPSHOT_V1]';

const SNAPSHOT_FIELDS = [
  'customer_name',
  'first_name',
  'last_name',
  'birthdate',
  'age',
  'gender',
  'phone',
  'email',
  'address',
  'street',
  'postal_code',
  'city',
  'health_insurance',
  'insurance_number',
  'cost_carrier_number',
  'insured_status',
  'customer_status',
  'customer_source',
  'source_systems',
  'data_quality_score',
  'profile_status',
  'current_focus',
  'next_action_at',
  'last_contact_at',
  'missing_required_fields',
  'active_lead_id',
  'active_goal_profile_id',
  'active_consultation_id',
  'active_reha_case_id',
  'active_contract_draft_id',
  'last_prescription_scan_id',
  'last_rehasport_consultation_id',
  'pipeline_status',
  'last_pipeline_status',
  'lead_source',
  'campaign_id',
  'primary_goal',
  'selected_goals',
  'pain_points',
  'assigned_advisor',
  'recommended_tariff',
  'expected_monthly_value',
  'consultation_type',
  'last_consultation_id',
  'lead_score',
  'advisor_note',
  'prescription_status',
  'prescription_date',
  'prescription_valid_from',
  'prescription_valid_to',
  'form_type',
  'form_number',
  'form_version',
  'practice_site_number',
  'doctor_number',
  'prescribed_units',
  'duration_months',
  'prescription_frequency',
  'prescribed_service',
  'sport_type',
  'functional_training_type',
  'diagnosis_text',
  'icd_codes',
  'impairment_text',
  'rehab_goal',
  'follow_up_prescription',
  'follow_up_reason',
  'prf_number',
  'physician_name',
  'physician_lanr',
  'doctor_signature_present',
  'doctor_stamp_present',
  'patient_signature_present',
  'approval_required',
  'approval_present',
  'approval_date',
  'approval_until',
  'approval_reference',
  'prescription_validation_status',
  'prescription_validation_score',
  'prescription_validation_report',
  'prescription_missing_items',
  'prescription_file_name',
  'prescription_file_uri',
  'prescription_file_url',
  'prescription_storage_mode',
  'prescription_extraction_status',
  'prescription_extraction_confidence',
  'prescription_last_scan_at',
  'themisoft_customer_id',
  'themisoft_sync_status',
  'myyolo_person_id',
  'myyolo_sync_status',
  'azh_person_guid',
  'azh_sync_status',
  'azh_last_sync_at',
  'training_goal',
  'training_experience',
  'training_frequency',
  'restrictions',
  'complaints',
  'budget_feeling',
  'interest_coaching',
  'interest_wellness',
  'interest_courses',
  'interest_reha',
  'privacy_consent',
  'privacy_consent_date',
  'consent_health',
  'consent_prescription_scan',
];

export const CUSTOMER_CRITICAL_PERSISTENCE_FIELDS = [
  'first_name',
  'last_name',
  'birthdate',
  'street',
  'postal_code',
  'city',
  'address',
  'health_insurance',
  'insurance_number',
  'cost_carrier_number',
  'prescription_status',
  'prescription_date',
  'prescription_valid_from',
  'prescription_valid_to',
  'prescribed_units',
  'duration_months',
  'prescribed_service',
  'diagnosis_text',
  'rehab_goal',
  'approval_required',
  'approval_date',
  'approval_until',
  'prescription_file_name',
  'prescription_file_uri',
  'prescription_file_url',
];

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  if (typeof value === 'boolean') return true;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function cleanNotes(value = '') {
  return String(value || '').trim();
}

export function splitCustomerNotes(notes = '') {
  const text = String(notes || '');
  const startIndex = text.indexOf(SNAPSHOT_START);
  if (startIndex === -1) {
    return { humanNotes: cleanNotes(text), snapshot: {} };
  }

  const endIndex = text.indexOf(SNAPSHOT_END, startIndex + SNAPSHOT_START.length);
  if (endIndex === -1) {
    return { humanNotes: cleanNotes(text), snapshot: {} };
  }

  const before = text.slice(0, startIndex);
  const after = text.slice(endIndex + SNAPSHOT_END.length);
  const json = text.slice(startIndex + SNAPSHOT_START.length, endIndex).trim();

  try {
    const snapshot = JSON.parse(json);
    return {
      humanNotes: cleanNotes(`${before}\n${after}`),
      snapshot: snapshot && typeof snapshot === 'object' ? snapshot : {},
    };
  } catch (error) {
    console.warn('Customer compatibility snapshot could not be parsed', error?.message || error);
    return { humanNotes: cleanNotes(`${before}\n${after}`), snapshot: {} };
  }
}

export function buildCustomerCompatibilitySnapshot(customer = {}) {
  const snapshot = {};

  for (const field of SNAPSHOT_FIELDS) {
    const value = customer[field];
    if (hasValue(value)) {
      snapshot[field] = value;
    }
  }

  return snapshot;
}

export function embedCustomerCompatibilitySnapshot(notes = '', customer = {}) {
  const { humanNotes } = splitCustomerNotes(notes);
  const snapshot = buildCustomerCompatibilitySnapshot(customer);

  if (Object.keys(snapshot).length === 0) return humanNotes;

  const snapshotBlock = `${SNAPSHOT_START}\n${JSON.stringify(snapshot)}\n${SNAPSHOT_END}`;
  return [humanNotes, snapshotBlock].filter(Boolean).join('\n\n');
}

export function hydrateCustomerRecord(record = {}) {
  if (!record || typeof record !== 'object') return record;

  const { humanNotes, snapshot } = splitCustomerNotes(record.notes);
  const hydrated = { ...snapshot };

  for (const [field, value] of Object.entries(record)) {
    if (field === 'notes') continue;
    if (
      hasValue(value) ||
      field === 'id' ||
      field === 'created_date' ||
      field === 'updated_date' ||
      field === 'created_by' ||
      field === 'created_by_id' ||
      field === 'updated_by' ||
      field === 'updated_by_id' ||
      field === 'is_sample'
    ) {
      hydrated[field] = value;
    }
  }

  hydrated.notes = humanNotes;
  return hydrated;
}

export function prepareCustomerPersistencePayload(payload = {}) {
  if (!payload || typeof payload !== 'object') return payload;
  const hydrated = hydrateCustomerRecord(payload);
  const notes = embedCustomerCompatibilitySnapshot(hydrated.notes, hydrated);
  return {
    ...payload,
    notes,
  };
}

export function getMissingCustomerPersistenceFields(expected = {}, actual = {}) {
  const hydratedActual = hydrateCustomerRecord(actual);

  return CUSTOMER_CRITICAL_PERSISTENCE_FIELDS.filter((field) => {
    if (!hasValue(expected[field])) return false;
    return !hasValue(hydratedActual[field]);
  });
}
