import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const GOAL_TILES = [
  {
    id: 'abnehmen',
    label: 'Abnehmen & Figur',
    sub: 'Gewicht verlieren, Körper formen',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80',
    color: 'from-orange-500/60',
  },
  {
    id: 'muskelaufbau',
    label: 'Muskelaufbau',
    sub: 'Stärker werden, Muskeln aufbauen',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    color: 'from-red-500/60',
  },
  {
    id: 'ruecken',
    label: 'Rücken entlasten',
    sub: 'Schmerzen reduzieren, Haltung verbessern',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    color: 'from-blue-500/60',
  },
  {
    id: 'beweglichkeit',
    label: 'Beweglichkeit',
    sub: 'Flexibler werden, Verspannungen lösen',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
    color: 'from-cyan-500/60',
  },
  {
    id: 'gesundheit',
    label: 'Gesundheit stärken',
    sub: 'Vorsorge, Immunsystem, Wohlbefinden',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    color: 'from-pink-500/60',
  },
  {
    id: 'reha',
    label: 'Reha & Heilung',
    sub: 'Nach Verletzung oder mit Verordnung',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80',
    color: 'from-emerald-500/60',
  },
  {
    id: 'performance',
    label: 'Performance steigern',
    sub: 'Leistung, Ausdauer, Athletik',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
    color: 'from-yellow-500/60',
  },
  {
    id: 'stress',
    label: 'Stress abbauen',
    sub: 'Ausgleich, Entspannung, Energie',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
    color: 'from-purple-500/60',
  },
  {
    id: 'einfach',
    label: 'Einfach starten',
    sub: 'Unkompliziert, geführt, schnell',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=80',
    color: 'from-green-500/60',
  },
  {
    id: 'community',
    label: 'Community & Kurse',
    sub: 'Gemeinsam trainieren, Spaß haben',
    image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=600&q=80',
    color: 'from-indigo-500/60',
  },
];

export default function GoalStep({ selectedGoals, setSelectedGoals, onNext, onBack }) {
  const toggle = (id) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col px-4 md:px-6 pb-8">
      {/* Header */}
      <div className="pt-6 pb-6 text-center">
        <h2 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tight">
          Was möchtest du erreichen?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Wähle alles aus, was zu dir passt – mehrere Ziele sind möglich
        </p>
      </div>

      {/* Goal Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">
        {GOAL_TILES.map((goal, i) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => toggle(goal.id)}
              className={`group relative overflow-hidden rounded-2xl h-36 md:h-44 text-left focus:outline-none transition-all duration-200 ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
              <img
                src={goal.image}
                alt={goal.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${goal.color} to-black/80 ${isSelected ? 'opacity-100' : 'opacity-90 group-hover:opacity-80'} transition-opacity duration-300`} />

              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className={`text-sm md:text-base font-black text-white uppercase leading-tight transition-colors ${isSelected ? 'text-primary' : ''}`}>
                  {goal.label}
                </h3>
                <p className="text-xs text-white/70 mt-0.5 leading-snug hidden md:block">{goal.sub}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={onBack}
          className="h-14 px-6 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNext}
          disabled={selectedGoals.length === 0}
          className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Auswertung starten →
        </button>
      </div>
    </div>
  );
}