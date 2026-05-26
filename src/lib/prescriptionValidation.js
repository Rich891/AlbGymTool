const REQUIRED_PROFILE_FIELDS = [
  {
    code: 'patient_name_missing',
    fields: ['patient_first_name', 'patient_last_name'],
    label: 'Patientenname',
    message: 'Vorname und Nachname muessen aus dem Rezept oder manuell erfasst sein.',
    severity: 'error',
    category: 'customer_profile',
    mode: 'all',
  },
  {
    code: 'birthdate_missing',
    fields: ['birthdate'],
    label: 'Geburtsdatum',
    message: 'Geburtsdatum fehlt. Ohne Geburtsdatum ist die Zuordnung unsicher.',
    severity: 'error',
    category: 'customer_profile',
  },
  {
    code: 'address_missing',
    fields: ['street', 'postal_code', 'city', 'address'],
    label: 'Adresse',
    message: 'Adresse ist unvollstaendig. Strasse, PLZ und Ort oder eine komplette Adresse erfassen.',
    severity: 'warning',
    category: 'customer_profile',
  },
  {
    code: 'insurance_missing',
    fields: ['health_insurance'],
    label: 'Krankenkasse',
    message: 'Krankenkasse fehlt oder wurde nicht erkannt.',
    severity: 'error',
    category: 'insurance',
  },
  {
    code: 'insurance_number_missing',
    fields: ['insurance_number'],
    label: 'Versichertennummer',
    message: 'Versichertennummer fehlt.',
    severity: 'error',
    category: 'insurance',
  },
];

const REQUIRED_PRESCRIPTION_FIELDS = [
  {
    code: 'prescription_date_missing',
    fields: ['prescription_date'],
    label: 'Ausstellungsdatum',
    message: 'Ausstellungsdatum fehlt.',
    severity: 'error',
    category: 'prescription',
  },
  {
    code: 'service_missing',
    fields: ['prescribed_service'],
    label: 'Leistung',
    message: 'Verordnete Leistung fehlt.',
    severity: 'error',
    category: 'prescription',
  },
  {
    code: 'units_missing',
    fields: ['prescribed_units'],
    label: 'Einheiten',
    message: 'Anzahl der Einheiten fehlt.',
    severity: 'error',
    category: 'prescription',
  },
  {
    code: 'duration_missing',
    fields: ['duration_months'],
    label: 'Dauer',
    message: 'Verordnungsdauer fehlt.',
    severity: 'warning',
    category: 'prescription',
  },
  {
    code: 'diagnosis_missing',
    fields: ['diagnosis_text', 'icd_codes'],
    label: 'Diagnose / ICD',
    message: 'Diagnose oder ICD-Code fehlt.',
    severity: 'error',
    category: 'medical',
  },
  {
    code: 'goal_missing',
    fields: ['rehab_goal'],
    label: 'Rehabilitationsziel',
    message: 'Rehabilitationsziel fehlt.',
    severity: 'warning',
    category: 'medical',
  },
  {
    code: 'doctor_signature_missing',
    fields: ['doctor_signature_present'],
    label: 'Arztunterschrift',
    message: 'Arztunterschrift wurde nicht erkannt.',
    severity: 'error',
    category: 'visual',
  },
  {
    code: 'doctor_stamp_missing',
    fields: ['doctor_stamp_present'],
    label: 'Arztstempel',
    message: 'Arztstempel wurde nicht erkannt.',
    severity: 'error',
    category: 'visual',
  },
];

