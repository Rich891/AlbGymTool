import { createEntity, safeFilterEntity, updateEntity } from '@/lib/entityGateway';
import { deriveGoalProfileSummary } from '@/lib/goalProfileModel';
import {
  validationStatusToPrescriptionStatus,
  validationStatusToRehaPrescriptionStatus,
} from '@/lib/prescriptionValidation';

const EMPTY_VALUES = new Set([undefined, null, '']);

export const PROFILE_STATUSES = {
  LEAD: 'lead',
  OFFER_OPEN: 'angebot_offen',
  TRIAL: 'testphase',
  MEMBER: 'mitglied',
  REHA_ACTIVE: 'reha_aktiv',
  LOST: 'verloren',
  ARCHIVED: 'archiviert',
};

export const CURRENT_FOCUS_TYPES = {
  NEW_LEAD: 'lead_qualifizieren',
  APPOINTMENT_PREP: 'termin_vorbereiten',
  OFFER_FOLLOW_UP: 'angebot_nachfassen',
  TRIAL_CHECK: 'testphase_pruefen',
  CONTRACT_PREPARE: 'vertrag_vorbereiten',
  PRESCRIPTION_REVIEW: 'rezept_pruefen',
  SYNC_PREPARE: 'sync_vorbereiten',
  GOAL_PROFILE_REVIEW: 'goalprofile_review',
  NONE: 'none',
};

export const CUSTOMER_CONTEXT_TYPES = {
  LEAD: 'lead',
  GOAL_PROFILE: 'goal_profile',
  CONSULTATION: 'consultation',
  REHA: 'reha',
  CONTRACT: 'contract',
  SYNC: 'sync',
};

export const SYNC_STATUSES = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  READY: 'ready',
  BLOCKED_MISSING_DATA: 'blocked_missing_data',
  SENT: 'sent',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
  ERROR: 'error',
};

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

