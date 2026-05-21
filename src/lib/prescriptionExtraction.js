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
  prescription_date: '',
  valid_from: '',
  valid_to: '',
  prescribed_service: 'Rehabilitationssport',
  prescribed_units: '',
  frequency: '',
  diagnosis_text: '',
  icd_codes: [],
  physician_name: '',
  physician_lanr: '',
  notes: '',
};

export const PRESCRIPTION_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
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
      },
    },
    insurance: {
      type: 'object',
      properties: {
        health_insurance: { type: 'string', description: 'Name der Krankenkasse' },
        insurance_number: { type: 'string', description: 'Krankenversichertennummer' },
        cost_carrier_number: { type: 'string', description: 'Kostentraegernummer / IK, falls vorhanden' },
      },
    },
    prescription: {
      type: 'object',
      properties: {
        prescription_date: { type: 'string', description: 'Ausstellungsdatum im Format YYYY-MM-DD' },
        valid_from: { type: 'string', description: 'Gueltig ab, falls vorhanden' },
        valid_to: { type: 'string', description: 'Gueltig bis, falls vorhanden' },
        prescribed_service: { type: 'string', description: 'Verordnete Leistung, z.B. Rehabilitationssport' },
        prescribed_units: { type: 'number', description: 'Anzahl verordneter Einheiten' },
        frequency: { type: 'string', description: 'Trainingsfrequenz, z.B. 1-2x pro Woche' },
        diagnosis_text: { type: 'string', description: 'Diagnose oder Indikation' },
        icd_codes: { type: 'array', items: { type: 'string' }, description: 'ICD-Codes' },
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

export function normalizePrescriptionExtraction(result = {}) {
  const patient = result.patient || {};
  const insurance = result.insurance || {};
  const prescription = result.prescription || {};
  const physician = result.physician || {};

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
    prescription_date: normalizeDate(valueFrom(prescription.prescription_date, result.prescription_date)),
    valid_from: normalizeDate(valueFrom(prescription.valid_from, result.valid_from)),
    valid_to: normalizeDate(valueFrom(prescription.valid_to, result.valid_to)),
    prescribed_service: valueFrom(prescription.prescribed_service, result.prescribed_service, 'Rehabilitationssport'),
    prescribed_units: valueFrom(prescription.prescribed_units, result.prescribed_units),
    frequency: valueFrom(prescription.frequency, result.frequency),
    diagnosis_text: valueFrom(prescription.diagnosis_text, result.diagnosis_text),
    icd_codes: normalizeIcdCodes(valueFrom(prescription.icd_codes, result.icd_codes)),
    physician_name: valueFrom(physician.name, result.physician_name),
    physician_lanr: valueFrom(physician.lanr, result.physician_lanr),
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

export async function extractPrescriptionData(base44, extractionUrl) {
  if (!extractionUrl) throw new Error('Keine Datei-URL fuer die Rezeptauslesung vorhanden.');

  const raw = await base44.integrations.Core.ExtractDataFromUploadedFile({
    file_url: extractionUrl,
    json_schema: PRESCRIPTION_EXTRACTION_SCHEMA,
  });

  return {
    fileMeta,
    extraction: {
      raw,
      status: 'extracted',
      confidence: raw?.confidence_notes ? 'needs_review' : 'review_required',
    },
    form: normalizePrescriptionExtraction(raw),
  };
}

export async function uploadAndExtractPrescription(base44, file) {
  const upload = await uploadPrescriptionFile(base44, file);
  const extraction = await extractPrescriptionData(base44, upload.extractionUrl);

  return {
    ...upload,
    ...extraction,
  };
}