const FIELD_LABELS = {
  patient_first_name: 'Vorname',
  patient_last_name: 'Nachname',
  birthdate: 'Geburtsdatum',
  gender: 'Geschlecht',
  street: 'Strasse',
  postal_code: 'PLZ',
  city: 'Ort',
  address: 'Adresse',
  phone: 'Telefon',
  email: 'E-Mail',
  health_insurance: 'Krankenkasse',
  insurance_number: 'Versichertennummer',
  cost_carrier_number: 'Kostentraegernummer',
  insured_status: 'Versichertenstatus',
  prescription_date: 'Ausstellungsdatum',
  valid_from: 'Gueltig ab',
  valid_to: 'Gueltig bis',
  form_type: 'Formular',
  form_number: 'Muster',
  form_version: 'Version',
  practice_site_number: 'BSNR',
  doctor_number: 'Arzt-Nr.',
  prescribed_service: 'Leistung',
  sport_type: 'Rehasportart',
  functional_training_type: 'Funktionstraining',
  prescribed_units: 'Einheiten',
  duration_months: 'Dauer',
  frequency: 'Frequenz',
  diagnosis_text: 'Diagnose',
  icd_codes: 'ICD-Codes',
  impairment_text: 'Schaedigung',
  rehab_goal: 'Rehabilitationsziel',
  follow_up_prescription: 'Folgeverordnung',
  follow_up_reason: 'Begruendung Folgeverordnung',
  physician_name: 'Arzt / Praxis',
  physician_lanr: 'LANR',
  prf_number: 'PRF.NR',
  doctor_signature_present: 'Arztunterschrift',
  doctor_stamp_present: 'Arztstempel',
  patient_signature_present: 'Patientenunterschrift',
  approval_present: 'Genehmigung',
  approval_date: 'Genehmigungsdatum',
  approval_until: 'Genehmigt bis',
};

const SEVERITY_WEIGHT = {
  error: 18,
  warning: 8,
  info: 3,
};

export const PRESCRIPTION_VALIDATION_STATUS = {
  VALID: 'valid',
  NEEDS_REVIEW: 'needs_review',
  INCOMPLETE: 'incomplete',
};

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function looseInsuranceKey(value) {
  return normalize(value)
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u');
}

function isFilled(value) {
  if (Array.isArray(value)) return value.filter(Boolean).length > 0;
  if (typeof value === 'boolean') return value === true;
  return clean(value) !== '';
}

function isDateInFuture(value, today = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date(today);
  now.setHours(23, 59, 59, 999);
  return date.getTime() > now.getTime();
}

function isDateBeforeToday(value, today = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return date.getTime() < now.getTime();
}

function hasAny(form, fields) {
  return fields.some(field => isFilled(form[field]));
}

function addIssue(issues, issue) {
  issues.push({
    severity: issue.severity || 'warning',
    category: issue.category || 'general',
    code: issue.code,
    label: issue.label,
    message: issue.message,
    fields: issue.fields || [],
    action: issue.action || '',
  });
}

export function matchHealthInsurance(name, healthInsurances = []) {
  const needle = normalize(name);
  const looseNeedle = looseInsuranceKey(name);
  if (!needle) return null;

  return healthInsurances.find(item => {
    const candidates = [
      item?.name,
      ...(Array.isArray(item?.aliases) ? item.aliases : []),
    ].filter(Boolean);

    return candidates.some(candidate => {
      const normalizedCandidate = normalize(candidate);
      const looseCandidate = looseInsuranceKey(candidate);
      return (
        normalizedCandidate === needle ||
        normalizedCandidate.includes(needle) ||
        needle.includes(normalizedCandidate) ||
        looseCandidate === looseNeedle ||
        looseCandidate.includes(looseNeedle) ||
        looseNeedle.includes(looseCandidate)
      );
    });
  }) || null;
}

function getFallbackInsurancePolicy(name) {
  const key = looseInsuranceKey(name);
  if (!key) return null;

  if (key.includes('aok')) {
    return {
      id: 'fallback-aok',
      name: 'AOK',
      approval_required: false,
      fallback: true,
    };
  }

  return null;
}

export function buildFieldIssueMap(issues = []) {
  return issues.reduce((acc, issue) => {
    for (const field of issue.fields || []) {
      if (!acc[field]) acc[field] = [];
      acc[field].push(issue);
    }
    return acc;
  }, {});
}

export function getWorstFieldSeverity(issues = []) {
  if (issues.some(issue => issue.severity === 'error')) return 'error';
  if (issues.some(issue => issue.severity === 'warning')) return 'warning';
  if (issues.length > 0) return 'info';
  return 'ok';
}

