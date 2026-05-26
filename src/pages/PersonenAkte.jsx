import React, { useMemo, useState } from 'react';
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
  [PROFILE_STATUSES.LEAD]: 'Lead',
  [PROFILE_STATUSES.OFFER_OPEN]: 'Angebot offen',
  [PROFILE_STATUSES.TRIAL]: 'Testphase',
  [PROFILE_STATUSES.MEMBER]: 'Mitglied',
  [PROFILE_STATUSES.REHA_ACTIVE]: 'Reha aktiv',
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

const EMPTY_CUSTOMER_FORM = {
  first_name: '',
  last_name: '',
  birthdate: '',
  gender: '',
  phone: '',
  email: '',
  street: '',
  postal_code: '',
  city: '',
  address: '',
  health_insurance: '',
  insurance_number: '',
  cost_carrier_number: '',
  insured_status: '',
  notes: '',
};

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

function labelForStatus(value) {
  return STATUS_LABELS[value] || value || 'Unbekannt';
}

function statusClass(value) {
  return STATUS_CLASSES[value] || STATUS_CLASSES[PROFILE_STATUSES.LEAD];
}

function customerToForm(customer = {}) {
  return {
    ...EMPTY_CUSTOMER_FORM,
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    birthdate: customer.birthdate || '',
    gender: customer.gender || '',
    phone: customer.phone || '',
    email: customer.email || '',
    street: customer.street || '',
    postal_code: customer.postal_code || '',
    city: customer.city || '',
    address: customer.address || '',
    health_insurance: customer.health_insurance || '',
    insurance_number: customer.insurance_number || '',
    cost_carrier_number: customer.cost_carrier_number || '',
    insured_status: customer.insured_status || '',
    notes: customer.notes || '',
  };
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

function EditField({ label, field, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value || ''}
        onChange={event => onChange(field, event.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
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
  const queryClient = useQueryClient();
  const initialTab = searchParams.get('tab') || 'overview';
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_CUSTOMER_FORM);

  const {
    data: customer,
    isLoading: customerLoading,
    isError: customerError,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: ['personenakte', 'customer', id],
    queryFn: async () => {
      const result = await safeGetEntity(base44, 'Customer', id);
      if (result) setForm(customerToForm(result));
      return result;
    },
    enabled: Boolean(id),
    retry: false,
  });

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
  const sortedActivities = useMemo(() => sortNewest(activities, 'occurred_at'), [activities]);

  const activeLead = useMemo(() => firstById(sortedLeads, customer?.active_lead_id), [sortedLeads, customer]);
  const activeConsultation = useMemo(() => firstById(sortedConsultations, customer?.active_consultation_id), [sortedConsultations, customer]);
  const activeReha = useMemo(() => firstById(sortedRehaCases, customer?.active_reha_case_id || customer?.last_rehasport_consultation_id), [sortedRehaCases, customer]);
  const activeGoalProfile = useMemo(() => firstById(sortedGoalProfiles, customer?.active_goal_profile_id), [sortedGoalProfiles, customer]);
  const activeContract = useMemo(() => firstById(contractDrafts, customer?.active_contract_draft_id), [contractDrafts, customer]);

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

  const openFollowUps = useMemo(
    () => followUps.filter(task => !task?.status || task.status === 'open'),
    [followUps],
  );

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCustomer = async () => {
    if (!customer?.id) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        customer_name: `${form.first_name || ''} ${form.last_name || ''}`.trim(),
      };
      payload.data_quality_score = calculateDataQualityScore(payload);
      payload.missing_required_fields = calculateMissingRequiredFields(payload);

      await updateEntity(base44, 'Customer', customer.id, payload);
      await queryClient.invalidateQueries({ queryKey: ['personenakte', 'customer', id] });
      await queryClient.invalidateQueries({ queryKey: ['personen-cockpit', 'customers'] });
      setEditing(false);
      toast.success('Stammdaten wurden gespeichert.');
    } catch (error) {
      console.error('Customer update failed', error);
      toast.error('Stammdaten konnten nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  if (customerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
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
              Die Personenakte konnte nicht geladen werden.
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
  const dataQuality = summary?.data_quality_score ?? calculateDataQualityScore(customer);
  const missingFields = summary?.missing_required_fields || [];

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
                  {customer.customer_source && (
                    <Badge variant="outline" className="text-xs">
                      Quelle: {customer.customer_source}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight truncate">
                  {customerName}
                </h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground mt-2">
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
                  <CalendarClock className="w-4 h-4 mr-2" /> Beratung starten
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 mt-6">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Datenqualitaet</p>
                <p className="text-sm font-black text-foreground">{Math.round(dataQuality || 0)}%</p>
              </div>
              <Progress value={Math.max(0, Math.min(100, dataQuality || 0))} />
              {missingFields.length > 0 ? (
                <p className="text-xs text-muted-foreground mt-2">
                  Fehlt: {missingFields.join(', ')}
                </p>
              ) : (
                <p className="text-xs text-primary mt-2">Pflichtdaten fuer die Basisaufnahme sind vollstaendig.</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Naechste Aktion</p>
              <p className="font-black text-foreground">{summary?.current_focus_label || 'Keine offene Aktion'}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatDateTime(summary?.next_action_at)}</p>
            </div>
          </div>

          {syncBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {syncBadges.map(badge => <ReadinessBadge key={badge.system} badge={badge} />)}
            </div>
          )}
        </section>

        <Tabs defaultValue={initialTab} className="space-y-5">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="overview" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Ueberblick
            </TabsTrigger>
            <TabsTrigger value="stammdaten" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Stammdaten
            </TabsTrigger>
            <TabsTrigger value="reha" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Reha
            </TabsTrigger>
            <TabsTrigger value="rezepte" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Rezepte
            </TabsTrigger>
            <TabsTrigger value="beratung" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Beratung
            </TabsTrigger>
            <TabsTrigger value="termine" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Termine
            </TabsTrigger>
            <TabsTrigger value="sync" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Sync
            </TabsTrigger>
            <TabsTrigger value="verlauf" className="rounded-xl border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Verlauf
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard icon={HeartPulse} label="Reha-Vorgaenge" value={sortedRehaCases.length} />
              <MetricCard icon={ScanLine} label="Rezeptscans" value={sortedScans.length} />
              <MetricCard icon={UserRound} label="Leads" value={sortedLeads.length} />
              <MetricCard icon={AlertTriangle} label="Offene Aufgaben" value={openFollowUps.length} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-primary" /> Aktuelles Zielprofil
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="w-5 h-5 text-primary" /> Arbeitsstand
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatusLine
                    ok={dataQuality >= 70}
                    label={dataQuality >= 70 ? 'Stammdaten gut nutzbar' : 'Stammdaten brauchen Nacharbeit'}
                    detail={missingFields.length ? missingFields.join(', ') : 'Keine Basis-Pflichtfelder offen'}
                  />
                  <StatusLine
                    ok={sortedScans.length > 0}
                    label={sortedScans.length > 0 ? 'Rezeptscan vorhanden' : 'Noch kein Rezeptscan'}
                    detail={sortedScans[0]?.file_name || 'Rezept kann ueber die Aktion oben erfasst werden'}
                  />
                  <StatusLine
                    ok={syncBadges.every(badge => ['ready', 'synced'].includes(badge.status))}
                    label="Sync-Bereitschaft"
                    detail={syncBadges.map(badge => `${badge.label}: ${badge.status}`).join(' | ')}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stammdaten" className="space-y-5">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IdCard className="w-5 h-5 text-primary" /> Stammdaten
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Grundlage fuer Rezept, Termine, Vertrag und Sync.
                  </p>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setForm(customerToForm(customer));
                        }}
                        disabled={saving}
                      >
                        Abbrechen
                      </Button>
                      <Button onClick={handleSaveCustomer} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Speichern
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Bearbeiten
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField label="Vorname" field="first_name" value={form.first_name} onChange={handleFormChange} />
                    <EditField label="Nachname" field="last_name" value={form.last_name} onChange={handleFormChange} />
                    <EditField label="Geburtsdatum" field="birthdate" value={form.birthdate} onChange={handleFormChange} type="date" />
                    <EditField label="Geschlecht" field="gender" value={form.gender} onChange={handleFormChange} />
                    <EditField label="Telefon" field="phone" value={form.phone} onChange={handleFormChange} />
                    <EditField label="E-Mail" field="email" value={form.email} onChange={handleFormChange} type="email" />
                    <EditField label="Strasse" field="street" value={form.street} onChange={handleFormChange} />
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                      <EditField label="PLZ" field="postal_code" value={form.postal_code} onChange={handleFormChange} />
                      <EditField label="Ort" field="city" value={form.city} onChange={handleFormChange} />
                    </div>
                    <EditField label="Krankenkasse" field="health_insurance" value={form.health_insurance} onChange={handleFormChange} />
                    <EditField label="Versichertennummer" field="insurance_number" value={form.insurance_number} onChange={handleFormChange} />
                    <EditField label="Kostentraegernummer" field="cost_carrier_number" value={form.cost_carrier_number} onChange={handleFormChange} />
                    <EditField label="Versichertenstatus" field="insured_status" value={form.insured_status} onChange={handleFormChange} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Person</p>
                      <Field label="Vorname" value={customer.first_name} />
                      <Field label="Nachname" value={customer.last_name} />
                      <Field label="Geburtsdatum" value={formatDate(customer.birthdate)} />
                      <Field label="Geschlecht" value={customer.gender} />
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kontakt</p>
                      <Field label="Telefon" value={customer.phone} />
                      <Field label="E-Mail" value={customer.email} />
                      <Field label="Adresse" value={customer.address || compact([customer.street, compact([customer.postal_code, customer.city]).join(' ')]).join(', ')} />
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kasse & Datenschutz</p>
                      <Field label="Krankenkasse" value={customer.health_insurance} />
                      <Field label="Versichertennummer" value={customer.insurance_number} />
                      <Field label="Kostentraeger" value={customer.cost_carrier_number} />
                      <Field label="Datenschutz" value={customer.privacy_consent ? 'Einwilligung vorhanden' : 'Offen'} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reha" className="space-y-5">
            <SectionHeader
              icon={HeartPulse}
              title="Reha-Vorgaenge"
              text="Alle Reha-Faelle dieser Person, inklusive Rezeptstatus und Angebotsdaten."
              action={<Button asChild><Link to={`/berater/rezepte?customerId=${customer.id}`}><ScanLine className="w-4 h-4 mr-2" /> Rezept scannen</Link></Button>}
            />
            {sortedRehaCases.length === 0 ? (
              <EmptyPanel
                icon={HeartPulse}
                title="Noch kein Reha-Vorgang"
                text="Ein Reha-Vorgang entsteht durch Rezeptscan oder Reha-Beratung."
                action={<Button asChild><Link to={`/berater/rezepte?customerId=${customer.id}`}>Rezept scannen</Link></Button>}
              />
            ) : (
              <div className="space-y-3">
                {sortedRehaCases.map(reha => (
                  <RecordPanel
                    key={reha.id}
                    icon={HeartPulse}
                    title={reha.status || 'Reha-Vorgang'}
                    subtitle={reha.health_insurance || reha.prescribed_service || 'Rehasport'}
                    meta={formatDate(reha.created_date || reha.prescription_date)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Field label="Rezeptstatus" value={reha.prescription_status || '-'} />
                      <Field label="Einheiten" value={reha.prescribed_units ? `${reha.prescribed_units}` : '-'} />
                      <Field label="Dauer" value={reha.duration_months ? `${reha.duration_months} Monate` : '-'} />
                      <Field label="Gueltig bis" value={formatDate(reha.prescription_valid_to)} />
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="rezepte" className="space-y-5">
            <SectionHeader
              icon={ScanLine}
              title="Rezepte & Scans"
              text="Gespeicherte Rezeptscans, OCR-Ergebnis und Abrechnungsstatus."
              action={<Button asChild><Link to={`/berater/rezepte?customerId=${customer.id}`}><ScanLine className="w-4 h-4 mr-2" /> Neuer Scan</Link></Button>}
            />
            {sortedScans.length === 0 ? (
              <EmptyPanel icon={ScanLine} title="Noch kein Rezeptscan" text="Scanne ein Rezept direkt aus dieser Personenakte." />
            ) : (
              <div className="space-y-3">
                {sortedScans.map(scan => (
                  <RecordPanel
                    key={scan.id}
                    icon={FileText}
                    title={scan.file_name || 'Rezeptscan'}
                    subtitle={`${scan.extraction_status || 'manual_review'} | ${scan.health_insurance || 'Kasse offen'}`}
                    meta={formatDate(scan.prescription_date || scan.created_date)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Field label="Formular" value={compact([scan.form_type, scan.form_number, scan.form_version]).join(' ')} />
                      <Field label="Einheiten" value={scan.prescribed_units ? `${scan.prescribed_units}` : '-'} />
                      <Field label="Dauer" value={scan.duration_months ? `${scan.duration_months} Monate` : '-'} />
                      <Field label="AZH" value={scan.azh_sync_status || 'not_started'} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {scan.file_url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={scan.file_url} target="_blank" rel="noreferrer">Scan oeffnen</a>
                        </Button>
                      )}
                      <Badge variant="outline">OCR: {scan.extraction_confidence || '-'}</Badge>
                      <Badge variant="outline">Status: {scan.status || '-'}</Badge>
                    </div>
                  </RecordPanel>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="beratung" className="space-y-5">
            <SectionHeader
              icon={ClipboardList}
              title="Leads, Beratung & Vertrag"
              text="Sales-Status, Beratungsverlauf, Zielprofil und Vertragsentwuerfe."
              action={<Button asChild><Link to={`/beratung/neukunde?customer=${customer.id}`}>Beratung starten</Link></Button>}
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ListCard title="Leads" icon={UserRound} empty="Keine Leads verknuepft.">
                {sortedLeads.map(lead => (
                  <RecordPanel
                    key={lead.id}
                    title={`${lead.first_name || customer.first_name || ''} ${lead.last_name || customer.last_name || ''}`.trim() || 'Lead'}
                    subtitle={compact([lead.status, lead.source, lead.primary_goal]).join(' | ')}
                    meta={formatDateTime(lead.next_action_at)}
                  />
                ))}
              </ListCard>
              <ListCard title="Beratungen" icon={ClipboardList} empty="Keine Beratungen vorhanden.">
                {sortedConsultations.map(item => (
                  <RecordPanel
                    key={item.id}
                    title={item.consultation_type || 'Beratung'}
                    subtitle={compact([item.status, item.outcome, item.selected_tariff]).join(' | ')}
                    meta={formatDate(item.created_date)}
                  >
                    <ChipList items={[...(item.selected_goals || []), ...(item.selected_addons || [])]} />
                  </RecordPanel>
                ))}
              </ListCard>
              <ListCard title="Zielprofile" icon={Target} empty="Kein Zielprofil vorhanden.">
                {sortedGoalProfiles.map(profile => (
                  <RecordPanel
                    key={profile.id}
                    title={profile.primary_goal || 'Ziel offen'}
                    subtitle={compact([profile.status, profile.source]).join(' | ')}
                    meta={profile.confidence_score !== undefined ? `${profile.confidence_score}%` : ''}
                  >
                    <ChipList items={profile.secondary_goals} />
                  </RecordPanel>
                ))}
              </ListCard>
              <ListCard title="Vertraege" icon={ShieldCheck} empty="Kein Vertragsentwurf vorhanden.">
                {contractDrafts.map(contract => (
                  <RecordPanel
                    key={contract.id}
                    title={contract.tariff_name || 'Vertragsentwurf'}
                    subtitle={compact([contract.status, contract.themisoft_reference]).join(' | ')}
                    meta={contract.monthly_price ? `${contract.monthly_price} EUR/mtl.` : ''}
                  />
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
                {appointments.map(appt => (
                  <RecordPanel
                    key={appt.id}
                    title={appt.notes || appt.status || 'Termin'}
                    subtitle={compact([appt.advisor, appt.status]).join(' | ')}
                    meta={formatDateTime(appt.start)}
                  />
                ))}
              </ListCard>
              <ListCard title="Aufgaben" icon={AlertTriangle} empty="Keine offenen Aufgaben.">
                {followUps.map(task => (
                  <RecordPanel
                    key={task.id}
                    title={task.reason || task.channel || 'Follow-up'}
                    subtitle={task.draft_message || task.status}
                    meta={formatDateTime(task.due_at)}
                  />
                ))}
              </ListCard>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-5">
            <SectionHeader
              icon={Database}
              title="Sync & externe Systeme"
              text="Readiness, externe IDs und spaetere Uebertragung an AZH/myYOLO/ThemiSoft."
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="w-5 h-5 text-primary" /> Systemstatus
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

            <ListCard title="Sync-Jobs" icon={RefreshCcw} empty="Noch keine Sync-Jobs angelegt.">
              {syncJobs.map(job => (
                <RecordPanel
                  key={job.id}
                  title={job.target_system || 'Sync'}
                  subtitle={job.error_message || job.status}
                  meta={formatDateTime(job.last_attempt_at || job.created_date)}
                />
              ))}
            </ListCard>
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
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusLine({ ok, label, detail }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ok ? 'text-primary' : 'text-amber-500'}`} />
      <div className="min-w-0">
        <p className="font-bold text-foreground text-sm">{label}</p>
        {detail && <p className="text-xs text-muted-foreground mt-0.5 break-words">{detail}</p>}
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
