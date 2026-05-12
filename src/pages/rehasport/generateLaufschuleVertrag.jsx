import { jsPDF } from 'jspdf';

const PACKAGE_PRICES = {
  'rehasport': 6.98,
  'rehasport-five': 11.98,
  'rehasport-milon': 11.98,
  'rehasport-five-milon': 13.98,
};

function getPackageKey(addons) {
  const has5 = addons?.includes('five');
  const hasMilon = addons?.includes('milon');
  if (has5 && hasMilon) return 'rehasport-five-milon';
  if (has5) return 'rehasport-five';
  if (hasMilon) return 'rehasport-milon';
  return 'rehasport';
}

function getPackageName(addons) {
  const has5 = addons?.includes('five');
  const hasMilon = addons?.includes('milon');
  if (has5 && hasMilon) return 'Rehasport+ inkl. FIVE & Milon';
  if (has5) return 'Rehasport+ inkl. FIVE';
  if (hasMilon) return 'Rehasport+ inkl. Milon';
  return 'Rehasport+';
}

function formatEur(amount) {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

function formatDate(date) {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function generateLaufschuleVertrag(profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });
  const W = 210;
  const H = 297;
  const ML = 18;
  const MR = 18;
  const CW = W - ML - MR;

  const addons = profile.selectedOffers || [];
  const packageKey = getPackageKey(addons);
  const packageName = getPackageName(addons);
  const weeklyPrice = PACKAGE_PRICES[packageKey];
  const monthlyPrice = weeklyPrice * 4.33;
  const hasSubsidy = profile.subsidyActive;
  const hasFive = addons.includes('five');
  const hasMilon = addons.includes('milon');
  const today = new Date();
  const payment2Date = new Date(today); payment2Date.setMonth(payment2Date.getMonth() + 6);
  const subsidy1Date = new Date(today); subsidy1Date.setMonth(subsidy1Date.getMonth() + 2);
  const subsidy2Date = new Date(payment2Date); subsidy2Date.setMonth(subsidy2Date.getMonth() + 2);

  // ─── COLOR PALETTE ──────────────────────────────────────
  const GREEN = [28, 140, 70];
  const DARK = [20, 20, 20];
  const GRAY = [100, 100, 100];
  const LIGHTGRAY = [200, 200, 200];
  const BGLIGHT = [245, 250, 247];

  // ─── HELPERS ────────────────────────────────────────────
  let y = 0;
  const rgb = (arr) => arr;

  const setFont = (style = 'normal', size = 10, color = DARK) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const row = (label, value, yPos, labelW = 40) => {
    setFont('bold', 9, GRAY);
    doc.text(label, ML, yPos);
    setFont('normal', 10, DARK);
    doc.text(String(value || '—'), ML + labelW, yPos);
  };

  const hline = (yPos, x1 = ML, x2 = W - MR, color = LIGHTGRAY, w = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(w);
    doc.line(x1, yPos, x2, yPos);
  };

  const sectionTitle = (title, yPos) => {
    doc.setFillColor(...GREEN);
    doc.rect(ML, yPos, CW, 7, 'F');
    setFont('bold', 9.5, [255, 255, 255]);
    doc.text(title.toUpperCase(), ML + 4, yPos + 5);
    return yPos + 12;
  };

  const checkMark = (x, y, checked) => {
    doc.setDrawColor(...GRAY);
    doc.setLineWidth(0.4);
    doc.rect(x, y - 3.5, 4, 4);
    if (checked) {
      doc.setFillColor(...GREEN);
      doc.rect(x, y - 3.5, 4, 4, 'F');
      setFont('bold', 7, [255, 255, 255]);
      doc.text('✓', x + 0.8, y - 0.2);
    }
  };

  // ════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════

  // ─── GREEN HEADER ───────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 42, 'F');

  // Logo area (white box)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(ML, 6, 32, 30, 3, 3, 'F');
  setFont('bold', 14, GREEN);
  doc.text('A', ML + 13, 24, { align: 'center' });
  setFont('bold', 6, GREEN);
  doc.text('ALB GYM', ML + 16, 29, { align: 'center' });

  // Header text
  setFont('bold', 18, [255, 255, 255]);
  doc.text('MITGLIEDSCHAFTSVERTRAG', ML + 38, 16);
  setFont('bold', 11, [200, 240, 210]);
  doc.text('REHASPORT+', ML + 38, 24);
  setFont('normal', 8, [200, 240, 210]);
  doc.text('AlbGym GmbH  ·  Auingerweg 39  ·  72525 Münsingen', ML + 38, 30);
  doc.text('Tel: 07381 - 93 86 510  ·  info@alb-gym.de  ·  www.alb-gym.de', ML + 38, 35);

  // Document date right-aligned
  setFont('normal', 8, [200, 240, 210]);
  doc.text(`Datum: ${formatDate(today)}`, W - MR, 38, { align: 'right' });

  y = 52;

  // ─── SECTION 1: MITGLIEDSDATEN ─────────────────────────
  y = sectionTitle('1.  Persönliche Daten des Mitglieds', y);

  // Two-column personal data
  const col1x = ML;
  const col2x = ML + CW / 2 + 4;
  const colW = CW / 2 - 6;

  const personalRows = [
    ['Name, Vorname', profile.name || ''],
    ['Geburtsdatum', profile.birthdate || ''],
    ['Geschlecht', profile.gender || ''],
    ['Adresse', profile.address || ''],
    ['E-Mail', profile.email || ''],
    ['Telefon / Handy', profile.phone || ''],
  ];

  personalRows.forEach((r, i) => {
    const isEven = i % 2 === 0;
    const xPos = isEven ? col1x : col2x;
    const rowY = y + Math.floor(i / 2) * 10;
    setFont('bold', 7.5, GRAY);
    doc.text(r[0], xPos, rowY);
    setFont('normal', 9.5, DARK);
    doc.text(String(r[1] || '—'), xPos, rowY + 4.5);
    hline(rowY + 6.5, xPos, xPos + colW, LIGHTGRAY, 0.2);
  });

  y += Math.ceil(personalRows.length / 2) * 10 + 6;

  // ─── SECTION 2: KRANKENKASSE ───────────────────────────
  y = sectionTitle('2.  Krankenkasse & Versicherung', y);

  const insuranceRows = [
    ['Krankenkasse', profile.health_insurance || ''],
    ['Versichertennummer', profile.insurance_number || ''],
  ];

  insuranceRows.forEach((r, i) => {
    const xPos = i % 2 === 0 ? col1x : col2x;
    const rowY = y + Math.floor(i / 2) * 10;
    setFont('bold', 7.5, GRAY);
    doc.text(r[0], xPos, rowY);
    setFont('normal', 9.5, DARK);
    doc.text(String(r[1] || '—'), xPos, rowY + 4.5);
    hline(rowY + 6.5, xPos, xPos + colW, LIGHTGRAY, 0.2);
  });

  y += 14;

  // ─── SECTION 3: PAKET ──────────────────────────────────
  y = sectionTitle('3.  Vereinbartes Paket', y);

  // Package box
  doc.setFillColor(...BGLIGHT);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.roundedRect(ML, y, CW, 32, 3, 3, 'FD');

  setFont('bold', 13, GREEN);
  doc.text(packageName, ML + 5, y + 9);

  setFont('normal', 8.5, GRAY);
  doc.text('Beinhaltet: Rehasport-Training + freies Studiozugang', ML + 5, y + 16);
  if (hasFive) doc.text('+ FIVE Beweglichkeitstraining (gerätegestützt)', ML + 5, y + 21.5);
  if (hasMilon) doc.text('+ Milon Kraftzirkel (geführtes Training)', ML + 5, hasFive ? y + 27 : y + 21.5);

  // Price badge right side
  setFont('bold', 18, GREEN);
  doc.text(formatEur(weeklyPrice), W - MR - 4, y + 10, { align: 'right' });
  setFont('normal', 8, GRAY);
  doc.text('pro Woche', W - MR - 4, y + 16, { align: 'right' });
  setFont('normal', 8, GRAY);
  doc.text(`≈ ${formatEur(monthlyPrice)} / Monat`, W - MR - 4, y + 22, { align: 'right' });

  y += 38;

  // ─── SECTION 4: ZUSCHUSS §20 ───────────────────────────
  y = sectionTitle('4.  §20 SGB V Präventionszuschuss', y);

  if (hasSubsidy) {
    // Subsidy enabled – show full breakdown
    doc.setFillColor(...BGLIGHT);
    doc.roundedRect(ML, y, CW, 50, 3, 3, 'F');

    setFont('bold', 9, GREEN);
    doc.text('Zuschuss aktiviert – §20 SGB V Kursgebühr-Modell', ML + 5, y + 7);

    const subRows = [
      { label: '1. §20-Pauschale', sub: `fällig ab ${formatDate(today)}`, value: '99,00 €', subval: `Zuschuss beantragen ab: ${formatDate(subsidy1Date)}` },
      { label: '2. §20-Pauschale', sub: `fällig ab ${formatDate(payment2Date)}`, value: '100,00 €', subval: `Zuschuss beantragen ab: ${formatDate(subsidy2Date)}` },
    ];

    subRows.forEach((r, i) => {
      const rowY = y + 13 + i * 17;
      doc.setFillColor(230, 250, 237);
      doc.roundedRect(ML + 4, rowY, CW - 8, 13, 2, 2, 'F');
      setFont('bold', 9, DARK);
      doc.text(r.label, ML + 8, rowY + 5.5);
      setFont('normal', 7.5, GRAY);
      doc.text(r.sub, ML + 8, rowY + 10);
      setFont('bold', 10, GREEN);
      doc.text(r.value, W - MR - 6, rowY + 5.5, { align: 'right' });
      setFont('normal', 7, GRAY);
      doc.text(r.subval, W - MR - 6, rowY + 10, { align: 'right' });
    });

    // Summary row
    const sumY = y + 13 + 2 * 17 + 2;
    hline(sumY, ML + 4, W - MR - 4, GREEN, 0.4);
    setFont('bold', 8.5, GRAY);
    doc.text('Gesamt §20-Pauschalen', ML + 8, sumY + 5);
    doc.text('199,00 €', W - MR - 6, sumY + 5, { align: 'right' });
    setFont('bold', 8.5, [0, 140, 70]);
    doc.text('Voraussichtlicher Zuschuss (KK)', ML + 8, sumY + 10);
    doc.text('− 159,00 €', W - MR - 6, sumY + 10, { align: 'right' });

    y += 56;
  } else {
    // No subsidy
    setFont('normal', 9, GRAY);
    doc.text('Kein §20-Präventionszuschuss gewählt.', ML + 4, y + 6);
    y += 12;
  }

  // ─── SECTION 5: BANKDATEN ──────────────────────────────
  y = sectionTitle('5.  Bankverbindung (SEPA-Lastschrift)', y);

  const bankRows = [
    ['Kontoinhaber', profile.account_holder || ''],
    ['IBAN', profile.iban || ''],
    ['BIC', profile.bic || ''],
    ['Bank', profile.bank || ''],
  ];

  bankRows.forEach((r, i) => {
    const xPos = i % 2 === 0 ? col1x : col2x;
    const rowY = y + Math.floor(i / 2) * 10;
    setFont('bold', 7.5, GRAY);
    doc.text(r[0], xPos, rowY);
    setFont('normal', 9.5, DARK);
    doc.text(String(r[1] || '—'), xPos, rowY + 4.5);
    hline(rowY + 6.5, xPos, xPos + colW, LIGHTGRAY, 0.2);
  });

  y += 24;

  // ─── SECTION 6: ZIELE & WÜNSCHE ────────────────────────
  y = sectionTitle('6.  Persönliche Ziele & Beschwerden', y);

  const goalsText = (profile.reasons || []).join(' · ') || '—';
  const complaintsText = (profile.complaints || []).join(' · ') || '—';
  const wishesText = (profile.wishes || []).join(' · ') || '—';

  const goalRows = [
    ['Rehaziele', goalsText],
    ['Beschwerden', complaintsText],
    ['Wünsche', wishesText],
  ];

  goalRows.forEach((r, i) => {
    const rowY = y + i * 9;
    setFont('bold', 7.5, GRAY);
    doc.text(r[0], ML, rowY);
    setFont('normal', 8.5, DARK);
    const wrapped = doc.splitTextToSize(r[1], CW - 40);
    doc.text(wrapped, ML + 36, rowY);
    hline(rowY + 5, ML, W - MR, LIGHTGRAY, 0.2);
    y += (wrapped.length - 1) * 4;
  });

  y += goalRows.length * 9 + 4;

  // ─── SECTION 7: EINWILLIGUNGEN ─────────────────────────
  y = sectionTitle('7.  Einwilligungen & Bestätigungen', y);

  const consents = [
    { label: 'Trainings- und Hausregeln des AlbGym', checked: profile.rules_accepted },
    { label: 'Einwilligung in die Verarbeitung von Beratungsdaten', checked: profile.consent_counseling },
    { label: 'Einwilligung in die Verarbeitung von Gesundheitsdaten', checked: profile.consent_health },
    { label: 'Einwilligung in die Verarbeitung von Bankdaten (SEPA)', checked: profile.consent_bank },
  ];

  consents.forEach((c, i) => {
    const rowY = y + i * 8;
    checkMark(ML, rowY, c.checked);
    setFont('normal', 8.5, DARK);
    doc.text(c.label, ML + 7, rowY);
  });

  y += consents.length * 8 + 8;

  // ─── SIGNATURE SECTION ──────────────────────────────────
  if (y > H - 55) {
    doc.addPage();
    y = 20;
  }

  hline(y, ML, W - MR, GREEN, 0.6);
  y += 8;

  setFont('bold', 9, GRAY);
  doc.text('Ort, Datum', ML, y);
  doc.text('Unterschrift Mitglied', W / 2 + 10, y);
  hline(y + 1, ML, ML + 60, DARK, 0.4);
  hline(y + 1, W / 2 + 10, W - MR, DARK, 0.4);

  setFont('normal', 9, DARK);
  doc.text(formatDate(today), ML, y + 7);

  if (profile.signature) {
    try {
      doc.addImage(profile.signature, 'PNG', W / 2 + 10, y - 8, 40, 14);
    } catch (e) { /* skip */ }
  }

  y += 16;

  setFont('bold', 9, GRAY);
  doc.text('Für AlbGym GmbH', ML, y);
  hline(y + 1, ML, ML + 60, DARK, 0.4);
  y += 6;

  // ─── FOOTER ────────────────────────────────────────────
  setFont('normal', 7, GRAY);
  doc.text('AlbGym GmbH · Auingerweg 39 · 72525 Münsingen · Tel: 07381 - 93 86 510 · info@alb-gym.de', W / 2, H - 10, { align: 'center' });
  hline(H - 13, ML, W - MR, LIGHTGRAY, 0.3);

  // ════════════════════════════════════════════════════════
  // PAGE 2 – AGB
  // ════════════════════════════════════════════════════════
  doc.addPage();

  // Green mini header
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 16, 'F');
  setFont('bold', 10, [255, 255, 255]);
  doc.text('ALLGEMEINE GESCHÄFTSBEDINGUNGEN & DATENSCHUTZHINWEISE – AlbGym GmbH, Stand 01.03.2026', W / 2, 10, { align: 'center' });

  let p2y = 24;

  const agbParagraphs = [
    ['§1 Geltungsbereich', 'Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Mitgliedschaftsverträge der AlbGym GmbH. Mit Abschluss des Vertrages erkennt das Mitglied diese AGB als verbindlich an.'],
    ['§2 Vertragsabschluss', 'Der Vertrag kommt durch Bestätigung der AlbGym GmbH in Textform oder durch Aufnahme der Trainingsaktivität zustande. Im Regelfall per E-Mail.'],
    ['§3 Zutrittssystem', 'Jedes Mitglied erhält ein persönliches Zutrittsmittel (Chip, Transponder oder App). Missbrauch kann mit einer Vertragsstrafe von bis zu 250 € belegt werden.'],
    ['§4 Leistungsumfang', 'Das Studio ist grundsätzlich rund um die Uhr geöffnet. Trainingszeiten werden bekanntgegeben. AlbGym behält sich das Recht vor, Geräte vorübergehend zu schließen oder Kurszeiten anzupassen.'],
    ['§5 Mitgliedsbeiträge', 'Der Mitgliedsbeitrag wird wöchentlich per Lastschrift eingezogen. Jede Woche erhöht sich der Beitrag automatisch um 0,13 €. Zusätzlich wird eine Service- und Hygienegebühr von 15 € pro Quartal erhoben.'],
    ['§6 Zahlungsverzug', 'Bei Rückstand von mehr als einem Monatsbeitrag ist AlbGym berechtigt, den Zugang zu sperren und den Vertrag zu kündigen.'],
    ['§7 Vertragslaufzeit', 'Die Vertragslaufzeit richtet sich nach dem vereinbarten Tarif. Nach Ablauf der Mindestlaufzeit verlängert sich der Vertrag automatisch auf unbestimmte Zeit und kann monatlich gekündigt werden. Kündigung bedarf der Textform.'],
    ['§8 Ruhepause', 'Das Mitglied kann seinen Vertrag aus wichtigem Grund für maximal 3 Monate ruhen lassen. Für die Bearbeitung einer Stilllegung wird eine Gebühr von 20 € erhoben.'],
    ['§9 Sonderkündigungsrecht', 'Bei dauerhafter Krankheit, Schwangerschaft oder Umzug in eine neue Wohnung > 5 km vom Studio entfernt besteht ein Sonderkündigungsrecht. Entsprechende Nachweise sind beizulegen.'],
    ['§10 Nutzung', 'Geräte und Einrichtungen werden auf eigene Verantwortung genutzt. Bei gesundheitlichen Beschwerden wird empfohlen, ärztlichen Rat einzuholen.'],
    ['§11 Haftung', 'AlbGym haftet nur für vorsätzlich oder grob fahrlässig verursachte Schäden. Haftung für Schäden durch unsachgemäße Nutzung der Geräte ist ausgeschlossen, soweit gesetzlich zulässig.'],
    ['§15 Hausrecht', 'AlbGym kann bei schwerwiegendem oder wiederholtem Verstoß gegen die Hausordnung das Hausverbot erteilen oder den Vertrag kündigen.'],
    ['§17 Streitbeilegung', 'AlbGym ist nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Es gilt das Recht der Bundesrepublik Deutschland.'],
  ];

  agbParagraphs.forEach(([title, text]) => {
    if (p2y > H - 25) {
      doc.addPage();
      p2y = 20;
    }
    setFont('bold', 8, DARK);
    doc.text(title, ML, p2y);
    p2y += 4;
    setFont('normal', 7.5, GRAY);
    const wrapped = doc.splitTextToSize(text, CW);
    doc.text(wrapped, ML, p2y);
    p2y += wrapped.length * 3.8 + 4;
  });

  // Datenschutz heading
  if (p2y > H - 60) { doc.addPage(); p2y = 20; }
  doc.setFillColor(...GREEN);
  doc.rect(ML, p2y, CW, 7, 'F');
  setFont('bold', 9.5, [255, 255, 255]);
  doc.text('DATENSCHUTZHINWEISE', ML + 4, p2y + 5);
  p2y += 12;

  const datenschutz = 'Die AlbGym GmbH, Auingerweg 39, 72525 Münsingen, verarbeitet personenbezogene Daten im Rahmen des Mitgliedschaftsvertrages insbesondere gemäß DSGVO und BDSG. Die Verarbeitung erfolgt zur Vertragsdurchführung (Art. 6 Abs. 1 lit. b DSGVO), zur Zahlungsabwicklung sowie zur Kommunikation mit dem Mitglied. Zur Identifikation des Mitglieds beim Zugang kann ein Mitgliederfoto gespeichert werden. Die Bankdaten werden ausschließlich zur SEPA-Lastschrift verarbeitet. Das Mitglied hat das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung. Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde. Die Bereitstellung der Daten ist für den Abschluss und die Durchführung des Vertrages erforderlich.';
  setFont('normal', 7.5, GRAY);
  const dsWrapped = doc.splitTextToSize(datenschutz, CW);
  doc.text(dsWrapped, ML, p2y);
  p2y += dsWrapped.length * 3.8 + 10;

  // Signature line on page 2
  hline(p2y, ML, W - MR, GREEN, 0.5);
  p2y += 6;
  setFont('bold', 8, GRAY);
  doc.text('Ich habe die AGB und Datenschutzhinweise gelesen und stimme ihnen zu.', ML, p2y);
  p2y += 8;
  setFont('normal', 8, GRAY);
  doc.text('Ort, Datum: ____________________________', ML, p2y);
  doc.text('Unterschrift: ____________________________', ML + 90, p2y);

  // Footer every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setFont('normal', 7, GRAY);
    doc.text(`Seite ${i} von ${totalPages}`, W - MR, H - 7, { align: 'right' });
    doc.text('AlbGym GmbH · Auingerweg 39 · 72525 Münsingen · Tel: 07381 - 93 86 510 · info@alb-gym.de', W / 2, H - 10, { align: 'center' });
  }

  return doc;
}