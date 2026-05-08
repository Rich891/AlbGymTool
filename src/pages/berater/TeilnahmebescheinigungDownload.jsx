import React, { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateTeilnahmebescheinigung } from '../rehasport/generateTeilnahmebescheinigung';

// Deutsche Feiertage Baden-Württemberg (feste Feiertage)
function isPublicHolidayBW(date) {
  const d = date.getDate();
  const m = date.getMonth() + 1; // 1-indexed
  // Neujahr, Tag der Arbeit, Tag der Deutschen Einheit, Weihnachten
  if ((m === 1 && d === 1) || (m === 5 && d === 1) || (m === 10 && d === 3) ||
      (m === 12 && d === 25) || (m === 12 && d === 26)) return true;
  // Ostern-basierte Feiertage (Karfreitag, Ostermontag, Himmelfahrt, Pfingstmontag)
  const y = date.getFullYear();
  const easter = getEaster(y);
  const holidays = [
    offsetDate(easter, -2),  // Karfreitag
    offsetDate(easter, 1),   // Ostermontag
    offsetDate(easter, 39),  // Christi Himmelfahrt
    offsetDate(easter, 50),  // Pfingstmontag
    offsetDate(easter, 60),  // Fronleichnam (BW)
  ];
  return holidays.some(h => h.getDate() === d && h.getMonth() + 1 === m && h.getFullYear() === y);
}

function getEaster(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

function offsetDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// Nächster Montag ab einem Datum (inkl. Feiertagsprüfung)
function nextMonday(from) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  // Gehe zu nächstem Montag
  const day = d.getDay();
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  // Falls Feiertag, nächste Woche
  while (isPublicHolidayBW(d)) {
    d.setDate(d.getDate() + 7);
  }
  return d;
}

// Berechnet Start- und Enddaten für Bescheinigung 1 und 2
export function calculateBescheinigungDates(abschlussDate) {
  const base = new Date(abschlussDate);
  base.setHours(0, 0, 0, 0);

  // Bescheinigung 1: erster Montag nach Abschluss
  const start1 = nextMonday(base);
  const end1 = new Date(start1);
  end1.setMonth(end1.getMonth() + 2);

  // Bescheinigung 2: erster Montag nach 6 Monaten ab Abschluss
  const sixMonthsLater = new Date(base);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  const start2 = nextMonday(sixMonthsLater);
  const end2 = new Date(start2);
  end2.setMonth(end2.getMonth() + 2);

  return { start1, end1, start2, end2 };
}

export default function TeilnahmebescheinigungDownload({ consultation, onClose }) {
  const [dl1, setDl1] = useState(false);
  const [dl2, setDl2] = useState(false);

  if (!consultation.subsidy_active) return null;

  const abschluss = new Date(consultation.created_date || Date.now());
  const { start1, end1, start2, end2 } = calculateBescheinigungDates(abschluss);

  const fmt = (d) => d.toLocaleDateString('de-DE');

  const buildProfile = (startDate, endDate) => ({
    name: consultation.customer_name,
    birthdate: consultation.birthdate,
    insurance_number: consultation.insurance_number,
    iban: consultation.iban,
    // Datumsfelder für die Generierung überschreiben
    _startDate: startDate,
    _endDate: endDate,
  });

  const download = async (num, startDate, endDate, setLoading) => {
    setLoading(true);
    try {
      const profile = buildProfile(startDate, endDate);
      const doc = generateTeilnahmebescheinigung(profile);
      doc.save(`Teilnahmebescheinigung-${num}-${consultation.customer_name?.replace(/\s/g, '-')}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-card border border-border rounded-3xl p-8 max-w-md w-full">

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">§20 SGB V</p>
              <h2 className="text-2xl font-black text-foreground uppercase">Teilnahmebescheinigungen</h2>
              <p className="text-sm text-muted-foreground mt-1">{consultation.customer_name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* Bescheinigung 1 */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-primary-foreground">1</span>
                </div>
                <p className="font-black text-foreground text-sm">1. Bescheinigung</p>
              </div>
              <div className="ml-10 space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kursstart</span>
                  <span className="font-bold text-foreground">{fmt(start1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kursende</span>
                  <span className="font-bold text-foreground">{fmt(end1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gebühr</span>
                  <span className="font-bold text-primary">99,00 €</span>
                </div>
              </div>
              <button
                onClick={() => download(1, start1, end1, setDl1)}
                disabled={dl1}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {dl1 ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <><Download className="w-4 h-4" /> PDF herunterladen</>
                )}
              </button>
            </div>

            {/* Bescheinigung 2 */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-primary-foreground">2</span>
                </div>
                <p className="font-black text-foreground text-sm">2. Bescheinigung (nach 6 Monaten)</p>
              </div>
              <div className="ml-10 space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kursstart</span>
                  <span className="font-bold text-foreground">{fmt(start2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kursende</span>
                  <span className="font-bold text-foreground">{fmt(end2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gebühr</span>
                  <span className="font-bold text-primary">99,00 €</span>
                </div>
              </div>
              <button
                onClick={() => download(2, start2, end2, setDl2)}
                disabled={dl2}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {dl2 ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <><Download className="w-4 h-4" /> PDF herunterladen</>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground bg-secondary/60 border border-border rounded-2xl p-3 leading-relaxed">
            ⚠️ Startdatum = erster Montag nach Abschluss (kein Feiertag BW). 2. Bescheinigung = erster Montag nach 6 Monaten.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}