import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

const OFFERS = [
  {
    id: 'rehasport',
    label: 'Rehasport Kurs',
    whyText: null,
    text: 'Dein ärztlich verordneter Gruppenkurs für Bewegung, Stabilität und Koordination.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80',
    gradient: 'from-emerald-900/90',
    accentColor: null,
    logo: null,
    alwaysBase: true,
  },
  {
    id: 'rehasport_plus',
    label: 'Rehasport+',
    whyText: 'Weil dir Führung und Unterstützung wichtig ist',
    text: 'Eigenständig trainieren neben dem Kurs – gezielter üben und unabhängiger von Kurszeiten.',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&q=80',
    gradient: 'from-emerald-800/90',
    accentColor: null,
    logo: null,
    alwaysRecommended: true,
  },
  {
    id: 'five',
    label: 'FIVE Training',
    whyText: 'Weil du mehr Beweglichkeit willst',
    text: 'Mehr Beweglichkeit, bessere Körperhaltung und gezieltes Arbeiten an muskulären Schwachstellen.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80',
    gradient: 'from-orange-900/90',
    accentColor: 'orange',
    logo: FIVE_LOGO,
    recommendedFor: { wishes: ['pain_free'], complaints: ['back', 'everyday'], reasons: ['mobility', 'pain'] },
  },
  {
    id: 'milon',
    label: 'Milon Training',
    whyText: 'Weil du dir mehr Freiheit wünschst',
    text: 'Geführtes Krafttraining mit automatischer Einstellung, klarer Führung und dokumentiertem Fortschritt.',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80',
    gradient: 'from-blue-900/90',
    accentColor: 'blue',
    logo: MILON_LOGO,
    recommendedFor: { wishes: ['everyday', 'guidance'], complaints: ['strength'], reasons: ['stability'] },
  },
];

function getAccentClasses(accentColor, sel) {
  if (accentColor === 'orange') {
    return {
      ring: sel ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(251,146,60,0.4)]' : 'hover:ring-1 hover:ring-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.2)]',
      labelColor: sel ? 'text-orange-400' : 'text-white group-hover:text-orange-400',
      checkBg: 'bg-orange-400',
      whyColor: 'text-orange-300',
    };
  }
  if (accentColor === 'blue') {
    return {
      ring: sel ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(96,165,250,0.4)]' : 'hover:ring-1 hover:ring-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]',
      labelColor: sel ? 'text-blue-400' : 'text-white group-hover:text-blue-400',
      checkBg: 'bg-blue-400',
      whyColor: 'text-blue-200',
    };
  }
  // default green
  return {
    ring: sel ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(0,230,80,0.35)]' : 'hover:ring-1 hover:ring-primary/40',
    labelColor: sel ? 'text-primary' : 'text-white group-hover:text-primary',
    checkBg: 'bg-primary',
    whyColor: 'text-primary/80',
  };
}

export default function RehaUpsell({ profile, update, onNext, onBack }) {
  const toggle = (id) => {
    if (id === 'rehasport') return;
    const current = profile.selectedOffers || [];
    const next = current.includes(id) ? current.filter((o) => o !== id) : [...current, id];
    update({ selectedOffers: next });
  };

  const selected = (id) => id === 'rehasport' || (profile.selectedOffers || []).includes(id);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Mehr als das Nötigste</p>
          <h1 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-tight">
            DEIN WEG ZUM ZIEL MIT:
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OFFERS.map((opt) => {
            const sel = selected(opt.id);
            const isBase = opt.alwaysBase;
            const accent = getAccentClasses(opt.accentColor, sel);

            return (
              <motion.button
                key={opt.id}
                whileTap={isBase ? {} : { scale: 0.97 }}
                onClick={() => toggle(opt.id)}
                className={`group relative overflow-hidden rounded-3xl text-left focus:outline-none transition-all duration-300
                  ${opt.whyText ? 'h-72' : 'h-56'}
                  ${accent.ring}
                  ${isBase ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${opt.gradient} to-black/40`} />

                {/* Selected check */}
                {sel && !isBase && (
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-full ${accent.checkBg} flex items-center justify-center z-10`}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Logo */}
                {opt.logo && (
                  <div className="absolute top-4 left-4 z-10 h-8">
                    <img src={opt.logo} alt={opt.label} className="h-full object-contain" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  {/* "Weil du..." reason text */}
                  {opt.whyText && (
                    <p className={`text-xs font-black uppercase tracking-widest mb-2 ${accent.whyColor}`}>
                      {opt.whyText}
                    </p>
                  )}
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
            Auswahl bestätigen →
          </motion.button>
        </div>
      </div>
    </div>
  );
}