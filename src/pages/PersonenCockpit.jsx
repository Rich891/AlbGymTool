import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  IdCard,
  Loader2,
  RefreshCcw,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';

import { base44 } from '@/api/base44Client';
import { safeListEntity } from '@/lib/entityGateway';
import {
  buildCustomerSummary,
  CURRENT_FOCUS_TYPES,
  PROFILE_STATUSES,
} from '@/lib/customerDataModel';
import { summarizeSyncBadges } from '@/lib/syncReadiness';
import { formatDateTime } from '@/lib/crmModel';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const PROFILE_STATUS_LABELS = {
  [PROFILE_STATUSES.LEAD]: 'Lead',
  [PROFILE_STATUSES.OFFER_OPEN]: 'Angebot offen',
  [PROFILE_STATUSES.TRIAL]: 'Testphase',
  [PROFILE_STATUSES.MEMBER]: 'Mitglied',
  [PROFILE_STATUSES.REHA_ACTIVE]: 'Reha aktiv',
  [PROFILE_STATUSES.LOST]: 'Verloren',
  [PROFILE_STATUSES.ARCHIVED]: 'Archiv',
};

const PROFILE_STATUS_BADGE_CLASS = {
  [PROFILE_STATUSES.LEAD]: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  [PROFILE_STATUSES.OFFER_OPEN]: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  [PROFILE_STATUSES.TRIAL]: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  [PROFILE_STATUSES.MEMBER]: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  [PROFILE_STATUSES.REHA_ACTIVE]: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  [PROFILE_STATUSES.LOST]: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  [PROFILE_STATUSES.ARCHIVED]: 'bg-muted text-muted-foreground border-border',
};

const CURRENT_FOCUS_LABELS = {
  [CURRENT_FOCUS_TYPES.NEW_LEAD]: 'Lead qualifizieren',
  [CURRENT_FOCUS_TYPES.APPOINTMENT_PREP]: 'Termin vorbereiten',
  [CURRENT_FOCUS_TYPES.OFFER_FOLLOW_UP]: 'Angebot nachfassen',
  [CURRENT_FOCUS_TYPES.TRIAL_CHECK]: 'Testphase pruefen',
  [CURRENT_FOCUS_TYPES.CONTRACT_PREPARE]: 'Vertrag vorbereiten',
  [CURRENT_FOCUS_TYPES.PRESCRIPTION_REVIEW]: 'Rezept pruefen',
  [CURRENT_FOCUS_TYPES.SYNC_PREPARE]: 'Sync vorbereiten',
  [CURRENT_FOCUS_TYPES.GOAL_PROFILE_REVIEW]: 'Zielprofil schaerfen',
  [CURRENT_FOCUS_TYPES.NONE]: 'Keine offene Aktion',
};

const SYNC_BADGE_COLOR_CLASS = {
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  red: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  gray: 'bg-muted text-muted-foreground border-border',
};

const CARDS_PAGE_SIZE = 60;

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

function profileStatusLabel(status) {
  return PROFILE_STATUS_LABELS[status] || status || 'Unbekannt';
}

function profileStatusClass(status) {
  return PROFILE_STATUS_BADGE_CLASS[status] || PROFILE_STATUS_BADGE_CLASS[PROFILE_STATUSES.LEAD];
}

function focusLabel(summary) {
  if (summary?.current_focus_label) return summary.current_focus_label;
  return CURRENT_FOCUS_LABELS[summary?.current_focus] || 'Keine offene Aktion';
}

function indexById(items = []) {
  const map = new Map();
  for (const item of items) {
    if (item?.id) map.set(item.id, item);
  }
  return map;
}

function groupByCustomerId(items = []) {
  const map = new Map();
  for (const item of items) {
    const id = item?.customer_id;
    if (!id) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(item);
  }
  return map;
}

