import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  UserPlus,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  buildTrainerBriefing,
  consultationToLeadCard,
  formatDateTime,
  getGoalLabel,
  getSourceLabel,
  getStageMeta,
  LEAD_SOURCES,
  PIPELINE_STAGES,
  PRIMARY_GOALS,
} from '@/lib/crmModel';

const EMPTY_LEAD = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  source: 'manual',
  primary_goal: 'gesundheit',
  status: 'NEW_LEAD',
};

async function listEntity(entityName, sort, limit) {
  try {
    const entity = base44.entities?.[entityName];
    if (!entity?.list) return [];
    return await entity.list(sort, limit);
  } catch (error) {
    console.warn(`${entityName}.list skipped`, error?.message || error);
    return [];
  }
}

export default function LeadCockpit() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_LEAD);

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: () => listEntity('Lead', '-next_action_at', 250),
    retry: false,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['crm-appointments'],
    queryFn: () => listEntity('Appointment', 'start', 250),
    retry: false,
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations-for-lead-cockpit'],
    queryFn: () => listEntity('Consultation', '-created_date', 100),
    retry: false,
  });

  const createLead = useMutation({
    mutationFn: async (payload) => {
      const created = await base44.entities.Lead.create({
        ...payload,
        selected_goals: [payload.primary_goal],
        lead_score: 0,
        next_action_at: new Date().toISOString(),
        created_from: 'lead_cockpit',
      });

      try {
        await base44.entities.ActivityLog.create({
          lead_id: created.id,
          type: 'lead.created',
          actor: 'advisor',
          occurred_at: new Date().toISOString(),
          notes: 'Manuell im Lead Cockpit angelegt',
        });
      } catch (error) {
        console.warn('ActivityLog.create skipped', error?.message || error);
      }

      return created;
    },
    onSuccess: () => {
      toast.success('Lead wurde angelegt.');
      setForm(EMPTY_LEAD);
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
    onError: () => {
      toast.error('Lead konnte nicht gespeichert werden. Ist die Base44-Entity Lead angelegt?');
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Lead.update(id, {
      status,
      last_contact_at: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
    onError: () => {
      toast.error('Status konnte nicht aktualisiert werden.');
    },
  });

  const leadCards = useMemo(() => {
    const sourceRecords = leads.length > 0 ? leads : consultations.map(consultationToLeadCard);

    return sourceRecords.map(lead => ({
      ...lead,
      appointment: appointments.find(item =>
        item.lead_id === lead.id ||
        item.customer_id === lead.customer_id ||
        item.consultation_id === lead.consultation_id
      ),
    }));
  }, [appointments, consultations, leads]);

  const filteredLeads = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return leadCards.filter(lead => {
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const haystack = [
        lead.first_name,
        lead.last_name,
        lead.email,
        lead.phone,
        lead.source,
        lead.primary_goal,
        lead.recommended_tariff,
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [leadCards, search, statusFilter]);

  const metrics = useMemo(() => {
    const dueNow = leadCards.filter(lead => lead.next_action_at && new Date(lead.next_action_at) <= new Date()).length;
    return [
      { label: 'Leads', value: leadCards.length, icon: UserPlus },
      { label: 'Termine', value: leadCards.filter(lead => lead.status === 'APPOINTMENT_BOOKED').length, icon: CalendarClock },
      { label: 'Offene Angebote', value: leadCards.filter(lead => lead.status === 'OFFER_OPEN').length, icon: ClipboardList },
      { label: 'Faellig', value: dueNow, icon: AlertTriangle },
    ];
  }, [leadCards]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error('Vorname und Nachname sind Pflichtfelder.');
      return;
    }
    createLead.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Sales CRM</p>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Lead Cockpit</h1>
        </div>
        <button
          onClick={() => setShowCreate(value => !value)}
          className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Lead erfassen
        </button>
      </div>

      {leads.length === 0 && consultations.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Lead-Entity noch leer oder nicht erreichbar. Das Cockpit zeigt voruebergehend Beratungen als Pipeline-Karten.</span>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <Field label="Vorname">
              <input
                value={form.first_name}
                onChange={event => setForm(prev => ({ ...prev, first_name: event.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Nachname">
              <input
                value={form.last_name}
                onChange={event => setForm(prev => ({ ...prev, last_name: event.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Telefon">
              <input
                value={form.phone}
                onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="E-Mail">
              <input
                type="email"
                value={form.email}
                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Quelle">
              <select
                value={form.source}
                onChange={event => setForm(prev => ({ ...prev, source: event.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {LEAD_SOURCES.map(source => <option key={source.id} value={source.id}>{source.label}</option>)}
              </select>
            </Field>
            <Field label="Hauptziel">
              <select
                value={form.primary_goal}
                onChange={event => setForm(prev => ({ ...prev, primary_goal: event.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PRIMARY_GOALS.map(goal => <option key={goal.id} value={goal.id}>{goal.label}</option>)}
              </select>
            </Field>
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="h-11 px-4 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-bold"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={createLead.isPending}
                className="h-11 flex-1 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Speichern
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-black text-foreground">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Name, Telefon, Quelle oder Ziel suchen..."
            className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          className="h-12 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">Alle Status</option>
          {PIPELINE_STAGES.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
        </select>
      </div>

      {leadsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Keine passenden Leads gefunden.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => {
            const stage = getStageMeta(lead.status);
            const briefing = buildTrainerBriefing(lead);
            return (
              <div key={`${lead.id}-${lead.status}`} className="rounded-2xl border border-border bg-card p-4 lg:p-5">
                <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${stage.badgeClass}`}>
                        {stage.label}
                      </span>
                      {lead.isDerived && (
                        <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">
                          Aus Beratung
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-foreground truncate">
                      {lead.first_name} {lead.last_name}
                    </h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      {lead.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>}
                      {lead.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{lead.email}</span>}
                      <span>{getSourceLabel(lead.source)}</span>
                      <span>{getGoalLabel(lead.primary_goal)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 xl:w-[520px] gap-3 text-sm">
                    <InfoBox label="Naechste Aktion" value={formatDateTime(lead.next_action_at)} />
                    <InfoBox label="Termin" value={lead.appointment ? formatDateTime(lead.appointment.start) : 'Kein Termin'} />
                    <InfoBox label="Wert" value={lead.expected_monthly_value ? `${lead.expected_monthly_value} EUR/mtl.` : 'Offen'} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
                  <div className="rounded-xl bg-secondary/50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Trainerbriefing</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground">
                      {briefing.map(item => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />{item}</span>)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    <select
                      value={lead.status || 'NEW_LEAD'}
                      disabled={lead.isDerived || updateStatus.isPending}
                      onChange={event => updateStatus.mutate({ id: lead.id, status: event.target.value })}
                      className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      {PIPELINE_STAGES.map(stageOption => <option key={stageOption.id} value={stageOption.id}>{stageOption.label}</option>)}
                    </select>
                    <Link
                      to={`/beratung/welcome?lead=${lead.id}`}
                      className="h-11 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center hover:bg-primary/90 transition-all"
                    >
                      Welcome starten
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">{label}</span>
      {children}
    </label>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-3 py-2 min-w-0">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground truncate">{value}</p>
    </div>
  );
}
