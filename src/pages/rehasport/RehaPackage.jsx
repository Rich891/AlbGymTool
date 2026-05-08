import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WISH_HEADLINES = {
  pain_free: 'Dein Weg zu weniger Beschwerden',
  everyday: 'Dein Weg zu mehr Sicherheit im Alltag',
  motivation: 'Dein Weg mit Unterstützung & Struktur',
  guidance: 'Dein sicherer Start ins Training',
};

const WISH_BENEFITS = {
  pain_free: 'Gezielter an Beschwerden arbeiten',
  everyday: 'Mehr Sicherheit und Stabilität im Alltag',
  motivation: 'Mit Struktur und Unterstützung trainieren',
  guidance: 'Klar geführt und sicher von Anfang an',
};

const ADDON_BENEFITS = {
  five: 'Mehr Beweglichkeit und Flexibilität',
  milon: 'Geführter Kraftaufbau mit Fortschritt',
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
  const [section20Accepted, setSection20Accepted] = useState({
    binding: false,
    no_guarantee: false,
    requires_rehasport: false,
    conditions_when_stopped: false,
  });
  const [saving, setSaving] = useState(false);

  const packageKey = getPackageKey(profile.selectedOffers);
  const packageName = getPackageName(profile.selectedOffers);
  const weeklyPrice = PACKAGE_PRICES[packageKey];
  const subsidyWeeklyPrice = 6.98;
  const section20Fee = 199;

  const hasSubsidyOption = profile.selectedOffers?.includes('five') || profile.selectedOffers?.includes('milon');
  const mainWish = profile.wishes?.[0];
  const headlineText = WISH_HEADLINES[mainWish] || 'Dein Paket für Rehasport';

  const getIncludedItems = () => {
    const items = ['Rehasport+'];
    if (profile.selectedOffers?.includes('five')) items.push('FIVE Beweglichkeitstraining');
    if (profile.selectedOffers?.includes('milon')) items.push('Milon Krafttraining');
    return items;
  };

  const getBenefits = () => {
    const benefits = [];
    if (mainWish && WISH_BENEFITS[mainWish]) benefits.push(WISH_BENEFITS[mainWish]);
    if (profile.selectedOffers?.includes('five')) benefits.push(ADDON_BENEFITS.five);
    if (profile.selectedOffers?.includes('milon')) benefits.push(ADDON_BENEFITS.milon);
    return benefits.slice(0, 3);
  };

  const canProceedSubsidy = Object.values(section20Accepted).every(v => v);

  const handleStartNormal = async () => {
    setSaving(true);
    try {
      update({
        subsidyActive: false,
        subsidy_variant: 'none',
        weekly_price: weeklyPrice,
      });
      onNext();
    } finally {
      setSaving(false);
    }
  };

  const handleStartWithSubsidy = async () => {
    if (!canProceedSubsidy) return;
    setSaving(true);
    try {
      update({
        subsidyActive: true,
        subsidy_variant: '1_course',
        weekly_price: weeklyPrice,
      });
      onNext();
    } finally {
      setSaving(false);
    }
  };

  const includedItems = getIncludedItems();
  const benefits = getBenefits();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 md:px-8 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <img
          src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png"
          alt="AlbGym"
          className="h-8 object-contain"
        />
      </div>

      {/* HERO - KOMPAKT */}
      <div className="relative h-72 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
          alt="Paket"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">Dein Weg zu ...</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4">
              {headlineText}
            </h1>
            <h2 className="text-2xl md:text-3xl font-black text-primary">{packageName}</h2>
          </motion.div>
        </div>
      </div>

      {/* CONTENT - KOMPAKT */}
      <div className="px-4 md:px-8 py-10 max-w-3xl mx-auto space-y-10">
        {/* INHALT DES PAKETS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-black text-foreground uppercase mb-4">Das ist in deinem Paket</h2>

          <div className="space-y-2">
            {includedItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-base font-semibold text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* NUTZEN */}
        {benefits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <h2 className="text-lg font-black text-foreground uppercase mb-4">Das bringt dir dein Paket</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="bg-secondary/50 border border-border rounded-2xl px-5 py-4">
                  <p className="font-bold text-foreground text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PREIS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-8 md:p-10">
          <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Dein Preis</p>

          <AnimatePresence mode="wait">
            {!showSubsidy ? (
              <motion.div
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6">
                <div>
                  <p className="text-5xl md:text-6xl font-black text-foreground">
                    {weeklyPrice.toFixed(2)}€
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">pro Woche</p>
                </div>

                <div className="space-y-3">
                  {hasSubsidyOption && (
                    <button
                      onClick={() => setShowSubsidy(true)}
                      className="w-full h-12 rounded-2xl border-2 border-primary text-primary font-black uppercase text-sm tracking-widest hover:bg-primary/5 transition-all">
                      Zuschuss nutzen
                    </button>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartNormal}
                    disabled={saving}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-base hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Jetzt starten'}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="subsidy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6">
                {/* Alter Preis durchgestrichen */}
                <div>
                  <p className="text-sm text-muted-foreground line-through mb-3">
                    Normalpreis: {weeklyPrice.toFixed(2)}€ / Woche
                  </p>

                  {/* Neuer Preis + Pauschale */}
                  <div className="space-y-2">
                    <p className="text-5xl md:text-6xl font-black text-primary">
                      {subsidyWeeklyPrice.toFixed(2)}€
                    </p>
                    <p className="text-sm text-muted-foreground">
                      pro Woche + {section20Fee}€ §20-Pauschale
                    </p>
                  </div>
                </div>

                {/* Zuschuss Info */}
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                  <p className="text-sm font-bold text-foreground mb-1">
                    💰 Dein Zuschuss
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Voraussichtlich bis zu 80 % der §20-Pauschale, abhängig von deiner Krankenkasse und regelmäßiger Teilnahme.
                  </p>
                </div>

                {/* Info Button */}
                <button
                  onClick={() => setShowSubsidyInfo(true)}
                  className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <Info className="w-3 h-3" /> Wie funktioniert der Zuschuss?
                </button>

                {/* §20 Bedingungen */}
                <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-foreground uppercase">§20-Bedingungen</p>
                  {[
                    { key: 'binding', text: 'Ich melde mich verbindlich zum §20-Angebot an.' },
                    { key: 'no_guarantee', text: 'Zuschuss nicht garantiert, abhängig von Anspruch und Teilnahme.' },
                    { key: 'requires_rehasport', text: 'Gilt nur mit aktiver Rehasport+ Teilnahme.' },
                    { key: 'conditions_when_stopped', text: 'Bei Beendigung gelten die Standardkonditionen.' },
                  ].map(({ key, text }) => (
                    <label key={key} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section20Accepted[key]}
                        onChange={e => setSection20Accepted({ ...section20Accepted, [key]: e.target.checked })}
                        className="w-4 h-4 rounded mt-0.5 accent-primary cursor-pointer"
                      />
                      <span className="text-xs text-foreground">{text}</span>
                    </label>
                  ))}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowSubsidy(false)}
                    className="w-full h-12 rounded-2xl border-2 border-border text-foreground font-black uppercase text-sm tracking-widest hover:bg-secondary transition-all">
                    Zurück zu Normalpreis
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartWithSubsidy}
                    disabled={saving || !canProceedSubsidy}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-base hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mit Zuschuss starten'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* LEISTUNGSKARTEN */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Rehasport+ */}
            <div className="relative overflow-hidden rounded-2xl h-40 group">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80"
                alt="Rehasport+"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="text-xs font-black uppercase leading-tight">Rehasport+</p>
              </div>
            </div>

            {/* FIVE */}
            {profile.selectedOffers?.includes('five') && (
              <div className="relative overflow-hidden rounded-2xl h-40 group">
                <img
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&q=80"
                  alt="FIVE"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs font-black uppercase leading-tight">FIVE</p>
                </div>
              </div>
            )}

            {/* Milon */}
            {profile.selectedOffers?.includes('milon') && (
              <div className="relative overflow-hidden rounded-2xl h-40 group">
                <img
                  src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=300&q=80"
                  alt="Milon"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs font-black uppercase leading-tight">Milon</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Zuschuss Info Modal */}
      <AnimatePresence>
        {showSubsidyInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-foreground uppercase">Zuschuss erklärt</h2>
                <button
                  onClick={() => setShowSubsidyInfo(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Viele gesetzliche Krankenkassen unterstützen zertifizierte Präventionsangebote nach §20 SGB V.
                </p>

                <p className="font-bold text-foreground">
                  Wenn dein Paket FIVE und/oder Milon enthält:
                </p>

                <ul className="space-y-2 list-disc list-inside">
                  <li>Rehasport+ läuft zum Basispreis von 6,98 € / Woche</li>
                  <li>Zusätzlich fällt eine §20-Pauschale von 199 € an</li>
                  <li>Ein Teil davon kommt voraussichtlich von deiner Krankenkasse zurück</li>
                </ul>

                <p className="bg-secondary/50 border border-border rounded-xl p-3 text-xs font-bold">
                  ⚠️ Der Zuschuss ist nicht garantiert und hängt von deiner Krankenkasse, deinem persönlichen Anspruch und deiner regelmäßigen Teilnahme ab.
                </p>
              </div>

              <button
                onClick={() => setShowSubsidyInfo(false)}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-sm tracking-widest hover:bg-primary/90 transition-all mt-6">
                Verstanden
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-10" />
    </div>
  );
}