import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WISH_HEADLINES = {
  pain_free: 'Dein Weg zu weniger Beschwerden',
  everyday: 'Dein Weg zu mehr Sicherheit im Alltag',
  motivation: 'Dein Weg mit Unterstützung & Struktur',
  guidance: 'Dein sicherer Start ins Training',
};

const WISH_BENEFITS = {
  pain_free: {
    title: 'Gezielter an Beschwerden arbeiten',
    text: 'Neben dem Gruppenkurs kannst du gezielt an Beweglichkeit, Kraft und Schwachstellen arbeiten.',
  },
  everyday: {
    title: 'Mehr Sicherheit im Alltag',
    text: 'Das Paket unterstützt dich dabei, dich stabiler und belastbarer zu fühlen.',
  },
  motivation: {
    title: 'Mit Unterstützung trainieren',
    text: 'Du bist nicht allein – strukturiert und mit professioneller Begleitung.',
  },
  guidance: {
    title: 'Sicher starten',
    text: 'Du bekommst eine klare Struktur und musst nicht allein herausfinden, was sinnvoll ist.',
  },
};

const ADDON_INFO = {
  five: {
    title: 'Mehr Beweglichkeit',
    text: 'FIVE hilft dir, muskuläre Einschränkungen gezielt zu bearbeiten.',
  },
  milon: {
    title: 'Geführter Kraftaufbau',
    text: 'Milon führt dich sicher durch dein Training und dokumentiert deinen Fortschritt.',
  },
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
  if (has5 && hasMilon) return 'Rehasport+ mit FIVE & Milon';
  if (has5) return 'Rehasport+ mit FIVE';
  if (hasMilon) return 'Rehasport+ mit Milon';
  return 'Rehasport+';
}

