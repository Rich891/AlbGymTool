import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PACKAGES = [
  {
    id: 'standard',
    name: 'Rehasport+',
    tagline: 'Dein Einstieg ins Training',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    gradient: 'from-primary/80',
    includes: [
      'Unbegrenztes Gerätetraining',
      'Zugang zu Gruppenkursen',
      '1x wöchentliche Einweisung',
      'Trainingsanalyse & Betreuung',
      'Beratung durch Trainer',
    ],
    weeklyPrice: 6.98,
  },
];

const ADDONS = [
  {
    id: 'five',
    name: 'FIVE Training',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    color: 'from-orange-600/80',
    benefits: [
      'Hochmodernes EMS-Training',
      'Nur 20 Min pro Woche',
      'Maximale Effizienz',
      'Professionelle Betreuung',
    ],
  },
  {
    id: 'milon',
    name: 'Milon Training',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
    color: 'from-blue-600/80',
    benefits: [
      'KI-gestütztes Training',
      'Personalisierte Workouts',
      'Automatische Anpassung',
      'Spielerisches Trainieren',
    ],
  },
];

export default function RehaPackage({ profile, update, onNext, onBack }) {
  const [showSubsidyModal, setShowSubsidyModal] = useState(false);
  const [subsidyVariant, setSubsidyVariant] = useState(null);
  const [section20Accepted, setSection20Accepted] = useState({
    binding: false,
    no_guarantee: false,
    requires_rehasport: false,
    conditions_when_stopped: false,
  });
  const [saving, setSaving] = useState(false);
  const [showSubsidyPrice, setShowSubsidyPrice] = useState(false);

  const pkg = PACKAGES[0];
  const selectedAddons = profile.selectedOffers || [];
  const weeklyPrice = pkg.weeklyPrice;
  const monthlyPrice = weeklyPrice * 4.33;
  const subsidyMonthlyPrice = Math.round(monthlyPrice * 0.5); // 50% Beispiel

  const handleSelectSubsidy = (variant) => {
    setSubsidyVariant(variant);
    setShowSubsidyModal(true);
  };

  const canProceedSubsidy = Object.values(section20Accepted).every(v => v);

  const handleConfirmSubsidy = async () => {
    if (!canProceedSubsidy) return;
    setSaving(true);
    try {
      update({
        subsidyActive: true,
        subsidy_variant: subsidyVariant,
        weekly_price: weeklyPrice,
      });
      setShowSubsidyModal(false);
      onNext();
    } finally {
      setSaving(false);
    }
  };

  const handleStartWithoutSubsidy = async () => {
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

  const handleSubsidyClick = () => {
    setShowSubsidyPrice(true);
    setTimeout(() => {
      handleSelectSubsidy('1_course');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 border-b border-border/50 flex items-center justify-between">
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

      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${pkg.gradient} to-transparent`} />

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-2">
            {pkg.name}
          </h1>
          <p className="text-lg md:text-xl text-white/90">{pkg.tagline}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-8 py-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Leistungen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-black text-foreground uppercase mb-6">Das ist enthalten</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Addons - wenn ausgewählt */}
          {selectedAddons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">+ Du hast auch gewählt</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADDONS.filter(a => selectedAddons.includes(a.id)).map(addon => (
                  <div
                    key={addon.id}
                    className="relative overflow-hidden rounded-3xl h-64 group">
                    <img
                      src={addon.image}
                      alt={addon.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${addon.color} to-transparent`} />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-black uppercase mb-2">{addon.name}</h3>
                      <div className="text-xs space-y-1">
                        {addon.benefits.slice(0, 2).map((b, i) => (
                          <p key={i} className="text-white/80">✓ {b}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6">
            {/* Standard Pricing */}
            <div className="bg-card border-2 border-border rounded-3xl p-8">
              <h3 className="text-xl font-black text-foreground uppercase mb-6">Ohne Zuschuss</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Wochenpreis</span>
                  <span className="text-3xl font-black text-foreground">{weeklyPrice.toFixed(2)}€</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">ca. monatlich</span>
                  <span className="text-lg font-bold text-foreground">{monthlyPrice.toFixed(2)}€</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleStartWithoutSubsidy}
                disabled={saving}
                className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-black uppercase tracking-wide hover:bg-secondary/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Jetzt starten →'}
              </motion.button>
            </div>

            {/* Subsidy Button - BIG & ANIMIERT */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubsidyClick}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-12 w-full group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />

              <div className="relative space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary-foreground/80 mb-2">
                    💰 Krankenkassen-Zuschuss
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight">
                    WOW! Spar bis zu 50%
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm opacity-80">Normalpreis</p>
                    <p className="text-2xl font-black line-through opacity-60">{monthlyPrice.toFixed(2)}€</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-3xl opacity-60">→</div>
                  </div>
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={showSubsidyPrice ? { scale: 1.1 } : { scale: 1 }}
                    className="text-center bg-primary-foreground/20 rounded-2xl p-3">
                    <p className="text-sm opacity-80">Mit Zuschuss</p>
                    <p className="text-3xl font-black text-primary-foreground">
                      {subsidyMonthlyPrice}€
                    </p>
                  </motion.div>
                </div>

                <div className="text-center border-t border-primary-foreground/20 pt-4">
                  <p className="text-sm font-bold">Klick um Zuschuss zu berechnen →</p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Subsidy Modal */}
      <AnimatePresence>
        {showSubsidyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-foreground uppercase mb-6">
                🎉 Dein Zuschuss
              </h2>

              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Normalpreis/Monat</span>
                    <span className="line-through text-muted-foreground">{monthlyPrice.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-primary/20 pt-3">
                    <span className="font-bold text-foreground">Mit Zuschuss</span>
                    <span className="text-3xl font-black text-primary">{subsidyMonthlyPrice}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary font-bold">Du sparst monatlich</span>
                    <span className="text-2xl font-black text-primary">
                      {(monthlyPrice - subsidyMonthlyPrice).toFixed(0)}€
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bedingungen akzeptieren</p>

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

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubsidyModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-border text-foreground hover:bg-secondary transition-all font-bold">
                  Zurück
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirmSubsidy}
                  disabled={saving || !canProceedSubsidy}
                  className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mit Zuschuss starten →'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}