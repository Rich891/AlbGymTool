import React, { useState, useMemo } from 'react';
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

  const SUBSIDY_AMOUNT = 160; // voraussichtlicher Zuschuss
  const section20Fee = 198;
  const netFee = section20Fee - SUBSIDY_AMOUNT; // 38€ Eigenanteil

  // Datum-Berechnung für die 2 Zahlungen & Zuschuss-Anspruch
  const dates = useMemo(() => {
    const fmt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const today = new Date();
    const payment2 = new Date(today); payment2.setMonth(payment2.getMonth() + 6);
    const subsidy1 = new Date(today); subsidy1.setMonth(subsidy1.getMonth() + 2);
    const subsidy2 = new Date(payment2); subsidy2.setMonth(subsidy2.getMonth() + 2);
    return {
      payment1: fmt(today),
      payment2: fmt(payment2),
      subsidy1: fmt(subsidy1),
      subsidy2: fmt(subsidy2),
    };
  }, []);

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
            src="https://media.base44.com/images/public/69fd9350879c9d422990f406/4440011fc_generated_image.png"
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
                  src="https://media.base44.com/images/public/69fd9350879c9d422990f406/b1f56f24a_generated_image.png"
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
                  src="https://media.base44.com/images/public/69fd9350879c9d422990f406/c3d955081_generated_image.png"
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
                    <span className="font-bold">198,00€</span>
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

          {/* Service-Pauschale Hinweis */}
          <p className="text-xs text-muted-foreground mb-4">
            zzgl. <span className="font-semibold text-foreground">15,00€ / Quartal</span> Service-, Reinigungs- & Wartungspauschale
          </p>

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
              className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                className="bg-card border border-border rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[92vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">§20 SGB V</p>
                    <h2 className="text-2xl font-black text-foreground uppercase">Zuschuss erklärt</h2>
                  </div>
                  <button onClick={() => setShowSubsidyInfo(false)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 py-6 space-y-5">
                  {/* Intro */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Viele gesetzliche Krankenkassen bezuschussen zertifizierte Präventionsangebote nach §20 SGB V. Das Modell läuft über <strong className="text-foreground">2 Zahlungen</strong> – mit je einem Erstattungsanspruch danach.
                  </p>

                  {/* Zahlungsplan */}
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-widest text-primary">Deine 2 Zahlungen</p>

                    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-primary-foreground">1</span>
                        </div>
                        <p className="font-black text-foreground text-sm">1. §20-Zahlung – beim Start</p>
                      </div>
                      <div className="ml-10 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fällig am</span>
                          <span className="font-bold text-foreground">{dates.payment1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Betrag</span>
                          <span className="font-bold text-foreground">99,00€</span>
                        </div>
                        <div className="flex justify-between text-primary">
                          <span>Zuschuss beantragen ab</span>
                          <span className="font-bold">{dates.subsidy1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-primary-foreground">2</span>
                        </div>
                        <p className="font-black text-foreground text-sm">2. §20-Zahlung – nach 6 Monaten</p>
                      </div>
                      <div className="ml-10 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fällig am</span>
                          <span className="font-bold text-foreground">{dates.payment2}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Betrag</span>
                          <span className="font-bold text-foreground">99,00€</span>
                        </div>
                        <div className="flex justify-between text-primary">
                          <span>Zuschuss beantragen ab</span>
                          <span className="font-bold">{dates.subsidy2}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zusammenfassung */}
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2 text-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">Gesamtrechnung</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>2 × §20-Pauschale gesamt</span>
                      <span className="font-bold">198,00€</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>Voraussichtlicher Zuschuss</span>
                      <span className="font-bold">− {SUBSIDY_AMOUNT},00€</span>
                    </div>
                    <div className="border-t border-primary/20 pt-2 flex justify-between font-black text-foreground">
                      <span>Dein Eigenanteil</span>
                      <span className="text-primary text-lg">{netFee},00€</span>
                    </div>
                  </div>

                  {/* Hinweis */}
                  <p className="text-xs text-muted-foreground bg-secondary/60 border border-border rounded-2xl p-4 leading-relaxed">
                    ⚠️ Zuschuss und Eigenanteil sind Richtwerte. Die tatsächliche Erstattung hängt von deiner Krankenkasse, deinem persönlichen Anspruch und regelmäßiger Teilnahme ab. Keine Garantie.
                  </p>
                </div>

                {/* Footer Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setShowSubsidyInfo(false)}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-sm tracking-widest hover:bg-primary/90 transition-all">
                    Verstanden
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}