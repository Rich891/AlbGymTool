import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DEFICITS } from './BestandDeficits';

function getLabel(score) {
  if (score <= 30) return { text: 'Weiterhin starkes Thema', color: 'text-destructive' };
  if (score <= 60) return { text: 'Teilweise verbessert', color: 'text-orange-400' };
  if (score <= 85) return { text: 'Deutlich verbessert', color: 'text-blue-400' };
  return { text: 'Sehr gut entwickelt', color: 'text-primary' };
}

function getBarColor(score) {
  if (score <= 30) return 'bg-destructive';
  if (score <= 60) return 'bg-orange-400';
  if (score <= 85) return 'bg-blue-400';
  return 'bg-primary';
}

function ImprovementSlider({ deficit, score, onChange }) {
  const def = DEFICITS.find(d => d.id === deficit);
  const label = getLabel(score);
  const barColor = getBarColor(score);

  const descriptions = ['kaum verbessert', 'etwas besser', 'spürbar besser', 'deutlich besser', 'fast vollständig verbessert'];
  const descIndex = Math.min(Math.floor(score / 25), 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-foreground uppercase">{def?.label}</h3>
          <p className="text-sm text-muted-foreground">{def?.description}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-black ${barColor.replace('bg-', 'text-')}`}>{score}%</p>
          <p className={`text-xs font-bold uppercase ${label.color}`}>{label.text}</p>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="relative h-3 bg-secondary rounded-full mb-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={score}
        onChange={e => onChange(deficit, Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
      />

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>kaum</span>
        <span>etwas</span>
        <span>spürbar</span>
        <span>deutlich</span>
        <span>fast vollständig</span>
      </div>

      <p className="text-sm text-center text-muted-foreground mt-2 font-medium">
        „{descriptions[descIndex]}"
      </p>
    </motion.div>
  );
}

export default function BestandImprovement({ deficits = [], scores = {}, onScoreChange, onNext, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            WIE SEHR HAT SICH<br /><span className="text-primary">DEIN ZUSTAND VERBESSERT?</span>
          </h1>
          <p className="text-muted-foreground">Bewege den Regler für jedes Thema.</p>
        </div>

        <div className="space-y-5 mb-8">
          {deficits.map(defId => (
            <ImprovementSlider
              key={defId}
              deficit={defId}
              score={scores[defId] ?? 50}
              onChange={onScoreChange}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all">
          Weiter →
        </motion.button>
      </div>
    </div>
  );
}