import { jsPDF } from 'jspdf';

/**
 * Generiert die ausgefüllte Teilnahmebescheinigung (§20 SGB V) als jsPDF-Dokument.
 * Basiert auf dem offiziellen ZPP-Formular Version 12/2024.
 */
export function generateTeilnahmebescheinigung(profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });
  const W = doc.internal.pageSize.getWidth();

  const today = new Date();
  const todayStr = today.toLocaleDateString('de-DE');

  // Startdatum / Enddatum: aus Profil übernehmen wenn vorhanden, sonst Fallback
  const startDate = profile._startDate ? new Date(profile._startDate) : today;
  const endDate = profile._endDate ? new Date(profile._endDate) : (() => { const d = new Date(today); d.setMonth(d.getMonth() + 2); return d; })();
  const startDateStr = startDate.toLocaleDateString('de-DE');
  const endDateStr = endDate.toLocaleDateString('de-DE');

  // --- Helper ---
  const text = (str, x, y, opts = {}) => doc.text(String(str || ''), x, y, opts);
  const line = (x1, y1, x2, y2) => { doc.setDrawColor(180, 180, 180); doc.line(x1, y1, x2, y2); };
  const bold = () => doc.setFont('helvetica', 'bold');
  const normal = () => doc.setFont('helvetica', 'normal');
  const gray = () => doc.setTextColor(80, 80, 80);
  const black = () => doc.setTextColor(0, 0, 0);
  const darkGray = () => doc.setTextColor(50, 50, 50);

  // ── HEADER ──
  doc.setFontSize(9);
  bold(); black();
  text('Formular für von der Zentrale Prüfstelle Prävention zertifizierte Präsenz- und IKT-Kurse', 15, 12);
  text('gemäß Kapitel 5 Leitfaden Prävention', 15, 17);
  normal();

  doc.setFontSize(7.5);
  gray();
  const headerNote = 'Das anbietende Unternehmen / die anbietende Organisation füllt Teil 1 „Teilnahmebescheinigung" aus. Die GKV-versicherte Person füllt Teil 2 „Antrag auf Bezuschussung" aus und leitet das ausgefüllte Formular (Teil 1 und Teil 2) an die Krankenkasse weiter.';
  const wrapped = doc.splitTextToSize(headerNote, W - 30);
  doc.text(wrapped, 15, 22);

  // Datenschutzbox
  doc.setDrawColor(150, 150, 150);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, 30, W - 30, 14, 2, 2, 'FD');
  doc.setFontSize(7);
  gray();
  const dsText = doc.splitTextToSize('Datenschutzhinweis: Die hier erhobenen Daten werden zur Bearbeitung Ihres Leistungsantrags verwendet. Rechtsgrundlage: Art. 6 Abs. 1 lit. e) DS-GVO i. V. m. § 284 Abs. 1 Nr. 4 SGB V.', W - 36);
  doc.text(dsText, 18, 36);

  // ── TEIL 1 HEADER ──
  let y = 52;
  doc.setFontSize(9);
  bold(); black();
  text('1.  Teilnahmebescheinigung für zertifizierte Präventionsangebote', 15, y);
  y += 4;
  doc.setFontSize(8);
  normal(); gray();
  text('(von dem anbietenden Unternehmen / der anbietenden Organisation in DRUCKBUCHSTABEN auszufüllen und zu unterschreiben)', 15, y);
  y += 7;

  // Name
  black(); normal(); doc.setFontSize(8.5);
  text(profile.name?.toUpperCase() || '', 15, y);
  line(15, y + 1, W - 15, y + 1);
  y += 4;
  doc.setFontSize(7); gray();
  text('Vor- und Nachname der teilnehmenden Person', 15, y);
  y += 7;

  // von / bis
  black(); normal(); doc.setFontSize(8.5);
  text(startDateStr, 28, y);
  line(28, y + 1, 85, y + 1);
  text(endDateStr, 100, y);
  line(100, y + 1, W - 15, y + 1);
  y += 4;
  doc.setFontSize(7); gray();
  text('von', 15, y); text('Tag, Monat, Jahr', 28, y);
  text('bis', 90, y); text('Tag, Monat, Jahr', 100, y);
  y += 7;

  // Kurseinheiten
  black(); normal(); doc.setFontSize(8.5);
  text('an', 15, y);
  bold(); text('8', 22, y);
  normal(); text('von', 30, y);
  bold(); text('8', 38, y);
  normal(); text('Kurseinheiten á', 45, y);
  bold(); text('60', 80, y);
  normal(); text('Minuten Dauer teilgenommen.', 87, y);
  y += 7;

  // Präventionsprinzip
  bold(); text('Präventionsprinzip', 15, y);
  normal(); text('Vorbeugung und Reduzierung spezieller gesundheitlicher Risiken durch geeignete Bewegungsprogramme', 52, y);
  line(52, y + 1, W - 15, y + 1);
  y += 7;

  // Kursleitung
  bold(); text('Kursleitung', 15, y);
  normal(); text('Blume, Richard', 52, y);
  line(52, y + 1, W - 15, y + 1);
  y += 4;
  doc.setFontSize(7); gray();
  text('Nachname, Vorname', 52, y);
  y += 6;

  // Kurs-ID Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, y - 2, 60, 10, 1, 1, 'S');
  doc.setFontSize(7); gray(); bold();
  text('Kurs-ID', 17, y + 2);
  text('(Datenbank der Zentrale', 17, y + 5);
  text('Prüfstelle Prävention)', 17, y + 8);
  doc.setFontSize(9); black(); bold();
  text('Die Fitness Ampel – Kurs-ID: KU-BE-EAPC8D', 80, y + 5);
  y += 13;

  // Bestätigung Kursleitung
  normal(); black(); doc.setFontSize(8);
  text('Die oben genannte Kursleitung hat die Maßnahme persönlich durchgeführt.', 15, y);
  y += 7;

  // Gebühr
  text('Die teilnehmende Person hat die Gebühr von € ', 15, y);
  bold();
  text('99,00', 97, y);
  line(97, y + 1, 125, y + 1);
  normal();
  text('entrichtet.', 127, y);
  y += 8;

  // Hinweistexte
  doc.setFontSize(7); gray();
  const hint1 = 'Bei Angeboten von Einrichtungen, die auch Mitgliedsbeiträge erheben: Ich bestätige, dass der Zuschuss der Krankenkasse nicht mit aktuellen, früheren oder zukünftigen Mitgliedsbeiträgen verrechnet wird.';
  const hint1w = doc.splitTextToSize(hint1, W - 30);
  doc.text(hint1w, 15, y);
  y += hint1w.length * 3.5 + 2;

  const hint2 = 'Ich versichere, dass die hier gemachten Angaben der Wahrheit entsprechen.';
  bold(); black(); doc.setFontSize(7.5);
  text(hint2, 15, y);
  y += 5;

  // Ort / Datum / Unterschrift
  normal(); black(); doc.setFontSize(8.5);
  text('Münsingen', 15, y);
  line(15, y + 1, 60, y + 1);
  text(todayStr, 70, y);
  line(70, y + 1, 110, y + 1);
  // Signature placeholder
  doc.setFontSize(7); gray();
  text('AlbGym GmbH (Stempel & Unterschrift)', 120, y);
  y += 4;
  doc.setFontSize(7); gray();
  text('Ort', 15, y); text('Datum', 70, y);
  y += 10;

  // ── TRENNLINIE ──
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(15, y, W - 15, y);
  doc.setLineWidth(0.2);
  y += 7;

  // ── TEIL 2 HEADER ──
  doc.setFontSize(9); bold(); black();
  text('2.  Antrag auf Bezuschussung', 15, y);
  y += 4;
  doc.setFontSize(8); normal(); gray();
  text('(von der GKV-versicherten Person in DRUCKBUCHSTABEN auszufüllen und zu unterschreiben)', 15, y);
  y += 8;

  // Name / Geburtsdatum / Versicherten-Nr.
  black(); bold(); doc.setFontSize(8.5);
  text((profile.name || '').toUpperCase(), 15, y);
  line(15, y + 1, 80, y + 1);
  text(profile.birthdate || '', 85, y);
  line(85, y + 1, 120, y + 1);
  text(profile.insurance_number || '', 125, y);
  line(125, y + 1, W - 15, y + 1);
  y += 4;
  normal(); doc.setFontSize(7); gray();
  text('Vor- und Nachname der GKV-versicherten Person', 15, y);
  text('Geburtsdatum', 85, y);
  text('Versicherten-Nr. (Krankenversichertenkarte)', 125, y);
  y += 8;

  // Antragssatz
  black(); normal(); doc.setFontSize(8);
  text('Ich beantrage einen Zuschuss zu der oben genannten Maßnahme, durchgeführt von:', 15, y);
  y += 6;

  // Unternehmen
  bold(); doc.setFontSize(8.5);
  text('AlbGym GmbH', 15, y);
  line(15, y + 1, W - 15, y + 1);
  y += 4;
  normal(); doc.setFontSize(7); gray();
  text('Name des anbietenden Unternehmens / der anbietenden Organisation', 15, y);
  y += 5;

  black(); bold(); doc.setFontSize(8.5);
  text('Auinger Weg 39, 72525 Münsingen', 15, y);
  line(15, y + 1, W - 15, y + 1);
  y += 4;
  normal(); doc.setFontSize(7); gray();
  text('Adresse des anbietenden Unternehmens / der anbietenden Organisation', 15, y);
  y += 6;

  // Bestätigungen
  black(); normal(); doc.setFontSize(7.5);
  const p2text = doc.splitTextToSize('Ich bestätige, dass ich an der oben genannten Maßnahme teilgenommen habe und dass sie von der Kursleitung persönlich durchgeführt wurde.', W - 30);
  doc.text(p2text, 15, y);
  y += p2text.length * 3.5 + 3;

  doc.setFontSize(7); gray();
  const p2hint = doc.splitTextToSize('Bei Angeboten von Einrichtungen, die auch Mitgliedsbeiträge erheben: Ich bestätige, dass der Zuschuss der Krankenkasse nicht mit aktuellen, früheren oder zukünftigen Mitgliedsbeiträgen verrechnet wird.', W - 30);
  doc.text(p2hint, 15, y);
  y += p2hint.length * 3.5 + 4;

  black(); normal(); doc.setFontSize(8);
  text('Ich bitte um Überweisung auf mein Konto:', 15, y);
  y += 6;

  // IBAN
  bold(); doc.setFontSize(8.5);
  text(profile.iban || '', 15, y);
  line(15, y + 1, W - 15, y + 1);
  y += 4;
  normal(); doc.setFontSize(7); gray();
  text('IBAN', 15, y);
  y += 8;

  // Ort / Datum / Unterschrift
  black(); normal(); doc.setFontSize(8.5);
  text('Münsingen', 15, y);
  line(15, y + 1, 60, y + 1);
  line(70, y + 1, 110, y + 1);
  y += 4;
  doc.setFontSize(7); gray();
  text('Ort', 15, y); text('Datum', 70, y);
  text('Unterschrift der GKV-versicherten Person', 120, y);

  // Version
  y += 10;
  doc.setFontSize(7); gray();
  text('Version 12/2024', W - 15, y, { align: 'right' });

  return doc;
}