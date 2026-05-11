/**
 * Scoring Engine für „Ich möchte mehr tun" Flow
 * Berechnet Empfehlungen basierend auf Zielen, Fokuspunkten und Fragenmatrix
 */

// Leistungs-IDs die in der Empfehlung erscheinen können
export const SERVICE_IDS = {
  REHASPORT_PLUS: 'rehasport_plus',
  FIVE: 'five',
  MILON: 'milon',
  PELVIPOWER: 'pelvipower',
  REDWAVE: 'redwave',
  AVACURA: 'avacura',
  INBODY: 'inbody',
  ERNAEHRUNG: 'ernaehrung',
  SKILLCOURT: 'skillcourt',
  LAUFANALYSE: 'laufanalyse',
  TRAININGSBERATUNG: 'trainingsberatung',
  CARDIO: 'cardio',
};

// Fokuspunkt → Leistungs-Score-Mapping
const FOCUS_SCORING = {
  back_neck:        { five: 30, rehasport_plus: 20, redwave: 15, avacura: 10 },
  mobility_daily:   { five: 30, rehasport_plus: 15, pelvipower: 10 },
  strength_stability: { milon: 30, rehasport_plus: 20, trainingsberatung: 15 },
  joint_relief:     { milon: 25, five: 20, rehasport_plus: 15 },
  daily_safe:       { milon: 25, trainingsberatung: 15, rehasport_plus: 15 },
  pelvic_floor:     { pelvipower: 35, rehasport_plus: 10 },
  regeneration:     { redwave: 25, avacura: 25 },
  stress_reduce:    { avacura: 25, redwave: 20 },
  body_fat:         { inbody: 25, ernaehrung: 30, milon: 20, cardio: 15 },
  weight_control:   { ernaehrung: 30, inbody: 20, cardio: 15 },
  muscle_build:     { milon: 30, rehasport_plus: 20, inbody: 15 },
  body_shape:       { milon: 25, inbody: 20, ernaehrung: 20 },
  nutrition:        { ernaehrung: 35, inbody: 20 },
  progress_track:   { inbody: 30, milon: 20, trainingsberatung: 10 },
  strength_perf:    { milon: 25, rehasport_plus: 15 },
  endurance:        { cardio: 25, rehasport_plus: 15 },
  coordination:     { skillcourt: 30, rehasport_plus: 10 },
  reaction:         { skillcourt: 30 },
  running_tech:     { laufanalyse: 35 },
  sport_capacity:   { milon: 20, cardio: 20, rehasport_plus: 15 },
  free_training:    { rehasport_plus: 25, trainingsberatung: 20 },
};

// Antwort-basiertes Scoring
function applyAnswerScoring(scores, answers) {
  const s = { ...scores };

  // Trainingsfrequenz
  if (answers.frequency === '3plus') {
    s.rehasport_plus = (s.rehasport_plus || 0) + 10;
    s.milon = (s.milon || 0) + 10;
  } else if (answers.frequency === '1x') {
    // Einfache Lösungen bevorzugen
    s.redwave = (s.redwave || 0) + 5;
  }

  // Trainingsstil
  if (answers.style === 'guided') {
    s.milon = (s.milon || 0) + 20;
    s.trainingsberatung = (s.trainingsberatung || 0) + 15;
  } else if (answers.style === 'independent') {
    s.rehasport_plus = (s.rehasport_plus || 0) + 15;
  } else if (answers.style === 'trainer') {
    s.trainingsberatung = (s.trainingsberatung || 0) + 25;
  }

  // Gerätesicherheit
  if (answers.device_confidence === 'unsicher') {
    s.milon = (s.milon || 0) + 20;
    s.trainingsberatung = (s.trainingsberatung || 0) + 20;
  } else if (answers.device_confidence === 'improve_tech') {
    s.trainingsberatung = (s.trainingsberatung || 0) + 20;
    s.laufanalyse = (s.laufanalyse || 0) + 10;
  }

  // Einschränkungen
  if (answers.restrictions === 'back_neck') {
    s.five = (s.five || 0) + 20;
    s.redwave = (s.redwave || 0) + 10;
  } else if (answers.restrictions === 'knee_hip') {
    s.milon = (s.milon || 0) + 15;
    s.five = (s.five || 0) + 10;
  } else if (answers.restrictions === 'cardio') {
    // Kein aggressives Upselling bei Herz-Kreislauf
    s.milon = Math.max((s.milon || 0) - 10, 0);
  }

  // Startpriorität
  if (answers.start_priority === 'progress') {
    s.inbody = (s.inbody || 0) + 20;
    s.milon = (s.milon || 0) + 10;
  } else if (answers.start_priority === 'pain') {
    s.five = (s.five || 0) + 20;
    s.redwave = (s.redwave || 0) + 15;
  } else if (answers.start_priority === 'motivation') {
    s.trainingsberatung = (s.trainingsberatung || 0) + 10;
  } else if (answers.start_priority === 'max_effect') {
    s.milon = (s.milon || 0) + 15;
    s.five = (s.five || 0) + 10;
    s.inbody = (s.inbody || 0) + 10;
  }

  // Fortschritt messbar
  if (answers.measure_progress === 'yes') {
    s.inbody = (s.inbody || 0) + 25;
    s.milon = (s.milon || 0) + 10;
    s.trainingsberatung = (s.trainingsberatung || 0) + 10;
  }

  return s;
}

