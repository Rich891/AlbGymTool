import React, { useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

const ADDONS = [
  {
    id: 'five',
    label: 'FIVE Training',
    whyText: 'Weil du mehr Beweglichkeit willst',
    text: 'Mehr Beweglichkeit, bessere Körperhaltung und gezieltes Arbeiten an muskulären Schwachstellen.',
    image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/e6dae839e_generated_image.png',
    gradient: 'from-orange-900/90',
    accentColor: 'orange',
    logo: FIVE_LOGO,
    recommendedFor: { wishes: ['pain_free', 'mobility'], complaints: ['back', 'everyday'], reasons: ['mobility', 'pain'] },
  },
  {
    id: 'milon',
    label: 'Milon Training',
    whyText: 'Weil dir Führung und Unterstützung wichtig ist',
    text: 'Geführtes Krafttraining mit automatischer Einstellung, klarer Führung und dokumentiertem Fortschritt.',
    image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/f864abc42_generated_image.png',
    gradient: 'from-blue-900/90',
    accentColor: 'blue',
    logo: MILON_LOGO,
    recommendedFor: { wishes: ['everyday', 'guidance', 'stability'], complaints: ['strength'], reasons: ['stability', 'guidance'] },
  },
];

function isRecommended(addon, profile) {
  const r = addon.recommendedFor;
  if (!r) return false;
  return (
    (r.wishes || []).some((w) => (profile.wishes || []).includes(w)) ||
    (r.complaints || []).some((c) => (profile.complaints || []).includes(c)) ||
    (r.reasons || []).some((re) => (profile.reasons || []).includes(re))
  );
}

function getAccentClasses(accentColor, sel) {
  if (accentColor === 'orange') {
    return {
      ring: sel
        ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(251,146,60,0.4)]'
        : 'hover:ring-1 hover:ring-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.2)]',
      labelColor: sel ? 'text-orange-400' : 'text-white group-hover:text-orange-400',
      checkBg: 'bg-orange-400',
      whyColor: 'text-orange-300',
    };
  }
  if (accentColor === 'blue') {
    return {
      ring: sel
        ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(96,165,250,0.4)]'
        : 'hover:ring-1 hover:ring-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]',
      labelColor: sel ? 'text-blue-400' : 'text-white group-hover:text-blue-400',
      checkBg: 'bg-blue-400',
      whyColor: 'text-blue-200',
    };
  }
  return {
    ring: sel
      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(0,230,80,0.35)]'
      : 'hover:ring-1 hover:ring-primary/40',
    labelColor: sel ? 'text-primary' : 'text-white group-hover:text-primary',
    checkBg: 'bg-primary',
    whyColor: 'text-primary/80',
  };
}

export default function RehaUpsell({ profile, update, onNext, onBack }) {
  // Auto-select add-ons based on profile answers on mount
  useEffect(() => {
    const current = profile.selectedOffers || [];
    // Default: Rehasport+ selected
    let next = current.length === 0 ? ['rehasport_plus'] : current;
    ADDONS.forEach((addon) => {
      if (isRecommended(addon, profile) && !next.includes(addon.id)) {
        next = [...next, addon.id];
      }
    });
    if (next.join(',') !== current.join(',')) {
      update({ selectedOffers: next });
    }
  }, []);

  const toggle = (id) => {
    const current = profile.selectedOffers || [];
    // If toggling an addon (five/milon) while rehasport_plus is not selected, add it automatically
    if (id !== 'rehasport_plus' && !current.includes('rehasport_plus') && !current.includes(id)) {
      update({ selectedOffers: [...current, 'rehasport_plus', id] });
      return;
    }
    const next = current.includes(id) ? current.filter((o) => o !== id) : [...current, id];
    update({ selectedOffers: next });
  };

  const selected = (id) => (profile.selectedOffers || []).includes(id);
  const hasSelection = (profile.selectedOffers || []).length > 0;
  const rehaSelected = selected('rehasport_plus');

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <div className="text-center mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Mehr als das Nötigste</p>
          <h1 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-tight">
            DEIN WEG ZUM ZIEL MIT:
          </h1>
        </div>

        {/* Rehasport+ — selectable base */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => toggle('rehasport_plus')}
          className={`group relative overflow-hidden rounded-3xl h-52 w-full mb-5 text-left focus:outline-none transition-all duration-300 cursor-pointer
            ${rehaSelected
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(0,230,80,0.3)]'
              : 'ring-1 ring-border hover:ring-primary/40 opacity-70 hover:opacity-100'
            }`}
        >
          <img
            src="https://media.base44.com/images/public/69fd9350879c9d422990f406/cd81f0c3a_generated_image.png"
            alt="Rehasport+"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/95 to-black/30" />

          {rehaSelected && (
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${rehaSelected ? 'text-primary' : 'text-white/50'}`}>
              Weil du dir mehr Freiheit wünschst
            </p>
            <h3 className={`text-3xl font-black uppercase leading-tight transition-colors duration-300 ${rehaSelected ? 'text-primary' : 'text-white'}`}>
              REHASPORT+
            </h3>
            <p className="text-sm text-white/70 mt-1.5 leading-snug">
              Eigenständig trainieren neben dem Kurs – gezielter üben und unabhängiger von Kurszeiten.
            </p>
          </div>
        </motion.button>

        {/* FIVE + Milon add-ons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ADDONS.map((opt) => {
            const sel = selected(opt.id);
            const accent = getAccentClasses(opt.accentColor, sel);

            return (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(opt.id)}
                className={`group relative overflow-hidden rounded-3xl h-72 text-left focus:outline-none transition-all duration-300 cursor-pointer ${accent.ring}`}
              >
                <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${opt.gradient} to-black/40`} />

                {sel && (
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-full ${accent.checkBg} flex items-center justify-center z-10`}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {opt.logo && (
                  <div className="absolute top-4 left-4 z-10 h-8">
                    <img src={opt.logo} alt={opt.label} className="h-full object-contain" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${accent.whyColor}`}>
                    {opt.whyText}
                  </p>
                  <h3 className={`text-2xl font-black uppercase leading-tight transition-colors duration-300 ${accent.labelColor}`}>
                    {opt.label}
                  </h3>
                  <p className="text-sm text-white/70 mt-1.5 leading-snug">{opt.text}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all"
          >
            {hasSelection ? 'Jetzt starten →' : 'Beratung abschließen'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}