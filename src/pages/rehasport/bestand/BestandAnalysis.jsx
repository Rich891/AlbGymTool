import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png';

const STEPS_TEXT = [
  'Wir vergleichen deine Startdefizite mit deinem aktuellen Zustand',
  'Wir prüfen, welche Maßnahmen du bisher genutzt hast',
  'Wir gleichen deine Wünsche mit deinem bisherigen Weg ab',
  'Wir erstellen deine Empfehlung',
];

export default function BestandAnalysis({ onDone }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const stepDuration = 2200;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step < STEPS_TEXT.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setDone(true);
        setTimeout(onDone, 1200);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Scan line effect */}
      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <motion.img
            src={LOGO_URL}
            alt="AlbGym"
            className="w-20 h-20 object-contain"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Animated green scan line */}
        <div className="relative h-1 bg-secondary rounded-full mb-12 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            animate={{ width: `${((currentStep + 1) / STEPS_TEXT.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
          {/* Glow dot */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(0,230,80,0.8)]"
            animate={{ left: `calc(${((currentStep + 1) / STEPS_TEXT.length) * 100}% - 8px)` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>

        {/* Schritte */}
        <div className="space-y-3">
          {STEPS_TEXT.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: i <= currentStep ? 1 : 0.2 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-500 ${
                i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary animate-pulse' : 'bg-secondary'
              }`}>
                {i < currentStep && (
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {i === currentStep && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
              <p className={`text-sm font-medium transition-colors duration-500 ${
                i === currentStep ? 'text-foreground font-bold' : i < currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Done state */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 text-center">
              <p className="text-primary font-black text-xl uppercase tracking-widest">Auswertung bereit</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}