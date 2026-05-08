import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Wir analysieren deine Ziele ...',
  'Wir prüfen deine Ausgangslage ...',
  'Wir bewerten passende Trainingswege ...',
  'Wir erstellen deine Empfehlung ...',
];

export default function AnalysisScreen({ onDone }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const total = 3200; // ms
    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min(100, (elapsed / total) * 100));
      setMsgIndex(Math.min(MESSAGES.length - 1, Math.floor((elapsed / total) * MESSAGES.length)));
      if (elapsed >= total) {
        clearInterval(timer);
        setDone(true);
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Logo mark */}
      <motion.img
        src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png"
        alt="AlbGym"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 object-contain mb-12"
      />

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 w-full max-w-sm"
          >
            {/* Animated rings */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border-4 border-transparent border-t-primary/40"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Cycling text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-lg text-muted-foreground font-medium"
              >
                {MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-full">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="space-y-6"
          >
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto"
            >
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
                DEINE EMPFEHLUNG<br />
                <span className="text-primary">IST BEREIT</span>
              </h2>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={onDone}
              className="mt-4 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg uppercase tracking-wide hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Empfehlung ansehen →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}