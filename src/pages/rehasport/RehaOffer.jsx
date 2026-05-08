import React, { useState } from 'react';
import { ArrowLeft, Check, BadgePercent, ChevronRight, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

// Full price per week with all three selected
const FULL_PRICE_WEEK = 13.99;
const SUBSIDY_PRICE_WEEK = 6.98;
const SUBSIDY_ONETIME = 199;

const CARD_DATA = {
  rehasport_plus: {
    label: 'Rehasport+',
    sub: 'Freies Training neben dem Kurs – mehr Flexibilität, mehr Fortschritt',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=80',
    gradient: 'from-emerald-900/95',
    accentColor: 'text-primary',
    logo: null,
    bullets: ['Freies Gerätetraining inklusive', 'Unabhängig von Kurszeiten', 'Gezielt üben & festigen'],
  },
  five: {
    label: 'FIVE Training',
    sub: 'Beweglichkeit, Haltung und muskuläre Balance gezielt verbessern',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80',
    gradient: 'from-orange-900/95',
    accentColor: 'text-orange-400',
    logo: FIVE_LOGO,
    bullets: ['Gezielte Beweglichkeitsarbeit', 'Persönlicher Trainingsplan', 'Dokumentierter Fortschritt'],
  },
  milon: {
    label: 'Milon Training',
    sub: 'Geführtes Krafttraining mit automatischer Einstellung und Tracking',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=900&q=80',
    gradient: 'from-blue-900/95',
    accentColor: 'text-blue-400',
    logo: MILON_LOGO,
    bullets: ['Vollautomatisch eingestellt', 'Keine Vorkenntnisse nötig', 'Klare Fortschrittsanzeige'],
  },
};

function deriveTitle(profile) {
  const w = profile.wishes || [];
  if (w.includes('pain_free')) return 'Schmerzfrei werden';
  if (w.includes('everyday')) return 'Alltag leichter meistern';
  if (w.includes('motivation')) return 'Sicher & motiviert starten';
  if (w.includes('guidance')) return 'Mit professioneller Anleitung';
  return 'Deinen Weg starten';
}

function fmt(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

// Visual card for each included module
function OfferCard({ id, tall }) {
  const d = CARD_DATA[id];
  if (!d) return null;
  return (
    <div className={`group relative overflow-hidden rounded-3xl w-full ${tall ? 'h-52' : 'h-56'}`}>
      <img src={d.image} alt={d.label} className="absolute inset-0 w-full h-full object-cover" />
      <div className={`absolute inset-0 bg-gradient-to-t ${d.gradient} to-black/30`} />

      {/* Logo top left */}
      {d.logo && (
        <div className="absolute top-4 left-4 z-10 h-7">
          <img src={d.logo} alt={d.label} className="h-full object-contain" />
        </div>
      )}

      {/* Check badge top right */}
      <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </div>

      {/* Content bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <h3 className={`text-xl font-black uppercase leading-tight mb-1 ${d.accentColor}`}>{d.label}</h3>
        <p className="text-xs text-white/70 leading-snug mb-3">{d.sub}</p>
        <div className="flex flex-wrap gap-2">
          {d.bullets.map((b) => (
            <span key={b} className="text-xs bg-white/10 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-full border border-white/10">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RehaOffer({ profile, update, onNext, onBack }) {
  const [subsidyMode, setSubsidyMode] = useState(profile.subsidyMode || false);
  // Simulated inputs — in a real flow these come from profile or a form
  const [kasseName, setKasseName] = useState(profile.kasseName || '');
  const [kasseZuschuss, setKasseZuschuss] = useState(profile.kasseZuschuss || '');

  const selectedOffers = profile.selectedOffers || [];
  const title = deriveTitle(profile);
  const hasOffers = selectedOffers.length > 0;

  // Determine which cards to show — rehasport_plus always first if present
  const orderedOffers = ['rehasport_plus', 'five', 'milon'].filter(id => selectedOffers.includes(id));

  const activateSubsidy = () => {
    const next = !subsidyMode;
    setSubsidyMode(next);
    update({ subsidyMode: next });
  };

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
            {/* Visual cards */}
            <div className={`mb-6 ${orderedOffers.length === 1 ? 'flex flex-col gap-4' : orderedOffers.length === 2 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}`}>
              {orderedOffers.length === 3 ? (
                <>
                  {/* Rehasport+ full width on top */}
                  <OfferCard key="rehasport_plus" id="rehasport_plus" tall />
                  {/* FIVE + Milon side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    {orderedOffers.filter(id => id !== 'rehasport_plus').map(id => (
                      <OfferCard key={id} id={id} />
                    ))}
                  </div>
                </>
              ) : (
                orderedOffers.map((id) => (
                  <OfferCard key={id} id={id} />
                ))
              )}
            </div>

            {/* Price block */}
            <div className="rounded-3xl bg-card border border-border overflow-hidden mb-4">
              <div className="px-6 pt-6 pb-5">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Dein Preis</p>

                {/* Price comparison */}
                <div className="flex items-end justify-between">
                  <div>
                    <AnimatePresence mode="wait">
                      {subsidyMode ? (
                        <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                          {/* Original — small, grey, strikethrough */}
                          <span className="text-base text-muted-foreground line-through leading-none mb-1">
                            {fmt(FULL_PRICE_WEEK)} / Woche
                          </span>
                          {/* Subsidized — big, white */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-foreground leading-none">{fmt(SUBSIDY_PRICE_WEEK)}</span>
                            <span className="text-base text-muted-foreground font-semibold">/ Woche</span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-foreground leading-none">{fmt(FULL_PRICE_WEEK)}</span>
                          <span className="text-base text-muted-foreground font-semibold">/ Woche</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {subsidyMode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 border border-primary/30 rounded-2xl px-3 py-2 text-center"
                    >
                      <p className="text-xs font-black text-primary uppercase tracking-wide">Ersparnis</p>
                      <p className="text-lg font-black text-primary">{fmt(FULL_PRICE_WEEK - SUBSIDY_PRICE_WEEK)}</p>
                      <p className="text-xs text-muted-foreground">pro Woche</p>
                    </motion.div>
                  )}
                </div>

                {/* Subsidy one-time package */}
                <AnimatePresence>
                  {subsidyMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-black text-foreground">Krankenkassen-Paket</p>
                              <span className="text-base font-black text-primary">{fmt(SUBSIDY_ONETIME)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">Einmalig – umfasst FIVE + Milon Einweisung, Betreuung & Dokumentation</p>

                            {/* KK name + Zuschuss inputs */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                                <span className="text-xs text-muted-foreground flex-shrink-0">Krankenkasse:</span>
                                <input
                                  type="text"
                                  value={kasseName}
                                  onChange={e => { setKasseName(e.target.value); update({ kasseName: e.target.value }); }}
                                  placeholder="z. B. AOK Bayern"
                                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-semibold"
                                />
                              </div>
                              <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                                <span className="text-xs text-muted-foreground flex-shrink-0">KK-Zuschuss:</span>
                                <input
                                  type="text"
                                  value={kasseZuschuss}
                                  onChange={e => { setKasseZuschuss(e.target.value); update({ kasseZuschuss: e.target.value }); }}
                                  placeholder="z. B. 150,00 €"
                                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-semibold"
                                />
                              </div>
                            </div>

                            {kasseName && kasseZuschuss && (
                              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-primary font-semibold">
                                {kasseName} übernimmt {kasseZuschuss} → du zahlst {fmt(SUBSIDY_ONETIME - parseFloat(kasseZuschuss.replace(',', '.').replace(' €', '')) || SUBSIDY_ONETIME)}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
          /* No selection — just base Rehasport Kurs */
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