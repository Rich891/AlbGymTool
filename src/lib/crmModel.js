export const PIPELINE_STAGES = [
  {
    id: 'NEW_LEAD',
    label: 'Neu',
    action: 'Ziel abfragen',
    badgeClass: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  },
  {
    id: 'QUALIFICATION_STARTED',
    label: 'Qualifizierung',
    action: 'Antwort auswerten',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  },
  {
    id: 'QUALIFIED',
    label: 'Qualifiziert',
    action: 'Terminlink senden',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  {
    id: 'APPOINTMENT_LINK_SENT',
    label: 'Link gesendet',
    action: 'Buchung pruefen',
    badgeClass: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  },
  {
    id: 'APPOINTMENT_BOOKED',
    label: 'Termin gebucht',
    action: 'Briefing vorbereiten',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  {
    id: 'APPOINTMENT_REMINDER_SENT',
    label: 'Reminder',
    action: 'Termin beobachten',
    badgeClass: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  },
  {
    id: 'OFFER_OPEN',
    label: 'Angebot offen',
    action: 'Follow-up',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  {
    id: 'TRIAL_STARTED',
    label: 'Testphase',
    action: 'Abschluss klaeren',
    badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
  {
    id: 'CONTRACT_READY',
    label: 'Vertrag bereit',
    action: 'ThemiSoft pruefen',
    badgeClass: 'bg-lime-500/10 text-lime-700 border-lime-500/20',
  },
  {
    id: 'CONVERTED',
    label: 'Abgeschlossen',
    action: 'Uebergabe pruefen',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'NO_SHOW',
    label: 'No-Show',
    action: 'Reaktivieren',
    badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  },
  {
    id: 'LOST',
    label: 'Verloren',
    action: 'Archivieren',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  },
];

export const LEAD_SOURCES = [
  { id: 'meta_ad', label: 'Meta Ad' },
  { id: 'instagram_dm', label: 'Instagram DM' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'website', label: 'Website' },
  { id: 'referral', label: 'Empfehlung' },
  { id: 'walk_in', label: 'Walk-in' },
  { id: 'superchat', label: 'Superchat' },
  { id: 'manual', label: 'Manuell' },
];

export const PRIMARY_GOALS = [
  { id: 'gesundheit', label: 'Gesundheit' },
  { id: 'figur', label: 'Figur' },
  { id: 'leistung', label: 'Leistung' },
  { id: 'reha', label: 'Reha' },
  { id: 'zuschuss', label: 'Zuschuss' },
];

const STAGE_BY_ID = PIPELINE_STAGES.reduce((acc, stage) => {
  acc[stage.id] = stage;
  return acc;
}, {});

const SOURCE_BY_ID = LEAD_SOURCES.reduce((acc, source) => {
  acc[source.id] = source;
  return acc;
}, {});

const GOAL_BY_ID = PRIMARY_GOALS.reduce((acc, goal) => {
  acc[goal.id] = goal;
  return acc;
}, {});

export function getStageMeta(status) {
  return STAGE_BY_ID[status] || STAGE_BY_ID.NEW_LEAD;
}

export function getSourceLabel(source) {
  return SOURCE_BY_ID[source]?.label || source || 'Unbekannt';
}

export function getGoalLabel(goal) {
  return GOAL_BY_ID[goal]?.label || goal || 'Noch offen';
}

export function addDaysIso(days, fromDate = new Date()) {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function formatDateTime(value) {
  if (!value) return 'Noch nicht gesetzt';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Noch nicht gesetzt';

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function mapOutcomeToPipelineStatus(outcome) {
  if (outcome === 'abschluss') return 'CONVERTED';
  if (outcome === 'testphase') return 'TRIAL_STARTED';
  if (outcome === 'angebot') return 'OFFER_OPEN';
  if (outcome === 'no_show') return 'NO_SHOW';
  return 'QUALIFIED';
}

export function getNextActionForOutcome(outcome) {
  if (outcome === 'angebot') return addDaysIso(1);
  if (outcome === 'testphase') return addDaysIso(7);
  if (outcome === 'abschluss') return null;
  return addDaysIso(1);
}

export function enrichCustomerWithConsentSnapshot(customer, { source = 'consultation_flow', now = new Date().toISOString() } = {}) {
  const previousConsents = Array.isArray(customer?.consents) ? customer.consents : [];
  const consultationConsent = {
    channel: 'in_app',
    purpose: 'beratung',
    status: 'granted',
    timestamp: customer?.privacy_consent_date || now,
    source,
  };

  return {
    ...customer,
    privacy_consent: customer?.privacy_consent !== false,
    privacy_consent_date: customer?.privacy_consent_date || now,
    consents: [
      ...previousConsents.filter(item => !(item.channel === 'in_app' && item.purpose === 'beratung')),
      consultationConsent,
    ],
  };
}

export function buildLeadPayload({ customer, customerId, selectedGoals = [], outcome, type, selectedTariff, totalMonthly }) {
  const primaryGoal = selectedGoals[0] || customer?.primary_goal || customer?.training_goal || 'gesundheit';
  const status = mapOutcomeToPipelineStatus(outcome);

  return {
    customer_id: customerId,
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    source: customer?.lead_source || customer?.source || 'manual',
    campaign_id: customer?.campaign_id || null,
    status,
    primary_goal: primaryGoal,
    selected_goals: selectedGoals,
    pain_points: customer?.pain_points || [],
    assigned_advisor: customer?.assigned_advisor || null,
    next_action_at: getNextActionForOutcome(outcome),
    recommended_tariff: selectedTariff?.name || null,
    expected_monthly_value: totalMonthly || 0,
    consultation_type: type || 'welcome',
    last_contact_at: new Date().toISOString(),
  };
}

export function buildActivityPayload({ leadId, customerId, consultationId, outcome, notes, actor = 'navigator' }) {
  return {
    lead_id: leadId || null,
    customer_id: customerId || null,
    consultation_id: consultationId || null,
    type: 'consultation.completed',
    actor,
    occurred_at: new Date().toISOString(),
    outcome,
    notes: notes || '',
  };
}

export function buildContractDraftPayload({ customer, customerId, consultation, selectedTariff, selectedAddons = [], totalMonthly, outcome }) {
  return {
    customer_profile_id: customerId,
    consultation_id: consultation?.id || null,
    customer_name: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
    tariff_id: selectedTariff?.id || null,
    tariff_name: selectedTariff?.name || null,
    addons: selectedAddons.map(addon => ({
      id: addon.id,
      name: addon.name,
      price_monthly: addon.price_monthly || 0,
      price_once: addon.price_once || 0,
    })),
    start_date: null,
    monthly_price: totalMonthly || 0,
    start_fee: selectedTariff?.start_fee || 0,
    duration_months: selectedTariff?.duration_months || 12,
    discounts: outcome === 'abschluss' ? { signup_fee_note: 'Im Beratungsgespraech pruefen' } : {},
    status: outcome === 'abschluss' ? 'ready' : 'draft',
    themisoft_reference: null,
    validation_notes: [],
  };
}

export function consultationToLeadCard(consultation) {
  const name = consultation?.customer_name || 'Unbekannter Lead';
  const [firstName, ...rest] = name.split(' ');

  return {
    id: consultation?.id,
    first_name: firstName,
    last_name: rest.join(' '),
    source: 'manual',
    status: mapOutcomeToPipelineStatus(consultation?.outcome),
    primary_goal: consultation?.selected_goals?.[0] || 'gesundheit',
    selected_goals: consultation?.selected_goals || [],
    next_action_at: getNextActionForOutcome(consultation?.outcome),
    recommended_tariff: consultation?.selected_tariff || null,
    expected_monthly_value: consultation?.monthly_price || 0,
    advisor_note: consultation?.notes || '',
    consultation_id: consultation?.id,
    isDerived: true,
  };
}

export function buildTrainerBriefing(lead) {
  const goal = getGoalLabel(lead?.primary_goal);
  const source = getSourceLabel(lead?.source);
  const tariff = lead?.recommended_tariff || 'Empfehlung offen';

  return [
    `Ziel: ${goal}`,
    `Quelle: ${source}`,
    `Angebot: ${tariff}`,
    lead?.advisor_note ? `Hinweis: ${lead.advisor_note}` : 'Hinweis: keine offenen Notizen',
  ];
}