function compactArray(items) {
  return unique((items || []).map(cleanText).filter(Boolean));
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
  const startsWithLetter = /^[A-Z]/.test(clean);
  const letter = startsWithLetter ? clean[0] : '';
  const digits = (startsWithLetter ? clean.slice(1) : clean).replace(/\D/g, '').slice(0, 9);
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
  if (['m', 'mann', 'maennlich', 'mannlich', 'm\u00e4nnlich', 'mã¤nnlich'].includes(raw)) return 'm\u00e4nnlich';
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

export function calculateMissingRequiredFields(customer = {}) {
  const requiredFields = [
    ['first_name', 'Vorname'],
    ['last_name', 'Nachname'],
    ['phone', 'Telefon'],
    ['email', 'E-Mail'],
  ];

  return requiredFields
    .filter(([field]) => !cleanText(customer[field]))
    .map(([, label]) => label);
}

export function deriveProfileStatus({ lead, rehaCase, consultation, contractDraft } = {}) {
  const leadStatus = cleanText(lead?.status).toUpperCase();
  const consultationOutcome = cleanText(consultation?.outcome);
  const consultationStatus = cleanText(consultation?.status);
  const contractStatus = cleanText(contractDraft?.status);
  const rehaStatus = cleanText(rehaCase?.status || rehaCase?.prescription_status);

  if (leadStatus === 'LOST' || consultationOutcome === 'kein_abschluss') return PROFILE_STATUSES.LOST;
  if (consultationOutcome === 'abschluss' || consultationStatus === 'abgeschlossen' || contractStatus === 'ready') return PROFILE_STATUSES.MEMBER;
  if (consultationOutcome === 'testphase' || consultationStatus === 'testphase') return PROFILE_STATUSES.TRIAL;
  if (leadStatus === 'OFFER_OPEN' || consultationOutcome === 'angebot' || consultationStatus === 'angebot_gespeichert') return PROFILE_STATUSES.OFFER_OPEN;
  if (rehaStatus && !['abgebrochen', 'archived'].includes(rehaStatus)) return PROFILE_STATUSES.REHA_ACTIVE;
  if (lead || leadStatus) return PROFILE_STATUSES.LEAD;
  return PROFILE_STATUSES.LEAD;
}

export function deriveCurrentFocus({ lead, rehaCase, syncJobs = [], followUpTasks = [], goalProfile } = {}) {
  const openFollowUp = (followUpTasks || [])
    .filter(task => !task?.status || task.status === 'open')
    .sort((a, b) => String(a?.due_at || '').localeCompare(String(b?.due_at || '')))[0];

  if (openFollowUp) {
    return {
      type: CURRENT_FOCUS_TYPES.OFFER_FOLLOW_UP,
      label: 'Follow-up bearbeiten',
      next_action_at: openFollowUp.due_at,
    };
  }

  const blockedSync = (syncJobs || []).find(job => job?.status === SYNC_STATUSES.BLOCKED_MISSING_DATA || job?.status === 'blocked_missing_data');
  if (blockedSync) {
    return {
      type: CURRENT_FOCUS_TYPES.SYNC_PREPARE,
      label: 'Sync-Daten vervollstaendigen',
      next_action_at: blockedSync.created_at || null,
    };
  }

  const rehaStatus = cleanText(rehaCase?.prescription_status || rehaCase?.status);
  if (['missing', 'manual_review', 'scan_saved', 'rezept_erfasst'].includes(rehaStatus)) {
    return {
      type: CURRENT_FOCUS_TYPES.PRESCRIPTION_REVIEW,
      label: 'Rezept pruefen',
      next_action_at: rehaCase?.next_action_at || null,
    };
  }

  const leadStatus = cleanText(lead?.status).toUpperCase();
  if (leadStatus === 'OFFER_OPEN') {
    return {
      type: CURRENT_FOCUS_TYPES.OFFER_FOLLOW_UP,
      label: 'Angebot nachfassen',
      next_action_at: lead?.next_action_at || null,
    };
  }
  if (leadStatus === 'TRIAL_STARTED') {
    return {
      type: CURRENT_FOCUS_TYPES.TRIAL_CHECK,
      label: 'Testphase pruefen',
      next_action_at: lead?.next_action_at || null,
    };
  }
  if (leadStatus === 'CONTRACT_READY') {
    return {
      type: CURRENT_FOCUS_TYPES.CONTRACT_PREPARE,
      label: 'Vertrag vorbereiten',
      next_action_at: lead?.next_action_at || null,
    };
  }
  if (leadStatus === 'APPOINTMENT_BOOKED') {
    return {
      type: CURRENT_FOCUS_TYPES.APPOINTMENT_PREP,
      label: 'Termin vorbereiten',
      next_action_at: lead?.next_action_at || null,
    };
  }
  if (lead) {
    return {
      type: CURRENT_FOCUS_TYPES.NEW_LEAD,
      label: 'Lead qualifizieren',
      next_action_at: lead?.next_action_at || null,
    };
  }

  if (goalProfile?.status === 'active' && typeof goalProfile?.confidence_score === 'number' && goalProfile.confidence_score < 50) {
    return {
      type: CURRENT_FOCUS_TYPES.GOAL_PROFILE_REVIEW,
      label: 'Zielprofil schaerfen',
      next_action_at: goalProfile?.next_action_at || null,
    };
  }

  return {
    type: CURRENT_FOCUS_TYPES.NONE,
    label: 'Keine offene Aktion',
    next_action_at: null,
  };
}

export function mergeCustomerContextSnapshot(existing = {}, incoming = {}) {
  return compactObject({
    ...stripEntityMetadata(existing),
    ...compactObject(incoming),
    source_systems: unique([...(existing.source_systems || []), ...(incoming.source_systems || [])]),
    missing_required_fields: compactArray([
      ...(existing.missing_required_fields || []),
      ...(incoming.missing_required_fields || []),
    ]),
  });
}

export function buildCustomerSummary(customer = {}, contexts = {}) {
  const { lead, rehaCase, consultation, contractDraft, syncJobs = [], followUpTasks = [], goalProfile } = contexts;
  const focus = deriveCurrentFocus({ lead, rehaCase, syncJobs, followUpTasks, goalProfile });
  const profileStatus = customer.profile_status || deriveProfileStatus({ lead, rehaCase, consultation, contractDraft });
  const badges = [
    lead || customer.active_lead_id ? 'Lead aktiv' : '',
    rehaCase || customer.active_reha_case_id || customer.last_rehasport_consultation_id ? 'Reha aktiv' : '',
    contractDraft || customer.active_contract_draft_id ? 'Vertrag offen' : '',
    profileStatus === PROFILE_STATUSES.OFFER_OPEN ? 'Angebot offen' : '',
  ].filter(Boolean);

  const summary = {
    id: customer.id,
    customer_name: joinCustomerName(customer),
    profile_status: profileStatus,
    current_focus: customer.current_focus || focus.type,
    current_focus_label: focus.label,
    next_action_at: customer.next_action_at || focus.next_action_at,
    badges,
    data_quality_score: customer.data_quality_score ?? calculateDataQualityScore(customer),
    missing_required_fields: customer.missing_required_fields || calculateMissingRequiredFields(customer),
    themisoft_sync_status: customer.themisoft_sync_status || SYNC_STATUSES.NOT_STARTED,
    myyolo_sync_status: customer.myyolo_sync_status || customer.azh_sync_status || SYNC_STATUSES.NOT_STARTED,
    azh_sync_status: customer.azh_sync_status || SYNC_STATUSES.NOT_STARTED,
  };

  if (goalProfile) {
    summary.active_goal_headline = deriveGoalProfileSummary(goalProfile);
  }

  return summary;
}

export function buildCustomerSearchText(customer = {}, contexts = {}) {
  const summary = buildCustomerSummary(customer, contexts);
  const contextValues = Object.values(contexts || {})
    .flatMap(value => Array.isArray(value) ? value : [value])
    .filter(Boolean)
    .flatMap(value => [
      value.customer_name,
      value.first_name,
      value.last_name,
      value.phone,
      value.email,
      value.health_insurance,
      value.insurance_number,
      value.status,
    ]);

  return compactArray([
    summary.customer_name,
    customer.first_name,
    customer.last_name,
    customer.phone,
    customer.email,
    customer.birthdate,
    customer.health_insurance,
    customer.insurance_number,
    customer.cost_carrier_number,
    customer.profile_status,
    customer.current_focus,
    ...summary.badges,
    ...contextValues,
  ]).join(' ').toLowerCase();
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
    age: Number(input.age) || undefined,
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
    profile_status: input.profile_status || input.customer_status || PROFILE_STATUSES.LEAD,
    current_focus: typeof input.current_focus === 'object' ? input.current_focus?.type : input.current_focus,
    next_action_at: input.next_action_at,
    last_contact_at: input.last_contact_at,
    missing_required_fields: input.missing_required_fields,
    customer_status: input.customer_status || 'lead',
    customer_source: source,
    source_systems: unique([sourceSystem, ...(input.source_systems || [])]),
    active_lead_id: input.active_lead_id,
    active_goal_profile_id: input.active_goal_profile_id,
    active_consultation_id: input.active_consultation_id,
    active_reha_case_id: input.active_reha_case_id,
    active_contract_draft_id: input.active_contract_draft_id,
    last_prescription_scan_id: input.last_prescription_scan_id,
    last_rehasport_consultation_id: input.last_rehasport_consultation_id,
    themisoft_customer_id: input.themisoft_customer_id,
    themisoft_sync_status: input.themisoft_sync_status || SYNC_STATUSES.NOT_STARTED,
    myyolo_person_id: input.myyolo_person_id,
    myyolo_sync_status: input.myyolo_sync_status || input.azh_sync_status || SYNC_STATUSES.NOT_STARTED,
    azh_person_guid: input.azh_person_guid,
    azh_sync_status: input.azh_sync_status || SYNC_STATUSES.NOT_STARTED,
    azh_last_sync_at: input.azh_last_sync_at,
    training_goal: cleanText(input.training_goal),
    training_experience: input.training_experience,
    training_frequency: input.training_frequency,
    restrictions: cleanText(input.restrictions),
    complaints: cleanText(input.complaints),
    budget_feeling: input.budget_feeling,
    interest_coaching: input.interest_coaching,
    interest_wellness: input.interest_wellness,
    interest_courses: input.interest_courses,
    interest_reha: input.interest_reha,
    privacy_consent: input.privacy_consent,
    privacy_consent_date: input.privacy_consent_date,
    consent_health: input.consent_health,
    consent_prescription_scan: input.consent_prescription_scan,
    notes: cleanText(input.notes),
  });
  payload.missing_required_fields = input.missing_required_fields || calculateMissingRequiredFields(payload);

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
  const validation = prescription.validation_report || {};
  const validationStatus = prescription.prescription_validation_status || validation.status;

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
    prescription_status: validationStatusToRehaPrescriptionStatus(validationStatus),
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
    doctor_signature_present: Boolean(prescription.doctor_signature_present),
    doctor_stamp_present: Boolean(prescription.doctor_stamp_present),
    patient_signature_present: Boolean(prescription.patient_signature_present),
    approval_required: Boolean(validation.approval_required || prescription.approval_required_hint),
    approval_present: Boolean(validation.approval_present || prescription.approval_present),
    approval_date: normalizeDate(prescription.approval_date),
    approval_until: normalizeDate(prescription.approval_until),
    approval_reference: cleanText(prescription.approval_reference),
    prescription_validation_status: validationStatus,
    prescription_validation_score: validation.score,
    prescription_validation_report: validation,
    prescription_missing_items: (validation.issues || []).map(issue => issue.label || issue.message).filter(Boolean),
    status: 'rezept_erfasst',
    notes: cleanText(prescription.notes),
  });
}

export function buildPrescriptionScanPayload({ customer, rehasportConsultation, prescription, fileMeta, extraction }) {
  const validation = prescription.validation_report || extraction?.validation_report || {};
  const validationStatus = prescription.prescription_validation_status || validation.status;

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
    doctor_signature_present: Boolean(prescription.doctor_signature_present),
    doctor_stamp_present: Boolean(prescription.doctor_stamp_present),
    patient_signature_present: Boolean(prescription.patient_signature_present),
    approval_required: Boolean(validation.approval_required || prescription.approval_required_hint),
    approval_present: Boolean(validation.approval_present || prescription.approval_present),
    approval_date: normalizeDate(prescription.approval_date),
    approval_until: normalizeDate(prescription.approval_until),
    approval_reference: cleanText(prescription.approval_reference),
    prescription_validation_status: validationStatus,
    prescription_validation_score: validation.score,
    prescription_validation_report: validation,
    prescription_missing_items: (validation.issues || []).map(issue => issue.label || issue.message).filter(Boolean),
    azh_sync_status: 'not_started',
    status: validationStatusToPrescriptionStatus(validationStatus),
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
