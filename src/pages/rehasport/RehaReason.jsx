import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const REASONS = [
  { id: 'pain', label: 'Schmerzen reduzieren', sub: 'Ich möchte Beschwerden besser in den Griff bekommen.', image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/70a6a019b_generated_image.png', color: 'from-red-600/70' },
  { id: 'mobility', label: 'Wieder beweglicher werden', sub: 'Ich möchte mich freier und sicherer bewegen.', image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/2ffbeffb5_generated_image.png', color: 'from-teal-600/70' },
  { id: 'recovery', label: 'Nach Krankheit oder Verletzung', sub: 'Ich brauche einen sicheren Wiedereinstieg.', image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0f5415cba_generated_image.png', color: 'from-blue-600/70' },
  { id: 'stability', label: 'Mehr Stabilität im Alltag', sub: 'Ich möchte mich belastbarer fühlen.', image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/49ae9cf34_generated_image.png', color: 'from-orange-600/70' },
];

export default function RehaReason({ profile, update, onNext, onBack }) {
  const toggle = (id) => {
    const current = profile.reasons || [];
    const next = current.includes(id) ? current.filter(r => r !== id) : [...current, id];
    update({ reasons: next });
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight mb-2">
        WAS BEWEGT DICH?
      </h1>
      <p className="text-sm font-medium text-primary">Mehrfachauswahl möglich</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REASONS.map(opt => {
          const selected = (profile.reasons || []).includes(opt.id);
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
          disabled={(profile.reasons || []).length === 0}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Weiter →
        </motion.button>
      </div>
      </div>
    </div>
  );
}