export default function RehaPackage({ profile, update, onNext, onBack }) {
  const [showSubsidyCalc, setShowSubsidyCalc] = useState(false);
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
  const monthlyPrice = Math.round(weeklyPrice * 4.33);
  const subsidyMonthlyPrice = Math.round(weeklyPrice * 4.33 * 0.5);

  const mainWish = profile.wishes?.[0];
  const headlineText = WISH_HEADLINES[mainWish] || 'Dein Paket für Rehasport';

  const getIncludedServices = () => {
    const services = ['Rehasport+'];
    if (profile.selectedOffers?.includes('five')) services.push('FIVE Beweglichkeitstraining');
    if (profile.selectedOffers?.includes('milon')) services.push('Milon Krafttraining');
    return services.join(', ');
  };

  const getWhyItFits = () => {
    const benefits = [];
    profile.wishes?.forEach(wish => {
      if (WISH_BENEFITS[wish]) benefits.push(wish);
    });
    if (profile.selectedOffers?.includes('five')) benefits.push('five');
    if (profile.selectedOffers?.includes('milon')) benefits.push('milon');
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
      setShowSubsidyCalc(false);
      onNext();
    } finally {
      setSaving(false);
    }
  };

  const whyItFits = getWhyItFits();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 md:px-8 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <img
          src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png"
          alt="AlbGym"
          className="h-8 object-contain"
        />
        <div className="w-24" />
      </div>

      {/* HERO SECTION */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
          alt="Rehasport Paket"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <p className="text-sm font-black uppercase tracking-widest text-primary mb-4">Dein Paket</p>

            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
              {headlineText}
            </h1>

            <h2 className="text-2xl md:text-4xl font-black text-primary mb-6">{packageName}</h2>

            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Dieses Paket passt zu dir, weil du {mainWish === 'pain_free' ? 'deine Beschwerden gezielter in den Griff bekommen' : mainWish === 'everyday' ? 'dich im Alltag sicherer und stabiler fühlen' : mainWish === 'motivation' ? 'mit Unterstützung und Struktur trainieren' : 'einen sicheren Einstieg ins selbstständige Training'} möchtest.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 md:px-8 py-16 max-w-4xl mx-auto space-y-20">
        {/* PREIS NORMAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-10 md:p-14">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Dein Preis</p>

          <div className="mb-8">
            <p className="text-5xl md:text-6xl font-black text-foreground mb-2">
              {weeklyPrice.toFixed(2)}€
            </p>
            <p className="text-lg text-muted-foreground">pro Woche</p>
            <p className="text-sm text-muted-foreground mt-2">
              ca. {monthlyPrice}€ monatlich
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
            Enthalten sind: {getIncludedServices()}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStartNormal}
              disabled={saving}
              className="h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Jetzt starten'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSubsidyCalc(true)}
              className="h-16 rounded-2xl border-2 border-primary text-primary font-black uppercase tracking-widest text-lg hover:bg-primary/10 transition-all">
              Mit Krankenkassen-Zuschuss
            </motion.button>
          </div>
        </motion.div>

        {/* ENTHALTENE LEISTUNGEN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase mb-10">
            Das ist in deinem Paket enthalten
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rehasport+ */}
            <div className="relative overflow-hidden rounded-3xl h-72 group">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"
                alt="Rehasport+"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-black uppercase mb-2">Rehasport+</h3>
                <p className="text-sm text-white/80">
                  Gruppenkurs, eigenständiges Training und regelmäßige Begleitung.
                </p>
              </div>
            </div>

            {/* FIVE */}
            {profile.selectedOffers?.includes('five') && (
              <div className="relative overflow-hidden rounded-3xl h-72 group">
                <img
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80"
                  alt="FIVE"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-orange-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-black uppercase mb-2">FIVE Training</h3>
                  <p className="text-sm text-white/80">
                    Gezielte Beweglichkeit und muskuläre Balance.
                  </p>
                </div>
              </div>
            )}

            {/* Milon */}
            {profile.selectedOffers?.includes('milon') && (
              <div className="relative overflow-hidden rounded-3xl h-72 group">
                <img
                  src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80"
                  alt="Milon"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-black uppercase mb-2">Milon Krafttraining</h3>
                  <p className="text-sm text-white/80">
                    KI-geführtes Training mit dokumentiertem Fortschritt.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* WARUM PASST DAS ZU DIR */}
        {whyItFits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>
            <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase mb-10">
              Warum dieses Paket zu dir passt
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyItFits.map((wish, i) => {
                const benefit = WISH_BENEFITS[wish] || ADDON_INFO[wish];
                return (
                  <motion.div
                    key={wish}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-secondary/50 border border-border rounded-3xl p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-3 uppercase">
                      {benefit?.title}
                    </h3>
                    <p className="text-muted-foreground">{benefit?.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ZUSCHUSS RECHNUNG - auf der Seite */}
        <AnimatePresence>
          {showSubsidyCalc && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-3xl p-10 md:p-14">
              <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase mb-4">
                Dein Paket mit Krankenkassen-Zuschuss
              </h2>

              <p className="text-lg text-muted-foreground mb-10">
                Wir rechnen dein Paket mit den Zuschussdaten deiner Krankenkasse neu.
              </p>

              {/* Preisvergleich */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-card border border-border rounded-2xl p-8">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-3">
                    Ohne Zuschuss
                  </p>
                  <p className="text-4xl font-black text-foreground mb-2">
                    {weeklyPrice.toFixed(2)}€
                  </p>
                  <p className="text-sm text-muted-foreground">pro Woche</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    ca. {monthlyPrice}€ / Monat
                  </p>
                </div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-card border-2 border-primary rounded-2xl p-8 relative">
                  <div className="absolute -top-4 right-4 px-4 py-1 bg-primary text-primary-foreground text-xs font-black uppercase rounded-full">
                    Mit Zuschuss
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-3">
                    Mit Zuschuss-Modell
                  </p>
                  <p className="text-4xl font-black text-primary mb-2">
                    {(weeklyPrice / 2).toFixed(2)}€
                  </p>
                  <p className="text-sm text-muted-foreground">pro Woche</p>
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                    + 99€ §20-Pauschale (6 Monate)
                  </p>
                </motion.div>
              </div>

              {/* Zuschuss Info */}
              <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-10">
                <p className="text-lg font-black text-foreground mb-2">
                  🎉 Voraussichtlicher Zuschuss: bis zu 160€
                </p>
                <p className="text-sm text-muted-foreground">
                  Statt {weeklyPrice.toFixed(2)}€ pro Woche zahlst du mit Zuschuss nur {(weeklyPrice / 2).toFixed(2)}€ – und bis zu 160€ bekommst du von deiner Krankenkasse erstattet (abhängig von Anspruch und regelmäßiger Teilnahme).
                </p>
              </div>

              {/* §20 Bedingungen */}
              <div className="space-y-4 mb-10 pb-10 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Bedingungen akzeptieren
                </p>
                {[
                  { key: 'binding', text: 'Ich melde mich verbindlich zum gewählten §20-Präventionsangebot an.' },
                  { key: 'no_guarantee', text: 'Der Zuschuss ist nicht garantiert und hängt von meiner aktiven Teilnahme ab.' },
                  { key: 'requires_rehasport', text: 'Das Zuschuss-Paket gilt nur mit aktiver Rehasport+ Teilnahme.' },
                  { key: 'conditions_when_stopped', text: 'Bei Beendigung von Rehasport+ gelten die Standardkonditionen.' },
                ].map(({ key, text }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section20Accepted[key]}
                      onChange={e => setSection20Accepted({ ...section20Accepted, [key]: e.target.checked })}
                      className="w-5 h-5 rounded mt-1 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">{text}</span>
                  </label>
                ))}
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowSubsidyCalc(false)}
                  className="h-14 rounded-2xl border-2 border-border text-foreground font-black uppercase tracking-widest hover:bg-secondary transition-all">
                  Zurück
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartWithSubsidy}
                  disabled={saving || !canProceedSubsidy}
                  className="h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mit Zuschuss starten'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-16" />
    </div>
  );
}