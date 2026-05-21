import { GOALS } from './goalConfig';

const EXPERIENCE_LEVELS = {
  keine: 0,
  none: 0,
  einsteiger: 0,
  wenig: 1,
  some: 1,
  gelegentlich: 1,
  mittel: 2,
  regular: 2,
  regelmaessig: 2,
  viel: 3,
  advanced: 3,
  fortgeschritten: 3,
};

const GOAL_SYNONYMS = {
  abnehmen: ['figur', 'aussehen', 'stoffwechsel', 'gewicht'],
  muskelaufbau: ['kraft', 'staerke', 'muskel', 'strength'],
  ruecken: ['ruecken', 'nacken', 'beweglichkeit', 'haltung'],
  beweglichkeit: ['beweglichkeit', 'mobilitaet', 'ruecken'],
  gesundheit: ['gesundheit', 'praevention', 'wohlbefinden', 'health'],
  reha: ['reha', 'recovery', 'beschwerden', 'wiedereinstieg'],
  performance: ['performance', 'leistung', 'athletik', 'energie'],
  stress: ['stress', 'schlaf', 'energie', 'regeneration'],
  einfach: ['einfach', 'start', 'selfguided', 'infrastruktur'],
  community: ['community', 'kurse', 'social', 'spass'],
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/×/g, 'x')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getSelectedGoalProfiles(selectedGoals) {
  return GOALS
    .filter(goal => selectedGoals.includes(goal.id))
    .map(goal => ({
      ...goal,
      terms: [goal.id, goal.label, ...(GOAL_SYNONYMS[goal.id] || [])]
        .map(normalizeText)
        .filter(Boolean),
    }));
}

function getSelectedGoalTerms(selectedGoalProfiles) {
  return selectedGoalProfiles.flatMap(goal => goal.terms);
}

function hasLooseMatch(candidate, targets) {
  const normalized = normalizeText(candidate);
  if (!normalized) return false;
  return targets.some(target => normalized.includes(target) || target.includes(normalized));
}

function getExperienceLevel(customerProfile, anamnesis) {
  const raw = customerProfile?.training_experience || customerProfile?.experience || anamnesis?.experience;
  const normalized = normalizeText(raw);

  if (normalized.includes('fort')) return 3;
  if (normalized.includes('regular') || normalized.includes('regelmaessig')) return 2;
  if (normalized.includes('some') || normalized.includes('gelegentlich')) return 1;
  if (normalized.includes('none') || normalized.includes('einsteiger')) return 0;

  return EXPERIENCE_LEVELS[normalized] ?? 0;
}

function getRequiredExperienceLevel(service) {
  const normalized = normalizeText(service?.experience_required);
  return EXPERIENCE_LEVELS[normalized] ?? 0;
}

function getSchedule(anamnesis) {
  return normalizeText(anamnesis?.schedule || anamnesis?.frequency);
}

function getLifestyle(anamnesis) {
  return normalizeText(anamnesis?.lifestyle || anamnesis?.training_style);
}

function getComplaints(anamnesis) {
  return normalizeArray(anamnesis?.complaints).map(normalizeText);
}

function hasComplaint(complaints, terms) {
  return complaints.some(complaint => terms.some(term => complaint.includes(term)));
}

/**
 * Calculates a fit-score (0-100) for each service based on customer profile.
 */
