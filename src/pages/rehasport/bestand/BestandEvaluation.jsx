import React from 'react';
import { motion } from 'framer-motion';
import { DEFICITS } from './BestandDeficits';
import { GOALS } from './BestandFutureGoals';
import { MEASURES } from './BestandUsedMeasures';

function getLabel(score) {
  if (score <= 30) return { text: 'Weiterhin starkes Thema', color: 'text-destructive', bar: 'bg-destructive' };
  if (score <= 60) return { text: 'Teilweise verbessert', color: 'text-orange-400', bar: 'bg-orange-400' };
  if (score <= 85) return { text: 'Deutlich verbessert', color: 'text-blue-400', bar: 'bg-blue-400' };
  return { text: 'Sehr gut entwickelt', color: 'text-primary', bar: 'bg-primary' };
}

export default function BestandEvaluation({ state, onNext, onBack }) {
  const { initialDeficits = [], improvementScores = {}, futureGoals = [], usedMeasures = [] } = state;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Deine Auswertung</p>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none">
            DEIN VERLAUF
          </h1>
        </div>

        {/* Bereich 1: Defizite & Verbesserung */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-6 mb-5">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-5">Deine Defizite seit deinem Beginn</p>
          <div className="space-y-4">
            {initialDeficits.map(defId => {
              const def = DEFICITS.find(d => d.id === defId);
              const score = improvementScores[defId] ?? 50;
              const label = getLabel(score);
              return (
                <div key={defId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-foreground">{def?.label}</span>
                    <div className="text-right">
                      <span className={`text-lg font-black ${label.bar.replace('bg-', 'text-')}`}>{score}%</span>
                      <span className={`text-xs block font-bold ${label.color}`}>{label.text}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${label.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bereich 2: Bisherige Maßnahmen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-6 mb-5">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-5">Deine bisherigen Maßnahmen</p>
          <div className="grid grid-cols-2 gap-3">
            {MEASURES.map(m => {
              const active = usedMeasures.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`relative overflow-hidden rounded-2xl h-24 transition-all ${active ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                  <img src={m.image} alt={m.label} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${active ? 'from-green-900/80' : 'from-black/80'} to-black/30`} />
                  {active && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <p className={`absolute bottom-2 left-3 text-sm font-black uppercase ${active ? 'text-primary' : 'text-white/60'}`}>
                    {m.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bereich 3: Wünsche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-6 mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-5">Deine Wünsche</p>
          <div className="flex flex-wrap gap-2">
            {futureGoals.map(goalId => {
              const goal = GOALS.find(g => g.id === goalId);
              return (
                <span key={goalId} className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold">
                  {goal?.label}
                </span>
              );
            })}
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all">
          Zur Empfehlung →
        </motion.button>
      </div>
    </div>
  );
}