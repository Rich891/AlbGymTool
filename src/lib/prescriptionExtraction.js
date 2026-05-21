import { normalizeDate, normalizeInsuranceNumber } from '@/lib/customerDataModel';

export const EMPTY_PRESCRIPTION_FORM = {
  patient_first_name: '',
  patient_last_name: '',
  birthdate: '',
  gender: '',
  street: '',
  postal_code: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  health_insurance: '',
  insurance_number: '',
  cost_carrier_number: '',
  insured_status: '',
  prescription_date: '',
  valid_from: '',
  valid_to: '',
  form_type: '',
  form_number: '',
  form_version: '',
  practice_site_number: '',
  doctor_number: '',
  prescribed_service: 'Rehabilitationssport',
  sport_type: '',
  functional_training_type: '',
  prescribed_units: '',
  duration_months: '',
  frequency: '',
  diagnosis_text: '',
  icd_codes: [],
  impairment_text: '',
  rehab_goal: '',
  follow_up_prescription: false,
  follow_up_reason: '',
  physician_name: '',
  physician_lanr: '',
  prf_number: '',
  page_count: '',
  blank_pages_detected: '',
  notes: '',
};

export const PRESCRIPTION_EXTRACTION_SCHEMA = {
  type: 'object',
  description: 'Daten aus einem deutschen Rehabilitationssport-/Funktionstraining-Rezept, besonders Formular 56, extrahieren. Bei Bild-PDFs OCR/Vision verwenden und angekreuzte Checkboxen auswerten.',
  properties: {
    document: {
      type: 'object',
      properties: {
        form_type: { type: 'string', description: 'Formulartyp, z.B. Antrag auf Kostenuebernahme' },
        form_number: { type: 'string', description: 'Formularnummer, z.B. Muster 56 oder Formular 56' },
        form_version: { type: 'string', description: 'Version/Ausgabe, z.B. Muster 56.1/E (1.2023)' },
        prf_number: { type: 'string', description: 'PRF.NR oder Pruefnummer, falls sichtbar' },
        page_count: { type: 'number', description: 'Anzahl Seiten im Scan/PDF' },
        blank_pages_detected: { type: 'number', description: 'Anzahl leerer oder nahezu leerer Seiten' },
      },
    },
    patient: {
      type: 'object',
      properties: {
        first_name: { type: 'string', description: 'Vorname der versicherten Person' },
        last_name: { type: 'string', description: 'Nachname der versicherten Person' },
        birthdate: { type: 'string', description: 'Geburtsdatum im Format YYYY-MM-DD, falls erkennbar' },
        gender: { type: 'string', description: 'Geschlecht, falls erkennbar' },
        street: { type: 'string', description: 'Strasse und Hausnummer' },
        postal_code: { type: 'string', description: 'Postleitzahl' },
        city: { type: 'string', description: 'Ort' },
        address: { type: 'string', description: 'Vollstaendige Adresse, falls nicht sauber in Strasse/PLZ/Ort trennbar' },
      },
    },
    insurance: {
      type: 'object',
      properties: {
        health_insurance: { type: 'string', description: 'Name der Krankenkasse' },
        insurance_number: { type: 'string', description: 'Krankenversichertennummer' },
        cost_carrier_number: { type: 'string', description: 'Kostentraegernummer / IK. Bei Formular 56 steht sie oben rechts als Kostentraegerkennung.' },
        insured_status: { type: 'string', description: 'Status-Feld der Versichertenkarte, falls sichtbar' },
      },
    },
    provider: {
      type: 'object',
      properties: {
        practice_site_number: { type: 'string', description: 'Betriebsstaetten-Nr. / BSNR aus dem Kopfbereich' },
        doctor_number: { type: 'string', description: 'Arzt-Nr. / LANR aus dem Kopfbereich' },
        physician_name: { type: 'string', description: 'Name des Arztes oder der Praxis, falls lesbar' },
        lanr: { type: 'string', description: 'LANR, falls separat lesbar' },
      },
    },
    prescription: {
      type: 'object',
      properties: {
        prescription_date: { type: 'string', description: 'Ausstellungsdatum aus dem Kopfbereich im Format YYYY-MM-DD' },
        valid_from: { type: 'string', description: 'Gueltig ab, falls vorhanden' },
        valid_to: { type: 'string', description: 'Gueltig bis, falls vorhanden' },
        rehabilitation_sport_checked: { type: 'boolean', description: 'True, wenn "Rehabilitationssport" angekreuzt ist' },
        functional_training_checked: { type: 'boolean', description: 'True, wenn "Funktionstraining" angekreuzt ist' },
        prescribed_service: { type: 'string', description: 'Verordnete Leistung, z.B. Rehabilitationssport' },
        sport_type: { type: 'string', description: 'Angekreuzte Art bei Rehabilitationssport, z.B. Gymnastik, Wassergymnastik, Herzgruppe' },
        functional_training_type: { type: 'string', description: 'Angekreuzte Art bei Funktionstraining, z.B. Trockengymnastik oder Wassergymnastik' },
        prescribed_units: { type: 'number', description: 'Anzahl verordneter Einheiten' },
        duration_months: { type: 'number', description: 'Bewilligungs-/Verordnungsdauer in Monaten, z.B. 18' },
        frequency: { type: 'string', description: 'Trainingsfrequenz, z.B. 1-2x pro Woche' },
        diagnosis_text: { type: 'string', description: 'Diagnose oder Indikation' },
        icd_codes: { type: 'array', items: { type: 'string' }, description: 'ICD-Codes' },
        impairment_text: { type: 'string', description: 'Schaedigung/Funktionsstoerung aus dem Formular' },
        rehab_goal: { type: 'string', description: 'Rehabilitationsziel aus dem Formular' },
        follow_up_prescription: { type: 'boolean', description: 'True, wenn Folgeverordnung angekreuzt ist' },
        follow_up_reason: { type: 'string', description: 'Begruendung fuer die Folgeverordnung, falls vorhanden' },
      },
    },
    physician: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name des Arztes oder der Praxis' },
        lanr: { type: 'string', description: 'LANR, falls vorhanden' },
      },
    },
    confidence_notes: {
      type: 'string',
      description: 'Kurzer Hinweis, welche Felder unsicher oder schlecht lesbar sind',
    },
  },
};