export function calculateScores(services, customerProfile, anamnesis, selectedGoals, rules) {
  const selectedGoalProfiles = getSelectedGoalProfiles(selectedGoals);
  const selectedGoalTerms = getSelectedGoalTerms(selectedGoalProfiles);
  const customerExperience = getExperienceLevel(customerProfile, anamnesis);
  const schedule = getSchedule(anamnesis);
  const lifestyle = getLifestyle(anamnesis);
  const complaints = getComplaints(anamnesis);

  return services
    .filter(service => service.is_active !== false)
    .map(service => {
      let score = 0;
      const reasons = [];

      const goalAreas = [
        ...normalizeArray(service.goal_areas),
        service.category,
        service.short_description,
        service.benefit_argument,
      ].map(normalizeText).filter(Boolean);

      const goalMatches = selectedGoalProfiles.filter(goal => goal.terms.some(term => hasLooseMatch(term, goalAreas)));
      const goalScore = Math.min(40, (goalMatches.length / Math.max(selectedGoalProfiles.length, 1)) * 40);
      score += goalScore;
      if (goalMatches.length > 0) reasons.push('Passt zu den gewaehlten Zielen');

      const requiredExperience = getRequiredExperienceLevel(service);
      if (customerExperience >= requiredExperience) {
        score += 15;
      } else {
        score += Math.max(0, 15 - (requiredExperience - customerExperience) * 5);
        reasons.push('Etwas Erfahrung empfohlen');
      }

      const wantsEfficient = schedule.includes('1x') || schedule.includes('2') || lifestyle.includes('efficient') || lifestyle.includes('kurz');
      if (wantsEfficient && service.time_efficient) {
        score += 10;
        reasons.push('Zeiteffizient');
      } else if (!wantsEfficient) {
        score += 5;
      }

      const needsCoaching = customerExperience === 0 || lifestyle.includes('coached') || lifestyle.includes('betreut') || lifestyle.includes('gefuehrt');
      if (needsCoaching && service.needs_coaching) {
        score += 10;
        reasons.push('Passende Betreuung');
      } else if (!needsCoaching && !service.needs_coaching) {
        score += 7;
      }

      const wantsWellness = lifestyle.includes('wellness') || lifestyle.includes('erholung') || normalizeText(anamnesis?.motivation).includes('energy');
      if (wantsWellness && normalizeText(service.category).includes('wellness')) {
        score += 10;
        reasons.push('Wellness-Interesse');
      }

      const budgetFeel = normalizeText(customerProfile?.budget_feeling);
      if (budgetFeel === 'sparsam' && service.price_monthly > 30) {
        score -= 5;
      } else if (budgetFeel === 'egal') {
        score += 5;
      }

      if (hasComplaint(complaints, ['back', 'ruecken', 'nacken']) && goalAreas.some(area => area.includes('ruecken') || area.includes('beweglichkeit') || area.includes('gesundheit'))) {
        score += 7;
        reasons.push('Beruecksichtigt Ruecken/Nacken');
      }
      if (hasComplaint(complaints, ['joints', 'knie', 'huefte']) && goalAreas.some(area => area.includes('reha') || area.includes('gesundheit') || area.includes('mobilitaet'))) {
        score += 6;
        reasons.push('Gelenkschonende Ausrichtung');
      }
      if (hasComplaint(complaints, ['cardio', 'herz', 'kreislauf']) && goalAreas.some(area => area.includes('gesundheit') || area.includes('praevention'))) {
        score += 5;
        reasons.push('Gesundheitlicher Fokus');
      }

      (rules || []).filter(rule => rule.is_active !== false).forEach(rule => {
        const boostServices = rule.boost_services || [];
        if (!boostServices.some(boosted => normalizeText(boosted) === normalizeText(service.name))) return;

        let ruleApplies = true;

        if (rule.condition_goal) {
          const ruleGoal = normalizeText(rule.condition_goal);
          ruleApplies = selectedGoalTerms.some(goal => goal.includes(ruleGoal) || ruleGoal.includes(goal));
        }

        if (rule.condition_experience) {
          const requiredRuleExperience = getRequiredExperienceLevel({ experience_required: rule.condition_experience });
          ruleApplies = ruleApplies && customerExperience === requiredRuleExperience;
        }

        if (ruleApplies) {
          score += rule.boost_amount || 10;
          reasons.push(rule.name);
        }
      });

      return {
        ...service,
        score: Math.min(100, Math.max(0, Math.round(score))),
        reasons,
        isAddon: service.is_addon || false,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Find best matching tariff based on scored services and goals.
 */
export function findBestTariff(tariffs, selectedGoals, scoredServices = []) {
  const selectedGoalProfiles = getSelectedGoalProfiles(selectedGoals);
  const topServiceNames = scoredServices.slice(0, 5).map(service => normalizeText(service.name));

  return tariffs
    .filter(tariff => tariff.is_active !== false)
    .map(tariff => {
      const tariffGoals = [
        ...normalizeArray(tariff.goal_areas),
        tariff.description,
        tariff.ideal_for,
        ...normalizeArray(tariff.included_service_names),
      ].map(normalizeText).filter(Boolean);

      const goalMatches = selectedGoalProfiles.filter(goal => goal.terms.some(term => hasLooseMatch(term, tariffGoals)));
      const serviceMatches = topServiceNames.filter(serviceName => hasLooseMatch(serviceName, tariffGoals));
      const goalScore = (goalMatches.length / Math.max(selectedGoalProfiles.length, 1)) * 80;
      const serviceScore = Math.min(20, serviceMatches.length * 5);

      return { ...tariff, score: Math.round(goalScore + serviceScore) };
    })
    .sort((a, b) => b.score - a.score);
}
