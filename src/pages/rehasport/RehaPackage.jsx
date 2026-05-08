import React, { useState } from 'react';
import { ArrowLeft, Check, Info, X, Loader2, Dumbbell, Bike, ShowerHead, Coffee, ClipboardList, Clock, Accessibility, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

const WISH_GOALS = {
  pain_free: 'WENIGER BESCHWERDEN',
  everyday: 'MEHR SICHERHEIT',
  motivation: 'STRUKTUR & UNTERSTÜTZUNG',
  guidance: 'KLARHEIT & FÜHRUNG',
};

const WISH_WHY = {
  pain_free: 'Weil du gezielter an deinen Beschwerden arbeiten möchtest',
  everyday: 'Weil dir Stabilität und Sicherheit im Alltag wichtig sind',
  motivation: 'Weil du mit Unterstützung dranbleiben möchtest',
  guidance: 'Weil du einen sicheren und klaren Start möchtest',
};

const PACKAGE_PRICES = {
  'rehasport': 6.98,
  'rehasport-five': 11.98,
  'rehasport-milon': 11.98,
  'rehasport-five-milon': 13.98,
};

function getPackageKey(addons) {
  const has5 = addons?.includes('five');
  const hasMilon = addons?.includes('milon');
  if (has5 && hasMilon) return 'rehasport-five-milon';
  if (has5) return 'rehasport-five';
  if (hasMilon) return 'rehasport-milon';
  return 'rehasport';
}

function getPackageName(addons) {
  const has5 = addons?.includes('five');
  const hasMilon = addons?.includes('milon');
  if (has5 && hasMilon) return 'Rehasport+ & FIVE & Milon';
  if (has5) return 'Rehasport+ & FIVE';
  if (hasMilon) return 'Rehasport+ & Milon';
  return 'Rehasport+';
}

export default function RehaPackage({ profile, update, onNext, onBack }) {
  const [showSubsidy, setShowSubsidy] = useState(false);
  const [showSubsidyInfo, setShowSubsidyInfo] = useState(false);
  const [saving, setSaving] = useState(false);

  const packageKey = getPackageKey(profile.selectedOffers);
  const packageName = getPackageName(profile.selectedOffers);
  const weeklyPrice = PACKAGE_PRICES[packageKey];
  const hasSubsidyOption = profile.selectedOffers?.includes('five') || profile.selectedOffers?.includes('milon');
  const hasFive = profile.selectedOffers?.includes('five');
  const hasMilon = profile.selectedOffers?.includes('milon');
  const mainWish = profile.wishes?.[0];
  const goal = WISH_GOALS[mainWish] || 'DEIN REHASPORT-PAKET';
  const whyText = WISH_WHY[mainWish] || 'Dieses Paket wurde für deinen Start zusammengestellt';

  const SUBSIDY_AMOUNT = 159; // voraussichtlicher Zuschuss
  const section20Fee = 199;
  const netFee = section20Fee - SUBSIDY_AMOUNT; // 40€ Eigenanteil

  const allInclusive = [
    { icon: Dumbbell, label: 'Krafttraining' },
    { icon: Bike, label: 'Cardio' },
    { icon: ShowerHead, label: 'Duschen & Umkleiden' },
    { icon: Coffee, label: 'Getränke' },
    { icon: ClipboardList, label: 'Einweisungen' },
    { icon: Clock, label: 'Jederzeit verfügbar' },
    ...(hasFive ? [{ icon: Accessibility, label: 'FIVE Beweglichkeit' }] : []),
    ...(hasMilon ? [{ icon: Settings2, label: 'Milon geführtes Training' }] : []),
  ];

  const handleStart = async (withSubsidy = false) => {
    setSaving(true);
    try {
      update({
        subsidyActive: withSubsidy,
        subsidy_variant: withSubsidy ? '1_course' : 'none',
        weekly_price: weeklyPrice,
      });
      onNext();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        {/* HEADER */}
        <div className="text-center mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
            Dein Weg zu ...
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tight leading-tight">
            {goal}
          </h1>
        </div>

        {/* REHASPORT+ KARTE – immer drin */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl h-52 w-full mb-5">
          <img
            src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=80"
            alt="Rehasport+"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/95 to-black/30" />

          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <p className="text-xs font-black uppercase tracking-widest mb-2 text-primary">
              {whyText}
            </p>
            <h3 className="text-3xl font-black uppercase leading-tight text-primary">
              REHASPORT+
            </h3>
            <p className="text-sm text-white/70 mt-1.5 leading-snug">
              Eigenständig trainieren neben dem Kurs – gezielter üben und unabhängiger von Kurszeiten.
            </p>
          </div>
        </motion.div>

        {/* ADDONS GRID */}
        {(hasFive || hasMilon) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {hasFive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl h-72">
                <img
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80"
                  alt="FIVE"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 to-black/40" />

                <div className="absolute top-4 left-4 z-10 h-8">
                  <img src={FIVE_LOGO} alt="FIVE" className="h-full object-contain" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <p className="text-xs font-black uppercase tracking-widest mb-2 text-orange-300">
                    Weil du mehr Beweglichkeit willst
                  </p>
                  <h3 className="text-2xl font-black uppercase leading-tight text-orange-400">
                    FIVE TRAINING
                  </h3>
                  <p className="text-sm text-white/70 mt-1.5 leading-snug">
                    Mehr Beweglichkeit, bessere Körperhaltung und gezieltes Arbeiten an muskulären Schwachstellen.
                  </p>
                </div>
              </motion.div>
            )}

            {hasMilon && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative overflow-hidden rounded-3xl h-72">
                <img
                  src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80"
                  alt="Milon"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-black/40" />

                <div className="absolute top-4 left-4 z-10 h-8">
                  <img src={MILON_LOGO} alt="Milon" className="h-full object-contain" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <p className="text-xs font-black uppercase tracking-widest mb-2 text-blue-200">
                    Weil dir Führung und Unterstützung wichtig ist
                  </p>
                  <h3 className="text-2xl font-black uppercase leading-tight text-blue-400">
                    MILON TRAINING
                  </h3>
                  <p className="text-sm text-white/70 mt-1.5 leading-snug">
                    Geführtes Krafttraining mit automatischer Einstellung, klarer Führung und dokumentiertem Fortschritt.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ALLES INKLUSIVE PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 bg-card border border-border rounded-3xl p-6">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-4">Alles inklusive</p>
          <div className="flex flex-wrap gap-2">
            {allInclusive.map((item, i) => {
              const Icon = item.icon;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-2 text-sm font-semibold text-foreground">
                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* PREIS + BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-8 mb-6">

          <AnimatePresence mode="wait">
            {!showSubsidy ? (
              <motion.div
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Dein Preis</p>
                    <p className="text-5xl font-black text-foreground">{weeklyPrice.toFixed(2).replace('.', ',')}€</p>
                    <p className="text-sm text-muted-foreground mt-1">pro Woche</p>
                  </div>
                  {hasSubsidyOption && (
                    <button
                      onClick={() => setShowSubsidy(true)}
                      className="text-xs font-black text-primary uppercase tracking-widest hover:underline">
                      Zuschuss möglich →
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="subsidy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Dein Preis mit Zuschuss</p>
                    <p className="text-base text-muted-foreground line-through mb-1">
                      {weeklyPrice.toFixed(2).replace('.', ',')}€ / Woche
                    </p>
                    <p className="text-5xl font-black text-primary">6,98€</p>
                    <p className="text-sm text-muted-foreground mt-1">pro Woche</p>
                  </div>
                  <button
                    onClick={() => setShowSubsidy(false)}
                    className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest font-bold mt-1">
                    Zurück
                  </button>
                </div>

                {/* §20-Rechnung */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-4 mb-3 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>§20-Pauschale</span>
                    <span className="font-bold">199,00€</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Voraussichtlicher Zuschuss*</span>
                    <span className="font-bold">− {SUBSIDY_AMOUNT},00€</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-foreground font-black">
                    <span>Dein Eigenanteil*</span>
                    <span className="text-primary">{netFee},00€</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSubsidyInfo(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-4">
                  <Info className="w-3 h-3" /> * Wie funktioniert das?
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Buttons */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleStart(showSubsidy)}
            disabled={saving}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : showSubsidy ? 'Mit Zuschuss starten →' : 'Jetzt starten →'}
          </motion.button>
        </motion.div>

        {/* Subsidy Info Modal */}
        <AnimatePresence>
          {showSubsidyInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-foreground uppercase">Zuschuss erklärt</h2>
                  <button onClick={() => setShowSubsidyInfo(false)} className="p-2 hover:bg-secondary rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed mb-6">
                  <p>Viele gesetzliche Krankenkassen unterstützen zertifizierte Präventionsangebote nach §20 SGB V.</p>
                  <p className="font-bold text-foreground">So funktioniert das Zuschuss-Modell:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Rehasport+ läuft zum Basispreis von 6,98€ / Woche</li>
                    <li>Einmalig fällt eine §20-Pauschale von 199€ an</li>
                    <li>Deine Krankenkasse erstattet voraussichtlich bis zu {SUBSIDY_AMOUNT}€ davon</li>
                    <li>Dein voraussichtlicher Eigenanteil: nur {netFee}€</li>
                  </ul>
                  <p className="bg-secondary/60 border border-border rounded-xl p-3 text-xs">
                    * Der angezeigte Zuschuss und Eigenanteil sind Richtwerte. Die tatsächliche Erstattung hängt von deiner Krankenkasse, deinem persönlichen Anspruch und regelmäßiger Teilnahme ab. Keine Garantie.
                  </p>
                </div>

                <button
                  onClick={() => setShowSubsidyInfo(false)}
                  className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-sm tracking-widest hover:bg-primary/90 transition-all">
                  Verstanden
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}