import { createEntity, updateEntity } from '@/lib/entityGateway';

export const GOAL_PROFILE_LIFE_PHASES = {
  YOUNG_ADULT: 'young_adult',
  FAMILY: 'family',
  SILVER: 'silver',
  REHA_ENTRY: 'reha_entry',
};

export const GOAL_PROFILE_LIFE_PHASE_LABELS = {
  [GOAL_PROFILE_LIFE_PHASES.YOUNG_ADULT]: 'Junge Erwachsene',
  [GOAL_PROFILE_LIFE_PHASES.FAMILY]: 'Familie & Berufsalltag',
  [GOAL_PROFILE_LIFE_PHASES.SILVER]: 'Silver Generation',
  [GOAL_PROFILE_LIFE_PHASES.REHA_ENTRY]: 'Reha-Einstieg',
};

export const GOAL_PROFILE_SOURCES = {
  CONSULTATION_NEUKUNDE: 'consultation_neukunde',
  CONSULTATION_REHA: 'consultation_rehasport',
  MANUAL: 'manual',
  LEAD_COCKPIT: 'lead_cockpit',
};

export const GOAL_PROFILE_STATUSES = {
  ACTIVE: 'active',
  SUPERSEDED: 'superseded',
  ARCHIVED: 'archived',
};

function cleanText(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function goalId(goal) {
  if (!goal) return null;
  if (typeof goal === 'string') return goal;
  if (typeof goal === 'object') return goal.id || goal.value || goal.key || null;
  return null;
}

function normalizeGoalList(goals = []) {
  return Array.from(new Set((goals || []).map(goalId).filter(Boolean)));
}

function calculateConfidence({ primaryGoal, secondaryGoals, anamnesis = {}, lifePhase }) {
  const checks = [
    Boolean(primaryGoal),
    secondaryGoals.length > 0,
    Boolean(cleanText(anamnesis.motivation)),
    Boolean(cleanText(anamnesis.schedule)),
    Boolean(cleanText(anamnesis.experience)),
    Boolean(cleanText(anamnesis.complaints?.notes) || (anamnesis.complaints?.tags || []).length > 0),
    Boolean(lifePhase),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function buildGoalProfilePayload({
  customer = {},
  selectedGoals = [],
  anamnesis = {},
  source,
  lifePhase,
  notes,
} = {}) {
  const allGoals = normalizeGoalList(selectedGoals);
  const primary_goal = allGoals[0] || null;
  const secondary_goals = allGoals.slice(1);
  const painPoints = Array.from(new Set((anamnesis.complaints?.tags || []).map(cleanText).filter(Boolean)));

  const payload = {
    customer_id: customer?.id || null,
    customer_name: cleanText(customer?.customer_name),
    primary_goal,
    secondary_goals,
    life_phase: lifePhase || null,
    motivation: cleanText(anamnesis.motivation),
    time_per_week: cleanText(anamnesis.schedule),
    restrictions_text: cleanText(anamnesis.complaints?.notes),
    pain_points: painPoints,
    experience_level: cleanText(anamnesis.experience),
    confidence_score: calculateConfidence({ primaryGoal: primary_goal, secondaryGoals: secondary_goals, anamnesis, lifePhase }),
    source: source || GOAL_PROFILE_SOURCES.MANUAL,
    captured_at: new Date().toISOString(),
    status: GOAL_PROFILE_STATUSES.ACTIVE,
    notes: cleanText(notes),
  };

  return payload;
}

export function deriveGoalProfileSummary(goalProfile = {}) {
  const primary = cleanText(goalProfile.primary_goal);
  const headline = primary ? `Ziel: ${primary}` : 'Ziel offen';
  const badges = [];
  const phaseLabel = GOAL_PROFILE_LIFE_PHASE_LABELS[goalProfile.life_phase];
  if (phaseLabel) badges.push(phaseLabel);
  if (Array.isArray(goalProfile.secondary_goals) && goalProfile.secondary_goals.length > 0) {
    badges.push(`+${goalProfile.secondary_goals.length} weitere`);
  }
  if (typeof goalProfile.confidence_score === 'number') {
    badges.push(`${goalProfile.confidence_score}% Profil`);
  }
  const cta_label = (goalProfile.confidence_score ?? 0) < 50 ? 'Beratung starten' : 'Zielprofil ansehen';
  return { headline, badges, cta_label };
}

export async function upsertGoalProfile(base44, customerId, payload) {
  if (!customerId) {
    return { id: null, status: null, error: 'missing_customer_id' };
  }

  const entity = base44?.entities?.GoalProfile;
  if (!entity?.create) {
    return { id: null, status: null, error: 'goal_profile_entity_unavailable' };
  }

  let activeId = null;
  try {
    const customer = await base44?.entities?.Customer?.get?.(customerId);
    activeId = customer?.active_goal_profile_id || null;
  } catch (error) {
    console.warn('Customer.get for goal profile upsert skipped', error?.message || error);
  }

  if (activeId) {
    try {
      await updateEntity(base44, 'GoalProfile', activeId, { status: GOAL_PROFILE_STATUSES.SUPERSEDED });
    } catch (error) {
      console.warn('GoalProfile supersede skipped', error?.message || error);
    }
  }

  try {
    const created = await createEntity(base44, 'GoalProfile', {
      ...payload,
      customer_id: customerId,
      status: GOAL_PROFILE_STATUSES.ACTIVE,
    });
    return { id: created?.id || null, status: created?.status || GOAL_PROFILE_STATUSES.ACTIVE };
  } catch (error) {
    return { id: null, status: null, error: error?.message || 'goal_profile_create_failed' };
  }
}
