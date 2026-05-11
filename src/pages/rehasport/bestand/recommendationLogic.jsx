/**
 * Berechnet die Empfehlung basierend auf Defiziten, Verbesserungsscores,
 * Wünschen, bisherigen Maßnahmen und Rezepthistorie.
 */
export function computeRecommendation({ initialDeficits, improvementScores, futureGoals, usedMeasures, prescriptionHistory }) {
  const recommended = new Set();
  const reasons = [];

  // Rehasport+ ist fast immer sinnvoll
  const alwaysRecommendPlus =
    prescriptionHistory === 'long_term' ||
    futureGoals.includes('daily_life') ||
    futureGoals.includes('guidance') ||
    futureGoals.includes('pain_free') ||
    initialDeficits.some(d => (improvementScores[d] ?? 50) < 60);

  if (alwaysRecommendPlus && !usedMeasures.includes('rehasportPlus')) {
    recommended.add('rehasportPlus');
    reasons.push({
      wish: futureGoals.includes('guidance') ? 'Anleitung & Sicherheit' : 'Weiterentwicklung',
      measure: 'Rehasport+',
      why: 'Rehasport+ gibt dir mehr Möglichkeiten neben dem Kurs und hilft dir, unabhängiger und gezielter zu trainieren.',
    });
  }

  // FIVE empfehlen
  const fiveDeficits = ['back_neck', 'mobility_daily'];
  const needsFive =
    initialDeficits.some(d => fiveDeficits.includes(d) && (improvementScores[d] ?? 50) < 70) ||
    futureGoals.includes('pain_free');

  if (needsFive && !usedMeasures.includes('five')) {
    recommended.add('five');
    const defLabel = initialDeficits.includes('back_neck') ? 'Rücken & Nacken' : 'Beweglichkeit & Alltag';
    const score = improvementScores['back_neck'] ?? improvementScores['mobility_daily'] ?? 50;
    reasons.push({
      deficit: defLabel,
      currentState: `${score}% verbessert – weiterhin relevantes Thema`,
      measure: 'FIVE',
      why: 'FIVE unterstützt Beweglichkeit, Muskelketten und das gezielte Bearbeiten muskulärer Schwachstellen.',
    });
  }

  // Milon empfehlen
  const milonDeficits = ['strength_stability', 'knee_hip'];
  const needsMilon =
    initialDeficits.some(d => milonDeficits.includes(d) && (improvementScores[d] ?? 50) < 70) ||
    futureGoals.includes('daily_life') ||
    futureGoals.includes('guidance') ||
    prescriptionHistory === 'long_term';

  if (needsMilon && !usedMeasures.includes('milon')) {
    recommended.add('milon');
    const defLabel = initialDeficits.includes('strength_stability') ? 'Kraft & Stabilität' : 'Knie & Gelenke';
    const score = improvementScores['strength_stability'] ?? improvementScores['knee_hip'] ?? 50;
    reasons.push({
      deficit: defLabel,
      currentState: `${score}% verbessert – weiterhin eingeschränkte Stabilität`,
      measure: 'Milon',
      why: 'Milon bietet geführtes Krafttraining mit klarer Geräteeinstellung und dokumentiertem Fortschritt.',
    });
  }

  // Rehasport (Basis immer anzeigen)
  const alreadyFits = recommended.size === 0;

  return {
    recommendedMeasures: Array.from(recommended),
    reasons,
    alreadyFits,
  };
}

export function getPackagePrice(measures) {
  const hasFive = measures.includes('five');
  const hasMilon = measures.includes('milon');
  if (hasFive && hasMilon) return 13.98;
  if (hasFive || hasMilon) return 11.98;
  return 6.98;
}