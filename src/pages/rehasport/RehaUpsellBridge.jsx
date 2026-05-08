import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const WISHES = [
  { id: 'pain_free', label: 'Schmerzfreier werden', sub: 'Ich möchte Beschwerden gezielter angehen.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80', color: 'from-red-600/70' },
  { id: 'everyday', label: 'Alltag besser meistern', sub: 'Sicherer, stabiler und belastbarer fühlen.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80', color: 'from-blue-600/70' },
  { id: 'motivation', label: 'Motivation & Gruppe', sub: 'Dranbleiben und gut aufgehoben fühlen.', image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=700&q=80', color: 'from-purple-600/70' },
  { id: 'guidance', label: 'Anleitung & Sicherheit', sub: 'Wissen, was für mich wirklich sinnvoll ist.', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&q=80', color: 'from-teal-600/70' },
];

export default function RehaUpsellBridge({ profile, update, onNext, onBack }) {
  const toggle = (id) => {
    const current = profile.wishes || [];
    const next = current.includes(id) ? current.filter(w => w !== id) : [...current, id];
    update({ wishes: next });
  };

  const firstName = (profile.name || 'du').split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight mb-2">
        WILLKOMMEN IM REHASPORT,<br /><span className="text-primary">{firstName.toUpperCase()}.</span>
      </h1>
      <p className="text-muted-foreground mb-2 leading-relaxed">
        Rehasport ist dein Einstieg. Wenn du mehr aus deinem Start machen möchtest, können wir deinen Weg gezielt ergänzen.
      </p>
      <p className="text-base font-semibold text-foreground">Was wünschst du dir über den Rehasport hinaus?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WISHES.map(opt => {
          const selected = (profile.wishes || []).includes(opt.id);
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(opt.id)}
              className={`group relative overflow-hidden rounded-3xl h-52 text-left focus:outline-none transition-all duration-200
                ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(0,230,80,0.3)]' : 'hover:ring-1 hover:ring-primary/40 hover:shadow-[0_0_20px_rgba(0,230,80,0.15)]'}`}
            >
              <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 bg-gradient-to-t ${opt.color} to-black/60`} />
              {selected && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <h3 className={`text-xl font-black uppercase leading-tight ${selected ? 'text-primary' : 'text-white group-hover:text-primary'} transition-colors duration-300`}>
                  {opt.label}
                </h3>
                <p className="text-sm text-white/70 mt-1 leading-snug">{opt.sub}</p>
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
          Möglichkeiten anzeigen →
        </motion.button>
      </div>
      </div>
    </div>
  );
}