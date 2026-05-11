import { jsPDF } from 'jspdf';

const LOGO_URL = 'https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png';

export function generateLaufschuleVertrag(profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });
  const W = 210;
  const ML = 15;
  const MR = 15;
  const CW = W - ML - MR;

  // Helpers
  const t = (str, x, y, opts = {}) => doc.text(String(str ?? ''), x, y, opts);
  const hline = (x1, y, x2, height = 0.5) => {
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(height);
    doc.line(x1, y, x2, y);
  };
  const bold = () => doc.setFont('helvetica', 'bold');
  const normal = () => doc.setFont('helvetica', 'normal');
  const sz = (s) => doc.setFontSize(s);
  const col = (r, g, b) => doc.setTextColor(r, g, b);
  const black = () => col(0, 0, 0);
  const gray = () => col(100, 100, 100);
  const primaryGreen = () => col(40, 150, 80);

  // ─── HEADER ────────────────────────────────────────────
  // Green header background
  doc.setFillColor(40, 150, 80);
  doc.rect(0, 0, W, 35, 'F');

  // White text on green
  col(255, 255, 255);
  sz(16);
  bold();
  t('WO AUS BEWEGUNG', ML, 12);
  t('GESUNDHEIT WIRD', ML, 18);

  // Contact info on right
  normal();
  sz(9);
  t('📞 07381 - 93 86 510', W - ML - 50, 8);
  t('✉ info@alb-gym.de', W - ML - 50, 14);
  t('🌐 www.alb-gym.de', W - ML - 50, 20);
  t('📍 Auingerweg 39, 72525 Münsingen', W - ML - 50, 26);

  // Logo placeholder
  doc.setFillColor(255, 255, 255);
  doc.rect(W - ML - 25, 3, 22, 22, 'F');
  sz(20);
  black();
  t('A', W - ML - 22, 20, { align: 'center' });

  // ─── FORM HEADER ───────────────────────────────────────
  let y = 42;
  sz(9);
  gray();
  t('(BITTE LESERLICH UND IN DRUCKBUCHSTABEN SCHREIBEN)', ML, y);
  y += 8;

  black();
  normal();
  sz(10);
  
  // Vorname & Name row
  t('Vorname:', ML, y);
  hline(ML + 25, y + 1, ML + 80);
  t('Name:', ML + 85, y);
  hline(ML + 100, y + 1, W - MR);
  
  sz(9);
  gray();
  t(profile.name?.split(' ')[0] || '', ML + 27, y - 1);
  t(profile.last_name || profile.name?.split(' ').slice(1).join(' ') || '', ML + 102, y - 1);
  
  y += 8;
  
  // Straße & Ort row
  black();
  normal();
  sz(10);
  t('Straße & Haus Nr.:', ML, y);
  hline(ML + 35, y + 1, ML + 85);
  t('PLZ, Ort:', ML + 88, y);
  hline(ML + 110, y + 1, W - MR);
  
  sz(9);
  gray();
  t(profile.address || '', ML + 36, y - 1);
  const plzOrt = profile.address ? '' : '';
  t(plzOrt, ML + 111, y - 1);
  
  y += 8;
  
  // Telefon & Email row
  black();
  normal();
  sz(10);
  t('Telefon:', ML, y);
  hline(ML + 18, y + 1, ML + 80);
  t('E-Mail:', ML + 85, y);
  hline(ML + 105, y + 1, W - MR);
  
  sz(9);
  gray();
  t(profile.phone || '', ML + 20, y - 1);
  t(profile.email || '', ML + 107, y - 1);
  
  y += 8;
  
  // Handy & Geburtsdatum row
  black();
  normal();
  sz(10);
  t('Handy:', ML, y);
  hline(ML + 15, y + 1, ML + 80);
  t('Geburtsdatum:', ML + 85, y);
  hline(ML + 115, y + 1, W - MR);
  
  sz(9);
  gray();
  t(profile.phone || '', ML + 17, y - 1);
  t(profile.birthdate || '', ML + 117, y - 1);
  
  y += 8;
  
  // Krankenkasse & Vers. Nr row
  black();
  normal();
  sz(10);
  t('Krankenkasse:', ML, y);
  hline(ML + 30, y + 1, ML + 80);
  t('Vers. Nr.:', ML + 85, y);
  hline(ML + 105, y + 1, W - MR);
  
  sz(9);
  gray();
  t(profile.health_insurance || '', ML + 32, y - 1);
  t(profile.insurance_number || '', ML + 107, y - 1);
  
  y += 12;

  // ─── COURSES SECTION ───────────────────────────────────
  black();
  bold();
  sz(11);
  t('VERFÜGBARE KURSE', ML, y);
  y += 10;

  const courses = [
    { id: 'laufschule_300', label: 'LAUFSCHULE', price: '300 €', cols: 2 },
    { id: 'laufschule_450', label: 'LAUFSCHULE', price: '450 €', cols: 2 },
    { id: 'five', label: 'FIVE - BEWEGLICHKEIT', price: '129 €', cols: 1 },
    { id: 'milon', label: 'MILON - KRÄFTIGUNG', price: '129 €', cols: 1 },
    { id: 'fitness', label: 'FITNESS FÜHRERSCHEIN', price: '139 €', cols: 1 },
    { id: 'skillcourt', label: 'SKILLCOURT - KOORDINATION', price: '129 €', cols: 1 },
  ];

  const selectedOffers = profile.selectedOffers || [];
  let x = ML;
  let courseY = y;

  courses.forEach((course, idx) => {
    const isSelected = selectedOffers.includes(course.id);
    
    // Checkbox
    const checkSize = 5;
    doc.setDrawColor(100, 100, 100);
    doc.rect(x - 2, courseY - 3, checkSize, checkSize);
    
    if (isSelected) {
      doc.setFillColor(40, 150, 80);
      doc.rect(x - 2, courseY - 3, checkSize, checkSize, 'F');
      black();
      sz(4);
      bold();
      t('✓', x + 0.5, courseY - 0.5, { align: 'center' });
      normal();
    }
    
    // Course label
    black();
    normal();
    sz(9);
    bold();
    t(course.label, x + 8, courseY);
    sz(8);
    normal();
    gray();
    t(course.price, x + 8, courseY + 5);
    
    if (course.cols === 1) {
      courseY += 12;
    } else {
      x = W / 2;
      if (idx === 1) {
        courseY += 12;
        x = ML;
      }
    }
  });

  y = courseY + 15;

  // ─── PAYMENT & SIGNATURE ───────────────────────────────
  black();
  normal();
  sz(9);
  const paymentText = 'Ich nehme am gewählten Präventionskurs teil, stimme der Abbuchung der Kursgebühr zu und bin darüber informiert,\ndass eine Erstattung durch gesetzliche Krankenkassen nur bei 100 % Teilnahme erfolgt.';
  doc.text(paymentText, ML, y);
  y += 10;

  // IBAN
  sz(10);
  black();
  t('IBAN: D E', ML, y);
  const ibanBoxes = 'D E   _   _   _   /   _   _   _   _   _   /   _   _   _   _   _   /   _   _   _   _   _   /   _   _';
  hline(ML + 18, y + 1, W - MR);
  
  sz(8);
  gray();
  if (profile.iban) {
    t(profile.iban, ML + 20, y - 1);
  }
  y += 8;

  // Bank & Kontoinhaber
  black();
  normal();
  sz(10);
  t('Bank:', ML, y);
  hline(ML + 12, y + 1, ML + 70);
  t('Kontoinhaber:', ML + 75, y);
  hline(ML + 105, y + 1, W - MR);
  
  sz(9);
  gray();
  t(profile.bank || '', ML + 14, y - 1);
  t(profile.account_holder || '', ML + 107, y - 1);
  y += 8;

  // Ort & Unterschrift
  black();
  normal();
  sz(10);
  t('Ort, Datum:', ML, y);
  hline(ML + 22, y + 1, ML + 70);
  t('Unterschrift:', ML + 75, y);
  hline(ML + 105, y + 1, W - MR);
  
  sz(9);
  gray();
  const today = new Date().toLocaleDateString('de-DE');
  t(today, ML + 24, y - 1);
  
  if (profile.signature) {
    try {
      doc.addImage(profile.signature, 'PNG', ML + 107, y - 8, 25, 10);
    } catch (e) { /* skip */ }
  }

  y += 12;

  // ─── CONSENT ───────────────────────────────────────────
  sz(8);
  black();
  normal();
  const consentText = 'Ich bestätige mit meiner Unterschrift, dass ich die Allgemeinen Geschäftsbedingungen, das SEPA-Lastschriftmandat\nsowie die Datenschutzhinweise (Rückseite) gelesen habe und ihnen zustimme.';
  doc.text(consentText, ML, y);

  // Add page 2 with AGB & Datenschutz
  doc.addPage();
  
  // Add the AGB & Datenschutz text (simplified version)
  sz(10);
  bold();
  black();
  t('Allgemeine Geschäftsbedingungen & Datenschutzhinweise', ML, 15);
  
  normal();
  sz(8);
  gray();
  const agbText = `AlbGym GmbH, Auinger Weg 39, 72525 Münsingen

ALLGEMEINE GESCHÄFTSBEDINGUNGEN
Die Anmeldung zu Kursen ist verbindlich. Der Trainingsbetrieb ist an Öffnungszeiten und Verfügbarkeit gebunden.
Abmeldungen müssen schriftlich erfolgen. Bei Stornierung innerhalb von 14 Tagen wird eine Bearbeitungsgebühr
von 25€ erhoben. Nach Kursbeginn erfolgt keine Rückerstattung.

DATENSCHUTZHINWEIS
Die erhobenen Daten werden zur Verwaltung Ihrer Anmeldung verwendet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a)
DS-GVO (Ihre Einwilligung). Ihre Daten werden nicht an Dritte weitergegeben. Sie haben das Recht auf Auskunft,
Berichtigung und Löschung Ihrer Daten. Kontakt: info@alb-gym.de`;
  
  const agbLines = doc.splitTextToSize(agbText, CW);
  doc.text(agbLines, ML, 25);

  return doc;
}