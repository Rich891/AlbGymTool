import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFocusLabel } from './scoringEngine';

const LOGO_URL = 'https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png';

const STEPS_TEXT = [
  { text: 'Wir gewichten deine Ziele', icon: '🎯' },
  { text: 'Wir prüfen passende Leistungen', icon: '🔍' },
  { text: 'Wir gleichen deine Einschränkungen ab', icon: '⚖️' },
  { text: 'Wir bewerten mögliche Kombinationen', icon: '🧩' },
  { text: 'Wir erstellen dein Paket', icon: '📦' },
];

// Particles
function Particle({ index }) {
  const x = Math.random() * 100;
  const delay = Math.random() * 3;
  const duration = 2 + Math.random() * 3;
  const size = 2 + Math.random() * 4;

  return (
    <motion.div
      className="absolute rounded-full bg-primary/40"
      style={{ left: `${x}%`, bottom: '-10px', width: size, height: size }}
      animate={{ y: [0, -(300 + Math.random() * 200)], opacity: [0, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function MehrAnalysis({ mainGoals, focusPoints, onDone }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [activeChips, setActiveChips] = useState([]);

  const goalIcons = { figur: '⚖️', leistung: '⚡', gesundheit: '💚' };
  const goalColors = { figur: 'text-orange-400', leistung: 'text-blue-400', gesundheit: 'text-primary' };

  useEffect(() => {
    const stepDuration = 1800;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step < STEPS_TEXT.length) {
        setCurrentStep(step);
        // Chips progressiv einblenden
        if (step >= 2 && focusPoints.length > 0) {
          const fp = focusPoints[Math.min(step - 2, focusPoints.length - 1)];
          setActiveChips(prev => [...prev, getFocusLabel(fp)]);
        }
      } else {
        clearInterval(interval);
        setDone(true);
        setTimeout(onDone, 1500);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onDone, focusPoints]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Scan lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-primary"
            style={{ top: `${10 + i * 12}%` }}
            animate={{ opacity: [0, 0.5, 0], scaleX: [0, 1, 0] }}
            transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => <Particle key={i} index={i} />)}
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Logo pulse */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.img
              src={LOGO_URL}
              alt="AlbGym"
              className="w-20 h-20 object-contain relative z-10"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Gewählte Ziele – Icons */}
        <div className="flex justify-center gap-4 mb-8">
          {mainGoals.map(goal => (
            <motion.div
              key={goal}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl ${goalColors[goal]}`}>
              {goalIcons[goal]}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="relative h-1 bg-secondary rounded-full mb-8 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            animate={{ width: `${((currentStep + 1) / STEPS_TEXT.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full shadow-[0_0_20px_rgba(0,230,80,0.9)]"
            animate={{ left: `calc(${((currentStep + 1) / STEPS_TEXT.length) * 100}% - 10px)` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>

        {/* Schritte */}
        <div className="space-y-3 mb-8">
          {STEPS_TEXT.map((step, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i <= currentStep ? 1 : 0.2 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4">
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm transition-all duration-500 ${
                i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary animate-pulse' : 'bg-secondary'
              }`}>
                {i < currentStep ? (
                  <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={i === currentStep ? 'text-primary-foreground text-sm' : 'text-muted-foreground text-sm'}>
                    {step.icon}
                  </span>
                )}
              </div>
              <p className={`text-sm transition-colors duration-500 ${
                i === currentStep ? 'text-foreground font-black' : i < currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}>
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Fokuspunkt-Chips die aufleuchten */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {activeChips.map((fp, i) => (
              <motion.span
                key={fp}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/40 text-primary text-xs font-bold">
                {fp}
              </motion.span>
            ))}
          </div>
        )}

        {/* Done state */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="text-center">
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(0,230,80,0.3)', '0 0 50px rgba(0,230,80,0.6)', '0 0 20px rgba(0,230,80,0.3)'] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="inline-block px-8 py-3 rounded-2xl bg-primary/10 border border-primary/50">
                <p className="text-primary font-black text-xl uppercase tracking-widest">
                  DEINE EMPFEHLUNG IST BEREIT ✓
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}