import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  HeartPulse,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Save,
  ScanLine,
  ShieldCheck,
  Target,
  UserRound,
} from 'lucide-react';

import { base44 } from '@/api/base44Client';
import { safeFilterEntity, updateEntity } from '@/lib/entityGateway';
import {
  buildCustomerSummary,
  calculateDataQualityScore,
  calculateMissingRequiredFields,
  joinCustomerName,
  mergeCustomerContextSnapshot,
  PROFILE_STATUSES,
} from '@/lib/customerDataModel';
import { summarizeSyncBadges } from '@/lib/syncReadiness';
import { formatDateTime } from '@/lib/crmModel';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const STATUS_LABELS = {
  [PROFILE_STATUSES.LEAD]: 'Interessent',
  [PROFILE_STATUSES.OFFER_OPEN]: 'Angebot offen',
  [PROFILE_STATUSES.TRIAL]: 'Testphase',
  [PROFILE_STATUSES.MEMBER]: 'Mitglied',
  [PROFILE_STATUSES.REHA_ACTIVE]: 'Reha-Kunde',
  [PROFILE_STATUSES.LOST]: 'Verloren',
  [PROFILE_STATUSES.ARCHIVED]: 'Archiv',
};

const STATUS_CLASSES = {
  [PROFILE_STATUSES.LEAD]: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  [PROFILE_STATUSES.OFFER_OPEN]: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  [PROFILE_STATUSES.TRIAL]: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  [PROFILE_STATUSES.MEMBER]: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  [PROFILE_STATUSES.REHA_ACTIVE]: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  [PROFILE_STATUSES.LOST]: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  [PROFILE_STATUSES.ARCHIVED]: 'bg-muted text-muted-foreground border-border',
};

const SYNC_BADGE_CLASSES = {
  green: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  red: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  gray: 'bg-muted text-muted-foreground border-border',
};

const TAB_ALIASES = {
  overview: 'profile',
  stammdaten: 'profile',
  beratung: 'aufnahme',
  reha: 'reha',
  rezepte: 'reha',
  termine: 'termine',
  verlauf: 'verlauf',
  sync: 'technik',
  technik: 'technik',
};

const CUSTOMER_FIELD_SECTIONS = [
  {
    id: 'identity',
    title: 'Person',
    description: 'Identitaet aus Rezept, Beratung oder manueller Aufnahme.',
    fields: [
      { name: 'first_name', label: 'Vorname', required: true, autoFill: 'patient_first_name' },
      { name: 'last_name', label: 'Nachname', required: true, autoFill: 'patient_last_name' },
      { name: 'birthdate', label: 'Geburtsdatum', type: 'date', autoFill: 'birthdate' },
      {
        name: 'gender',
        label: 'Geschlecht',
        type: 'select',
        autoFill: 'gender',
        options: [
          { value: '', label: '-' },
          { value: 'm\u00e4nnlich', label: 'Maennlich' },
          { value: 'weiblich', label: 'Weiblich' },
          { value: 'divers', label: 'Divers' },
        ],
      },
      {
        name: 'profile_status',
        label: 'Kundenstatus',
        type: 'select',
        options: Object.values(PROFILE_STATUSES).map(status => ({
          value: status,
          label: STATUS_LABELS[status] || status,
        })),
      },
    ],
  },
  {
    id: 'contact',
    title: 'Kontakt',
    description: 'Alle Felder, die Mitarbeiter fuer Rueckfragen und Termine brauchen.',
    fields: [
      { name: 'phone', label: 'Telefon', required: true, autoFill: 'phone' },
      { name: 'email', label: 'E-Mail', type: 'email', required: true, autoFill: 'email' },
      { name: 'street', label: 'Strasse', autoFill: 'street' },
      { name: 'postal_code', label: 'PLZ', autoFill: 'postal_code' },
      { name: 'city', label: 'Ort', autoFill: 'city' },
      { name: 'address', label: 'Adresse komplett', autoFill: 'address', span: 2 },
    ],
  },
  {
    id: 'insurance',
    title: 'Krankenkasse',
    description: 'Diese Felder werden aus Rezepten uebernommen und spaeter fuer AZH/myYOLO genutzt.',
    fields: [
      { name: 'health_insurance', label: 'Krankenkasse', autoFill: 'health_insurance' },
      { name: 'insurance_number', label: 'Versichertennummer', autoFill: 'insurance_number' },
      { name: 'cost_carrier_number', label: 'Kostentraegernummer', autoFill: 'cost_carrier_number' },
      { name: 'insured_status', label: 'Versichertenstatus', autoFill: 'insured_status' },
    ],
  },
  {
    id: 'pipeline',
    title: 'Aufnahme & Beratung',
    description: 'Kontaktquelle, Ziel und aktueller Beratungsstatus direkt in der Kundenakte.',
    fields: [
      { name: 'pipeline_status', label: 'Pipeline-Status' },
      { name: 'lead_source', label: 'Kontaktquelle' },
      { name: 'primary_goal', label: 'Hauptziel' },
      { name: 'recommended_tariff', label: 'Empfohlener Tarif' },
      { name: 'expected_monthly_value', label: 'Monatswert', type: 'number' },
      { name: 'consultation_type', label: 'Beratungsart' },
      { name: 'advisor_note', label: 'Beraternotiz', type: 'textarea', span: 2 },
    ],
  },
  {
    id: 'prescription',
    title: 'Aktuelles Rezept',
    description: 'Fuehrende Rezeptdaten direkt in der zentralen Kundenakte.',
    fields: [
      {
        name: 'prescription_status',
        label: 'Rezeptstatus',
        type: 'select',
        options: [
          { value: '', label: '-' },
          { value: 'missing', label: 'Fehlt' },
          { value: 'scan_saved', label: 'Scan gespeichert' },
          { value: 'manual_review', label: 'Manuell pruefen' },
          { value: 'verified', label: 'Geprueft' },
          { value: 'failed', label: 'Fehler' },
        ],
      },
      { name: 'prescription_date', label: 'Ausstellungsdatum', type: 'date' },
      { name: 'prescription_valid_from', label: 'Gueltig ab', type: 'date' },
      { name: 'prescription_valid_to', label: 'Gueltig bis', type: 'date' },
      { name: 'prescribed_service', label: 'Leistung' },
      { name: 'sport_type', label: 'Rehasportart' },
      { name: 'prescribed_units', label: 'Einheiten', type: 'number' },
      { name: 'duration_months', label: 'Dauer Monate', type: 'number' },
      { name: 'prescription_frequency', label: 'Frequenz' },
      { name: 'form_number', label: 'Muster/Formular' },
    ],
  },
  {
    id: 'medical',
    title: 'Medizin & Reha-Ziel',
    description: 'Diese Felder kommen aus dem Rezept und werden spaeter fuer Aufnahme und Sync genutzt.',
    fields: [
      { name: 'diagnosis_text', label: 'Diagnose / Indikation', type: 'textarea', span: 2 },
      { name: 'impairment_text', label: 'Schaedigung / Funktionsstoerung', type: 'textarea', span: 2 },
      { name: 'rehab_goal', label: 'Rehabilitationsziel', type: 'textarea', span: 2 },
      { name: 'follow_up_prescription', label: 'Folgeverordnung', type: 'checkbox' },
      { name: 'follow_up_reason', label: 'Begruendung Folgeverordnung', type: 'textarea' },
    ],
  },
  {
    id: 'prescription_review',
    title: 'Rezeptpruefung',
    description: 'Sichtpruefung, Genehmigung und Arztangaben aus dem aktuellen Rezept.',
    fields: [
      { name: 'doctor_signature_present', label: 'Arztunterschrift erkannt', type: 'checkbox' },
      { name: 'doctor_stamp_present', label: 'Arztstempel erkannt', type: 'checkbox' },
      { name: 'patient_signature_present', label: 'Patientenunterschrift erkannt', type: 'checkbox' },
      { name: 'approval_required', label: 'Genehmigung erforderlich', type: 'checkbox' },
      { name: 'approval_present', label: 'Genehmigung vorhanden', type: 'checkbox' },
      { name: 'approval_date', label: 'Genehmigungsdatum', type: 'date' },
      { name: 'approval_until', label: 'Genehmigt bis', type: 'date' },
      { name: 'approval_reference', label: 'Genehmigungsnummer' },
      { name: 'physician_name', label: 'Arzt / Praxis' },
      { name: 'physician_lanr', label: 'LANR' },
      { name: 'practice_site_number', label: 'BSNR' },
      { name: 'doctor_number', label: 'Arzt-Nr.' },
    ],
  },
  {
    id: 'consent',
    title: 'Einwilligungen & Notizen',
    description: 'Freigaben und interne Hinweise fuer Aufnahme, Scan und Gesundheitsdaten.',
    fields: [
      { name: 'privacy_consent', label: 'Datenschutz-Einwilligung', type: 'checkbox' },
      { name: 'consent_health', label: 'Gesundheitsdaten erlaubt', type: 'checkbox' },
      { name: 'consent_prescription_scan', label: 'Rezeptscan speichern erlaubt', type: 'checkbox' },
      { name: 'notes', label: 'Interne Notizen', type: 'textarea', span: 2 },
    ],
  },
];

