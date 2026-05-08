import React from 'react';
import { ArrowLeft, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const OFFERS = [
  {
    id: 'rehasport',
    label: 'Rehasport Kurs',
    text: 'Dein ärztlich verordneter Gruppenkurs für Bewegung, Stabilität und Koordination.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80',
    color: 'from-primary/80',
    alwaysBase: true,
  },
  {
    id: 'rehasport_plus',
    label: 'Rehasport+',
    text: 'Mehr Möglichkeiten neben dem Kurs: eigenständig trainieren, gezielter üben und unabhängiger von Kurszeiten werden.',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&q=80',
    color: 'from-emerald-600/80',
    alwaysRecommended: true,
  },
  {
    id: 'five',
    label: 'FIVE Beweglichkeitstraining',
    text: 'Mehr Beweglichkeit, bessere Körperhaltung und gezieltes Arbeiten an muskulären Schwachstellen.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80',
    color: 'from-teal-600/80',
    recommendedFor: { wishes: ['pain_free'], complaints: ['back', 'everyday'], reasons: ['mobility', 'pain'] },
  },
  {
    id: 'milon',
    label: 'Milon Krafttraining',
    text: 'Geführtes Krafttraining mit automatischer Einstellung, klarer Führung und dokumentiertem Fortschritt.',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80',
    color: 'from-blue-700/80',
    recommendedFor: { wishes: ['everyday', 'guidance'], complaints: ['strength'], reasons: ['stability'] },
  },
];

function isRecommended(offer, profile) {
  if (offer.alwaysRecommended) return true;
  if (offer.alwaysBase) return false;
  const r = offer.recommendedFor;
  if (!r) return false;
  return (
    (r.wishes || []).some(w => (profile.wishes || []).includes(w)) ||
    (r.complaints || []).some(c => (profile.complaints || []).includes(c)) ||
    (r.reasons || []).some(re => (profile.reasons || []).includes(re))
  );
}

export default function RehaUpsell({ profile, update, onNext, onBack }) {
  const toggle = (id) => {
    if (id === 'rehasport') return; // always selected
    const current = profile.selectedOffers || [];
    const next = current.includes(id) ? current.filter(o => o !== id) : [...current, id];
    update({ selectedOffers: next });
  };

  const selected = (id) => id === 'rehasport' || (profile.selectedOffers || []).includes(id);

  return (
    <div className="min-h-screen flex flex-col px-4 md:px-8 pt-8 pb-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight mb-2">
        DEINE MÖGLICHKEITEN<br /><span className="text-primary">IM ALBGYM</span>
      </h1>
      <p className="text-muted-foreground mb-8">Wähle, was zu dir passt. Empfohlene Optionen sind hervorgehoben.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {OFFERS.map(opt => {
          const rec = isRecommended(opt, profile);
          const sel = selected(opt.id);
          const isBase = opt.alwaysBase;

          return (
            <motion.button
              key={opt.id}
              whileTap={isBase ? {} : { scale: 0.97 }}
              onClick={() => toggle(opt.id)}
              className={`group relative overflow-hidden rounded-3xl h-56 text-left focus:outline-none transition-all duration-200
                ${sel
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(0,230,80,0.35)]'
                  : rec
                    ? 'ring-1 ring-primary/40 hover:ring-primary/70 hover:shadow-[0_0_25px_rgba(0,230,80,0.2)]'
                    : 'hover:ring-1 hover:ring-primary/30 hover:shadow-[0_0_15px_rgba(0,230,80,0.1)]'
                }
                ${isBase ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 bg-gradient-to-t ${opt.color} to-black/60`} />

              {/* Recommended badge */}
              {rec && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-black uppercase px-3 py-1.5 rounded-full z-10">
                  <Star className="w-3 h-3" /> Empfohlen für dich
                </div>
              )}

              {/* Selected / base check */}
              {sel && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}

              {isBase && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">Basis</div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <h3 className={`text-xl font-black uppercase leading-tight ${sel ? 'text-primary' : 'text-white group-hover:text-primary'} transition-colors duration-300`}>
                  {opt.label}
                </h3>
                <p className="text-sm text-white/70 mt-1 leading-snug">{opt.text}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto pt-8 max-w-4xl">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all"
        >
          Auswahl bestätigen →
        </motion.button>
      </div>
    </div>
  );
}