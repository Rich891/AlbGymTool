import React, { useState } from 'react';
import { ArrowLeft, Check, BadgePercent, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

// Prices per week
const PRICING = {
  rehasport_plus: { label: 'Rehasport+', sub: 'Freies Training neben dem Kurs', price: 6.98, subsidized: 0, logo: null, color: 'text-primary', bg: 'bg-primary/10' },
  five: { label: 'FIVE Training', sub: 'Beweglichkeit & Haltung verbessern', price: 2.49, subsidized: 0, logo: FIVE_LOGO, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  milon: { label: 'Milon Training', sub: 'Geführtes Krafttraining mit Fortschrittstrack', price: 2.49, subsidized: 0, logo: MILON_LOGO, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

// Subsidy reduces the weekly price (example: KK covers part)
const SUBSIDY_AMOUNT = { rehasport_plus: 3.49, five: 1.24, milon: 1.24 };

function deriveTitle(profile) {
  const w = profile.wishes || [];
  if (w.includes('pain_free')) return 'Schmerzfrei werden';
  if (w.includes('everyday')) return 'Den Alltag leichter meistern';
  if (w.includes('motivation')) return 'Sicher & motiviert starten';
  if (w.includes('guidance')) return 'Mit professioneller Anleitung';
  return 'Deinen eigenen Weg starten';
}

function fmt(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

function PriceLine({ price, subsidized, subsidyMode, color }) {
  const subsidizedPrice = Math.max(0, price - subsidized);
  return (
    <div className="flex flex-col items-end">
      <AnimatePresence mode="wait">
        {subsidyMode ? (
          <motion.div key="sub" className="flex flex-col items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="text-xs text-muted-foreground line-through leading-none">{fmt(price)}</span>
            <span className={`text-lg font-black leading-tight ${color}`}>{fmt(subsidizedPrice)}</span>
          </motion.div>
        ) : (
          <motion.span key="normal" className={`text-lg font-black ${color}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {fmt(price)}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="text-xs text-muted-foreground">/ Woche</span>
    </div>
  );
}

export default function RehaOffer({ profile, update, onNext, onBack }) {
  const [subsidyMode, setSubsidyMode] = useState(profile.subsidyMode || false);

  const selectedOffers = profile.selectedOffers || [];
  const title = deriveTitle(profile);

  const totalPerWeek = selectedOffers.reduce((sum, id) => sum + (PRICING[id]?.price || 0), 0);
  const totalSubsidized = selectedOffers.reduce((sum, id) => sum + Math.max(0, (PRICING[id]?.price || 0) - (SUBSIDY_AMOUNT[id] || 0)), 0);

  const activateSubsidy = () => {
    const next = !subsidyMode;
    setSubsidyMode(next);
    update({ subsidyMode: next });
  };

  const hasOffers = selectedOffers.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Dein persönliches Angebot</p>
          <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight">
            DEIN WEG ZU<br /><span className="text-primary">{title.toUpperCase()}</span>
          </h1>
        </div>

        {hasOffers ? (
          <>
            {/* Offer items */}
            <div className="space-y-3 mb-6">
              {selectedOffers.map((id) => {
                const d = PRICING[id];
                if (!d) return null;
                return (
                  <div key={id} className={`flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-card`}>
                    <div className="flex items-center gap-3">
                      {d.logo ? (
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 p-1.5">
                          <img src={d.logo} alt={d.label} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl ${d.bg} flex items-center justify-center flex-shrink-0`}>
                          <Check className={`w-5 h-5 ${d.color}`} />
                        </div>
                      )}
                      <div>
                        <p className={`font-black text-base ${d.color}`}>{d.label}</p>
                        <p className="text-xs text-muted-foreground">{d.sub}</p>
                      </div>
                    </div>
                    <PriceLine price={d.price} subsidized={SUBSIDY_AMOUNT[id] || 0} subsidyMode={subsidyMode} color={d.color} />
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="rounded-2xl bg-card border border-primary/30 px-5 py-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Gesamt pro Woche</span>
                <div className="flex flex-col items-end">
                  <AnimatePresence mode="wait">
                    {subsidyMode ? (
                      <motion.div key="sub-total" className="flex flex-col items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <span className="text-sm text-muted-foreground line-through leading-none">{fmt(totalPerWeek)}</span>
                        <span className="text-3xl font-black text-primary leading-tight">{fmt(totalSubsidized)}</span>
                      </motion.div>
                    ) : (
                      <motion.span key="normal-total" className="text-3xl font-black text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {fmt(totalPerWeek)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="text-xs text-muted-foreground">/ Woche</span>
                </div>
              </div>
              {subsidyMode && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-muted-foreground">
                  * Endpreis abhängig von deiner Krankenkasse und persönlichem Anspruch.
                </motion.p>
              )}
            </div>

            {/* Subsidy toggle */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={activateSubsidy}
              className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-3 mb-3
                ${subsidyMode
                  ? 'bg-primary/10 border border-primary/40 text-primary'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
              <BadgePercent className="w-5 h-5" />
              {subsidyMode ? 'Zuschuss aktiv ✓' : 'Krankenkassen-Zuschuss einrechnen'}
            </motion.button>

            {/* Continue */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="w-full h-14 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2"
            >
              Weiter <ChevronRight className="w-4 h-4" />
            </motion.button>
          </>
        ) : (
          /* No selection — just Rehasport Kurs */
          <div className="rounded-2xl border border-border bg-card px-6 py-8 text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-1">Rehasport Kurs</h3>
            <p className="text-sm text-muted-foreground mb-2">Ärztlich verordnet – sicher und strukturiert.</p>
            <p className="text-xs text-muted-foreground">Kosten über deine Verordnung (Formular 56) abgedeckt.</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 transition-all"
            >
              Beratung abschließen →
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}