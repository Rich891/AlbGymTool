import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { FOCUS_BY_GOAL } from './scoringEngine';

export default function MehrFocusPoints({ mainGoals, selected, onToggle, onNext, onBack }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Alle relevanten Fokuspunkte für gewählte Hauptziele sammeln (dedupliziert)
  const allFocusPoints = [];
  const seen = new Set();
  for (const goal of mainGoals) {
    for (const fp of (FOCUS_BY_GOAL[goal] || [])) {
      if (!seen.has(fp.id)) {
        seen.add(fp.id);
        allFocusPoints.push({ ...fp, goal });
      }
    }
  }

  const goalColors = { figur: 'from-orange-900/80', leistung: 'from-blue-900/80', gesundheit: 'from-green-900/80' };
  const goalLabels = { figur: 'Figur', leistung: 'Leistung', gesundheit: 'Gesundheit' };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            WORAUF MÖCHTEST DU DICH<br /><span className="text-primary">GENAU KONZENTRIEREN?</span>
          </h1>
          <p className="text-muted-foreground">Mehrfachauswahl möglich – hover für passende Leistungen.</p>
        </div>

        {/* Gruppiert nach Ziel */}
        {mainGoals.map(goal => {
          const fps = FOCUS_BY_GOAL[goal] || [];
          return (
            <div key={goal} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground px-3">{goalLabels[goal]}</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {fps.map((fp, i) => {
                  const isSelected = selected.includes(fp.id);
                  const isHovered = hoveredId === fp.id;

                  return (
                    <motion.div
                      key={fp.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                      onMouseEnter={() => setHoveredId(fp.id)}
                      onMouseLeave={() => setHoveredId(null)}>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onToggle(fp.id)}
                        className={`relative overflow-hidden rounded-2xl w-full h-36 text-left group focus:outline-none transition-all duration-300 ${
                          isSelected ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(0,200,80,0.35)]' : ''
                        }`}>
                        <img src={fp.image} alt={fp.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? goalColors[goal] : 'from-black/85'} to-black/30 transition-all`} />

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                          <p className={`text-sm font-black uppercase leading-tight transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                            {fp.label}
                          </p>
                        </div>
                      </motion.button>

                      {/* Hover Overlay – passende Leistungen */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.97 }}
                            className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-card border border-primary/30 rounded-2xl p-3 shadow-xl pointer-events-none">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-primary" />
                              Passende Leistungen
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {fp.chips?.map(chip => (
                                <span key={chip} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                                  {chip}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={selected.length === 0}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 shadow-[0_0_30px_rgba(0,200,80,0.2)]">
          Weiter zur kurzen Analyse →
        </motion.button>
      </div>
    </div>
  );
}