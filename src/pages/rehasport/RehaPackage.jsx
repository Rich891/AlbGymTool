import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

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
      'Beratung durch Trainier',
    ],
    basePrice: 6.98,
    monthlyPrice: 30.33,
  },
];

export default function RehaPackage({ profile, update, onNext, onBack }) {
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [showSubsidyModal, setShowSubsidyModal] = useState(false);
  const [subsidyVariant, setSubsidyVariant] = useState(null);
  const [section20Accepted, setSection20Accepted] = useState({
    binding: false,
    no_guarantee: false,
    requires_rehasport: false,
    conditions_when_stopped: false,
  });
  const [saving, setSaving] = useState(false);

  const pkg = PACKAGES.find(p => p.id === selectedPackage);
  const selectedAddons = profile.selectedOffers || [];
  const addonsPrice = selectedAddons.length * 5;
  const weeklyPrice = pkg.basePrice + addonsPrice;
  const monthlyPrice = weeklyPrice * 4.33;

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
        <div className="max-w-4xl mx-auto">
          {/* Leistungen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8 mb-10">
            <h2 className="text-2xl font-black text-foreground uppercase mb-6">Das ist enthalten</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {pkg.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>

            {/* Addons */}
            {selectedAddons.length > 0 && (
              <div className="border-t border-border pt-6">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  + Zusätzlich gewählt
                </p>
                <div className="space-y-2">
                  {selectedAddons.includes('five') && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-400/30">
                      <span className="font-bold text-foreground">FIVE Training</span>
                      <span className="text-orange-400 font-bold">+5,00€/Wo</span>
                    </div>
                  )}
                  {selectedAddons.includes('milon') && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-400/30">
                      <span className="font-bold text-foreground">Milon Training</span>
                      <span className="text-blue-400 font-bold">+5,00€/Wo</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Jetzt starten ohne Zuschuss →'}
              </motion.button>
            </div>

            {/* Subsidy Option */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-black uppercase rounded-full">
                Sparoptionen
              </div>

              <h3 className="text-xl font-black text-foreground uppercase mb-6">Mit Krankenkassen-Zuschuss</h3>

              <div className="space-y-3 mb-8">
                <p className="text-sm text-muted-foreground">
                  Viele Krankenkassen bezuschussen zertifizierte Präventionskurse nach §20 SGB V. Wir berechnen deinen möglichen Zuschuss live für dich.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectSubsidy('1_course')}
                  className="p-5 rounded-2xl border-2 border-primary/30 bg-background hover:border-primary hover:bg-primary/5 transition-all text-left">
                  <p className="font-black text-foreground mb-1">1 §20-Kurs (6 Monate)</p>
                  <p className="text-xs text-muted-foreground">Einmalgebühr 99€</p>
                  <p className="text-sm font-bold text-primary mt-2">Zuschuss bis 99€</p>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectSubsidy('2_courses')}
                  className="p-5 rounded-2xl border-2 border-primary/30 bg-background hover:border-primary hover:bg-primary/5 transition-all text-left">
                  <p className="font-black text-foreground mb-1">2 §20-Kurse (12 Monate)</p>
                  <p className="text-xs text-muted-foreground">2 × 99€ Gebühren</p>
                  <p className="text-sm font-bold text-primary mt-2">Zuschuss bis 198€</p>
                </motion.button>
              </div>
            </div>
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
                WOW! Dein Zuschuss
              </h2>

              {/* Preisberechnung */}
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-8">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Normalpreis monatlich:</span>
                    <span className="line-through text-muted-foreground">{monthlyPrice.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-primary/20 pt-3">
                    <span className="font-bold text-foreground">Mit Zuschuss:</span>
                    <span className="text-2xl font-black text-primary">
                      {(monthlyPrice - (subsidyVariant === '2_courses' ? 50 : 25)).toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary font-bold">Du sparst:</span>
                    <span className="text-lg font-black text-primary">
                      ~{subsidyVariant === '2_courses' ? '50' : '25'}€/Monat
                    </span>
                  </div>
                </div>
              </div>

              {/* §20 Bedingungen */}
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
                  Abbrechen
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