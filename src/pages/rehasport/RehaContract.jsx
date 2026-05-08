import React, { useState } from 'react';
import { Download, Check, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

const LOGO_URL = 'https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/0137b7bb4_AlbGymLogo.png';
const COMPANY_ADDRESS = {
  name: 'AlbGym GmbH',
  street: 'Wilhelmstraße 123',
  city: '73230 Kirchheim unter Teck',
  phone: '+49 (0) 7381 9386-510',
  email: 'info@alb-gym.de',
  website: 'www.alb-gym.de',
};

function generateContract(profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 15;

  // Header mit Logo
  try {
    doc.addImage(LOGO_URL, 'PNG', pageWidth - 50, 10, 35, 12);
  } catch (e) {
    console.log('Logo konnte nicht geladen werden');
  }

  // Company info
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(COMPANY_ADDRESS.name, 15, yPos);
  doc.text(COMPANY_ADDRESS.street, 15, yPos + 4);
  doc.text(COMPANY_ADDRESS.city, 15, yPos + 8);
  doc.text(`Tel: ${COMPANY_ADDRESS.phone}`, 15, yPos + 12);
  doc.text(`Mail: ${COMPANY_ADDRESS.email}`, 15, yPos + 16);

  yPos = 50;

  // Titel
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('MITGLIEDSCHAFTSVERTRAG REHASPORT+', 15, yPos);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ausgestellt: ${new Date().toLocaleDateString('de-DE')}`, 15, yPos + 8);

  yPos += 20;

  // Kundendaten
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 150, 100);
  doc.text('1. KUNDENDATEN', 15, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPos += 7;

  const customerData = [
    `Name: ${profile.name || 'N/A'}`,
    `Geburtsdatum: ${profile.birthdate || 'N/A'}`,
    `Geschlecht: ${profile.gender || 'N/A'}`,
    `Adresse: ${profile.address || 'N/A'}`,
    `E-Mail: ${profile.email || 'N/A'}`,
    `Telefon: ${profile.phone || 'N/A'}`,
  ];

  customerData.forEach(line => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 15;
    }
    doc.text(line, 15, yPos);
    yPos += 6;
  });

  yPos += 4;

  // Leistungen
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 150, 100);
  doc.text('2. LEISTUNGEN', 15, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPos += 7;

  const services = [
    { name: 'Rehasport+', included: true },
    { name: 'FIVE Training', included: profile.selectedOffers?.includes('five') },
    { name: 'Milon Training', included: profile.selectedOffers?.includes('milon') },
  ];

  services.forEach(service => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 15;
    }
    const status = service.included ? '✓' : '–';
    doc.text(`${status} ${service.name}`, 15, yPos);
    yPos += 6;
  });

  yPos += 4;

  // Finanzielles
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 150, 100);
  doc.text('3. FINANZIELLE BEDINGUNGEN', 15, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPos += 7;

  const pricing = [
    `Wochenpreis: ${profile.weekly_price?.toFixed(2) || '6,98'}€`,
    `Monatspreis (ca.): ${((profile.weekly_price || 6.98) * 4.33).toFixed(2)}€`,
  ];

  if (profile.subsidyActive) {
    pricing.push(`Zuschusspaket: ${profile.subsidy_variant === '1_course' ? '1 Kurs (99€)' : '2 Kurse (198€)'}`);
    pricing.push(`Geschätzter Zuschuss: bis ${profile.estimated_subsidy || '0'}€`);
  }

  pricing.forEach(line => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 15;
    }
    doc.text(line, 15, yPos);
    yPos += 6;
  });

  yPos += 4;

  // Krankenkasse
  if (profile.health_insurance) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 100);
    doc.text('4. KRANKENKASSENDATEN', 15, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    yPos += 7;

    const insuranceData = [
      `Krankenkasse: ${profile.health_insurance}`,
      `Versichertennummer: ${profile.insurance_number || 'N/A'}`,
      `Kontoinhaber: ${profile.account_holder || 'N/A'}`,
      `IBAN: ${profile.iban || 'N/A'}`,
    ];

    insuranceData.forEach(line => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 15;
      }
      doc.text(line, 15, yPos);
      yPos += 6;
    });

    yPos += 4;
  }

  // AGB / Bestimmungen
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = 15;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 150, 100);
  doc.text('5. VEREINBARTE BEDINGUNGEN', 15, yPos);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPos += 7;

  const terms = [
    '✓ Der Mitglied akzeptiert die Haus- und Trainingsregeln des AlbGym.',
    '✓ Die Mitgliedschaft ist monatlich kündbar mit 4 Wochen Kündigungsfrist.',
    '✓ Mindestvertragslaufzeit: 1 Monat.',
    '✓ Zahlungsweise: Lastschrift',
    '✓ Datenschutz: Alle Daten werden DSGVO-konform verarbeitet.',
    profile.subsidyActive
      ? '✓ §20-Zuschuss: Nicht garantiert, abhängig von Teilnahme und KK-Genehmigung.'
      : '',
  ].filter(t => t);

  terms.forEach(term => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 15;
    }
    const wrapped = doc.splitTextToSize(term, pageWidth - 30);
    doc.text(wrapped, 15, yPos);
    yPos += wrapped.length * 4 + 2;
  });

  // Unterschriften
  yPos += 8;
  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = 15;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('UNTERSCHRIFT', 15, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mitglied: ________________________  Datum: ${new Date().toLocaleDateString('de-DE')}`, 15, yPos);
  yPos += 8;
  doc.text(`AlbGym: ________________________  Datum: ${new Date().toLocaleDateString('de-DE')}`, 15, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`${COMPANY_ADDRESS.website} | ${COMPANY_ADDRESS.phone}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc;
}

export default function RehaContract({ profile, onDone }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const doc = generateContract(profile);
      doc.save(`AlbGym-Vertrag-${profile.name?.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Fehler beim Download:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-12 pb-10">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            GLÜCKWUNSCH!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Deine Anmeldung ist abgeschlossen.
          </p>
          <p className="text-muted-foreground">
            Lade deinen Mitgliedschaftsvertrag herunter und starte sofort.
          </p>
        </motion.div>

        {/* Contract Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border-2 border-primary/40 bg-card p-8 mb-10 shadow-xl">
          
          <div className="text-center mb-6">
            <img
              src={LOGO_URL}
              alt="AlbGym"
              className="h-12 object-contain mx-auto mb-6"
            />
            <h2 className="text-2xl font-black text-foreground uppercase">Mitgliedschaftsvertrag Rehasport+</h2>
            <p className="text-sm text-muted-foreground mt-2">{new Date().toLocaleDateString('de-DE')}</p>
          </div>

          <div className="space-y-6 text-sm">
            {/* Kundendaten */}
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Kundendaten</p>
              <div className="space-y-1 bg-secondary/50 rounded-xl p-4 text-foreground">
                <p><span className="font-bold">Name:</span> {profile.name}</p>
                <p><span className="font-bold">Geb.:</span> {profile.birthdate}</p>
                <p><span className="font-bold">Adresse:</span> {profile.address}</p>
                <p><span className="font-bold">E-Mail:</span> {profile.email}</p>
                <p><span className="font-bold">Telefon:</span> {profile.phone}</p>
              </div>
            </div>

            {/* Leistungen */}
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Leistungen</p>
              <div className="space-y-2">
                {[
                  { name: 'Rehasport+', included: true },
                  { name: 'FIVE Training', included: profile.selectedOffers?.includes('five') },
                  { name: 'Milon Training', included: profile.selectedOffers?.includes('milon') },
                ].map(s => (
                  <p key={s.name} className="text-foreground">
                    {s.included ? '✓' : '–'} {s.name}
                  </p>
                ))}
              </div>
            </div>

            {/* Preise */}
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Finanzielles</p>
              <div className="space-y-1 bg-secondary/50 rounded-xl p-4 text-foreground">
                <p><span className="font-bold">Wochenpreis:</span> {(profile.weekly_price || 6.98).toFixed(2)}€</p>
                <p><span className="font-bold">Monatspreis (ca.):</span> {((profile.weekly_price || 6.98) * 4.33).toFixed(2)}€</p>
                {profile.subsidyActive && (
                  <>
                    <p><span className="font-bold">Zuschusspaket:</span> {profile.subsidy_variant === '1_course' ? '1 Kurs (99€)' : '2 Kurse (198€)'}</p>
                    <p className="text-primary font-bold"><span className="font-bold">Geschätzter Zuschuss:</span> bis {profile.estimated_subsidy || '0'}€</p>
                  </>
                )}
              </div>
            </div>

            {/* Company Footer */}
            <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
              <p className="font-bold mb-1">{COMPANY_ADDRESS.name}</p>
              <p>{COMPANY_ADDRESS.street}</p>
              <p>{COMPANY_ADDRESS.city}</p>
              <p>{COMPANY_ADDRESS.phone} | {COMPANY_ADDRESS.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={downloading}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg mb-3">
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Wird vorbereitet...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Vertrag herunterladen (PDF)
            </>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="w-full h-16 rounded-2xl border-2 border-primary text-primary font-black text-lg uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-3">
          <Home className="w-5 h-5" />
          Zur Startseite
        </motion.button>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Behalte deinen heruntergeladenen Vertrag sicher. <br />
          Unser Team wird dich in Kürze kontaktieren, um die Einweisung zu planen.
        </p>
      </div>
    </div>
  );
}