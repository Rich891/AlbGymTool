import { jsPDF } from 'jspdf';

/**
 * Generiert die Teilnahmebescheinigung 1:1 nach der offiziellen ZPP-Vorlage Version 12/2024.
 */
export function generateTeilnahmebescheinigung(profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });
  const W = 210;
  const ML = 15; // margin left
  const MR = 15; // margin right
  const CW = W - ML - MR; // content width

  const today = new Date();
  const todayStr = today.toLocaleDateString('de-DE');

  const startDate = profile._startDate ? new Date(profile._startDate) : today;
  const endDate = profile._endDate
    ? new Date(profile._endDate)
    : (() => { const d = new Date(today); d.setMonth(d.getMonth() + 2); return d; })();
  const startDateStr = startDate.toLocaleDateString('de-DE');
  const endDateStr = endDate.toLocaleDateString('de-DE');

  // ─── Helpers ───────────────────────────────────────────────
  const t = (str, x, y, opts = {}) => doc.text(String(str ?? ''), x, y, opts);
  const hline = (x1, y, x2) => {
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.line(x1, y, x2, y);
  };
  const bold = () => doc.setFont('helvetica', 'bold');
  const normal = () => doc.setFont('helvetica', 'normal');
  const sz = (s) => doc.setFontSize(s);
  const col = (r, g, b) => doc.setTextColor(r, g, b);
  const black = () => col(0, 0, 0);
  const gray = () => col(90, 90, 90);
  const darkgray = () => col(50, 50, 50);

  // ─── HEADER ────────────────────────────────────────────────
  sz(9); bold(); black();
  t('Formular für von der Zentrale Prüfstelle Prävention zertifizierte Präsenz- und IKT-Kurse', ML, 13);
  t('gemäß Kapitel 5 Leitfaden Prävention', ML, 18);
  normal();

  sz(7.5); gray();
  const intro = 'Das anbietende Unternehmen / die anbietende Organisation füllt Teil 1 „Teilnahmebescheinigung" aus.\nDie GKV-versicherte Person füllt Teil 2 „Antrag auf Bezuschussung" aus und leitet das ausgefüllte Formular (Teil 1 und Teil 2) an die Krankenkasse weiter.';
  const introLines = doc.splitTextToSize(intro, CW);
  doc.text(introLines, ML, 24);

  // Datenschutzbox
  doc.setDrawColor(150, 150, 150);
  doc.setFillColor(248, 248, 248);
  doc.rect(ML, 31, CW, 16, 'FD');
  sz(7.5); bold(); black();
  t('Datenschutzhinweis:', ML + 3, 37);
  normal(); gray();
  const dsNote = 'Die hier erhobenen Daten werden zur Bearbeitung Ihres Leistungsantrags verwendet, um zu prüfen, ob die Krankenkasse Kosten erstatten kann. Dazu ist der Nachweis der regelmäßigen Teilnahme erforderlich. Rechtsgrundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. e) DS-GVO i. V. m. § 284 Abs. 1 Nr. 4 SGB V.';
  const dsLines = doc.splitTextToSize(dsNote, CW - 6);
  doc.text(dsLines, ML + 3, 41);

  // ─── TEIL 1 ÜBERSCHRIFT ────────────────────────────────────
  let y = 52;
  sz(9); bold(); black();
  t('1.  Teilnahmebescheinigung für zertifizierte Präventionsangebote (Datenbank der Zentrale Prüfstelle Prävention)', ML, y);
  y += 4;
  sz(7.5); normal(); gray();
  t('(von dem anbietenden Unternehmen / der anbietenden Organisation in DRUCKBUCHSTABEN auszufüllen und zu unterschreiben)', ML, y);
  y += 8;

  // Teilnehmer-Name
  sz(9); bold(); black();
  t((profile.name || '').toUpperCase(), ML, y);
  hline(ML, y + 1, W - MR);
  y += 4;
  sz(7); normal(); gray();
  t('Vor- und Nachname der teilnehmenden Person', ML, y);
  y += 8;

  // von / bis Datum
  sz(8); normal(); black();
  t('von', ML, y);
  sz(9); bold();
  t(startDateStr, ML + 8, y);
  hline(ML + 7, y + 1, 85);
  sz(8); normal(); black();
  t('bis', 88, y);
  sz(9); bold();
  t(endDateStr, 97, y);
  hline(96, y + 1, W - MR);
  y += 4;
  sz(7); normal(); gray();
  t('Tag, Monat, Jahr', ML + 7, y);
  t('Tag, Monat, Jahr', 96, y);
  y += 8;

  // Kurseinheiten
  sz(8); normal(); black();
  t('an', ML, y);
  bold(); t('8', ML + 9, y);
  normal(); t('von', ML + 16, y);
  bold(); t('8', ML + 26, y);
  normal(); t('Kurseinheiten á', ML + 33, y);
  bold(); t('60', ML + 67, y);
  normal(); t('Minuten Dauer teilgenommen.', ML + 74, y);
  y += 8;

  // Präventionsprinzip
  sz(8); bold(); black();
  t('Präventionsprinzip', ML, y);
  normal();
  const ppText = 'Vorbeugung und Reduzierung spezieller gesundheitlicher Risiken durch geeignete Bewegungsprogramme';
  t(ppText, ML + 40, y);
  hline(ML + 39, y + 1, W - MR);
  y += 8;

  // Kursleitung
  bold(); t('Kursleitung', ML, y);
  normal(); t('Blume, Richard', ML + 40, y);
  hline(ML + 39, y + 1, W - MR);
  y += 4;
  sz(7); gray();
  t('Nachname, Vorname', ML + 40, y);
  y += 7;

  // Kurs-ID Block (linke Beschriftung + rechts fettgedruckt)
  sz(7); gray(); normal();
  t('Kurs-ID', ML, y);
  t('(Datenbank der Zentrale', ML, y + 4);
  t('Prüfstelle Prävention)', ML, y + 8);
  sz(11); bold(); black();
  t('Die Fitness Ampel – Kurs-ID: KU-BE-EAPC8D', ML + 40, y + 5);
  y += 14;

  // Kursleitung persönlich
  sz(8); normal(); black();
  t('Die oben genannte Kursleitung hat die Maßnahme persönlich durchgeführt.', ML, y);
  y += 7;

  // Gebühr
  t('Die teilnehmende Person hat die Gebühr von €', ML, y);
  bold();
  t('99,00', ML + 84, y);
  hline(ML + 83, y + 1, ML + 103);
  normal();
  t('entrichtet.', ML + 105, y);
  y += 8;

  // Hinweistexte (grau, klein)
  sz(7); gray();
  const hint1 = doc.splitTextToSize(
    'Bei Angeboten von Einrichtungen, die auch Mitgliedsbeiträge erheben: Ich bestätige, dass der Zuschuss der Krankenkasse nicht mit aktuellen, früheren oder zukünftigen Mitgliedsbeiträgen verrechnet wird. Die Teilnahmegebühr wird Teilnehmenden nicht als Geld- oder Sachleistung erstattet. Die Teilnahme am Kurs ist nicht an die Bedingung einer derzeitigen oder zukünftigen Mitgliedschaft geknüpft. Es handelt sich nicht um ein Abonnement.',
    CW
  );
  doc.text(hint1, ML, y);
  y += hint1.length * 3.3 + 3;

  const hint2 = doc.splitTextToSize(
    'Bei wohnortfernen Angeboten: Ich versichere, dass die Kursgebühr ausschließlich der Bezahlung des genannten Präventionsangebotes dient und es keinerlei Quersubventionierung von Übernachtungs-, Verpflegungs- oder sonstigen Kosten gibt.',
    CW
  );
  doc.text(hint2, ML, y);
  y += hint2.length * 3.3 + 3;

  sz(7.5); bold(); black();
  t('Ich versichere, dass die hier gemachten Angaben der Wahrheit entsprechen.', ML, y);
  y += 4;
  sz(7); normal(); gray();
  const hintCheck = doc.splitTextToSize(
    'Hinweis: Die Krankenkasse hat das Recht, die Einhaltung der Kriterien des GKV-Leitfadens Prävention in der geltenden Fassung auch vor Ort unangemeldet zu überprüfen.',
    CW
  );
  doc.text(hintCheck, ML, y);
  y += hintCheck.length * 3.3 + 5;

  // Ort / Datum / Unterschrift – Teil 1
  sz(9); bold(); black();
  t('Münsingen', ML, y);
  hline(ML, y + 1, 65);
  t(todayStr, 70, y);
  hline(69, y + 1, 115);

  // Unterschrift des Unternehmens (Stempel / Signatur)
  if (profile.signature) {
    try {
      doc.addImage(profile.signature, 'PNG', 118, y - 10, 40, 14);
    } catch (e) { /* skip */ }
  }

  // AlbGym Logo / Stempel rechts
  sz(7); normal(); gray();
  t('AlbGym GmbH', 165, y - 3);
  t('info@alb-gym.de', 165, y + 1);
  t('www.alb-gym.de', 165, y + 5);

  y += 4;
  sz(7); gray(); normal();
  t('Ort', ML, y);
  t('Datum', 70, y);
  t('Unterschrift bzw. digitale Signatur des anbietenden Unternehmens / der anbietenden Organisation', 118, y);
  y += 12;

  // ─── TRENNLINIE ────────────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(ML, y, W - MR, y);
  doc.setLineWidth(0.2);
  y += 7;

  // ─── TEIL 2 ÜBERSCHRIFT ────────────────────────────────────
  sz(9); bold(); black();
  t('2.  Antrag auf Bezuschussung', ML, y);
  y += 4;
  sz(7.5); normal(); gray();
  t('(von der GKV-versicherten Person bzw. von deren gesetzlichen Vertretung, bei Minderjährigen der sorgeberechtigten Person, in', ML, y);
  y += 4;
  t('DRUCKBUCHSTABEN auszufüllen und zu unterschreiben)', ML, y);
  y += 8;

  // Name / Geburtsdatum / Versicherten-Nr.
  sz(9); bold(); black();
  t((profile.name || '').toUpperCase(), ML, y);
  hline(ML, y + 1, 85);
  t(profile.birthdate || '', 88, y);
  hline(87, y + 1, 130);
  t(profile.insurance_number || '', 133, y);
  hline(132, y + 1, W - MR);
  y += 4;
  sz(7); normal(); gray();
  t('Vor- und Nachname der GKV-versicherten Person', ML, y);
  t('Geburtsdatum', 88, y);
  t('Versicherten-Nr.', 133, y);
  y += 3;
  t('(siehe Krankenversichertenkarte)', 133, y);
  y += 7;

  // Gesetzliche Vertretung (leer)
  hline(ML, y + 1, 85);
  hline(87, y + 1, 130);
  y += 4;
  sz(7); normal(); gray();
  t('Vor- und Nachname der gesetzlichen Vertretung,', ML, y);
  t('Geburtsdatum', 88, y);
  y += 3;
  t('bei Minderjährigen der sorgeberechtigten Person', ML, y);
  y += 8;

  // Antragssatz
  sz(8); bold(); black();
  t('Ich beantrage einen Zuschuss zu der oben genannten Maßnahme, durchgeführt von:', ML, y);
  y += 7;

  // Unternehmensname
  sz(9); normal(); black();
  t('AlbGym GmbH', ML, y);
  hline(ML, y + 1, W - MR);
  y += 4;
  sz(7); gray();
  t('Name des anbietenden Unternehmens / der anbietenden Organisation', ML, y);
  y += 6;

  // Unternehmensadresse
  sz(9); normal(); black();
  t('Auinger Weg 39, 72525 Münsingen', ML, y);
  hline(ML, y + 1, W - MR);
  y += 4;
  sz(7); gray();
  t('Adresse des anbietenden Unternehmens / der anbietenden Organisation', ML, y);
  y += 7;

  // Bestätigungstext
  sz(7.5); normal(); black();
  const p2confirm = doc.splitTextToSize(
    'Ich bestätige, dass ich an der oben genannten Maßnahme teilgenommen habe und dass sie von der Kursleitung persönlich durchgeführt wurde.',
    CW
  );
  doc.text(p2confirm, ML, y);
  y += p2confirm.length * 3.5 + 3;

  sz(7); gray();
  const p2hint = doc.splitTextToSize(
    'Bei Angeboten von Einrichtungen, die auch Mitgliedsbeiträge erheben: Ich bestätige, dass der Zuschuss der Krankenkasse nicht mit aktuellen, früheren oder zukünftigen Mitgliedsbeiträgen verrechnet wird. Die Teilnahmegebühr wird mir nicht als Geld- oder Sachleistung erstattet. Die Teilnahme am Kurs ist nicht an die Bedingung einer derzeitigen oder zukünftigen Mitgliedschaft geknüpft. Es handelt sich nicht um ein Abonnement.',
    CW
  );
  doc.text(p2hint, ML, y);
  y += p2hint.length * 3.3 + 4;

  sz(7.5); normal(); black();
  t('Ein zu Unrecht erhaltener Zuschuss ist zurückzuzahlen.', ML, y);
  y += 6;

  t('Ich bitte um Überweisung auf mein Konto:', ML, y);
  y += 7;

  // IBAN
  sz(9); bold(); black();
  t(profile.iban || '', ML, y);
  hline(ML, y + 1, W - MR);
  y += 4;
  sz(7); normal(); gray();
  t('IBAN', ML, y);
  y += 8;

  // Ort / Datum / Unterschrift – Teil 2
  sz(9); bold(); black();
  t('Münsingen', ML, y);
  hline(ML, y + 1, 65);
  // Datum leer lassen (vom Kunden auszufüllen)
  hline(70, y + 1, 115);
  y += 4;
  sz(7); normal(); gray();
  t('Ort', ML, y);
  t('Datum', 70, y);
  const sigLabel = doc.splitTextToSize(
    'Unterschrift bzw. digitale Signatur der GKV-versicherten Person bzw. von deren gesetzlichen Vertretung, bei Minderjährigen der sorgeberechtigten Person\n(bei digitalem Upload in der App oder im Login-Bereich der Krankenkasse entbehrlich)',
    70
  );
  doc.text(sigLabel, 118, y);
  y += sigLabel.length * 3 + 6;

  // Version rechts unten
  sz(7.5); gray(); normal();
  t('Version 12/2024', W - MR, y, { align: 'right' });

  return doc;
}