function valueFrom(...values) {
  return values.find(value => value !== undefined && value !== null && String(value).trim() !== '') || '';
}

function normalizeIcdCodes(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[,;\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return false;
  return ['true', 'ja', 'yes', 'x', 'angekreuzt', 'checked', '1'].includes(raw);
}

export function normalizePrescriptionExtraction(result = {}) {
  const document = result.document || {};
  const patient = result.patient || {};
  const insurance = result.insurance || {};
  const prescription = result.prescription || {};
  const provider = result.provider || {};
  const physician = result.physician || {};
  const rehabilitationSportChecked = normalizeBoolean(
    valueFrom(prescription.rehabilitation_sport_checked, result.rehabilitation_sport_checked)
  );
  const functionalTrainingChecked = normalizeBoolean(
    valueFrom(prescription.functional_training_checked, result.functional_training_checked)
  );

  return {
    patient_first_name: valueFrom(patient.first_name, result.patient_first_name, result.first_name),
    patient_last_name: valueFrom(patient.last_name, result.patient_last_name, result.last_name),
    birthdate: normalizeDate(valueFrom(patient.birthdate, result.birthdate)),
    gender: valueFrom(patient.gender, result.gender),
    street: valueFrom(patient.street, result.street),
    postal_code: valueFrom(patient.postal_code, result.postal_code),
    city: valueFrom(patient.city, result.city),
    address: valueFrom(patient.address, result.address),
    health_insurance: valueFrom(insurance.health_insurance, result.health_insurance),
    insurance_number: normalizeInsuranceNumber(valueFrom(insurance.insurance_number, result.insurance_number)),
    cost_carrier_number: valueFrom(insurance.cost_carrier_number, result.cost_carrier_number),
    insured_status: valueFrom(insurance.insured_status, result.insured_status),
    prescription_date: normalizeDate(valueFrom(prescription.prescription_date, result.prescription_date)),
    valid_from: normalizeDate(valueFrom(prescription.valid_from, result.valid_from)),
    valid_to: normalizeDate(valueFrom(prescription.valid_to, result.valid_to)),
    form_type: valueFrom(document.form_type, result.form_type),
    form_number: valueFrom(document.form_number, result.form_number),
    form_version: valueFrom(document.form_version, result.form_version),
    practice_site_number: valueFrom(provider.practice_site_number, result.practice_site_number),
    doctor_number: valueFrom(provider.doctor_number, provider.lanr, physician.lanr, result.doctor_number, result.physician_lanr),
    prescribed_service: valueFrom(
      prescription.prescribed_service,
      result.prescribed_service,
      rehabilitationSportChecked ? 'Rehabilitationssport' : '',
      functionalTrainingChecked ? 'Funktionstraining' : '',
      'Rehabilitationssport'
    ),
    sport_type: valueFrom(prescription.sport_type, result.sport_type),
    functional_training_type: valueFrom(prescription.functional_training_type, result.functional_training_type),
    prescribed_units: valueFrom(prescription.prescribed_units, result.prescribed_units),
    duration_months: valueFrom(prescription.duration_months, result.duration_months),
    frequency: valueFrom(prescription.frequency, result.frequency),
    diagnosis_text: valueFrom(prescription.diagnosis_text, result.diagnosis_text),
    icd_codes: normalizeIcdCodes(valueFrom(prescription.icd_codes, result.icd_codes)),
    impairment_text: valueFrom(prescription.impairment_text, result.impairment_text),
    rehab_goal: valueFrom(prescription.rehab_goal, result.rehab_goal),
    follow_up_prescription: normalizeBoolean(valueFrom(prescription.follow_up_prescription, result.follow_up_prescription)),
    follow_up_reason: valueFrom(prescription.follow_up_reason, result.follow_up_reason),
    physician_name: valueFrom(provider.physician_name, physician.name, result.physician_name),
    physician_lanr: valueFrom(physician.lanr, provider.lanr, result.physician_lanr),
    prf_number: valueFrom(document.prf_number, result.prf_number),
    page_count: valueFrom(document.page_count, result.page_count),
    blank_pages_detected: valueFrom(document.blank_pages_detected, result.blank_pages_detected),
    notes: valueFrom(result.confidence_notes, result.notes),
  };
}

export async function uploadPrescriptionFile(base44, file) {
  if (!file) throw new Error('Keine Datei ausgewaehlt.');

  let fileMeta = {
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    storage_mode: 'private',
  };
  let extractionUrl = null;

  try {
    const privateUpload = await base44.integrations.Core.UploadPrivateFile({ file });
    const signed = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: privateUpload.file_uri,
      expires_in: 900,
    });
    fileMeta = { ...fileMeta, file_uri: privateUpload.file_uri };
    extractionUrl = signed.signed_url;
  } catch (privateError) {
    console.warn('Private prescription upload failed, using public upload fallback', privateError?.message || privateError);
    const publicUpload = await base44.integrations.Core.UploadFile({ file });
    fileMeta = {
      ...fileMeta,
      file_url: publicUpload.file_url,
      storage_mode: 'public_fallback',
    };
    extractionUrl = publicUpload.file_url;
  }

  return { fileMeta, extractionUrl };
}

