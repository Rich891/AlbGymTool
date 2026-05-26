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
  doctor_signature_present: false,
  doctor_stamp_present: false,
  patient_signature_present: false,
  approval_required_hint: false,
  approval_present: false,
  approval_date: '',
  approval_until: '',
  approval_reference: '',
  document_kind: '',
  contains_multiple_prescriptions: false,
  prescription_count: '',
  primary_prescription_page: '',
  page_roles: [],
  page_count: '',
  blank_pages_detected: '',
  scan_warning: '',
  notes: '',
};

export const PRESCRIPTION_EXTRACTION_PROMPT = `
Du liest AlbGym Rehasport-Rezeptscans. Als Trainingsmuster wurden historische
Rezeptstapel aus 2024 verwendet. Die eigentlichen Produktiv-Uploads sind normalerweise
einzelne Rezepte, aber die alten Stapel zeigen typische Varianten:
- Formular 56 Vorderseiten mit "Antrag auf Kostenuebernahme" und Markierung "56".
- Formular 56 kann roetlich, grau oder blass gescannt sein, mit Stempeln, Handschrift,
  Lochrand, Barcode/QR-Code und Kassenaufklebern.
- Rueckseiten/Bewilligungsseiten der Krankenkasse enthalten oft Kostenzusage,
  Unterschrift/Stempel, Gueltigkeitsdaten oder IK-Hinweise.
- DAK/AOK/IKK/Barmer-Briefe, Begleitschreiben, Abrechnungsboegen und leere Seiten sind
  keine Quelle fuer neue Kundendaten.

Fuelle die Maske aus einer Formular-56-Rezeptseite. Wenn neben der Vorderseite auch
eine Rueckseite/Bewilligung vorhanden ist, darfst du daraus nur ergaenzende Rezeptdaten
uebernehmen, aber Patientendaten haben Vorrang von der Formular-56-Vorderseite.
Vermische nie Daten von verschiedenen Personen. Wenn mehrere Personen sichtbar sind,
verwende nur die erste eindeutig erkennbare Formular-56-Person und notiere den Hinweis
in confidence_notes.

Wichtige Feldpositionen auf Formular 56: Patient/Kasse links oben, Versichertennummer,
Kostentraegerkennung, Status, BSNR, Arzt-Nr. und Datum rechts oben; Diagnose/ICD,
Schaedigung und Ziel im Mittelteil; Rehasport/Funktionstraining, Art, Einheiten,
Dauer und Folgeverordnung im unteren Teil. Arztstempel und Arztunterschrift sind meist
unten/rechts oder im unteren Formularbereich sichtbar. Bewilligungen der Krankenkasse
stehen haeufig auf Rueckseiten oder separaten Bewilligungsseiten und enthalten Gueltigkeit,
Genehmigungsnummer, Stempel oder Unterschrift. Deutsche Datumswerte kommen oft als
TT.MM.JJ vor: Geburtsdaten duerfen nicht in der Zukunft liegen; Rezeptdaten aus
2024/2025/2026 sollen als 20xx interpretiert werden.
`.trim();

