import React, { useState } from 'react';
import { Check, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

function fmt(n) {
  return typeof n === 'number' ? n.toFixed(2).replace('.', ',') + ' €' : '–';
}

function generatePDF(profile) {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('de-DE');

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AlbGym – Rehasport Vertrag', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Datum: ${today}`, 20, 34);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 38, 190, 38);

  // Kundendaten
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Kundendaten', 20, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 56;
  const add = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || '–'), 70, y);
    y += 8;
  };

  add('Name', profile.name);
  add('Geburtsdatum', profile.birthdate);
  add('Geschlecht', profile.gender);

  y += 4;
  doc.line(20, y, 190, y);
  y += 8;

  // Leistungen
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Gebuchte Leistungen', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const offers = profile.selectedOffers || [];
  const labelMap = { rehasport_plus: 'Rehasport+', five: 'FIVE Training', milon: 'Milon Training' };
  if (offers.length === 0) {
    doc.text('Rehasport Kurs (ärztlich verordnet)', 20, y);
    y += 8;
  } else {
    offers.forEach(o => {
      doc.text('• ' + (labelMap[o] || o), 20, y);
      y += 7;
    });
  }

  y += 4;
  doc.line(20, y, 190, y);
  y += 8;

  // Preise
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Preisübersicht', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Wöchentlicher Beitrag:', 20, y);
  doc.text(profile.subsidyMode ? '6,98 €' : '13,99 €', 120, y);
  y += 8;

  if (profile.subsidyMode) {
    doc.text('Krankenkassen-Paket (einmalig):', 20, y);
    doc.text('199,00 €', 120, y);
    y += 8;
    if (profile.kasseName) {
      doc.text('Krankenkasse:', 20, y);
      doc.text(profile.kasseName, 120, y);
      y += 8;
    }
    if (profile.kasseZuschuss) {
      doc.text('KK-Zuschuss:', 20, y);
      doc.text(profile.kasseZuschuss, 120, y);
      y += 8;
    }
  }

  y += 4;
  doc.line(20, y, 190, y);
  y += 10;

  // Unterschrift
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Unterschrift', 20, y);
  y += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ich bestätige die oben genannten Leistungen und stimme den AGB zu.', 20, y);
  y += 16;

  doc.line(20, y, 100, y);
  doc.text('Datum, Unterschrift Kunde', 20, y + 5);

  doc.line(120, y, 190, y);
  doc.text('AlbGym', 120, y + 5);

  doc.save(`AlbGym_Rehasport_${(profile.name || 'Vertrag').replace(/\s/g, '_')}_${today.replace(/\./g, '-')}.pdf`);
}

export default function RehaContract({ profile, onDone }) {
  const [downloaded, setDownloaded] = useState(false);
  const firstName = (profile.name || 'du').split(' ')[0];

  const handleDownload = () => {
    generatePDF(profile);
    setDownloaded(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-10">
      <div className="w-full max-w-lg">

        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-5">
            <FileText className="w-9 h-9 text-primary" />
          </div>
          <p className="text-xs text-primary uppercase tracking-widest font-bold mb-2">Fast geschafft</p>
          <h1 className="text-4xl font-black text-foreground uppercase leading-tight">Vertrag<br />herunterladen</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            {firstName}, alles ist bereit. Lade jetzt den Vertrag herunter und unterschreibe ihn vor Ort.
          </p>
        </div>

        {/* Download button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className={`w-full h-16 rounded-2xl font-black text-lg uppercase tracking-wide transition-all flex items-center justify-center gap-3
            ${downloaded
              ? 'bg-primary/10 border border-primary text-primary'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
        >
          <Download className="w-5 h-5" />
          {downloaded ? 'Erneut herunterladen' : 'Vertrag als PDF herunterladen'}
        </motion.button>

        {downloaded && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold justify-center"
          >
            <Check className="w-4 h-4" /> PDF wurde heruntergeladen
          </motion.div>
        )}

        {/* Finish */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          disabled={!downloaded}
          className="mt-6 w-full h-14 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Abschließen →
        </motion.button>
      </div>
    </div>
  );
}