function buildPersonRows({
  customers,
  leadsByCustomer,
  consultationsByCustomer,
  rehaByCustomer,
  followUpsByCustomer,
  goalProfilesByCustomer,
  leadsById,
  rehaById,
  consultationsById,
}) {
  return customers.map((customer) => {
    const leadCandidates = leadsByCustomer.get(customer.id) || [];
    const activeLead = customer.active_lead_id
      ? leadsById.get(customer.active_lead_id) || leadCandidates[0] || null
      : leadCandidates[0] || null;

    const consultationCandidates = consultationsByCustomer.get(customer.id) || [];
    const activeConsultation = customer.active_consultation_id
      ? consultationsById.get(customer.active_consultation_id) || consultationCandidates[0] || null
      : consultationCandidates[0] || null;

    const rehaCandidates = rehaByCustomer.get(customer.id) || [];
    const activeReha = customer.active_reha_case_id
      ? rehaById.get(customer.active_reha_case_id) || rehaCandidates[0] || null
      : rehaCandidates[0] || null;

    const followUpTasks = followUpsByCustomer.get(customer.id) || [];

    const goalProfiles = goalProfilesByCustomer.get(customer.id) || [];
    const activeGoalProfile = customer.active_goal_profile_id
      ? goalProfiles.find((gp) => gp.id === customer.active_goal_profile_id) || goalProfiles[0] || null
      : goalProfiles.find((gp) => (gp.status || 'active') === 'active') || goalProfiles[0] || null;

    const summary = buildCustomerSummary(customer, {
      lead: activeLead,
      consultation: activeConsultation,
      rehaCase: activeReha,
      followUpTasks,
      goalProfile: activeGoalProfile,
    });

    const syncBadges = summarizeSyncBadges(customer);

    return {
      customer,
      summary,
      syncBadges,
      activeGoalProfile,
    };
  });
}

