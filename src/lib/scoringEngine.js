import { GOALS } from './goalConfig';

/**
 * Calculates a fit-score (0-100) for each service based on customer profile
 */
export function calculateScores(services, customerProfile, anamnesis, selectedGoals, rules) {
  const selectedGoalLabels = GOALS
    .filter(g => selectedGoals.includes(g.id))
    .map(g => g.label.toLowerCase());

  return services
    .filter(s => s.is_active !== false)
    .map(service => {
      let score = 0;
      const reasons = [];

      // 1. Goal matching (0-40 points)
      const goalAreas = (service.goal_areas || []).map(g => g.toLowerCase());
      const goalMatches = selectedGoalLabels.filter(g => 
        goalAreas.some(ga => ga.includes(g) || g.includes(ga))
      );
      const goalScore = Math.min(40, (goalMatches.length / Math.max(selectedGoals.length, 1)) * 40);
      score += goalScore;
      if (goalMatches.length > 0) reasons.push(`Passt zu: ${goalMatches.join(', ')}`);

      // 2. Experience match (0-15 points)
      const expLevels = { 'keine': 0, 'wenig': 1, 'mittel': 2, 'viel': 3 };
      const custExp = expLevels[customerProfile.training_experience] || 0;
      const reqExp = expLevels[service.experience_required] || 0;
      if (custExp >= reqExp) {
        score += 15;
      } else {
        score += Math.max(0, 15 - (reqExp - custExp) * 5);
        if (reqExp > custExp) reasons.push('Etwas Erfahrung empfohlen');
      }

      // 3. Time efficiency (0-10 points)
      const wantsEfficient = anamnesis?.frequency === '1× pro Woche' || anamnesis?.frequency === '2× pro Woche';
      if (wantsEfficient && service.time_efficient) {
        score += 10;
        reasons.push('Zeiteffizient');
      } else if (!wantsEfficient) {
        score += 5;
      }

      // 4. Coaching need (0-10 points)
      const needsCoaching = anamnesis?.confidence === 'Gar nicht – brauche Anleitung' || 
                           anamnesis?.training_style === 'Geführt – ich brauche Struktur';
      if (needsCoaching && service.needs_coaching) {
        score += 10;
        reasons.push('Passende Betreuung');
      } else if (!needsCoaching && !service.needs_coaching) {
        score += 7;
      }

      // 5. Wellness interest (0-10 points)
      const wantsWellness = anamnesis?.wellness === 'Ja, sehr!' || anamnesis?.wellness === 'Wäre schön';
      if (wantsWellness && service.category === 'Wellness & Regeneration') {
        score += 10;
        reasons.push('Wellness-Interesse');
      }

      // 6. Budget consideration (0-10 points)
      const budgetFeel = customerProfile.budget_feeling;
      if (budgetFeel === 'sparsam' && service.price_monthly > 30) {
        score -= 5;
      } else if (budgetFeel === 'egal') {
        score += 5;
      }

      // 7. Complaints match (0-5 points)
      const complaints = anamnesis?.complaints || [];
      if (complaints.includes('Rücken') && goalAreas.some(g => g.includes('rücken') || g.includes('beweglichkeit'))) {
        score += 5;
        reasons.push('Hilft bei Rückenbeschwerden');
      }
      if (complaints.includes('Knie/Hüfte') && goalAreas.some(g => g.includes('reha') || g.includes('gesundheit'))) {
        score += 5;
      }

      // 8. Apply recommendation rules
      (rules || []).filter(r => r.is_active !== false).forEach(rule => {
        const boostServices = rule.boost_services || [];
        if (boostServices.some(bs => bs.toLowerCase() === service.name.toLowerCase())) {
          let ruleApplies = false;
          
          if (rule.condition_goal) {
            const ruleGoal = rule.condition_goal.toLowerCase();
            ruleApplies = selectedGoalLabels.some(g => g.includes(ruleGoal) || ruleGoal.includes(g));
          }
          if (rule.condition_experience) {
            ruleApplies = ruleApplies && customerProfile.training_experience === rule.condition_experience;
          }
          
          if (ruleApplies) {
            score += rule.boost_amount || 10;
            reasons.push(rule.name);
          }
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
 * Find best matching tariff based on scored services and goals
 */
export function findBestTariff(tariffs, selectedGoals, scoredServices) {
  const selectedGoalLabels = GOALS
    .filter(g => selectedGoals.includes(g.id))
    .map(g => g.label.toLowerCase());

  return tariffs
    .filter(t => t.is_active !== false)
    .map(t => {
      let score = 0;
      const tariffGoals = (t.goal_areas || []).map(g => g.toLowerCase());
      const matches = selectedGoalLabels.filter(g => 
        tariffGoals.some(tg => tg.includes(g) || g.includes(tg))
      );
      score = (matches.length / Math.max(selectedGoals.length, 1)) * 100;
      return { ...t, score: Math.round(score) };
    })
    .sort((a, b) => b.score - a.score);
}