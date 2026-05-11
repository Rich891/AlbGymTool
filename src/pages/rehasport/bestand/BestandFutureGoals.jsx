import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const GOALS = [
  {
    id: 'pain_free',
    label: 'Schmerzfreier werden',
    description: 'Ich möchte Beschwerden noch gezielter angehen.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  },
  {
    id: 'daily_life',
    label: 'Alltag besser meistern',
    description: 'Ich möchte stabiler, belastbarer und sicherer werden.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
  },
  {
    id: 'motivation',
    label: 'Motivation & sozial',
    description: 'Ich möchte dranbleiben, Struktur haben und mich gut aufgehoben fühlen.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  },
  {
    id: 'guidance',
    label: 'Anleitung & Sicherheit',
    description: 'Ich möchte wissen, was für mich wirklich sinnvoll ist.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  },
];

export default function BestandFutureGoals({ selected = [], onToggle, onNext, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            WAS WÜNSCHST DU<br /><span className="text-primary">DIR ZUKÜNFTIG?</span>
          </h1>
          <p className="text-muted-foreground">Mehrfachauswahl möglich.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {GOALS.map((goal, i) => {
            const isSelected = selected.includes(goal.id);
            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onToggle(goal.id)}
                className={`relative overflow-hidden rounded-3xl h-44 text-left group focus:outline-none transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(0,200,80,0.3)]' : ''
                }`}>
                <img src={goal.image} alt={goal.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-green-900/90' : 'from-black/85'} to-black/30`} />

                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <h3 className={`text-xl font-black uppercase mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                    {goal.label}
                  </h3>
                  <p className="text-sm text-white/70 leading-snug">{goal.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={selected.length === 0}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40">
          Weiter →
        </motion.button>
      </div>
    </div>
  );
}

export { GOALS };