const EMPTY_CUSTOMER_FORM = CUSTOMER_FIELD_SECTIONS
  .flatMap(section => section.fields)
  .reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {});

function normalizeTab(value) {
  return TAB_ALIASES[value] || 'profile';
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function calculateAge(value) {
  if (!value) return '';
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age > 0 ? `${age} Jahre` : '';
}

function compact(items) {
  return (items || []).filter(Boolean);
}

function firstById(items = [], id) {
  if (!id) return items[0] || null;
  return items.find(item => item?.id === id) || items[0] || null;
}

function sortNewest(items = [], field = 'created_date') {
  return [...items].sort((a, b) => String(b?.[field] || '').localeCompare(String(a?.[field] || '')));
}

function sortSoonest(items = [], field = 'start') {
  return [...items].sort((a, b) => String(a?.[field] || '').localeCompare(String(b?.[field] || '')));
}

function labelForStatus(value) {
  return STATUS_LABELS[value] || value || 'Unbekannt';
}

function statusClass(value) {
  return STATUS_CLASSES[value] || STATUS_CLASSES[PROFILE_STATUSES.LEAD];
}

function buildAddress(source = {}) {
  return source.address || compact([
    source.street,
    compact([source.postal_code, source.city]).join(' '),
  ]).join(', ');
}

function hasCustomerPrescription(customer = {}) {
  return Boolean(
    customer.prescription_status ||
    customer.prescription_date ||
    customer.prescription_file_uri ||
    customer.prescription_file_url ||
    customer.last_prescription_scan_id ||
    customer.diagnosis_text ||
    customer.prescribed_units
  );
}

function firstAvailableValue(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value;
    if (typeof value === 'boolean') return value;
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return undefined;
}

function mergePrescriptionSources(customer = {}, latestScan = null, activeReha = null) {
  const source = {};
  const fields = [
    'prescription_status',
    'prescription_date',
    'prescription_valid_from',
    'prescription_valid_to',
    'prescribed_service',
    'sport_type',
    'functional_training_type',
    'prescribed_units',
    'duration_months',
    'prescription_frequency',
    'health_insurance',
    'insurance_number',
    'diagnosis_text',
    'icd_codes',
    'impairment_text',
    'rehab_goal',
    'approval_required',
    'approval_present',
    'approval_date',
    'approval_until',
    'approval_reference',
    'doctor_signature_present',
    'doctor_stamp_present',
    'patient_signature_present',
    'prescription_validation_score',
    'prescription_missing_items',
  ];

  for (const field of fields) {
    source[field] = firstAvailableValue(customer[field], latestScan?.[field], activeReha?.[field]);
  }

  source.prescription_file_url = firstAvailableValue(customer.prescription_file_url, latestScan?.file_url);
  source.prescription_file_uri = firstAvailableValue(customer.prescription_file_uri, latestScan?.file_uri);
  source.prescription_file_name = firstAvailableValue(customer.prescription_file_name, latestScan?.file_name);
  source.last_prescription_scan_id = firstAvailableValue(customer.last_prescription_scan_id, latestScan?.id);
  return { ...customer, ...source };
}

function customerToForm(customer = {}) {
  return Object.keys(EMPTY_CUSTOMER_FORM).reduce((acc, key) => {
    const defaultValue = EMPTY_CUSTOMER_FORM[key];
    acc[key] = typeof defaultValue === 'boolean'
      ? Boolean(customer[key])
      : customer[key] || '';
    return acc;
  }, {});
}

function displayValue(field, source = {}) {
  const value = source[field.name];
  if (field.type === 'checkbox') return value ? 'Ja' : 'Offen';
  if (field.type === 'date') return formatDate(value);
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '-';
  if (field.type === 'select') {
    return field.options?.find(option => option.value === value)?.label || value || '-';
  }
  return value || '-';
}

function buildSavePayload(form = {}) {
  const payload = {
    ...form,
    address: form.address || buildAddress(form),
    customer_name: `${form.first_name || ''} ${form.last_name || ''}`.trim(),
  };
  payload.data_quality_score = calculateDataQualityScore(payload);
  payload.missing_required_fields = calculateMissingRequiredFields(payload);
  return payload;
}

async function safeGetEntity(base44Client, entityName, id) {
  try {
    const entity = base44Client?.entities?.[entityName];
    if (!entity?.get || !id) return null;
    return await entity.get(id);
  } catch (error) {
    console.warn(`${entityName}.get skipped`, error?.message || error);
    return null;
  }
}

function buildNextAction({ missingFields, scans, appointments, customer }) {
  const hasPrescription = scans.length > 0 || hasCustomerPrescription(customer);
  if (missingFields.length > 0) {
    return {
      id: 'profile',
      title: 'Profil vervollstaendigen',
      text: `Offen: ${missingFields.join(', ')}`,
      kind: 'edit',
    };
  }

  if (!hasPrescription) {
    return {
      id: 'scan',
      title: 'Rezept erfassen',
      text: 'Noch kein Rezeptscan in dieser Akte.',
      kind: 'link',
      label: 'Rezept scannen',
      icon: ScanLine,
      to: 'scan',
    };
  }

  if (appointments.length === 0) {
    return {
      id: 'appointment',
      title: 'Termin buchen',
      text: 'Rezept liegt vor. Jetzt kann die Aufnahme terminiert werden.',
      kind: 'link',
      label: 'Termin buchen',
      icon: CalendarClock,
      to: 'appointment',
    };
  }

  return {
    id: 'followup',
    title: 'Kundenverlauf aktuell halten',
    text: 'Profil, Rezept und Termine sind angelegt.',
    kind: 'tab',
    label: 'Verlauf ansehen',
    icon: Activity,
    tab: 'verlauf',
  };
}

function buildWorkflowSteps({ missingFields, scans, activeReha, appointments, customer }) {
  const latestScan = scans[0];
  const hasProfile = missingFields.length === 0;
  const hasScan = scans.length > 0 || hasCustomerPrescription(customer);
  const hasReviewedPrescription = hasScan && (
    latestScan?.status === 'verified' ||
    latestScan?.extraction_status === 'extracted' ||
    Boolean(activeReha?.prescription_status) ||
    ['verified', 'scan_saved'].includes(customer.prescription_status)
  );
  const hasAppointment = appointments.length > 0;
  const syncReady = hasProfile && hasScan && Boolean(customer.health_insurance || customer.insurance_number);

  return [
    {
      id: 'profile',
      title: 'Kundendaten',
      detail: hasProfile ? 'Basisdaten sind vollstaendig.' : `Offen: ${missingFields.join(', ')}`,
      state: hasProfile ? 'done' : 'current',
    },
    {
      id: 'scan',
      title: 'Rezeptscan',
      detail: hasScan ? `${scans.length} Scan${scans.length === 1 ? '' : 's'} gespeichert.` : 'Noch kein Rezept erfasst.',
      state: hasScan ? 'done' : hasProfile ? 'current' : 'open',
    },
    {
      id: 'review',
      title: 'Rezeptpruefung',
      detail: hasReviewedPrescription ? 'Rezeptdaten liegen vor.' : 'Pruefung von Inhalt, Unterschrift und Genehmigung steht aus.',
      state: hasReviewedPrescription ? 'done' : hasScan ? 'current' : 'open',
    },
    {
      id: 'appointment',
      title: 'Termin',
      detail: hasAppointment ? `Naechster Termin: ${formatDateTime(appointments[0]?.start)}` : 'Noch kein Termin in dieser Akte.',
      state: hasAppointment ? 'done' : hasReviewedPrescription ? 'current' : 'open',
    },
    {
      id: 'sync',
      title: 'AZH/myYOLO',
      detail: syncReady ? 'Datenbasis fuer spaetere Synchronisation vorbereitet.' : 'Sync folgt nach sauberer Aufnahme.',
      state: syncReady ? 'done' : 'open',
    },
  ];
}

function ReadinessBadge({ badge }) {
  const cls = SYNC_BADGE_CLASSES[badge.color] || SYNC_BADGE_CLASSES.gray;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold cursor-help ${cls}`}>
          {badge.label}: {badge.status}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-[280px]">{badge.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ChipList({ items }) {
  const safeItems = compact(items);
  if (!safeItems.length) return <span className="text-sm text-muted-foreground">-</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {safeItems.map(item => (
        <Badge key={String(item)} variant="outline" className="text-xs">
          {String(item)}
        </Badge>
      ))}
    </div>
  );
}

export default function PersonenAkte() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(normalizeTab(requestedTab));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_CUSTOMER_FORM);

  useEffect(() => {
    setActiveTab(normalizeTab(requestedTab));
  }, [requestedTab]);

  const {
    data: customer,
    isLoading: customerLoading,
    isError: customerError,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: ['personenakte', 'customer', id],
    queryFn: () => safeGetEntity(base44, 'Customer', id),
    enabled: Boolean(id),
    retry: false,
  });

  useEffect(() => {
    if (customer && !editing) setForm(customerToForm(customer));
  }, [customer, editing]);

  const { data: leads = [] } = useQuery({
    queryKey: ['personenakte', 'leads', id],
    queryFn: () => safeFilterEntity(base44, 'Lead', { customer_id: id }, '-created_date', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['personenakte', 'consultations', id],
    queryFn: () => safeFilterEntity(base44, 'Consultation', { customer_id: id }, '-created_date', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: rehaCases = [] } = useQuery({
    queryKey: ['personenakte', 'reha-cases', id],
    queryFn: () => safeFilterEntity(base44, 'RehasportConsultation', { customer_id: id }, '-created_date', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: prescriptionScans = [] } = useQuery({
    queryKey: ['personenakte', 'prescription-scans', id],
    queryFn: () => safeFilterEntity(base44, 'PrescriptionScan', { customer_id: id }, '-created_date', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: goalProfiles = [] } = useQuery({
    queryKey: ['personenakte', 'goal-profiles', id],
    queryFn: () => safeFilterEntity(base44, 'GoalProfile', { customer_id: id }, '-captured_at', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['personenakte', 'appointments', id],
    queryFn: () => safeFilterEntity(base44, 'Appointment', { customer_id: id }, '-start', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ['personenakte', 'followups', id],
    queryFn: () => safeFilterEntity(base44, 'FollowUpTask', { customer_id: id }, '-due_at', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: syncJobs = [] } = useQuery({
    queryKey: ['personenakte', 'sync-jobs', id],
    queryFn: () => safeFilterEntity(base44, 'SyncJob', { customer_id: id }, '-created_date', 100),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['personenakte', 'activities', id],
    queryFn: () => safeFilterEntity(base44, 'ActivityLog', { customer_id: id }, '-occurred_at', 150),
    enabled: Boolean(id),
    retry: false,
  });

  const { data: contractDrafts = [] } = useQuery({
    queryKey: ['personenakte', 'contract-drafts', id],
    queryFn: () => safeFilterEntity(base44, 'ContractDraft', { customer_profile_id: id }, '-created_date', 50),
    enabled: Boolean(id),
    retry: false,
  });

  const sortedLeads = useMemo(() => sortNewest(leads), [leads]);
  const sortedConsultations = useMemo(() => sortNewest(consultations), [consultations]);
  const sortedRehaCases = useMemo(() => sortNewest(rehaCases), [rehaCases]);
  const sortedScans = useMemo(() => sortNewest(prescriptionScans), [prescriptionScans]);
  const sortedGoalProfiles = useMemo(() => sortNewest(goalProfiles, 'captured_at'), [goalProfiles]);
  const sortedAppointments = useMemo(() => sortSoonest(appointments), [appointments]);
  const sortedActivities = useMemo(() => sortNewest(activities, 'occurred_at'), [activities]);
  const sortedContracts = useMemo(() => sortNewest(contractDrafts), [contractDrafts]);

  const activeLead = useMemo(() => firstById(sortedLeads, customer?.active_lead_id), [sortedLeads, customer]);
  const activeConsultation = useMemo(() => firstById(sortedConsultations, customer?.active_consultation_id), [sortedConsultations, customer]);
  const activeReha = useMemo(() => firstById(sortedRehaCases, customer?.active_reha_case_id || customer?.last_rehasport_consultation_id), [sortedRehaCases, customer]);
  const activeGoalProfile = useMemo(() => firstById(sortedGoalProfiles, customer?.active_goal_profile_id), [sortedGoalProfiles, customer]);
  const activeContract = useMemo(() => firstById(sortedContracts, customer?.active_contract_draft_id), [sortedContracts, customer]);

  const summary = useMemo(() => {
    if (!customer) return null;
    return buildCustomerSummary(customer, {
      lead: activeLead,
      consultation: activeConsultation,
      rehaCase: activeReha,
      contractDraft: activeContract,
      syncJobs,
      followUpTasks: followUps,
      goalProfile: activeGoalProfile,
    });
  }, [customer, activeLead, activeConsultation, activeReha, activeContract, syncJobs, followUps, activeGoalProfile]);

  const syncBadges = useMemo(() => customer ? summarizeSyncBadges(customer) : [], [customer]);
  const openFollowUps = useMemo(() => followUps.filter(task => !task?.status || task.status === 'open'), [followUps]);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCustomer = async () => {
    if (!customer?.id) return;
    setSaving(true);
    try {
      await updateEntity(base44, 'Customer', customer.id, mergeCustomerContextSnapshot(customer, buildSavePayload(form)));
      await queryClient.invalidateQueries({ queryKey: ['personenakte', 'customer', id] });
      await queryClient.invalidateQueries({ queryKey: ['personen-cockpit', 'customers'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditing(false);
      toast.success('Kundenprofil wurde gespeichert.');
    } catch (error) {
      console.error('Customer update failed', error);
      toast.error('Kundenprofil konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  if (customerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="py-10 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-black text-foreground">Person nicht gefunden</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Die Kundenakte konnte nicht geladen werden.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link to="/berater/personen">Zurueck</Link>
              </Button>
              <Button onClick={() => refetchCustomer()}>
                <RefreshCcw className="w-4 h-4 mr-2" /> Erneut laden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customerName = joinCustomerName(customer) || 'Unbenannte Person';
  const currentPrescription = mergePrescriptionSources(customer, sortedScans[0], activeReha);
  const customerHasPrescription = hasCustomerPrescription(currentPrescription);
  const dataQuality = summary?.data_quality_score ?? calculateDataQualityScore(customer);
  const missingFields = summary?.missing_required_fields || calculateMissingRequiredFields(customer);
  const nextAction = buildNextAction({
    missingFields,
    scans: sortedScans,
    appointments: sortedAppointments,
    customer: currentPrescription,
  });
  const workflowSteps = buildWorkflowSteps({
    missingFields,
    scans: sortedScans,
    activeReha,
    appointments: sortedAppointments,
    customer: currentPrescription,
  });

  const startEditProfile = () => {
    setActiveTab('profile');
    setEditing(true);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <Link
          to="/berater/personen"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurueck zum Personen-Cockpit
        </Link>

        <section className="rounded-2xl border border-border bg-card p-5 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <UserRound className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={statusClass(summary?.profile_status)}>
                    {labelForStatus(summary?.profile_status)}
                  </Badge>
                  {(activeReha || customerHasPrescription) && <Badge variant="outline">Reha-Vorgang aktiv</Badge>}
                  {customerHasPrescription && <Badge variant="outline">Rezept in Kundenakte</Badge>}
                  {sortedScans.length > 0 && <Badge variant="outline">Scan archiviert</Badge>}
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight truncate">
                  {customerName}
                </h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground mt-2">
                  {customer.birthdate && <span>{formatDate(customer.birthdate)} {calculateAge(customer.birthdate) ? `(${calculateAge(customer.birthdate)})` : ''}</span>}
                  {customer.phone && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>}
                  {customer.email && <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{customer.email}</span>}
                  {(customer.city || customer.postal_code) && <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{[customer.postal_code, customer.city].filter(Boolean).join(' ')}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <Button asChild variant="outline">
                <Link to={`/berater/rezepte?customerId=${customer.id}`}>
                  <ScanLine className="w-4 h-4 mr-2" /> Rezept scannen
                </Link>
              </Button>
              <Button asChild>
                <Link to={`/beratung/rehasport?customer=${customer.id}`}>
                  <CalendarClock className="w-4 h-4 mr-2" /> Termin/Beratung
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 mt-6">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Kundenprofil</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Krankenkasse" value={customer.health_insurance} />
                <Field label="Versichertennummer" value={customer.insurance_number} />
                <Field label="Adresse" value={buildAddress(customer)} />
              </div>
            </div>

            <NextActionCard
              action={nextAction}
              customerId={customer.id}
              onEditProfile={startEditProfile}
              onSelectTab={setActiveTab}
            />
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="profile" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profil
            </TabsTrigger>
            <TabsTrigger value="aufnahme" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Aufnahme
            </TabsTrigger>
            <TabsTrigger value="reha" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Reha & Rezepte
            </TabsTrigger>
            <TabsTrigger value="termine" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Termine
            </TabsTrigger>
            <TabsTrigger value="verlauf" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Verlauf
            </TabsTrigger>
            <TabsTrigger value="technik" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Technik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-5">
            <CustomerFileOverview
              customer={customer}
              prescription={currentPrescription}
              dataQuality={dataQuality}
              missingFields={missingFields}
            />
            <ProfileEditor
              customer={customer}
              form={form}
              editing={editing}
              saving={saving}
              onChange={handleFormChange}
              onEdit={() => setEditing(true)}
              onCancel={() => {
                setEditing(false);
                setForm(customerToForm(customer));
              }}
              onSave={handleSaveCustomer}
            />
          </TabsContent>

          <TabsContent value="aufnahme" className="space-y-5">
            <SectionHeader
              icon={ClipboardList}
              title="Aufnahme-Workflow"
              text="Vom Kundenprofil ueber Rezeptscan bis Termin. Das ist der operative Arbeitsablauf."
              action={<Button asChild><Link to={`/berater/rezepte?customerId=${customer.id}`}><ScanLine className="w-4 h-4 mr-2" /> Rezept scannen</Link></Button>}
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
              <Card>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                      <WorkflowStep key={step.id} step={step} index={index + 1} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-5">
                <ProfileCheckCard
                  dataQuality={dataQuality}
                  missingFields={missingFields}
                  onEditProfile={startEditProfile}
                />
                <GoalProfileCard activeGoalProfile={activeGoalProfile} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ListCard title="Legacy-Kontakte" icon={UserRound} empty="Keine alten Kontaktkarten verknuepft.">
                {sortedLeads.map(lead => (
                  <RecordPanel
                    key={lead.id}
                    title={`${lead.first_name || customer.first_name || ''} ${lead.last_name || customer.last_name || ''}`.trim() || 'Kontakt'}
                    subtitle={compact([lead.status, lead.source, lead.primary_goal]).join(' | ')}
                    meta={formatDateTime(lead.next_action_at)}
                  />
                ))}
              </ListCard>

              <ListCard title="Beratung & Vertrag" icon={ShieldCheck} empty="Noch keine Beratung oder kein Vertrag vorhanden.">
                {[
                  ...sortedConsultations.map(item => ({
                    id: `consultation-${item.id}`,
                    title: item.consultation_type || 'Beratung',
                    subtitle: compact([item.status, item.outcome, item.selected_tariff]).join(' | '),
                    meta: formatDate(item.created_date),
                    icon: ClipboardList,
                    goals: [...(item.selected_goals || []), ...(item.selected_addons || [])],
                  })),
                  ...sortedContracts.map(contract => ({
                    id: `contract-${contract.id}`,
                    title: contract.tariff_name || 'Vertragsentwurf',
                    subtitle: compact([contract.status, contract.themisoft_reference]).join(' | '),
                    meta: contract.monthly_price ? `${contract.monthly_price} EUR/mtl.` : '',
                    icon: ShieldCheck,
                  })),
                ].map(item => (
                  <RecordPanel key={item.id} icon={item.icon} title={item.title} subtitle={item.subtitle} meta={item.meta}>
                    {item.goals && <ChipList items={item.goals} />}
                  </RecordPanel>
                ))}
              </ListCard>
            </div>
          </TabsContent>

          <TabsContent value="reha" className="space-y-5">
            <SectionHeader
              icon={HeartPulse}
              title="Reha & Rezepte"
              text="Reha-Fall, Rezeptdaten, gespeicherte Scans und spaetere Abrechnungsvorbereitung."
              action={<Button asChild><Link to={`/berater/rezepte?customerId=${customer.id}`}><ScanLine className="w-4 h-4 mr-2" /> Neuer Scan</Link></Button>}
            />

            {customerHasPrescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IdCard className="w-5 h-5 text-primary" /> Aktuelles Rezept in der Kundenakte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Field label="Status" value={currentPrescription.prescription_status || '-'} />
                    <Field label="Ausgestellt" value={formatDate(currentPrescription.prescription_date)} />
                    <Field label="Gueltig ab" value={formatDate(currentPrescription.prescription_valid_from)} />
                    <Field label="Gueltig bis" value={formatDate(currentPrescription.prescription_valid_to)} />
                    <Field label="Leistung" value={currentPrescription.prescribed_service} />
                    <Field label="Art" value={currentPrescription.sport_type || currentPrescription.functional_training_type} />
                    <Field label="Einheiten" value={currentPrescription.prescribed_units ? `${currentPrescription.prescribed_units}` : '-'} />
                    <Field label="Dauer" value={currentPrescription.duration_months ? `${currentPrescription.duration_months} Monate` : '-'} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Krankenkasse" value={currentPrescription.health_insurance} />
                    <Field label="Versichertennummer" value={currentPrescription.insurance_number} />
                    <Field label="Genehmigung" value={currentPrescription.approval_required ? (currentPrescription.approval_present ? 'Vorhanden' : 'Erforderlich, fehlt') : 'Nicht erforderlich'} />
                    <Field label="Arztunterschrift" value={currentPrescription.doctor_signature_present ? 'Ja' : 'Offen'} />
                    <Field label="Arztstempel" value={currentPrescription.doctor_stamp_present ? 'Ja' : 'Offen'} />
                    <Field label="Pruefscore" value={currentPrescription.prescription_validation_score !== undefined ? `${currentPrescription.prescription_validation_score}` : '-'} />
                  </div>

                  {(currentPrescription.diagnosis_text || currentPrescription.rehab_goal || currentPrescription.impairment_text) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field label="Diagnose" value={currentPrescription.diagnosis_text} />
                      <Field label="Schaedigung" value={currentPrescription.impairment_text} />
                      <Field label="Reha-Ziel" value={currentPrescription.rehab_goal} />
                    </div>
                  )}

                  {currentPrescription.prescription_missing_items?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Offene Pruefpunkte</p>
                      <ChipList items={currentPrescription.prescription_missing_items} />
                    </div>
                  )}

                  <StoredFileButton
                    fileUrl={currentPrescription.prescription_file_url}
                    fileUri={currentPrescription.prescription_file_uri}
                    label="Gespeicherten Rezeptscan oeffnen"
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ListCard title="Reha-Vorgaenge" icon={HeartPulse} empty="Noch kein Reha-Vorgang vorhanden.">
                {sortedRehaCases.map(reha => (
                  <RecordPanel
                    key={reha.id}
                    icon={HeartPulse}
                    title={reha.status || 'Reha-Vorgang'}
                    subtitle={reha.health_insurance || reha.prescribed_service || 'Rehasport'}
                    meta={formatDate(reha.created_date || reha.prescription_date)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Rezeptstatus" value={reha.prescription_status || '-'} />
                      <Field label="Gueltig bis" value={formatDate(reha.prescription_valid_to)} />
                      <Field label="Einheiten" value={reha.prescribed_units ? `${reha.prescribed_units}` : '-'} />
                      <Field label="Dauer" value={reha.duration_months ? `${reha.duration_months} Monate` : '-'} />
                    </div>
                    {(reha.diagnosis_text || reha.icd_codes?.length > 0 || reha.rehab_goal) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Diagnose" value={reha.diagnosis_text} />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">ICD</p>
                          <ChipList items={reha.icd_codes} />
                        </div>
                        <Field label="Reha-Ziel" value={reha.rehab_goal} />
                      </div>
                    )}
                  </RecordPanel>
                ))}
              </ListCard>

              <ListCard title="Rezeptscans" icon={ScanLine} empty="Noch kein Rezeptscan gespeichert.">
                {sortedScans.map(scan => (
                  <RecordPanel
                    key={scan.id}
                    icon={FileText}
                    title={scan.file_name || 'Rezeptscan'}
                    subtitle={`${scan.extraction_status || 'manual_review'} | ${scan.health_insurance || 'Kasse offen'}`}
                    meta={formatDate(scan.prescription_date || scan.created_date)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Formular" value={compact([scan.form_type, scan.form_number, scan.form_version]).join(' ')} />
                      <Field label="AZH" value={scan.azh_sync_status || 'not_started'} />
                      <Field label="Gueltig bis" value={formatDate(scan.prescription_valid_to || scan.approval_until)} />
                      <Field label="Einheiten" value={scan.prescribed_units ? `${scan.prescribed_units}` : '-'} />
                      <Field label="Dauer" value={scan.duration_months ? `${scan.duration_months} Monate` : '-'} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <StoredFileButton fileUrl={scan.file_url} fileUri={scan.file_uri} label="Scan oeffnen" />
                      <Badge variant="outline">OCR: {scan.extraction_confidence || '-'}</Badge>
                      <Badge variant="outline">Status: {scan.status || '-'}</Badge>
                    </div>
                  </RecordPanel>
                ))}
              </ListCard>
            </div>
          </TabsContent>

          <TabsContent value="termine" className="space-y-5">
            <SectionHeader
              icon={CalendarClock}
              title="Termine & Aufgaben"
              text="Geplante Termine und offene Follow-ups dieser Person."
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ListCard title="Termine" icon={CalendarClock} empty="Keine Termine vorhanden.">
                {sortedAppointments.map(appt => (
                  <RecordPanel
                    key={appt.id}
                    icon={CalendarClock}
                    title={appt.notes || appt.status || 'Termin'}
                    subtitle={compact([appt.advisor, appt.status]).join(' | ')}
                    meta={formatDateTime(appt.start)}
                  />
                ))}
              </ListCard>
              <ListCard title="Aufgaben" icon={AlertTriangle} empty="Keine offenen Aufgaben.">
                {openFollowUps.map(task => (
                  <RecordPanel
                    key={task.id}
                    icon={AlertTriangle}
                    title={task.reason || task.channel || 'Follow-up'}
                    subtitle={task.draft_message || task.status}
                    meta={formatDateTime(task.due_at)}
                  />
                ))}
              </ListCard>
            </div>
          </TabsContent>

          <TabsContent value="verlauf" className="space-y-5">
            <SectionHeader
              icon={Activity}
              title="Verlauf"
              text="Aktivitaeten, automatische Ereignisse und wichtige Aenderungen."
            />
            {sortedActivities.length === 0 ? (
              <EmptyPanel icon={Activity} title="Noch kein Aktivitaetsverlauf" text="Neue Scans, Beratungen und Sync-Aktionen werden hier protokolliert." />
            ) : (
              <div className="space-y-3">
                {sortedActivities.map(activity => (
                  <RecordPanel
                    key={activity.id}
                    icon={Activity}
                    title={activity.type || 'Aktivitaet'}
                    subtitle={compact([activity.actor, activity.outcome, activity.notes]).join(' | ')}
                    meta={formatDateTime(activity.occurred_at)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="technik" className="space-y-5">
            <SectionHeader
              icon={Database}
              title="Technik & Sync"
              text="Interne Pruefwerte, externe IDs und spaetere Uebertragung an AZH/myYOLO/ThemiSoft."
            />

            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
              <ProfileCheckCard
                dataQuality={dataQuality}
                missingFields={missingFields}
                onEditProfile={startEditProfile}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="w-5 h-5 text-primary" /> Externe Systeme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {syncBadges.map(badge => <ReadinessBadge key={badge.system} badge={badge} />)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="AZH GUID" value={customer.azh_person_guid} />
                    <Field label="myYOLO ID" value={customer.myyolo_person_id} />
                    <Field label="ThemiSoft ID" value={customer.themisoft_customer_id} />
                    <Field label="AZH Status" value={customer.azh_sync_status || 'not_started'} />
                    <Field label="myYOLO Status" value={customer.myyolo_sync_status || 'not_started'} />
                    <Field label="ThemiSoft Status" value={customer.themisoft_sync_status || 'not_started'} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <ListCard title="Sync-Jobs" icon={RefreshCcw} empty="Noch keine Sync-Jobs angelegt.">
              {syncJobs.map(job => (
                <RecordPanel
                  key={job.id}
                  icon={RefreshCcw}
                  title={job.target_system || 'Sync'}
                  subtitle={job.error_message || job.status}
                  meta={formatDateTime(job.last_attempt_at || job.created_date)}
                />
              ))}
            </ListCard>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function NextActionCard({ action, customerId, onEditProfile, onSelectTab }) {
  const Icon = action.icon || ClipboardList;
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Naechster Schritt</p>
      <p className="font-black text-foreground">{action.title}</p>
      <p className="text-sm text-muted-foreground mt-1">{action.text}</p>
      <div className="mt-4">
        {action.kind === 'edit' && (
          <Button onClick={onEditProfile} className="w-full">
            <IdCard className="w-4 h-4 mr-2" /> Profil bearbeiten
          </Button>
        )}
        {action.kind === 'link' && action.to === 'scan' && (
          <Button asChild className="w-full">
            <Link to={`/berater/rezepte?customerId=${customerId}`}>
              <Icon className="w-4 h-4 mr-2" /> {action.label}
            </Link>
          </Button>
        )}
        {action.kind === 'link' && action.to === 'appointment' && (
          <Button asChild className="w-full">
            <Link to={`/beratung/rehasport?customer=${customerId}`}>
              <Icon className="w-4 h-4 mr-2" /> {action.label}
            </Link>
          </Button>
        )}
        {action.kind === 'tab' && (
          <Button onClick={() => onSelectTab(action.tab)} className="w-full">
            <Icon className="w-4 h-4 mr-2" /> {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

function CustomerFileOverview({ customer, prescription, dataQuality, missingFields }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserRound className="w-5 h-5 text-primary" /> Allgemeine Akte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Geburtsdatum" value={formatDate(customer.birthdate)} />
            <Field label="Telefon" value={customer.phone} />
            <Field label="E-Mail" value={customer.email} />
            <Field label="Adresse" value={buildAddress(customer)} />
            <Field label="Krankenkasse" value={customer.health_insurance} />
            <Field label="Versichertennummer" value={customer.insurance_number} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Datenstand</p>
              <p className="text-sm font-black text-foreground">{Math.round(dataQuality || 0)}%</p>
            </div>
            <Progress value={Math.max(0, Math.min(100, dataQuality || 0))} />
            {missingFields.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">Offen: {missingFields.join(', ')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartPulse className="w-5 h-5 text-primary" /> Rehasport & Rezept
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Rezeptstatus" value={prescription.prescription_status} />
            <Field label="Ausgestellt" value={formatDate(prescription.prescription_date)} />
            <Field label="Gueltig bis" value={formatDate(prescription.prescription_valid_to)} />
            <Field label="Einheiten" value={prescription.prescribed_units ? `${prescription.prescribed_units}` : '-'} />
            <Field label="Dauer" value={prescription.duration_months ? `${prescription.duration_months} Monate` : '-'} />
            <Field label="Genehmigung" value={prescription.approval_required ? (prescription.approval_present ? 'Vorhanden' : 'Fehlt') : 'Nicht erforderlich'} />
          </div>
          <StoredFileButton
            fileUrl={prescription.prescription_file_url}
            fileUri={prescription.prescription_file_uri}
            label="Rezeptscan oeffnen"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="w-5 h-5 text-primary" /> Gesundheit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Diagnose / Indikation" value={prescription.diagnosis_text} />
          <Field label="Schaedigung" value={prescription.impairment_text || customer.restrictions} />
          <Field label="Reha-Ziel" value={prescription.rehab_goal || customer.training_goal} />
          <Field label="Gesundheitsdaten" value={customer.consent_health ? 'Einwilligung vorhanden' : 'Einwilligung offen'} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileEditor({ customer, form, editing, saving, onChange, onEdit, onCancel, onSave }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IdCard className="w-5 h-5 text-primary" /> Kundenprofil
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Diese Felder sind die zentrale Grundlage fuer Rezeptscan, Reha, Termine und spaetere Syncs.
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                Abbrechen
              </Button>
              <Button onClick={onSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Speichern
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onEdit}>
              Bearbeiten
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {CUSTOMER_FIELD_SECTIONS.map(section => (
          <ProfileSection
            key={section.id}
            section={section}
            customer={customer}
            form={form}
            editing={editing}
            onChange={onChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ProfileSection({ section, customer, form, editing, onChange }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wide text-foreground">{section.title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.fields.map(field => (
          <div key={field.name} className={field.span === 2 ? 'md:col-span-2' : ''}>
            {editing ? (
              <EditField field={field} value={form[field.name]} onChange={onChange} />
            ) : (
              <Field
                label={`${field.label}${field.required ? ' *' : ''}`}
                value={displayValue(field, customer)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground break-words">
        {value || '-'}
      </p>
    </div>
  );
}

function StoredFileButton({ fileUrl, fileUri, label }) {
  const [opening, setOpening] = useState(false);
  if (!fileUrl && !fileUri) return null;

  const handleOpen = async () => {
    setOpening(true);
    try {
      let targetUrl = fileUrl;
      if (!targetUrl && fileUri) {
        const signed = await base44.integrations.Core.CreateFileSignedUrl({
          file_uri: fileUri,
          expires_in: 900,
        });
        targetUrl = signed?.signed_url;
      }
      if (!targetUrl) throw new Error('Keine Datei-URL verfuegbar.');
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Open prescription file failed', error);
      toast.error('Rezeptdatei konnte nicht geoeffnet werden.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleOpen} disabled={opening}>
      {opening ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
      {label}
    </Button>
  );
}

function EditField({ field, value, onChange }) {
  const commonClass = 'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  if (field.type === 'checkbox') {
    return (
      <label className="flex h-11 items-center gap-3 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={event => onChange(field.name, event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="block">
        <EditLabel field={field} />
        <select
          value={value || ''}
          onChange={event => onChange(field.name, event.target.value)}
          className={commonClass}
        >
          {(field.options || []).map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="block">
        <EditLabel field={field} />
        <textarea
          value={value || ''}
          onChange={event => onChange(field.name, event.target.value)}
          className={`${commonClass} h-28 py-3`}
        />
      </label>
    );
  }

  return (
    <label className="block">
      <EditLabel field={field} />
      <input
        type={field.type || 'text'}
        value={value || ''}
        onChange={event => onChange(field.name, event.target.value)}
        className={commonClass}
      />
    </label>
  );
}

function EditLabel({ field }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
      {field.label}{field.required ? ' *' : ''}
    </span>
  );
}

function WorkflowStep({ step, index }) {
  const stateClass = {
    done: 'border-primary/30 bg-primary/5',
    current: 'border-amber-500/30 bg-amber-500/5',
    open: 'border-border bg-background',
  }[step.state] || 'border-border bg-background';

  const iconClass = {
    done: 'bg-primary text-primary-foreground',
    current: 'bg-amber-500 text-white',
    open: 'bg-muted text-muted-foreground',
  }[step.state] || 'bg-muted text-muted-foreground';

  return (
    <div className={`rounded-xl border p-4 ${stateClass}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${iconClass}`}>
          {step.state === 'done' ? <CheckCircle2 className="w-4 h-4" /> : index}
        </div>
        <div className="min-w-0">
          <p className="font-black text-foreground">{step.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{step.detail}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileCheckCard({ dataQuality, missingFields, onEditProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="w-5 h-5 text-primary" /> Profil-Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vollstaendigkeit</p>
            <p className="text-sm font-black text-foreground">{Math.round(dataQuality || 0)}%</p>
          </div>
          <Progress value={Math.max(0, Math.min(100, dataQuality || 0))} />
        </div>
        {missingFields.length > 0 ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-sm font-bold text-foreground">Noch offen</p>
            <p className="text-sm text-muted-foreground mt-1">{missingFields.join(', ')}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm font-bold text-foreground">
            Basisprofil ist vollstaendig.
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={onEditProfile}>
          Profil bearbeiten
        </Button>
      </CardContent>
    </Card>
  );
}

function GoalProfileCard({ activeGoalProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" /> Zielprofil
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeGoalProfile ? (
          <div className="space-y-4">
            <Field label="Hauptziel" value={activeGoalProfile.primary_goal || 'Ziel offen'} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Weitere Ziele</p>
              <ChipList items={activeGoalProfile.secondary_goals} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Profilstaerke" value={`${activeGoalProfile.confidence_score ?? 0}%`} />
              <Field label="Quelle" value={activeGoalProfile.source} />
            </div>
          </div>
        ) : (
          <EmptyPanel icon={Target} title="Kein Zielprofil" text="Ein Zielprofil entsteht aus Beratung oder manueller Erfassung." />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyPanel({ icon: Icon = FileText, title, text, action }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
      <Icon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="font-bold text-foreground">{title}</p>
      {text && <p className="text-sm text-muted-foreground mt-1">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function RecordPanel({ title, subtitle, meta, children, icon: Icon }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate">{title}</p>
              {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {meta && <div className="text-xs text-muted-foreground flex-shrink-0">{meta}</div>}
          </div>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">{title}</h2>
          {text && <p className="text-sm text-muted-foreground mt-1">{text}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

function ListCard({ title, icon: Icon = FileText, empty, children }) {
  const childArray = React.Children.toArray(children).filter(Boolean);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {childArray.length === 0 ? (
          <EmptyPanel icon={Icon} title={empty} />
        ) : (
          <div className="space-y-3">{childArray}</div>
        )}
      </CardContent>
    </Card>
  );
}
