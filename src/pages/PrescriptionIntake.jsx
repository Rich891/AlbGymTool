import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Save,
  ScanLine,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createEntity, safeListEntity, updateEntity } from '@/lib/entityGateway';
import {
  buildCustomerPayloadFromPrescription,
  buildPrescriptionScanPayload,
  buildRehasportConsultationFromPrescription,
  derivePrescriptionLifecycle,
  upsertUnifiedCustomer,
} from '@/lib/customerDataModel';
import {
  EMPTY_PRESCRIPTION_FORM,
  createExtractionUrl,
  extractPrescriptionDataWithRetry,
  extractPrescriptionQuickData,
  uploadPrescriptionFile,
} from '@/lib/prescriptionExtraction';
import {
  evaluatePrescription,
  getWorstFieldSeverity,
} from '@/lib/prescriptionValidation';

function hasMergeableValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return value === true;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function mergeFilledPrescriptionForm(previous, incoming = {}) {
  const next = { ...previous };

  for (const [field, value] of Object.entries(incoming)) {
    if (hasMergeableValue(value)) {
      next[field] = value;
    }
  }

  return next;
}

const LIFECYCLE_TRIGGER_FIELDS = new Set([
  'health_insurance',
  'prescription_date',
  'prescribed_units',
  'duration_months',
  'approval_date',
  'approval_until',
  'valid_from',
  'valid_to',
]);

