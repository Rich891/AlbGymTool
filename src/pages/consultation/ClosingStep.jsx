import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';

export default function ClosingStep({
  customer, selectedTariff, selectedAddons, totalMonthly,
  onClose, onBack
}) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [chosen, setChosen] = useState(null);

  const handle = async (outcome) => {
    setChosen(outcome);
    setSaving(true);
    await onClose(outcome, notes);
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Summary hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-card border-b border-border/50 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Zusammenfassung</p>
          <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-1">
            {customer.first_name} {customer.last_name}
          </h2>

          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-5xl font-black text-primary">{totalMonthly}€</span>
            <span className="text-muted-foreground text-lg">/Monat</span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-foreground font-semibold">{selectedTariff?.name || '–'}</span>
              <span className="text-muted-foreground">· {selectedTariff?.monthly_price || 0}€/mtl.</span>
            </div>
            {selectedAddons.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{a.name}</span>
                {a.price_monthly > 0 && <span className="text-muted-foreground">· +{a.price_monthly}€/mtl.</span>}
              </div>
            ))}
            {selectedTariff?.start_fee > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Startgebühr: {selectedTariff.start_fee}€ · Laufzeit: {selectedTariff.duration_months || 12} Monate
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-8 pt-6 max-w-2xl mx-auto w-full">
        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Beratungsnotizen (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Besonderheiten, Rückfragen, Hinweise zum Kunden ..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm resize-none"
          />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {/* Primary CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handle('abschluss')}
            disabled={saving}
            className="w-full relative overflow-hidden rounded-2xl bg-primary text-primary-foreground py-6 font-black text-xl uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25"
          >
            <div className="flex flex-col items-center">
              <span>🎯 JETZT ABSCHLIESSEN</span>
              {selectedTariff?.start_fee > 0 && (
                <span className="text-sm font-medium opacity-80 mt-0.5">Keine Startgebühr heute – sprich deinen Berater an</span>
              )}
            </div>
            {chosen === 'abschluss' && saving && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary">
                <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              </div>
            )}
          </motion.button>

          {/* Secondary CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handle('testphase')}
            disabled={saving}
            className="w-full rounded-2xl border-2 border-blue-400/40 bg-blue-400/5 text-blue-400 hover:bg-blue-400/10 py-5 font-black text-lg uppercase tracking-wide transition-all disabled:opacity-50"
          >
            ⏱ 14 TAGE TESTEN
          </motion.button>

          {/* Tertiary CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handle('angebot')}
            disabled={saving}
            className="w-full rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary py-4 font-semibold text-base transition-all disabled:opacity-50"
          >
            Angebot speichern
          </motion.button>
        </div>

        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zur Empfehlung
        </button>
      </div>
    </div>
  );
}