export function computeMehrRecommendation({ mainGoals, mainGoalWeights, focusPoints, answers }) {
  // Basis-Scores
  const scores = {};

  // Fokuspunkt-Scoring
  for (const fp of (focusPoints || [])) {
    const mapping = FOCUS_SCORING[fp] || {};
    for (const [service, pts] of Object.entries(mapping)) {
      // Gewichtung durch Hauptziel-Wichtigkeit
      const goalWeight = getGoalWeightForFocus(fp, mainGoals, mainGoalWeights);
      scores[service] = (scores[service] || 0) + pts * goalWeight;
    }
  }

  // Antwort-basiertes Scoring
  const finalScores = applyAnswerScoring(scores, answers || {});

  // Top-Services sortieren
  const sorted = Object.entries(finalScores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  // Kernpaket bestimmen
  const hasFive = finalScores.five > 0;
  const hasMilon = finalScores.milon > 0;

  let corePackage;
  if (hasFive && hasMilon && (finalScores.five + finalScores.milon) > 60) {
    corePackage = 'rehasport_plus_five_milon';
  } else if (hasMilon && finalScores.milon >= (finalScores.five || 0)) {
    corePackage = 'rehasport_plus_milon';
  } else if (hasFive) {
    corePackage = 'rehasport_plus_five';
  } else {
    corePackage = 'rehasport_plus';
  }

  // Upsells: Top 3 Services außerhalb des Kernpakets
  const coreServices = getCoreServices(corePackage);
  const upsells = sorted
    .filter(([id]) => !coreServices.includes(id) && id !== 'rehasport_plus')
    .slice(0, 3)
    .map(([id]) => id);

  // Reasons generieren
  const reasons = generateReasons(focusPoints || [], corePackage, upsells, mainGoals);

  return {
    corePackage,
    coreServices,
    upsells,
    scores: finalScores,
    reasons,
  };
}

function getGoalWeightForFocus(focusPoint, mainGoals, mainGoalWeights) {
  const figuraFocuses = ['body_fat', 'weight_control', 'muscle_build', 'body_shape', 'nutrition', 'progress_track'];
  const leistungFocuses = ['strength_perf', 'endurance', 'coordination', 'reaction', 'running_tech', 'sport_capacity', 'free_training'];
  const gesundheitFocuses = ['back_neck', 'mobility_daily', 'strength_stability', 'joint_relief', 'daily_safe', 'pelvic_floor', 'regeneration', 'stress_reduce'];

  let weight = 1.0;

  if (figuraFocuses.includes(focusPoint) && mainGoals.includes('figur')) {
    weight = Math.max(weight, (mainGoalWeights?.figur || 75) / 75);
  }
  if (leistungFocuses.includes(focusPoint) && mainGoals.includes('leistung')) {
    weight = Math.max(weight, (mainGoalWeights?.leistung || 75) / 75);
  }
  if (gesundheitFocuses.includes(focusPoint) && mainGoals.includes('gesundheit')) {
    weight = Math.max(weight, (mainGoalWeights?.gesundheit || 75) / 75);
  }

  return weight;
}

function getCoreServices(pkg) {
  switch (pkg) {
    case 'rehasport_plus_five_milon': return ['rehasport_plus', 'five', 'milon'];
    case 'rehasport_plus_milon': return ['rehasport_plus', 'milon'];
    case 'rehasport_plus_five': return ['rehasport_plus', 'five'];
    default: return ['rehasport_plus'];
  }
}

export function getPackagePrice(pkg, acceptedUpsells = []) {
  const hasFive = pkg.includes('five') || acceptedUpsells.includes('five');
  const hasMilon = pkg.includes('milon') || acceptedUpsells.includes('milon');
  if (hasFive && hasMilon) return 13.98;
  if (hasFive || hasMilon) return 11.98;
  return 6.98;
}

export const PACKAGE_CONFIG = {
  rehasport_plus: {
    name: 'Gesundheitsstart',
    subtitle: 'mit Rehasport+',
    description: 'Mehr Möglichkeiten neben deinem Kurs – eigenständig trainieren, gezielter üben, flexibler sein.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    weeklyPrice: 6.98,
    includes: ['Rehasport+'],
  },
  rehasport_plus_five: {
    name: 'Rehasport+ & FIVE',
    subtitle: 'Beweglichkeit & Gesundheit',
    description: 'Gezieltes Beweglichkeitstraining kombiniert mit freiem Training für mehr Flexibilität und Körpergefühl.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    weeklyPrice: 11.98,
    includes: ['Rehasport+', 'FIVE'],
  },
  rehasport_plus_milon: {
    name: 'Rehasport+ & Milon',
    subtitle: 'Kraft & Stabilität',
    description: 'Geführtes Krafttraining mit dokumentiertem Fortschritt – für mehr Stabilität und Belastbarkeit.',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
    weeklyPrice: 11.98,
    includes: ['Rehasport+', 'Milon'],
  },
  rehasport_plus_five_milon: {
    name: 'Rehasport+ FIVE & Milon',
    subtitle: 'Das Rundum-Paket',
    description: 'Maximale Wirkung: Beweglichkeit, Kraft und freies Training in einem umfassenden Gesundheitspaket.',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
    weeklyPrice: 13.98,
    includes: ['Rehasport+', 'FIVE', 'Milon'],
  },
};

export const UPSELL_CONFIG = {
  inbody: {
    name: 'InBody Analyse',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    focusPoint: 'Fortschritt messen',
    pitch: 'Damit du siehst, ob sich Körperfett, Muskulatur und Wasserhaushalt wirklich verändern.',
    price: 'Auf Anfrage',
    priceType: 'pro Termin',
  },
  ernaehrung: {
    name: 'Ernährungsberatung',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    focusPoint: 'Körperfett reduzieren',
    pitch: 'Damit dein Training durch eine klare Alltagsstrategie unterstützt wird.',
    price: 'Auf Anfrage',
    priceType: 'pro Session',
  },
  redwave: {
    name: 'RedWave',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    focusPoint: 'Regeneration verbessern',
    pitch: 'Zur Unterstützung deiner Erholung und Belastungsverträglichkeit nach dem Training.',
    price: 'Auf Anfrage',
    priceType: 'pro Termin',
  },
  avacura: {
    name: 'Avacura',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    focusPoint: 'Stress reduzieren',
    pitch: 'Regenerationsanwendung zur Entspannung, Erholung und Entlastung nach Belastung.',
    price: 'Auf Anfrage',
    priceType: 'pro Anwendung',
  },
  pelvipower: {
    name: 'PelviPower',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
    focusPoint: 'Beckenboden stärken',
    pitch: 'Gezieltes Training für Beckenboden, Körpermitte und Stabilität – diskret und effektiv.',
    price: 'Auf Anfrage',
    priceType: 'pro Termin',
  },
  skillcourt: {
    name: 'Skillcourt',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    focusPoint: 'Koordination & Reaktion',
    pitch: 'Kognitiv-motorisches Training für Reaktion, Koordination und schnelle Aktivierung.',
    price: 'Auf Anfrage',
    priceType: 'pro Einheit',
  },
  laufanalyse: {
    name: 'Lauf- & Ganganalyse',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80',
    focusPoint: 'Lauftechnik verbessern',
    pitch: 'Analyse von Gangbild, Lauftechnik und Fehlbelastungen für gezielte Verbesserung.',
    price: 'Auf Anfrage',
    priceType: 'pro Analyse',
  },
  trainingsberatung: {
    name: 'Trainingsberatung',
    image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800&q=80',
    focusPoint: 'Anleitung & Sicherheit',
    pitch: 'Persönliche Beratung für einen klar strukturierten Trainingsplan, der wirklich zu dir passt.',
    price: 'Auf Anfrage',
    priceType: 'pro Session',
  },
  cardio: {
    name: 'Cardiotraining',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc172f32?w=800&q=80',
    focusPoint: 'Ausdauer verbessern',
    pitch: 'Für mehr Ausdauer, Belastbarkeit und einen aktiven Fettstoffwechsel.',
    price: 'Im Tarif enthalten',
    priceType: 'inklusive',
  },
};

function generateReasons(focusPoints, corePackage, upsells, mainGoals) {
  const reasons = [];

  const focusToService = {
    back_neck: { service: 'FIVE', why: 'FIVE hilft dir, muskuläre Schwachstellen und Bewegungseinschränkungen im Bereich Rücken & Nacken gezielt zu bearbeiten.' },
    mobility_daily: { service: 'FIVE', why: 'FIVE verbessert Muskelketten und Beweglichkeit für einen sichereren Alltag.' },
    strength_stability: { service: 'Milon', why: 'Milon führt dich sicher durchs Krafttraining und dokumentiert deinen Fortschritt messbar.' },
    joint_relief: { service: 'Milon + FIVE', why: 'Die Kombination aus geführtem Krafttraining und Beweglichkeitsarbeit entlastet Gelenke nachhaltig.' },
    daily_safe: { service: 'Milon', why: 'Geführtes Krafttraining macht dich im Alltag stabiler, sicherer und belastbarer.' },
    pelvic_floor: { service: 'PelviPower', why: 'PelviPower trainiert gezielt Beckenboden und Körpermitte – diskret und effektiv.' },
    regeneration: { service: 'RedWave', why: 'RedWave unterstützt Regeneration und Belastungsverträglichkeit durch Photobiomodulation.' },
    stress_reduce: { service: 'Avacura', why: 'Avacura hilft dir, muskuläre Anspannung und Stress systematisch abzubauen.' },
    body_fat: { service: 'Ernährungsberatung', why: 'Eine klare Ernährungsstrategie ist der entscheidende Hebel beim Körperfett.' },
    weight_control: { service: 'Ernährungsberatung + InBody', why: 'Kombination aus Ernährungsstrategie und regelmäßiger Körperanalyse.' },
    muscle_build: { service: 'Milon', why: 'Milon bietet sicheres, dokumentiertes Krafttraining – ideal für Muskelaufbau.' },
    body_shape: { service: 'Milon + InBody', why: 'Kraft + Körperanalyse = messbare Veränderung der Körperzusammensetzung.' },
    nutrition: { service: 'Ernährungsberatung', why: 'Gezielte Ernährungsberatung gibt dir eine konkrete Alltagsstrategie.' },
    progress_track: { service: 'InBody', why: 'InBody macht Veränderungen in Körperfett, Muskulatur und Wasserhaushalt messbar sichtbar.' },
    coordination: { service: 'Skillcourt', why: 'Skillcourt verbessert Reaktion und Koordination durch kognitiv-motorisches Training.' },
    running_tech: { service: 'Lauf- & Ganganalyse', why: 'Die Ganganalyse deckt Fehlbelastungen auf und verbessert gezielt die Technik.' },
  };

  const goalLabels = { figur: 'Figur', leistung: 'Leistung', gesundheit: 'Gesundheit' };

  for (const fp of focusPoints.slice(0, 4)) {
    const mapping = focusToService[fp];
    if (!mapping) continue;
    const goalForFp = mainGoals[0] ? goalLabels[mainGoals[0]] : 'Gesundheit';
    reasons.push({
      goal: goalForFp,
      focusPoint: getFocusLabel(fp),
      service: mapping.service,
      why: mapping.why,
    });
  }

  return reasons;
}

export function getFocusLabel(id) {
  const labels = {
    back_neck: 'Rücken & Nacken entlasten',
    mobility_daily: 'Beweglichkeit verbessern',
    strength_stability: 'Kraft & Stabilität aufbauen',
    joint_relief: 'Gelenke entlasten',
    daily_safe: 'Alltag sicherer meistern',
    pelvic_floor: 'Beckenboden stärken',
    regeneration: 'Regeneration verbessern',
    stress_reduce: 'Stress reduzieren',
    body_fat: 'Körperfett reduzieren',
    weight_control: 'Gewicht kontrollieren',
    muscle_build: 'Muskulatur aufbauen',
    body_shape: 'Körperform verbessern',
    nutrition: 'Ernährung strukturieren',
    progress_track: 'Fortschritt messen',
    strength_perf: 'Kraft steigern',
    endurance: 'Ausdauer verbessern',
    coordination: 'Koordination verbessern',
    reaction: 'Reaktion verbessern',
    running_tech: 'Lauftechnik verbessern',
    sport_capacity: 'Sportliche Belastbarkeit',
    free_training: 'Freie Trainingsfähigkeit',
  };
  return labels[id] || id;
}

// Fokuspunkte nach Hauptziel
export const FOCUS_BY_GOAL = {
  figur: [
    { id: 'body_fat', label: 'Körperfett reduzieren', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', chips: ['InBody', 'Ernährungsberatung', 'Milon'] },
    { id: 'weight_control', label: 'Gewicht kontrollieren', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80', chips: ['Ernährungsberatung', 'InBody', 'Cardio'] },
    { id: 'muscle_build', label: 'Muskulatur aufbauen', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', chips: ['Milon', 'Rehasport+', 'InBody'] },
    { id: 'body_shape', label: 'Körperform verbessern', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', chips: ['Milon', 'InBody', 'Ernährung'] },
    { id: 'nutrition', label: 'Ernährung strukturieren', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', chips: ['Ernährungsberatung', 'InBody'] },
    { id: 'progress_track', label: 'Fortschritt messen', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80', chips: ['InBody', 'Milon', 'Trainingsberatung'] },
  ],
  leistung: [
    { id: 'strength_perf', label: 'Kraft steigern', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', chips: ['Milon', 'Rehasport+'] },
    { id: 'endurance', label: 'Ausdauer verbessern', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc172f32?w=800&q=80', chips: ['Cardio', 'Rehasport+'] },
    { id: 'coordination', label: 'Koordination verbessern', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', chips: ['Skillcourt', 'Rehasport+'] },
    { id: 'reaction', label: 'Reaktion verbessern', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', chips: ['Skillcourt'] },
    { id: 'running_tech', label: 'Lauftechnik verbessern', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', chips: ['Laufanalyse', 'Laufschule'] },
    { id: 'sport_capacity', label: 'Sportliche Belastbarkeit', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', chips: ['Milon', 'Cardio', 'Rehasport+'] },
    { id: 'free_training', label: 'Freie Trainingsfähigkeit', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80', chips: ['Rehasport+', 'Trainingsberatung'] },
  ],
  gesundheit: [
    { id: 'back_neck', label: 'Rücken & Nacken entlasten', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', chips: ['FIVE', 'Rückentraining', 'RedWave'] },
    { id: 'mobility_daily', label: 'Beweglichkeit verbessern', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', chips: ['FIVE', 'Yoga', 'Pilates'] },
    { id: 'strength_stability', label: 'Kraft & Stabilität aufbauen', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', chips: ['Milon', 'Rehasport+'] },
    { id: 'joint_relief', label: 'Gelenke entlasten', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', chips: ['Milon', 'FIVE', 'Rehasport+'] },
    { id: 'daily_safe', label: 'Alltag sicherer meistern', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', chips: ['Milon', 'Trainingsberatung'] },
    { id: 'pelvic_floor', label: 'Beckenboden stärken', image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800&q=80', chips: ['PelviPower', 'Rehasport+'] },
    { id: 'regeneration', label: 'Regeneration verbessern', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', chips: ['RedWave', 'Avacura', 'Sauna'] },
    { id: 'stress_reduce', label: 'Stress reduzieren', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', chips: ['Avacura', 'RedWave', 'Sauna'] },
  ],
};