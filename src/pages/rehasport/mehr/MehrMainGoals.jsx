import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const GOALS = [
  {
    id: 'figur',
    label: 'FIGUR',
    sub: 'Ich möchte mich wohler fühlen, Körperform verändern oder mein Gewicht gezielt angehen.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80',
    color: 'from-orange-900/80',
    accent: '#f97316',
  },
  {
    id: 'leistung',
    label: 'LEISTUNG',
    sub: 'Ich möchte stärker, belastbarer, fitter oder koordinierter werden.',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=80',
    color: 'from-blue-900/80',
    accent: '#3b82f6',
  },
  {
    id: 'gesundheit',
    label: 'GESUNDHEIT',
    sub: 'Ich möchte Beschwerden reduzieren, stabiler werden und meinen Alltag besser meistern.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80',
    color: 'from-green-900/80',
    accent: '#22c55e',
  },
];

export default function MehrMainGoals({ customerName, selected, weights, onToggle, onWeightChange, onNext, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Ich möchte mehr tun</p>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            WAS MÖCHTEST DU<br /><span className="text-primary">ERREICHEN{customerName ? `, ${customerName.split(' ')[0].toUpperCase()}` : ''}?</span>
          </h1>
          <p className="text-muted-foreground">Wähle aus, in welchen Bereichen du dich gezielt weiterentwickeln möchtest.</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {GOALS.map((goal, i) => {
            const isSelected = selected.includes(goal.id);
            const weight = weights[goal.id] ?? 75;

            return (
              <div key={goal.id} className="flex flex-col">
                {/* Slider erscheint ÜBER dem Button wenn ausgewählt */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden">
                      <div className="bg-card border border-border rounded-2xl px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-foreground">Wie wichtig ist dir {goal.label}?</p>
                          <span className="text-2xl font-black text-primary">{weight}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={weight}
                          onChange={e => onWeightChange(goal.id, Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Weniger wichtig</span>
                          <span>Sehr wichtig</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Goal Card */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: isSelected ? 4 : 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onToggle(goal.id)}
                  className={`relative overflow-hidden rounded-3xl h-40 text-left group focus:outline-none transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-primary shadow-[0_0_40px_rgba(0,200,80,0.35)]' : ''
                  }`}>
                  <img src={goal.image} alt={goal.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${goal.color} to-black/40 transition-all`} />

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center z-10 shadow-lg">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </motion.div>
                  )}

                  <div className="absolute inset-0 flex flex-col justify-center px-8 z-10">
                    <h3 className={`text-3xl font-black uppercase transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                      {goal.label}
                    </h3>
                    <p className="text-sm text-white/75 mt-1 max-w-md leading-snug">{goal.sub}</p>
                  </div>

                  {/* Green border glow on select */}
                  <div className={`absolute inset-0 rounded-3xl border-2 transition-all duration-300 ${
                    isSelected ? 'border-primary/70' : 'border-transparent group-hover:border-white/20'
                  }`} />
                </motion.button>
              </div>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={selected.length === 0}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 shadow-[0_0_30px_rgba(0,200,80,0.25)]">
          Fokuspunkte wählen →
        </motion.button>
      </div>
    </div>
  );
}