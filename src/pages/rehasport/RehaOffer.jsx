import React, { useState } from 'react';
import { ArrowLeft, Check, BadgePercent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OFFER_DETAILS = {
  rehasport: { label: 'Rehasport Kurs', benefit: 'Ärztlich verordnet – sicher und strukturiert', price: 'Per Rezept' },
  rehasport_plus: { label: 'Rehasport+', benefit: 'Mehr Freiheit, mehr Trainingsmöglichkeiten', price: '6,98 € / Woche' },
  five: { label: 'FIVE Beweglichkeitstraining', benefit: 'Gezielte Verbesserung von Haltung und Beweglichkeit', price: 'im §20-Paket' },
  milon: { label: 'Milon Krafttraining', benefit: 'Geführt, dokumentiert, einfach zu bedienen', price: 'im §20-Paket' },
};

function deriveTitle(profile) {
  const w = profile.wishes || [];
  if (w.includes('pain_free')) return 'Schmerzfreier werden';
  if (w.includes('everyday')) return 'Alltag besser meistern';
  if (w.includes('motivation')) return 'Sicher & motiviert starten';
  if (w.includes('guidance')) return 'Mit professioneller Anleitung';
  return 'Deinen eigenen Weg starten';
}

export default function RehaOffer({ profile, update, onNext, onBack }) {
  const [subsidyMode, setSubsidyMode] = useState(profile.subsidyMode || false);

  const allSelected = ['rehasport', ...(profile.selectedOffers || [])];
  const hasSubsidizable = allSelected.some(id => id === 'five' || id === 'milon' || id === 'rehasport_plus');
  const title = deriveTitle(profile);

  const activateSubsidy = () => {
    const next = !subsidyMode;
    setSubsidyMode(next);
    update({ subsidyMode: next });
  };

  return (
    <div className="min-h-screen flex flex-col px-4 md:px-8 pt-8 pb-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight mb-2">
        DEIN EIGENER WEG ZU<br /><span className="text-primary">{title.toUpperCase()}</span>
      </h1>
      <p className="text-muted-foreground mb-8 max-w-xl">Dein persönliches Angebot basierend auf deinen Antworten.</p>

      {/* Offer Card */}
      <div className="max-w-2xl w-full">
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 px-6 py-5 border-b border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Dein Paket</p>
            <h2 className="text-xl font-black text-foreground">
              {allSelected.map(id => OFFER_DETAILS[id]?.label).filter(Boolean).join(' + ')}
            </h2>
          </div>

          <div className="divide-y divide-border">
            {allSelected.map(id => {
              const d = OFFER_DETAILS[id];
              if (!d) return null;
              return (
                <div key={id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.benefit}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary ml-4 flex-shrink-0">{d.price}</span>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {subsidyMode && hasSubsidizable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/5 border-t border-primary/30 overflow-hidden"
              >
                <div className="px-6 py-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-3">Mit Krankenkassen-Zuschuss</p>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-black text-primary">6,98 €</span>
                    <span className="text-muted-foreground font-semibold">/ Woche</span>
                  </div>
                  <p className="text-sm text-foreground font-semibold mb-1">+ einmalige Pauschale 199 €</p>
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-primary/10">
                    <BadgePercent className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      <span className="font-bold">Bis zu 100 % Zuschuss möglich</span><br />
                      <span className="text-muted-foreground text-xs">Abhängig von deiner Krankenkasse und deinem persönlichen Anspruch.</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-8 max-w-2xl flex flex-col gap-3">
        {hasSubsidizable && !subsidyMode && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={activateSubsidy}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
          >
            <BadgePercent className="w-5 h-5" /> Krankenkassen-Zuschuss nutzen
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className={`w-full h-14 rounded-2xl font-black text-base uppercase tracking-wide transition-all
            ${subsidyMode || !hasSubsidizable
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
        >
          {subsidyMode ? 'Jetzt starten →' : 'Ohne Zuschuss fortfahren →'}
        </motion.button>
      </div>
    </div>
  );
}