export function evaluatePrescription(form = {}, healthInsurances = [], options = {}) {
  const today = options.today || new Date();
  const issues = [];

  for (const rule of REQUIRED_PROFILE_FIELDS) {
    const missing = rule.mode === 'all'
      ? !rule.fields.every(field => isFilled(form[field]))
      : !hasAny(form, rule.fields);
    if (missing) addIssue(issues, rule);
  }

  for (const rule of REQUIRED_PRESCRIPTION_FIELDS) {
    if (!hasAny(form, rule.fields)) addIssue(issues, rule);
  }

  if (form.birthdate && isDateInFuture(form.birthdate, today)) {
    addIssue(issues, {
      code: 'birthdate_future',
      fields: ['birthdate'],
      label: 'Geburtsdatum',
      message: 'Geburtsdatum liegt in der Zukunft.',
      severity: 'error',
      category: 'customer_profile',
    });
  }

  if (form.prescription_date && isDateInFuture(form.prescription_date, today)) {
    addIssue(issues, {
      code: 'prescription_date_future',
      fields: ['prescription_date'],
      label: 'Ausstellungsdatum',
      message: 'Ausstellungsdatum liegt in der Zukunft.',
      severity: 'error',
      category: 'prescription',
    });
  }

  if (form.valid_to && isDateBeforeToday(form.valid_to, today)) {
    addIssue(issues, {
      code: 'prescription_expired',
      fields: ['valid_to'],
      label: 'Gueltigkeit',
      message: 'Rezeptgueltigkeit ist abgelaufen.',
      severity: 'error',
      category: 'prescription',
    });
  }

  const units = Number(form.prescribed_units);
  if (isFilled(form.prescribed_units) && (!Number.isFinite(units) || units <= 0)) {
    addIssue(issues, {
      code: 'units_invalid',
      fields: ['prescribed_units'],
      label: 'Einheiten',
      message: 'Einheiten muessen als positive Zahl erfasst sein.',
      severity: 'error',
      category: 'prescription',
    });
  } else if (Number.isFinite(units) && units > 120) {
    addIssue(issues, {
      code: 'units_unusually_high',
      fields: ['prescribed_units'],
      label: 'Einheiten',
      message: 'Einheiten wirken ungewoehnlich hoch. Bitte pruefen.',
      severity: 'warning',
      category: 'prescription',
    });
  }

  const duration = Number(form.duration_months);
  if (isFilled(form.duration_months) && (!Number.isFinite(duration) || duration <= 0)) {
    addIssue(issues, {
      code: 'duration_invalid',
      fields: ['duration_months'],
      label: 'Dauer',
      message: 'Dauer muss als positive Monatszahl erfasst sein.',
      severity: 'error',
      category: 'prescription',
    });
  } else if (Number.isFinite(duration) && duration > 36) {
    addIssue(issues, {
      code: 'duration_unusually_high',
      fields: ['duration_months'],
      label: 'Dauer',
      message: 'Dauer wirkt ungewoehnlich hoch. Bitte pruefen.',
      severity: 'warning',
      category: 'prescription',
    });
  }

  if (!form.sport_type && !form.functional_training_type) {
    addIssue(issues, {
      code: 'sport_type_missing',
      fields: ['sport_type', 'functional_training_type'],
      label: 'Art der Leistung',
      message: 'Rehasportart oder Funktionstrainingsart fehlt.',
      severity: 'warning',
      category: 'prescription',
    });
  }

  if (!form.frequency) {
    addIssue(issues, {
      code: 'frequency_missing',
      fields: ['frequency'],
      label: 'Frequenz',
      message: 'Trainingsfrequenz wurde nicht erkannt.',
      severity: 'warning',
      category: 'prescription',
    });
  }

  if (!form.practice_site_number && !form.doctor_number && !form.physician_name) {
    addIssue(issues, {
      code: 'physician_missing',
      fields: ['practice_site_number', 'doctor_number', 'physician_name'],
      label: 'Arzt/Praxis',
      message: 'Arzt- oder Praxisdaten wurden nicht erkannt.',
      severity: 'warning',
      category: 'visual',
    });
  }

  if (form.document_kind && !['formular_56', 'mixed_batch'].includes(form.document_kind)) {
    addIssue(issues, {
      code: 'document_kind_unexpected',
      fields: ['document_kind'],
      label: 'Dokumenttyp',
      message: `Dokumenttyp ist ${form.document_kind}. Bitte pruefen, ob es wirklich ein Formular 56 ist.`,
      severity: 'warning',
      category: 'document',
    });
  }

  if (form.contains_multiple_prescriptions || Number(form.prescription_count) > 1) {
    addIssue(issues, {
      code: 'multiple_prescriptions',
      fields: ['contains_multiple_prescriptions', 'prescription_count'],
      label: 'Mehrere Rezepte',
      message: 'Im Dokument wurden mehrere Rezepte erkannt. Bitte nur ein Einzelrezept speichern.',
      severity: 'warning',
      category: 'document',
    });
  }

  if (form.scan_warning) {
    addIssue(issues, {
      code: 'scan_warning',
      fields: ['scan_warning'],
      label: 'Scanqualitaet',
      message: clean(form.scan_warning),
      severity: 'warning',
      category: 'document',
    });
  }

  const insuranceMatch = matchHealthInsurance(form.health_insurance, healthInsurances);
  const insuranceFallback = insuranceMatch ? null : getFallbackInsurancePolicy(form.health_insurance);
  const insurancePolicy = insuranceMatch || insuranceFallback;
  const approvalRequired = insurancePolicy
    ? Boolean(insurancePolicy.approval_required)
    : Boolean(form.approval_required_hint);
  if (form.health_insurance && !insurancePolicy && healthInsurances.length > 0) {
    addIssue(issues, {
      code: 'insurance_not_in_database',
      fields: ['health_insurance'],
      label: 'Krankenkasse',
      message: 'Krankenkasse wurde nicht eindeutig in der lokalen Datenbank gefunden.',
      severity: 'warning',
      category: 'insurance',
    });
  }

  if (approvalRequired && !form.approval_present) {
    addIssue(issues, {
      code: 'approval_missing',
      fields: ['approval_present', 'approval_date', 'approval_until'],
      label: 'Genehmigung',
      message: 'Diese Kasse oder das Dokument verlangt eine Genehmigung. Genehmigung wurde nicht erkannt.',
      severity: 'error',
      category: 'approval',
    });
  }

  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;
  const score = Math.max(
    0,
    100 - issues.reduce((sum, issue) => sum + (SEVERITY_WEIGHT[issue.severity] || 5), 0)
  );
  const status = errorCount > 0
    ? PRESCRIPTION_VALIDATION_STATUS.INCOMPLETE
    : warningCount > 0
    ? PRESCRIPTION_VALIDATION_STATUS.NEEDS_REVIEW
    : PRESCRIPTION_VALIDATION_STATUS.VALID;
  const fieldIssues = buildFieldIssueMap(issues);

  return {
    status,
    status_label: status === PRESCRIPTION_VALIDATION_STATUS.VALID
      ? 'Rezept abrechnungsbereit'
      : status === PRESCRIPTION_VALIDATION_STATUS.NEEDS_REVIEW
      ? 'Pruefung noetig'
      : 'Nicht abrechnungsbereit',
    status_color: status === PRESCRIPTION_VALIDATION_STATUS.VALID
      ? 'green'
      : status === PRESCRIPTION_VALIDATION_STATUS.NEEDS_REVIEW
      ? 'amber'
      : 'red',
    score,
    issues,
    field_issues: fieldIssues,
    error_count: errorCount,
    warning_count: warningCount,
    matched_health_insurance_id: insurancePolicy?.id || '',
    matched_health_insurance_name: insurancePolicy?.name || '',
    approval_required: approvalRequired,
    approval_present: Boolean(form.approval_present),
    checked_at: new Date().toISOString(),
    highlighted_fields: Object.keys(fieldIssues),
    field_labels: FIELD_LABELS,
  };
}

export function validationStatusToPrescriptionStatus(status) {
  if (status === PRESCRIPTION_VALIDATION_STATUS.VALID) return 'verified';
  return 'manual_review';
}

export function validationStatusToRehaPrescriptionStatus(status) {
  if (status === PRESCRIPTION_VALIDATION_STATUS.VALID) return 'scan_saved';
  return 'manual_review';
}