export default function PersonenCockpit() {
  const [search, setSearch] = useState('');
  const [profileStatusFilter, setProfileStatusFilter] = useState('ALL');
  const [focusFilter, setFocusFilter] = useState('ALL');

  const {
    data: customers = [],
    isLoading: customersLoading,
    isError: customersError,
    refetch: refetchCustomers,
    isFetching: customersFetching,
  } = useQuery({
    queryKey: ['personen-cockpit', 'customers'],
    queryFn: () => safeListEntity(base44, 'Customer', '-updated_date', 300),
    retry: false,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['personen-cockpit', 'leads'],
    queryFn: () => safeListEntity(base44, 'Lead', '-next_action_at', 300),
    retry: false,
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['personen-cockpit', 'consultations'],
    queryFn: () => safeListEntity(base44, 'Consultation', '-created_date', 300),
    retry: false,
  });

  const { data: rehaConsultations = [] } = useQuery({
    queryKey: ['personen-cockpit', 'reha-consultations'],
    queryFn: () => safeListEntity(base44, 'RehasportConsultation', '-created_date', 300),
    retry: false,
  });

  const { data: followUpTasks = [] } = useQuery({
    queryKey: ['personen-cockpit', 'follow-up-tasks'],
    queryFn: () => safeListEntity(base44, 'FollowUpTask', '-due_at', 300),
    retry: false,
  });

  const { data: goalProfiles = [] } = useQuery({
    queryKey: ['personen-cockpit', 'goal-profiles'],
    queryFn: () => safeListEntity(base44, 'GoalProfile', '-captured_at', 300),
    retry: false,
  });

  const { data: prescriptionScans = [] } = useQuery({
    queryKey: ['personen-cockpit', 'prescription-scans'],
    queryFn: () => safeListEntity(base44, 'PrescriptionScan', '-created_date', 300),
    retry: false,
  });

  const rows = useMemo(() => {
    const leadsByCustomer = groupByCustomerId(leads);
    const consultationsByCustomer = groupByCustomerId(consultations);
    const rehaByCustomer = groupByCustomerId(rehaConsultations);
    const followUpsByCustomer = groupByCustomerId(followUpTasks);
    const goalProfilesByCustomer = groupByCustomerId(goalProfiles);
    const leadsById = indexById(leads);
    const rehaById = indexById(rehaConsultations);
    const consultationsById = indexById(consultations);

    return buildPersonRows({
      customers,
      leadsByCustomer,
      consultationsByCustomer,
      rehaByCustomer,
      followUpsByCustomer,
      goalProfilesByCustomer,
      leadsById,
      rehaById,
      consultationsById,
    });
  }, [customers, leads, consultations, rehaConsultations, followUpTasks, goalProfiles]);

  const availableFocusValues = useMemo(() => {
    const set = new Set();
    for (const row of rows) {
      const focus = row.summary?.current_focus;
      if (focus) set.add(focus);
    }
    return Array.from(set);
  }, [rows]);

  const availableStatusValues = useMemo(() => {
    const set = new Set();
    for (const row of rows) {
      const status = row.summary?.profile_status;
      if (status) set.add(status);
    }
    return Array.from(set);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return rows.filter(({ customer, summary }) => {
      if (profileStatusFilter !== 'ALL' && summary.profile_status !== profileStatusFilter) {
        return false;
      }
      if (focusFilter !== 'ALL' && summary.current_focus !== focusFilter) {
        return false;
      }
      if (!needle) return true;

      const haystack = [
        summary.customer_name,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.insurance_number,
        customer.health_insurance,
        customer.city,
        customer.postal_code,
        summary.active_goal_headline?.headline,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [rows, search, profileStatusFilter, focusFilter]);

  const visibleRows = useMemo(() => filteredRows.slice(0, CARDS_PAGE_SIZE), [filteredRows]);

  const leadsWithoutCustomerCount = useMemo(
    () => leads.filter((lead) => !lead.customer_id).length,
    [leads],
  );

  const handleOpenPerson = (customerId) => {
    if (!customerId) {
      toast.error('Person hat keine ID.');
      return;
    }
    // Detailansicht folgt in Phase 5: navigate(`/berater/personen/${customerId}`)
    toast('Detailansicht folgt in Phase 5.', {
      description: 'Personenakte wird derzeit aufgebaut.',
    });
  };

  if (customersError) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
        <p className="text-destructive font-bold">Personen konnten nicht geladen werden.</p>
        <button
          onClick={() => refetchCustomers()}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
        >
          <RefreshCcw className="w-4 h-4" /> Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <Header
          totalCount={rows.length}
          filteredCount={filteredRows.length}
          isFetching={customersFetching}
          search={search}
          setSearch={setSearch}
          profileStatusFilter={profileStatusFilter}
          setProfileStatusFilter={setProfileStatusFilter}
          focusFilter={focusFilter}
          setFocusFilter={setFocusFilter}
          availableStatusValues={availableStatusValues}
          availableFocusValues={availableFocusValues}
        />

        {customersLoading ? (
          <CardGridSkeleton />
        ) : visibleRows.length === 0 ? (
          <EmptyState
            hasCustomers={rows.length > 0}
            hasFilters={search.trim().length > 0 || profileStatusFilter !== 'ALL' || focusFilter !== 'ALL'}
            onReset={() => {
              setSearch('');
              setProfileStatusFilter('ALL');
              setFocusFilter('ALL');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleRows.map((row) => (
              <PersonCard
                key={row.customer.id}
                row={row}
                onOpen={() => handleOpenPerson(row.customer.id)}
              />
            ))}
          </div>
        )}

        {filteredRows.length > visibleRows.length && (
          <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground text-center">
            {filteredRows.length - visibleRows.length} weitere Personen werden ausgeblendet. Filter verfeinern, um weitere anzuzeigen.
          </div>
        )}

        <FooterCounters
          leadsWithoutCustomer={leadsWithoutCustomerCount}
          totalLeads={leads.length}
          totalGoalProfiles={goalProfiles.length}
          totalPrescriptionScans={prescriptionScans.length}
        />
      </div>
    </TooltipProvider>
  );
}

function Header({
  totalCount,
  filteredCount,
  isFetching,
  search,
  setSearch,
  profileStatusFilter,
  setProfileStatusFilter,
  focusFilter,
  setFocusFilter,
  availableStatusValues,
  availableFocusValues,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Personenakte</p>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Personen-Cockpit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredCount} von {totalCount} Personen sichtbar
            {isFetching && <Loader2 className="inline-block w-3.5 h-3.5 ml-2 animate-spin text-primary" />}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, Telefon, E-Mail, Krankenkasse oder Versichertennummer..."
            className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <FilterChips
        label="Status"
        value={profileStatusFilter}
        onChange={setProfileStatusFilter}
        options={[
          { id: 'ALL', label: 'Alle Status' },
          ...availableStatusValues.map((value) => ({
            id: value,
            label: profileStatusLabel(value),
          })),
        ]}
      />

      <FilterChips
        label="Fokus"
        value={focusFilter}
        onChange={setFocusFilter}
        options={[
          { id: 'ALL', label: 'Alle Fokus-Themen' },
          ...availableFocusValues.map((value) => ({
            id: value,
            label: CURRENT_FOCUS_LABELS[value] || value,
          })),
        ]}
      />
    </div>
  );
}

function FilterChips({ label, value, onChange, options }) {
  if (options.length <= 1) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">
        {label}
      </span>
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide transition-all ${
              active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PersonCard({ row, onOpen }) {
  const { customer, summary, syncBadges, activeGoalProfile } = row;

  const initials = getInitials(summary.customer_name || customer.email || customer.id);
  const statusClass = profileStatusClass(summary.profile_status);

  // Maximal 6 Badges pro Karte (Anforderung):
  const contextBadges = [
    customer.active_lead_id || summary.badges?.includes('Lead aktiv') ? 'Lead aktiv' : null,
    customer.active_reha_case_id || customer.last_rehasport_consultation_id ? 'Reha aktiv' : null,
    customer.active_contract_draft_id ? 'Vertrag offen' : null,
    summary.profile_status === PROFILE_STATUSES.OFFER_OPEN ? 'Angebot offen' : null,
  ].filter(Boolean).slice(0, 4);

  const visibleSyncBadges = syncBadges.slice(0, Math.max(0, 6 - contextBadges.length));

  return (
    <Card className="p-5 flex flex-col gap-4 border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-foreground text-base truncate">
            {summary.customer_name || 'Unbenannte Person'}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusClass}`}>
              {profileStatusLabel(summary.profile_status)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-secondary/50 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Naechste Aktion
          </span>
          <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className="text-sm font-bold text-foreground mt-1 truncate">
          {focusLabel(summary)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDateTime(summary.next_action_at)}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Datenqualitaet
          </span>
          <span className="text-xs font-bold text-foreground">
            {Math.round(summary.data_quality_score || 0)}%
          </span>
        </div>
        <Progress value={Math.max(0, Math.min(100, summary.data_quality_score || 0))} />
        {Array.isArray(summary.missing_required_fields) && summary.missing_required_fields.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Fehlt: {summary.missing_required_fields.slice(0, 3).join(', ')}
            {summary.missing_required_fields.length > 3 ? ` +${summary.missing_required_fields.length - 3}` : ''}
          </p>
        )}
      </div>

      {(contextBadges.length > 0 || visibleSyncBadges.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {contextBadges.map((label) => (
            <span
              key={`ctx-${label}`}
              className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            >
              {label}
            </span>
          ))}
          {visibleSyncBadges.map((badge) => (
            <Tooltip key={`sync-${badge.system}`}>
              <TooltipTrigger asChild>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide cursor-help ${
                    SYNC_BADGE_COLOR_CLASS[badge.color] || SYNC_BADGE_COLOR_CLASS.gray
                  }`}
                >
                  {badge.label}: {badge.status}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[260px]">{badge.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {(activeGoalProfile || summary.active_goal_headline) && (
        <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
            Aktuelles Ziel
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5 truncate">
            {summary.active_goal_headline?.headline || 'Ziel offen'}
          </p>
          {Array.isArray(summary.active_goal_headline?.badges) && summary.active_goal_headline.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {summary.active_goal_headline.badges.slice(0, 3).map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full bg-muted text-muted-foreground border border-border px-2 py-0.5 text-[10px] font-bold"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-1">
        <button
          type="button"
          onClick={onOpen}
          className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2"
        >
          Person oeffnen
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Card key={idx} className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ hasCustomers, hasFilters, onReset }) {
  if (!hasCustomers) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center space-y-3">
        <Users className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-foreground font-bold">Noch keine Personenakten vorhanden.</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Sobald aus einem Lead, einer Beratung oder einem Rezeptscan eine Personenakte angelegt wird, taucht sie hier auf.
        </p>
        <Link
          to="/berater/leads"
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Zum Lead-Cockpit
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center space-y-3">
      <Search className="w-10 h-10 text-muted-foreground mx-auto" />
      <p className="text-foreground font-bold">Keine Personen passen zu den Filtern.</p>
      <p className="text-sm text-muted-foreground">
        Versuch es mit weniger Filtern oder einer anderen Suchanfrage.
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-card text-foreground font-bold hover:bg-secondary transition-all"
        >
          Filter zuruecksetzen
        </button>
      )}
    </div>
  );
}

function FooterCounters({ leadsWithoutCustomer, totalLeads, totalGoalProfiles, totalPrescriptionScans }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Link
        to="/berater/leads"
        className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <UserPlus className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Leads ohne Personenakte
          </p>
          <p className="text-lg font-black text-foreground">
            {leadsWithoutCustomer} <span className="text-xs font-bold text-muted-foreground">von {totalLeads}</span>
          </p>
        </div>
      </Link>

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <IdCard className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Zielprofile gesamt
          </p>
          <p className="text-lg font-black text-foreground">{totalGoalProfiles}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Rezeptscans erfasst
          </p>
          <p className="text-lg font-black text-foreground">{totalPrescriptionScans}</p>
        </div>
      </div>
    </div>
  );
}