export async function createExtractionUrl(base44, fileMeta) {
  if (fileMeta?.file_url) return fileMeta.file_url;
  if (fileMeta?.file_uri) {
    const signed = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: fileMeta.file_uri,
      expires_in: 900,
    });
    return signed.signed_url;
  }
  return null;
}

function buildExtractionResult(raw, options = {}) {
  const form = normalizePrescriptionExtraction(raw);
  const hasUsefulData = Boolean(
    form.patient_first_name ||
    form.patient_last_name ||
    form.insurance_number ||
    form.health_insurance ||
    form.diagnosis_text ||
    form.icd_codes?.length
  );

  return {
    extraction: {
      raw,
      status: hasUsefulData ? 'extracted' : 'manual_review',
      confidence: hasUsefulData
        ? raw?.confidence_notes ? 'needs_review' : 'review_required'
        : 'empty_result',
      url_mode: options.urlMode || 'unknown',
      retry_mode: options.retryMode || '',
    },
    form,
  };
}

export async function extractPrescriptionData(base44, extractionUrl, options = {}) {
  if (!extractionUrl) throw new Error('Keine Datei-URL fuer die Rezeptauslesung vorhanden.');

  const raw = await base44.integrations.Core.ExtractDataFromUploadedFile({
    file_url: extractionUrl,
    json_schema: PRESCRIPTION_EXTRACTION_SCHEMA,
  });

  return buildExtractionResult(raw, options);
}

export async function extractPrescriptionDataWithRetry(base44, { extractionUrl, file, fileMeta } = {}) {
  const firstUrlMode = fileMeta?.file_url || fileMeta?.storage_mode === 'public_fallback'
    ? 'public_url'
    : 'private_signed_url';

  try {
    const result = await extractPrescriptionData(base44, extractionUrl, { urlMode: firstUrlMode });
    return { ...result, fileMeta, extractionUrl };
  } catch (firstError) {
    if (!file || firstUrlMode === 'public_url') throw firstError;

    console.warn('Prescription extraction via signed URL failed, retrying with public upload fallback', firstError?.message || firstError);

    try {
      const publicUpload = await base44.integrations.Core.UploadFile({ file });
      const retry = await extractPrescriptionData(base44, publicUpload.file_url, {
        urlMode: 'public_retry',
        retryMode: 'public_upload_after_signed_url_failed',
      });

      return {
        ...retry,
        fileMeta: {
          ...fileMeta,
          extraction_mode: 'public_retry',
        },
        extractionUrl: publicUpload.file_url,
        firstError,
      };
    } catch (retryError) {
      const retryMessage = retryError?.message || 'OCR-Retry fehlgeschlagen';
      const firstMessage = firstError?.message || 'Signed-URL-OCR fehlgeschlagen';
      throw new Error(`Automatische Rezeptauslesung fehlgeschlagen. ${firstMessage}. Retry: ${retryMessage}`);
    }
  }
}

export async function uploadAndExtractPrescription(base44, file) {
  const upload = await uploadPrescriptionFile(base44, file);
  const extraction = await extractPrescriptionDataWithRetry(base44, {
    ...upload,
    file,
  });

  return {
    ...upload,
    ...extraction,
  };
}