export const PRESCRIPTION_EXTRACTION_SCHEMA = {
  type: 'object',
  description: 'Daten aus einem deutschen Rehabilitationssport-/Funktionstraining-Rezept, besonders Formular 56, extrahieren. Bei Bild-PDFs OCR/Vision verwenden, angekreuzte Checkboxen auswerten und Kassen-/Bewilligungsseiten nur als ergaenzende Quelle nutzen.',
  properties: {
    document: {
      type: 'object',
      properties: {
        document_kind: {
          type: 'string',
          enum: ['formular_56', 'approval_letter', 'cover_letter', 'attendance_sheet', 'blank_page', 'mixed_batch', 'unknown'],
          description: 'Primaerer Dokumenttyp. mixed_batch nur als Hinweis verwenden, wenn mehrere Seitentypen oder Personen sichtbar sind.',
        },
        contains_multiple_prescriptions: {
          type: 'boolean',
          description: 'True, wenn mehrere unterschiedliche Rezeptpersonen/Formular-56-Rezepte im PDF sichtbar sind.',
        },
        prescription_count: {
          type: 'number',
          description: 'Erkennbare Anzahl verschiedener Formular-56-Rezepte/Patienten im Dokument.',
        },
        primary_prescription_page: {
          type: 'number',
          description: 'Seitennummer der Formular-56-Seite, aus der die Kundendaten extrahiert wurden.',
        },
        page_roles: {
          type: 'array',
          description: 'Kurze Seitentypen-Klassifizierung, z.B. Formular 56, Bewilligungsseite, leer, Begleitschreiben.',
          items: {
            type: 'object',
            properties: {
              page_number: { type: 'number' },
              role: { type: 'string' },
              patient_hint: { type: 'string' },
            },
          },
        },
        form_type: { type: 'string', description: 'Formulartyp, z.B. Antrag auf Kostenuebernahme' },
        form_number: { type: 'string', description: 'Formularnummer, z.B. Muster 56 oder Formular 56' },
        form_version: { type: 'string', description: 'Version/Ausgabe, z.B. Muster 56.1/E (1.2023)' },
        prf_number: { type: 'string', description: 'PRF.NR oder Pruefnummer, falls sichtbar' },
        page_count: { type: 'number', description: 'Anzahl Seiten im Scan/PDF' },
        blank_pages_detected: { type: 'number', description: 'Anzahl leerer oder nahezu leerer Seiten' },
        scan_warning: { type: 'string', description: 'Warnhinweis, wenn Felder unsicher sind oder manuell geprueft werden muessen' },
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
    validation: {
      type: 'object',
      properties: {
        doctor_signature_present: { type: 'boolean', description: 'True, wenn eine Arztunterschrift im richtigen Formularbereich sichtbar ist.' },
        doctor_stamp_present: { type: 'boolean', description: 'True, wenn ein Arzt-/Praxisstempel sichtbar ist.' },
        patient_signature_present: { type: 'boolean', description: 'True, wenn eine Patienten-/Versichertenunterschrift sichtbar ist, falls vorhanden.' },
        approval_required_hint: { type: 'boolean', description: 'True, wenn Rezept oder Kassenblatt erkennen lassen, dass eine Genehmigung erforderlich ist.' },
        approval_present: { type: 'boolean', description: 'True, wenn eine Krankenkassen-Genehmigung/Bewilligung sichtbar ist.' },
        approval_date: { type: 'string', description: 'Genehmigungsdatum im Format YYYY-MM-DD, falls sichtbar.' },
        approval_until: { type: 'string', description: 'Genehmigt/gueltig bis im Format YYYY-MM-DD, falls sichtbar.' },
        approval_reference: { type: 'string', description: 'Genehmigungsnummer, Aktenzeichen oder Hinweis der Krankenkasse.' },
        visual_quality_notes: { type: 'string', description: 'Hinweise zu schlechter Lesbarkeit, abgeschnittenen Feldern, Stempeln oder Unterschriften.' },
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
  const source = result.data || result.result || result.extracted_data || result;
  const document = source.document || {};
  const patient = source.patient || {};
  const insurance = source.insurance || {};
  const prescription = source.prescription || {};
  const provider = source.provider || {};
  const physician = source.physician || {};
  const validation = source.validation || {};
  const rehabilitationSportChecked = normalizeBoolean(
    valueFrom(prescription.rehabilitation_sport_checked, source.rehabilitation_sport_checked)
  );
  const functionalTrainingChecked = normalizeBoolean(
    valueFrom(prescription.functional_training_checked, source.functional_training_checked)
  );

  return {
    patient_first_name: valueFrom(patient.first_name, source.patient_first_name, source.first_name),
    patient_last_name: valueFrom(patient.last_name, source.patient_last_name, source.last_name),
    birthdate: normalizeDate(valueFrom(patient.birthdate, source.birthdate)),
    gender: valueFrom(patient.gender, source.gender),
    street: valueFrom(patient.street, source.street),
    postal_code: valueFrom(patient.postal_code, source.postal_code),
    city: valueFrom(patient.city, source.city),
    address: valueFrom(patient.address, source.address),
    health_insurance: valueFrom(insurance.health_insurance, source.health_insurance),
    insurance_number: normalizeInsuranceNumber(valueFrom(insurance.insurance_number, source.insurance_number)),
    cost_carrier_number: valueFrom(insurance.cost_carrier_number, source.cost_carrier_number),
    insured_status: valueFrom(insurance.insured_status, source.insured_status),
    prescription_date: normalizeDate(valueFrom(prescription.prescription_date, source.prescription_date)),
    valid_from: normalizeDate(valueFrom(prescription.valid_from, source.valid_from)),
    valid_to: normalizeDate(valueFrom(prescription.valid_to, source.valid_to)),
    form_type: valueFrom(document.form_type, source.form_type),
    form_number: valueFrom(document.form_number, source.form_number),
    form_version: valueFrom(document.form_version, source.form_version),
    practice_site_number: valueFrom(provider.practice_site_number, source.practice_site_number),
    doctor_number: valueFrom(provider.doctor_number, provider.lanr, physician.lanr, source.doctor_number, source.physician_lanr),
    prescribed_service: valueFrom(
      prescription.prescribed_service,
      source.prescribed_service,
      rehabilitationSportChecked ? 'Rehabilitationssport' : '',
      functionalTrainingChecked ? 'Funktionstraining' : '',
      'Rehabilitationssport'
    ),
    sport_type: valueFrom(prescription.sport_type, source.sport_type),
    functional_training_type: valueFrom(prescription.functional_training_type, source.functional_training_type),
    prescribed_units: valueFrom(prescription.prescribed_units, source.prescribed_units),
    duration_months: valueFrom(prescription.duration_months, source.duration_months),
    frequency: valueFrom(prescription.frequency, source.frequency),
    diagnosis_text: valueFrom(prescription.diagnosis_text, source.diagnosis_text),
    icd_codes: normalizeIcdCodes(valueFrom(prescription.icd_codes, source.icd_codes)),
    impairment_text: valueFrom(prescription.impairment_text, source.impairment_text),
    rehab_goal: valueFrom(prescription.rehab_goal, source.rehab_goal),
    follow_up_prescription: normalizeBoolean(valueFrom(prescription.follow_up_prescription, source.follow_up_prescription)),
    follow_up_reason: valueFrom(prescription.follow_up_reason, source.follow_up_reason),
    physician_name: valueFrom(provider.physician_name, physician.name, source.physician_name),
    physician_lanr: valueFrom(physician.lanr, provider.lanr, source.physician_lanr),
    prf_number: valueFrom(document.prf_number, source.prf_number),
    doctor_signature_present: normalizeBoolean(valueFrom(validation.doctor_signature_present, source.doctor_signature_present)),
    doctor_stamp_present: normalizeBoolean(valueFrom(validation.doctor_stamp_present, source.doctor_stamp_present)),
    patient_signature_present: normalizeBoolean(valueFrom(validation.patient_signature_present, source.patient_signature_present)),
    approval_required_hint: normalizeBoolean(valueFrom(validation.approval_required_hint, source.approval_required_hint)),
    approval_present: normalizeBoolean(valueFrom(validation.approval_present, source.approval_present)),
    approval_date: normalizeDate(valueFrom(validation.approval_date, source.approval_date)),
    approval_until: normalizeDate(valueFrom(validation.approval_until, source.approval_until)),
    approval_reference: valueFrom(validation.approval_reference, source.approval_reference),
    document_kind: valueFrom(document.document_kind, source.document_kind),
    contains_multiple_prescriptions: normalizeBoolean(valueFrom(document.contains_multiple_prescriptions, source.contains_multiple_prescriptions)),
    prescription_count: valueFrom(document.prescription_count, source.prescription_count),
    primary_prescription_page: valueFrom(document.primary_prescription_page, source.primary_prescription_page),
    page_roles: Array.isArray(document.page_roles) ? document.page_roles : [],
    page_count: valueFrom(document.page_count, source.page_count),
    blank_pages_detected: valueFrom(document.blank_pages_detected, source.blank_pages_detected),
    scan_warning: valueFrom(document.scan_warning, validation.visual_quality_notes, source.scan_warning),
    notes: valueFrom(source.confidence_notes, validation.visual_quality_notes, source.notes),
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
  const prescriptionCount = Number(form.prescription_count) || 0;
  const isBatch = form.contains_multiple_prescriptions || prescriptionCount > 1;
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
      confidence: isBatch
        ? 'needs_review'
        : hasUsefulData
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

export async function invokePrescriptionVision(base44, fileUrl, options = {}) {
  if (!fileUrl) throw new Error('Keine Datei-URL fuer die Vision-Auslesung vorhanden.');

  const raw = await base44.integrations.Core.InvokeLLM({
    prompt: PRESCRIPTION_EXTRACTION_PROMPT,
    file_urls: [fileUrl],
    response_json_schema: PRESCRIPTION_EXTRACTION_SCHEMA,
  });

  return buildExtractionResult(raw, {
    urlMode: options.urlMode || 'llm_vision',
    retryMode: options.retryMode || 'llm_vision_fallback',
  });
}

async function extractFromPublicUrl(base44, { fileUrl, fileMeta, retryMode }) {
  try {
    const result = await extractPrescriptionData(base44, fileUrl, {
      urlMode: 'public_retry',
      retryMode,
    });

    if (result.extraction.status !== 'manual_review') {
      return {
        ...result,
        fileMeta: {
          ...fileMeta,
          extraction_mode: 'public_retry',
        },
        extractionUrl: fileUrl,
      };
    }
  } catch (extractError) {
    console.warn('Public ExtractDataFromUploadedFile failed, trying LLM vision fallback', extractError?.message || extractError);
  }

  const vision = await invokePrescriptionVision(base44, fileUrl, {
    urlMode: 'llm_vision',
    retryMode: `${retryMode}_llm_vision`,
  });

  return {
    ...vision,
    fileMeta: {
      ...fileMeta,
      extraction_mode: 'llm_vision',
    },
    extractionUrl: fileUrl,
  };
}

export async function extractPrescriptionDataWithRetry(base44, { extractionUrl, file, fileMeta } = {}) {
  const firstUrlMode = fileMeta?.file_url || fileMeta?.storage_mode === 'public_fallback'
    ? 'public_url'
    : 'private_signed_url';

  try {
    const result = await extractPrescriptionData(base44, extractionUrl, { urlMode: firstUrlMode });
    if (result.extraction.status !== 'manual_review') {
      return { ...result, fileMeta, extractionUrl };
    }

    if (firstUrlMode === 'public_url') {
      const vision = await invokePrescriptionVision(base44, extractionUrl, {
        urlMode: 'llm_vision',
        retryMode: 'empty_public_extract_llm_vision',
      });
      return {
        ...vision,
        fileMeta: {
          ...fileMeta,
          extraction_mode: 'llm_vision',
        },
        extractionUrl,
      };
    }

    if (file) {
      const publicUpload = await base44.integrations.Core.UploadFile({ file });
      return extractFromPublicUrl(base44, {
        fileUrl: publicUpload.file_url,
        fileMeta,
        retryMode: 'empty_signed_url_extract',
      });
    }

    return { ...result, fileMeta, extractionUrl };
  } catch (firstError) {
    if (firstUrlMode === 'public_url' && extractionUrl) {
      try {
        const vision = await invokePrescriptionVision(base44, extractionUrl, {
          urlMode: 'llm_vision',
          retryMode: 'failed_public_extract_llm_vision',
        });
        return {
          ...vision,
          fileMeta: {
            ...fileMeta,
            extraction_mode: 'llm_vision',
          },
          extractionUrl,
          firstError,
        };
      } catch (visionError) {
        const visionMessage = visionError?.message || 'Vision-Retry fehlgeschlagen';
        const firstMessage = firstError?.message || 'Public-URL-OCR fehlgeschlagen';
        throw new Error(`Automatische Rezeptauslesung fehlgeschlagen. ${firstMessage}. Vision: ${visionMessage}`);
      }
    }

    if (!file || firstUrlMode === 'public_url') throw firstError;

    console.warn('Prescription extraction via signed URL failed, retrying with public upload fallback', firstError?.message || firstError);

    try {
      const publicUpload = await base44.integrations.Core.UploadFile({ file });
      const retry = await extractFromPublicUrl(base44, {
        fileUrl: publicUpload.file_url,
        fileMeta,
        retryMode: 'public_upload_after_signed_url_failed',
      });

      return {
        ...retry,
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