export default function PrescriptionIntake() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdFromUrl = searchParams.get('customerId') || '';
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileMeta, setFileMeta] = useState(null);
  const [extractionUrl, setExtractionUrl] = useState('');
  const [extraction, setExtraction] = useState(null);
  const [scanError, setScanError] = useState('');
  const [form, setForm] = useState(EMPTY_PRESCRIPTION_FORM);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [appliedCustomerIdParam, setAppliedCustomerIdParam] = useState('');
  const [scanPhase, setScanPhase] = useState('Bereit');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-unified-prescription'],
    queryFn: () => safeListEntity(base44, 'Customer', '-created_date', 300),
    retry: false,
  });

  const { data: prescriptionScans = [] } = useQuery({
    queryKey: ['prescription-scans'],
    queryFn: () => safeListEntity(base44, 'PrescriptionScan', '-created_date', 20),
    retry: false,
  });

  const { data: healthInsurances = [] } = useQuery({
    queryKey: ['health-insurances'],
    queryFn: () => safeListEntity(base44, 'HealthInsurance', 'name', 250),
    retry: false,
  });

  useEffect(() => {
    if (!customerIdFromUrl || appliedCustomerIdParam === customerIdFromUrl) return;
    setSelectedCustomerId(customerIdFromUrl);
    setAppliedCustomerIdParam(customerIdFromUrl);
  }, [customerIdFromUrl, appliedCustomerIdParam]);

  useEffect(() => {
    if (!file || !file.type?.startsWith('image/')) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const customerDraft = useMemo(() => buildCustomerPayloadFromPrescription(form), [form]);
  const prescriptionReview = useMemo(
    () => evaluatePrescription(form, healthInsurances),
    [form, healthInsurances],
  );
  const hasScanContext = Boolean(
    file ||
    extraction ||
    form.patient_first_name ||
    form.patient_last_name ||
    form.health_insurance ||
    form.prescription_date
  );

  const candidateCustomers = useMemo(() => {
    const insuranceNumber = customerDraft.insurance_number?.replace(/\s/g, '').toLowerCase();
    const email = customerDraft.email?.toLowerCase();
    const nameBirthdate = `${customerDraft.first_name}|${customerDraft.last_name}|${customerDraft.birthdate}`.toLowerCase();

    return customers.filter(customer => {
      const customerInsurance = customer.insurance_number?.replace(/\s/g, '').toLowerCase();
      const customerEmail = customer.email?.toLowerCase();
      const customerNameBirthdate = `${customer.first_name}|${customer.last_name}|${customer.birthdate}`.toLowerCase();

      return (
        (insuranceNumber && customerInsurance === insuranceNumber) ||
        (email && customerEmail === email) ||
        (customerDraft.birthdate && customerNameBirthdate === nameBirthdate)
      );
    }).slice(0, 5);
  }, [customerDraft, customers]);

  const canSave = !!file && !!form.patient_first_name?.trim() && !!form.patient_last_name?.trim();

  const mergeAndDeriveForm = (previous, incoming = {}) => {
    const merged = mergeFilledPrescriptionForm(previous, incoming);
    return derivePrescriptionLifecycle(merged, evaluatePrescription(merged, healthInsurances));
  };
  const set = (field, value) => setForm(prev => {
    const next = { ...prev, [field]: value };
    if (!LIFECYCLE_TRIGGER_FIELDS.has(field)) return next;
    return derivePrescriptionLifecycle(next, evaluatePrescription(next, healthInsurances));
  });
  const issuesFor = (field) => prescriptionReview.field_issues?.[field] || [];
  const inputFor = (field) => `${inputCls} ${fieldStateClass(issuesFor(field))}`;

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFile(nextFile);
    setFileMeta(null);
    setExtractionUrl('');
    setExtraction(null);
    setScanError('');
    setScanPhase('Datei bereit - Rezept auslesen starten');
  };

  const ensureFileUploaded = async () => {
    if (!file) {
      toast.error('Bitte zuerst einen Rezeptscan auswaehlen.');
      return null;
    }

    if (fileMeta) {
      const nextExtractionUrl = extractionUrl || await createExtractionUrl(base44, fileMeta);
      setExtractionUrl(nextExtractionUrl || '');
      return { fileMeta, extractionUrl: nextExtractionUrl };
    }

    const upload = await uploadPrescriptionFile(base44, file);
    setFileMeta(upload.fileMeta);
    setExtractionUrl(upload.extractionUrl || '');
    return upload;
  };

  const handleExtract = async () => {
    setScanError('');

    setExtracting(true);
    try {
      setScanPhase('Datei wird hochgeladen');
      const upload = await ensureFileUploaded();
      if (!upload) return null;

      setScanPhase('OCR liest Patient, Kasse und Rezeptdaten');
      let nextExtractionUrl = upload.extractionUrl;
      if (!nextExtractionUrl) {
        nextExtractionUrl = await createExtractionUrl(base44, upload.fileMeta);
        setExtractionUrl(nextExtractionUrl || '');
      }

      let quickResult = null;
      try {
        setScanPhase('Basisdaten werden schnell uebernommen');
        quickResult = await extractPrescriptionQuickData(base44, nextExtractionUrl, {
          urlMode: 'quick_profile',
        });

        if (quickResult.fileMeta) setFileMeta(quickResult.fileMeta);
        if (quickResult.extractionUrl) setExtractionUrl(quickResult.extractionUrl);
        setExtraction({
          ...quickResult.extraction,
          stage: 'quick_profile',
        });
        setForm(prev => mergeAndDeriveForm(prev, quickResult.form));

        if (quickResult.extraction.status === 'extracted') {
          setScanPhase('Basisdaten uebernommen - Vollanalyse laeuft');
          toast.success('Basisdaten wurden uebernommen. Vollanalyse laeuft weiter.');
        } else {
          setScanPhase('Schnellauslesung ohne Treffer - Vollanalyse laeuft');
        }
      } catch (quickError) {
        console.warn('Quick prescription extraction skipped', quickError?.message || quickError);
        setScanPhase('Schnellauslesung fehlgeschlagen - Vollanalyse laeuft');
      }

      setScanPhase(quickResult?.extraction?.status === 'extracted'
        ? 'Basisdaten uebernommen - vollstaendige Formular-56-Analyse laeuft'
        : 'Formular-56-Analyse laeuft');
      const result = await extractPrescriptionDataWithRetry(base44, {
        extractionUrl: nextExtractionUrl,
        file,
        fileMeta: upload.fileMeta,
      });
      if (result.fileMeta) setFileMeta(result.fileMeta);
      if (result.extractionUrl) setExtractionUrl(result.extractionUrl);
      setExtraction({
        ...result.extraction,
        stage: quickResult ? 'full_after_quick_profile' : 'full',
      });
      setForm(prev => mergeAndDeriveForm(prev, result.form));
      setScanPhase('Rezeptpruefung aktualisiert');
      if (result.extraction.status === 'extracted') {
        toast.success('Rezept wurde ausgelesen. Bitte die Daten pruefen.');
      } else {
        toast.warning('OCR lief durch, hat aber keine verwertbaren Felder erkannt. Bitte manuell pruefen.');
      }
      return { ...upload, ...result };
    } catch (error) {
      console.error('Prescription extraction failed', error);
      const message = error?.message || 'Automatische Rezeptauslesung fehlgeschlagen.';
      setScanError(message);
      setScanPhase('Manuelle Pruefung noetig');
      setExtraction({
        raw: { error: message },
        status: 'failed',
        confidence: 'manual_entry',
      });
      toast.warning('Automatisches Auslesen fehlgeschlagen. Der Scan kann trotzdem mit manueller Pruefung gespeichert werden.');
      return null;
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      toast.error('Scan, Vorname und Nachname sind Pflicht.');
      return;
    }

    setSaving(true);
    try {
      setScanPhase('Kundenprofil und Rezept werden gespeichert');
      let currentFileMeta = fileMeta;
      let currentExtraction = extraction;

      if (!currentFileMeta) {
        const upload = await ensureFileUploaded();
        if (!upload) return;
        currentFileMeta = upload.fileMeta;
      }

      currentExtraction = currentExtraction || {
        raw: null,
        status: 'manual_review',
        confidence: 'manual_entry',
      };

      const derivedForm = derivePrescriptionLifecycle(form, prescriptionReview);
      const finalReview = evaluatePrescription(derivedForm, healthInsurances);
      const reviewedPrescription = {
        ...derivedForm,
        validation_report: finalReview,
        prescription_validation_status: finalReview.status,
      };
      currentExtraction = {
        ...currentExtraction,
        validation_report: finalReview,
      };
      const profilePayload = buildCustomerPayloadFromPrescription(reviewedPrescription, {
        fileMeta: currentFileMeta,
        extraction: currentExtraction,
      });

      const targetCustomerId = selectedCustomerId || customerIdFromUrl || undefined;
      const upsert = await upsertUnifiedCustomer(base44, profilePayload, {
        existingCustomerId: targetCustomerId,
      });
      const savedCustomerId = upsert.customer?.id || targetCustomerId;
      if (!savedCustomerId) {
        throw new Error('Kundenakte wurde gespeichert, aber Base44 hat keine Customer-ID zurueckgegeben.');
      }
      const savedCustomer = {
        ...profilePayload,
        ...upsert.customer,
        id: savedCustomerId,
      };

      let prescriptionScan = null;
      let rehaRecord = null;
      let archiveWarning = '';
      try {
        setScanPhase('Kundenakte gespeichert - Rezeptarchiv wird verknuepft');
        prescriptionScan = await createEntity(
          base44,
          'PrescriptionScan',
          buildPrescriptionScanPayload({
            customer: savedCustomer,
            prescription: reviewedPrescription,
            fileMeta: currentFileMeta,
            extraction: currentExtraction,
          })
        );

        rehaRecord = await createEntity(
          base44,
          'RehasportConsultation',
          buildRehasportConsultationFromPrescription({
            customer: savedCustomer,
            prescription: reviewedPrescription,
            prescriptionScanId: prescriptionScan.id,
          })
        );

        await updateEntity(base44, 'PrescriptionScan', prescriptionScan.id, {
          rehasport_consultation_id: rehaRecord.id,
        });

        await updateEntity(base44, 'Customer', savedCustomerId, {
          last_prescription_scan_id: prescriptionScan.id,
          last_rehasport_consultation_id: rehaRecord.id,
          active_reha_case_id: rehaRecord.id,
        });

        try {
          await createEntity(base44, 'ActivityLog', {
            customer_id: savedCustomerId,
            rehasport_consultation_id: rehaRecord.id,
            prescription_scan_id: prescriptionScan.id,
            type: 'prescription.scan_saved',
            actor: 'advisor',
            occurred_at: new Date().toISOString(),
            notes: upsert.created ? 'Kunde aus Rezeptscan angelegt' : 'Kunde aus Rezeptscan aktualisiert',
            outcome: finalReview.status,
          });
        } catch (activityError) {
          console.warn('ActivityLog for prescription skipped', activityError?.message || activityError);
        }
      } catch (archiveError) {
        archiveWarning = archiveError?.message || 'Archiv-/Verlaufsdaten konnten nicht vollstaendig gespeichert werden.';
        console.warn('Prescription archive skipped after central customer save', archiveWarning);
      }

      if (archiveWarning) {
        toast.warning('Kundenakte wurde gespeichert. Rezeptarchiv/Verlauf bitte spaeter pruefen.');
      } else {
        toast.success(upsert.created ? 'Kundenakte mit Rezeptdaten wurde angelegt.' : 'Kundenakte mit Rezeptdaten wurde aktualisiert.');
      }
      setFile(null);
      setPreviewUrl('');
      setFileMeta(null);
      setExtractionUrl('');
      setExtraction(null);
      setScanError('');
      setForm(EMPTY_PRESCRIPTION_FORM);
      setSelectedCustomerId('');
      setScanPhase('Gespeichert');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-unified-prescription'] });
      queryClient.invalidateQueries({ queryKey: ['rehasport-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-scans'] });
      queryClient.invalidateQueries({ queryKey: ['personen-cockpit', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['personenakte', 'customer', savedCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['personenakte', 'prescription-scans', savedCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['personenakte', 'reha-cases', savedCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['personenakte', 'activities', savedCustomerId] });

      navigate(`/berater/personen/${savedCustomerId}?tab=profile`, { replace: true });
    } catch (error) {
      console.error('Prescription save failed', error);
      toast.error('Rezept konnte nicht gespeichert werden. Sind Customer, PrescriptionScan und RehasportConsultation in Base44 angelegt?');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Rezept-Import</p>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Scan & Kundendatei</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
            Rezept einlesen, Daten pruefen, zentrale Kundendatei anlegen oder aktualisieren und den Scan revisionsfaehig speichern.
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-3xl">
            Automatisches Auslesen fuellt die Kundenprofil-Felder, bewertet die Rezeptgueltigkeit und markiert fehlende oder unsichere Felder direkt im Formular.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExtract}
            disabled={!file || extracting || saving}
            className="h-11 px-4 rounded-xl border border-border bg-card text-foreground font-bold hover:bg-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
            Rezept auslesen
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || extracting || saving}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-black hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <section className="space-y-4">
          <label className="block rounded-2xl border border-dashed border-border bg-card p-6 cursor-pointer hover:border-primary/50 transition-all">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-black text-foreground">Rezeptscan waehlen</p>
                <p className="text-sm text-muted-foreground mt-1">Foto, Scan oder PDF</p>
              </div>
            </div>
          </label>

          {file && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                </div>
              </div>
              {previewUrl ? (
                <img src={previewUrl} alt="Rezept Vorschau" className="w-full rounded-xl border border-border object-cover max-h-[420px]" />
              ) : (
                <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                  PDF ist ausgewaehlt und wird beim Auslesen hochgeladen.
                </div>
              )}
            </div>
          )}

          <ReviewPanel review={prescriptionReview} phase={scanPhase} extracting={extracting} hasScanContext={hasScanContext} />
          <StatusPanel fileMeta={fileMeta} extraction={extraction} scanError={scanError} review={prescriptionReview} hasScanContext={hasScanContext} />
          <CandidatePanel
            candidates={candidateCustomers}
            selectedCustomerId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
          />
        </section>

        <section className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserRound className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-foreground uppercase">Kundendaten</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Vorname *" issues={issuesFor('patient_first_name')}>
                <input value={form.patient_first_name} onChange={event => set('patient_first_name', event.target.value)} className={inputFor('patient_first_name')} />
              </Field>
              <Field label="Nachname *" issues={issuesFor('patient_last_name')}>
                <input value={form.patient_last_name} onChange={event => set('patient_last_name', event.target.value)} className={inputFor('patient_last_name')} />
              </Field>
              <Field label="Geburtsdatum" issues={issuesFor('birthdate')}>
                <input type="date" value={form.birthdate} onChange={event => set('birthdate', event.target.value)} className={inputFor('birthdate')} />
              </Field>
              <Field label="Geschlecht">
                <select value={form.gender} onChange={event => set('gender', event.target.value)} className={inputFor('gender')}>
                  <option value="">-</option>
                  <option value={'m\u00e4nnlich'}>Maennlich</option>
                  <option value="weiblich">Weiblich</option>
                  <option value="divers">Divers</option>
                </select>
              </Field>
              <Field label="Strasse" issues={issuesFor('street')}>
                <input value={form.street} onChange={event => set('street', event.target.value)} className={inputFor('street')} />
              </Field>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <Field label="PLZ" issues={issuesFor('postal_code')}>
                  <input value={form.postal_code} onChange={event => set('postal_code', event.target.value)} className={inputFor('postal_code')} />
                </Field>
                <Field label="Ort" issues={issuesFor('city')}>
                  <input value={form.city} onChange={event => set('city', event.target.value)} className={inputFor('city')} />
                </Field>
              </div>
              <Field label="Telefon">
                <input value={form.phone} onChange={event => set('phone', event.target.value)} className={inputFor('phone')} />
              </Field>
              <Field label="E-Mail">
                <input type="email" value={form.email} onChange={event => set('email', event.target.value)} className={inputFor('email')} />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-foreground uppercase">Kasse & Rezept</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Krankenkasse" issues={issuesFor('health_insurance')}>
                <input
                  list="health-insurance-options"
                  value={form.health_insurance}
                  onChange={event => set('health_insurance', event.target.value)}
                  className={inputFor('health_insurance')}
                />
                <datalist id="health-insurance-options">
                  {healthInsurances.map(item => <option key={item.id} value={item.name} />)}
                </datalist>
              </Field>
              <Field label="Versichertennummer" issues={issuesFor('insurance_number')}>
                <input value={form.insurance_number} onChange={event => set('insurance_number', event.target.value)} className={inputFor('insurance_number')} />
              </Field>
              <Field label="Kostentraegernummer">
                <input value={form.cost_carrier_number} onChange={event => set('cost_carrier_number', event.target.value)} className={inputFor('cost_carrier_number')} />
              </Field>
              <Field label="Status">
                <input value={form.insured_status} onChange={event => set('insured_status', event.target.value)} className={inputFor('insured_status')} />
              </Field>
              <Field label="Ausstellungsdatum" issues={issuesFor('prescription_date')}>
                <input type="date" value={form.prescription_date} onChange={event => set('prescription_date', event.target.value)} className={inputFor('prescription_date')} />
              </Field>
              <Field label="Gueltig ab">
                <input type="date" value={form.valid_from} onChange={event => set('valid_from', event.target.value)} className={inputFor('valid_from')} />
              </Field>
              <Field label="Gueltig bis" issues={issuesFor('valid_to')}>
                <input type="date" value={form.valid_to} onChange={event => set('valid_to', event.target.value)} className={inputFor('valid_to')} />
              </Field>
              <Field label="Formular">
                <input value={form.form_type} onChange={event => set('form_type', event.target.value)} className={inputFor('form_type')} />
              </Field>
              <Field label="Muster">
                <input value={form.form_number} onChange={event => set('form_number', event.target.value)} className={inputFor('form_number')} />
              </Field>
              <Field label="Version">
                <input value={form.form_version} onChange={event => set('form_version', event.target.value)} className={inputFor('form_version')} />
              </Field>
              <Field label="BSNR" issues={issuesFor('practice_site_number')}>
                <input value={form.practice_site_number} onChange={event => set('practice_site_number', event.target.value)} className={inputFor('practice_site_number')} />
              </Field>
              <Field label="Arzt-Nr." issues={issuesFor('doctor_number')}>
                <input value={form.doctor_number} onChange={event => set('doctor_number', event.target.value)} className={inputFor('doctor_number')} />
              </Field>
              <Field label="Leistung" issues={issuesFor('prescribed_service')}>
                <input value={form.prescribed_service} onChange={event => set('prescribed_service', event.target.value)} className={inputFor('prescribed_service')} />
              </Field>
              <Field label="Rehasportart" issues={issuesFor('sport_type')}>
                <input value={form.sport_type} onChange={event => set('sport_type', event.target.value)} className={inputFor('sport_type')} />
              </Field>
              <Field label="Einheiten" issues={issuesFor('prescribed_units')}>
                <input type="number" value={form.prescribed_units} onChange={event => set('prescribed_units', event.target.value)} className={inputFor('prescribed_units')} />
              </Field>
              <Field label="Dauer Monate" issues={issuesFor('duration_months')}>
                <input type="number" value={form.duration_months} onChange={event => set('duration_months', event.target.value)} className={inputFor('duration_months')} />
              </Field>
              <Field label="Frequenz" issues={issuesFor('frequency')}>
                <input value={form.frequency} onChange={event => set('frequency', event.target.value)} className={inputFor('frequency')} />
              </Field>
              <Field label="PRF.NR">
                <input value={form.prf_number} onChange={event => set('prf_number', event.target.value)} className={inputFor('prf_number')} />
              </Field>
              <Field label="ICD-Codes" issues={issuesFor('icd_codes')}>
                <input
                  value={(form.icd_codes || []).join(', ')}
                  onChange={event => set('icd_codes', event.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                  className={inputFor('icd_codes')}
                />
              </Field>
              <label className="flex items-center gap-3 h-11 px-3 rounded-xl border border-border bg-background text-sm font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={!!form.follow_up_prescription}
                  onChange={event => set('follow_up_prescription', event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Folgeverordnung
              </label>
              <CheckField
                label="Arztunterschrift erkannt"
                checked={!!form.doctor_signature_present}
                onChange={value => set('doctor_signature_present', value)}
                issues={issuesFor('doctor_signature_present')}
              />
              <CheckField
                label="Arztstempel erkannt"
                checked={!!form.doctor_stamp_present}
                onChange={value => set('doctor_stamp_present', value)}
                issues={issuesFor('doctor_stamp_present')}
              />
              <CheckField
                label="Patientenunterschrift"
                checked={!!form.patient_signature_present}
                onChange={value => set('patient_signature_present', value)}
                issues={issuesFor('patient_signature_present')}
              />
              <CheckField
                label="Genehmigung vorhanden"
                checked={!!form.approval_present}
                onChange={value => set('approval_present', value)}
                issues={issuesFor('approval_present')}
              />
              <Field label="Genehmigungsdatum" issues={issuesFor('approval_date')}>
                <input type="date" value={form.approval_date} onChange={event => set('approval_date', event.target.value)} className={inputFor('approval_date')} />
              </Field>
              <Field label="Genehmigt bis" issues={issuesFor('approval_until')}>
                <input type="date" value={form.approval_until} onChange={event => set('approval_until', event.target.value)} className={inputFor('approval_until')} />
              </Field>
              <Field label="Genehmigungsnummer">
                <input value={form.approval_reference} onChange={event => set('approval_reference', event.target.value)} className={inputFor('approval_reference')} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Diagnose / Indikation" issues={issuesFor('diagnosis_text')}>
                  <textarea value={form.diagnosis_text} onChange={event => set('diagnosis_text', event.target.value)} className={`${inputFor('diagnosis_text')} min-h-24 py-3`} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Schaedigung / Funktionsstoerung">
                  <textarea value={form.impairment_text} onChange={event => set('impairment_text', event.target.value)} className={`${inputFor('impairment_text')} min-h-20 py-3`} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Rehabilitationsziel" issues={issuesFor('rehab_goal')}>
                  <textarea value={form.rehab_goal} onChange={event => set('rehab_goal', event.target.value)} className={`${inputFor('rehab_goal')} min-h-20 py-3`} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Begruendung Folgeverordnung">
                  <textarea value={form.follow_up_reason} onChange={event => set('follow_up_reason', event.target.value)} className={`${inputFor('follow_up_reason')} min-h-20 py-3`} />
                </Field>
              </div>
              <Field label="Arzt / Praxis" issues={issuesFor('physician_name')}>
                <input value={form.physician_name} onChange={event => set('physician_name', event.target.value)} className={inputFor('physician_name')} />
              </Field>
              <Field label="LANR">
                <input value={form.physician_lanr} onChange={event => set('physician_lanr', event.target.value)} className={inputFor('physician_lanr')} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Pruefhinweise">
                  <textarea value={form.notes} onChange={event => set('notes', event.target.value)} className={`${inputFor('notes')} min-h-20 py-3`} />
                </Field>
              </div>
            </div>
          </div>
        </section>
      </div>

      <RecentScans scans={prescriptionScans} />
    </div>
  );
}

const inputCls = 'w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary text-sm';

function fieldStateClass(issues = []) {
  const state = getWorstFieldSeverity(issues);
  if (state === 'error') return 'border-rose-500 bg-rose-500/5 focus:ring-rose-500';
  if (state === 'warning') return 'border-amber-500 bg-amber-500/5 focus:ring-amber-500';
  return '';
}

function Field({ label, children, issues = [] }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
        {label}
      </span>
      {children}
      <FieldIssues issues={issues} />
    </label>
  );
}

function CheckField({ label, checked, onChange, issues = [] }) {
  const stateClass = fieldStateClass(issues);
  return (
    <label className={`block rounded-xl border bg-background px-3 py-2.5 text-sm font-bold text-foreground ${stateClass || 'border-border'}`}>
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={event => onChange(event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        {label}
      </span>
      <FieldIssues issues={issues} />
    </label>
  );
}

function FieldIssues({ issues = [] }) {
  if (!issues.length) return null;
  const issue = issues[0];
  const cls = issue.severity === 'error' ? 'text-rose-600' : 'text-amber-600';
  return (
    <p className={`mt-1 text-xs font-medium ${cls}`}>
      {issue.message}
    </p>
  );
}

function ReviewPanel({ review, phase, extracting, hasScanContext }) {
  if (!hasScanContext) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="rounded-xl border border-border bg-background px-3 py-3">
          <div className="flex items-start gap-3">
            <ScanLine className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-black text-foreground">Rezept bereit zum Scan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Nach dem Upload werden Kundenprofil, Rezeptdaten und Gueltigkeit automatisch geprueft.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const colorClass = {
    green: 'border-primary/30 bg-primary/10 text-primary',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
    red: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  }[review.status_color] || 'border-border bg-card text-muted-foreground';
  const Icon = review.status_color === 'green' ? CheckCircle2 : AlertTriangle;
  const topIssues = review.issues.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <div className={`rounded-xl border px-3 py-3 ${colorClass}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 ${extracting ? 'animate-pulse' : ''}`} />
          <div className="min-w-0">
            <p className="font-black text-foreground">{review.status_label}</p>
            <p className="text-sm mt-1">{phase}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-bold uppercase tracking-widest">Score</p>
            <p className="text-lg font-black">{review.score}</p>
          </div>
        </div>
      </div>

      {review.matched_health_insurance_name && (
        <p className="text-xs text-muted-foreground">
          Kasse erkannt: <span className="font-bold text-foreground">{review.matched_health_insurance_name}</span>
          {review.approval_required ? ' - Genehmigung erforderlich' : ' - keine Genehmigungspflicht hinterlegt'}
        </p>
      )}

      {topIssues.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Was zu pruefen ist</p>
          {topIssues.map(issue => (
            <div
              key={`${issue.code}-${issue.fields?.join('-')}`}
              className={`rounded-xl border px-3 py-2 text-sm ${
                issue.severity === 'error'
                  ? 'border-rose-500/20 bg-rose-500/10'
                  : 'border-amber-500/20 bg-amber-500/10'
              }`}
            >
              <p className="font-bold text-foreground">{issue.label}</p>
              <p className="text-muted-foreground mt-0.5">{issue.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-bold text-foreground">
          Keine offenen Pruefpunkte erkannt.
        </div>
      )}
    </div>
  );
}

function StatusPanel({ fileMeta, extraction, scanError, review, hasScanContext }) {
  const extractionLabel = extraction?.status === 'extracted'
    ? `Daten ausgelesen${extraction.retry_mode ? ' (Retry)' : ''}`
    : extraction?.status === 'failed'
    ? 'OCR fehlgeschlagen - manuelle Pruefung aktiv'
    : extraction?.status === 'manual_review'
    ? 'OCR ohne verwertbare Felder - manuelle Pruefung aktiv'
    : 'OCR noch offen';

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <StatusLine
        ok={!!fileMeta}
        label={fileMeta ? `Datei hochgeladen (${fileMeta.storage_mode}${fileMeta.extraction_mode ? `, OCR ${fileMeta.extraction_mode}` : ''})` : 'Datei noch nicht hochgeladen'}
      />
      <StatusLine
        ok={extraction?.status === 'extracted'}
        label={extractionLabel}
        warning={extraction?.status === 'failed'}
      />
      {hasScanContext && (
        <StatusLine
          ok={review.status === 'valid'}
          label={`Rezeptpruefung: ${review.status_label}`}
          warning={review.status !== 'valid'}
        />
      )}
      <StatusLine ok={false} label="AZH-Sync spaeter: not_started" neutral />
      {scanError && (
        <p className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-700">
          {scanError}
        </p>
      )}
    </div>
  );
}

function StatusLine({ ok, label, neutral = false, warning = false }) {
  const Icon = ok ? CheckCircle2 : neutral ? AlertTriangle : AlertTriangle;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`w-4 h-4 ${ok ? 'text-primary' : neutral ? 'text-muted-foreground' : warning ? 'text-amber-500' : 'text-amber-500'}`} />
      <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function CandidatePanel({ candidates, selectedCustomerId, onSelect }) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Keine bestehende Kundendatei erkannt.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Moegliche Treffer</p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onSelect('')}
          className={`w-full text-left rounded-xl border px-3 py-2 text-sm ${!selectedCustomerId ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'}`}
        >
          Neue Kundendatei anlegen
        </button>
        {candidates.map(customer => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer.id)}
            className={`w-full text-left rounded-xl border px-3 py-2 text-sm ${selectedCustomerId === customer.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'}`}
          >
            <span className="font-bold text-foreground">{customer.first_name} {customer.last_name}</span>
            <span className="block text-xs text-muted-foreground">{customer.birthdate || 'Geburtsdatum offen'} - {customer.health_insurance || 'Kasse offen'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecentScans({ scans }) {
  if (!scans.length) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-black text-foreground uppercase mb-4">Letzte Rezeptscans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {scans.slice(0, 6).map(scan => (
          <div key={scan.id} className="rounded-xl border border-border bg-background p-4">
            <p className="font-bold text-foreground truncate">{scan.customer_name || 'Unbekannter Kunde'}</p>
            <p className="text-xs text-muted-foreground mt-1">{scan.health_insurance || 'Kasse offen'}</p>
            <p className="text-xs text-muted-foreground mt-1">AZH: {scan.azh_sync_status || 'not_started'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
