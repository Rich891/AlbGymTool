import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Home, RefreshCw, Check, Calendar, Package } from 'lucide-react';
import { PACKAGE_CONFIG, UPSELL_CONFIG } from './scoringEngine';
import { jsPDF } from 'jspdf';

const LOGO_URL = 'https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/0137b7bb4_AlbGymLogo.png';

function generateAbschlussPDF(profile, moreState) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  try { doc.addImage(LOGO_URL, 'PNG', pageWidth - 50, 10, 35, 12); } catch {}

  doc.setFontSize(8); doc.setTextColor(120, 120, 120);
  doc.text('AlbGym GmbH · Wilhelmstraße 123 · 73230 Kirchheim', 15, y + 6);

  y = 45;
  doc.setFontSize(16); doc.setTextColor(0,0,0); doc.setFont('helvetica', 'bold');
  doc.text('BERATUNGSZUSAMMENFASSUNG', 15, y);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(100,100,100);
  doc.text(`Erstellt: ${new Date().toLocaleDateString('de-DE')}`, 15, y + 8);
  y += 20;

  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 150, 80);
  doc.text('KUNDE', 15, y); y += 7;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(0,0,0);
  doc.text(`Name: ${profile.name || '–'}`, 15, y); y += 6;
  if (profile.phone) { doc.text(`Telefon: ${profile.phone}`, 15, y); y += 6; }
  if (profile.email) { doc.text(`E-Mail: ${profile.email}`, 15, y); y += 6; }
  y += 4;

  const pkg = PACKAGE_CONFIG[moreState.corePackage];
  if (pkg) {
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 150, 80);
    doc.text('EMPFOHLENES PAKET', 15, y); y += 7;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(0,0,0);
    doc.text(`${pkg.name} (${pkg.subtitle})`, 15, y); y += 6;
    doc.text(`Wochenpreis: ${(moreState.weekly_price || pkg.weeklyPrice).toFixed(2)}€`, 15, y); y += 6;
    pkg.includes.forEach(s => { doc.text(`  ✓ ${s}`, 15, y); y += 5; });
    if (moreState.acceptedUpsells?.length) {
      moreState.acceptedUpsells.forEach(id => {
        const u = UPSELL_CONFIG[id];
        if (u) { doc.text(`  + ${u.name}`, 15, y); y += 5; }
      });
    }
    y += 4;
  }

  doc.setFontSize(8); doc.setTextColor(150,150,150);
  doc.text('www.alb-gym.de | +49 (0) 7381 9386-510', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

  return doc;
}

// Welche Termine werden benötigt
function getRequiredAppointments(corePackage, acceptedUpsells) {
  const appts = [];
  if (corePackage.includes('five') || acceptedUpsells.includes('five')) {
    appts.push({ id: 'five', label: 'FIVE & Geräte-Einweisung', icon: '🏋️' });
  }
  if (corePackage.includes('milon') || acceptedUpsells.includes('milon')) {
    appts.push({ id: 'milon', label: 'Milon-Einweisung', icon: '⚙️' });
  }
  if (acceptedUpsells.includes('inbody')) {
    appts.push({ id: 'inbody', label: 'InBody-Analyse planen', icon: '📊' });
  }
  if (acceptedUpsells.includes('ernaehrung')) {
    appts.push({ id: 'ernaehrung', label: 'Ernährungsberatung planen', icon: '🥗' });
  }
  if (acceptedUpsells.includes('skillcourt')) {
    appts.push({ id: 'skillcourt', label: 'Skillcourt-Einführung planen', icon: '🎯' });
  }
  if (acceptedUpsells.includes('laufanalyse')) {
    appts.push({ id: 'laufanalyse', label: 'Lauf- und Ganganalyse planen', icon: '🏃' });
  }
  if (acceptedUpsells.includes('pelvipower')) {
    appts.push({ id: 'pelvipower', label: 'PelviPower-Termin planen', icon: '💫' });
  }
  if (acceptedUpsells.includes('redwave') || acceptedUpsells.includes('avacura')) {
    appts.push({ id: 'regen', label: 'Regenerationsanwendung planen', icon: '✨' });
  }
  return appts;
}

export default function MehrAbschluss({ profile, moreState, onNewConsultation, onHome }) {
  const [downloading, setDownloading] = useState(false);

  const pkg = PACKAGE_CONFIG[moreState.corePackage];
  const appointments = getRequiredAppointments(moreState.corePackage || '', moreState.acceptedUpsells || []);
  const firstName = profile?.name?.split(' ')[0] || '';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const doc = generateAbschlussPDF(profile, moreState);
      doc.save(`AlbGym-Beratung-${profile?.name?.replace(/\s/g, '-') || 'Beratung'}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,200,80,0.3)]">
            <Check className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            DEIN START IST<br /><span className="text-primary">VORBEREITET</span>
          </h1>
          {firstName && (
            <p className="text-lg text-muted-foreground">
              Alles bereit, {firstName}. Dein neues Training kann beginnen.
            </p>
          )}
        </motion.div>

        {/* Paketübersicht */}
        {pkg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-primary/30 rounded-3xl overflow-hidden mb-5 shadow-[0_0_30px_rgba(0,200,80,0.15)]">
            <div className="h-40 relative overflow-hidden">
              <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">{pkg.subtitle}</p>
                <h3 className="text-2xl font-black text-white uppercase">{pkg.name}</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {pkg.includes.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold">✓ {s}</span>
                  ))}
                  {moreState.acceptedUpsells?.map(id => {
                    const u = UPSELL_CONFIG[id];
                    return u ? <span key={id} className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">+ {u.name}</span> : null;
                  })}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-3xl font-black text-primary">{(moreState.weekly_price || pkg.weeklyPrice).toFixed(2).replace('.', ',')}€</p>
                  <p className="text-xs text-muted-foreground">pro Woche</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Nächste Termine */}
        {appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-3xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-xs font-black uppercase tracking-widest text-primary">Deine nächsten Termine</p>
            </div>
            <div className="space-y-2">
              {appointments.map(appt => (
                <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
                  <span className="text-xl">{appt.icon}</span>
                  <p className="text-sm font-bold text-foreground">{appt.label}</p>
                  <div className="ml-auto">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">Bald buchen</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Was mitbringen */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-3xl p-5 mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Was du mitbringen solltest</p>
          <div className="space-y-2">
            {['Sportkleidung & Sportschuhe', 'Handtuch', 'Evtl. ärztliche Unterlagen', 'Gute Laune 💪'].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Motivierender Abschluss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-foreground font-bold">
            „Jeder große Fortschritt beginnt mit einem kleinen, konkreten ersten Schritt."
          </p>
          <p className="text-muted-foreground text-sm mt-1">— Dein AlbGym-Team</p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            disabled={downloading}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {downloading
              ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              : <><Download className="w-5 h-5" /> Zusammenfassung als PDF</>}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNewConsultation}
            className="w-full h-14 rounded-2xl border-2 border-border text-muted-foreground hover:border-primary hover:text-primary font-black uppercase tracking-wide transition-all flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5" />
            Neue Beratung starten
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onHome}
            className="w-full h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-bold transition-all flex items-center justify-center gap-2 text-sm">
            <Home className="w-4 h-4" /> Zur Startseite
          </motion.button>
        </div>
      </div>
    </div>
  );
}