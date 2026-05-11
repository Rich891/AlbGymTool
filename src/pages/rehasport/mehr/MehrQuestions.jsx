import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  {
    id: 'frequency',
    question: 'Wie oft möchtest du realistisch zusätzlich trainieren?',
    options: [
      { id: '1x', label: '1× pro Woche', icon: '📅' },
      { id: '2x', label: '2× pro Woche', icon: '📆' },
      { id: '3plus', label: '3× oder mehr', icon: '🔥' },
      { id: 'flexible', label: 'Möglichst flexibel', icon: '⚡' },
    ],
  },
  {
    id: 'style',
    question: 'Wie möchtest du trainieren?',
    options: [
      { id: 'guided', label: 'Geführt & einfach', icon: '🎯' },
      { id: 'independent', label: 'Eigenständig mit Plan', icon: '📋' },
      { id: 'trainer', label: 'Mit Trainer-Unterstützung', icon: '🧑‍🏫' },
      { id: 'group', label: 'In Gruppe / mit Motivation', icon: '👥' },
    ],
  },
  {
    id: 'device_confidence',
    question: 'Wie sicher fühlst du dich aktuell an Geräten?',
    options: [
      { id: 'unsicher', label: 'Eher unsicher', icon: '😬' },
      { id: 'some_exp', label: 'Etwas Erfahrung', icon: '🙂' },
      { id: 'confident', label: 'Sicher', icon: '💪' },
      { id: 'improve_tech', label: 'Ich möchte Technik verbessern', icon: '🔧' },
    ],
  },
  {
    id: 'restrictions',
    question: 'Gibt es Einschränkungen, die wir beachten müssen?',
    options: [
      { id: 'back_neck', label: 'Rücken / Nacken', icon: '🔴' },
      { id: 'knee_hip', label: 'Knie / Hüfte / Gelenke', icon: '🔴' },
      { id: 'cardio', label: 'Herz-Kreislauf / Belastbarkeit', icon: '🔴' },
      { id: 'none', label: 'Keine relevanten', icon: '✅' },
    ],
  },
  {
    id: 'start_priority',
    question: 'Was ist dir für den Start am wichtigsten?',
    options: [
      { id: 'easy', label: 'Einfache Umsetzung', icon: '🟢' },
      { id: 'progress', label: 'Sichtbarer Fortschritt', icon: '📈' },
      { id: 'pain', label: 'Schmerzreduktion', icon: '💊' },
      { id: 'motivation', label: 'Motivation', icon: '⭐' },
    ],
  },
  {
    id: 'measure_progress',
    question: 'Möchtest du deinen Fortschritt messbar machen?',
    options: [
      { id: 'yes', label: 'Ja, unbedingt', icon: '📊' },
      { id: 'maybe', label: 'Vielleicht später', icon: '🤔' },
      { id: 'no', label: 'Nein, erstmal starten', icon: '🏃' },
    ],
  },
];

export default function MehrQuestions({ answers, onAnswer, onNext, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const safeQ = Math.min(currentQ, QUESTIONS.length - 1);
  const question = QUESTIONS[safeQ];
  const isLast = safeQ === QUESTIONS.length - 1;
  const canContinue = answers[question?.id] !== undefined;

  const handleSelect = (optionId) => {
    onAnswer(question.id, optionId);
    if (!isLast) {
      setTimeout(() => setCurrentQ(q => Math.min(q + 1, QUESTIONS.length - 1)), 350);
    }
  };

  const handleNext = () => {
    if (isLast) onNext();
    else setCurrentQ(q => q + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {QUESTIONS.map((_, i) => (
            <button key={i} onClick={() => i < currentQ || answers[QUESTIONS[i].id] ? setCurrentQ(i) : null}
              className={`transition-all duration-300 rounded-full ${
                i === currentQ ? 'w-8 h-2.5 bg-primary' :
                answers[QUESTIONS[i].id] ? 'w-2.5 h-2.5 bg-primary/60' :
                'w-2.5 h-2.5 bg-secondary'
              }`} />
          ))}
        </div>

        <div className="text-center mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
            Frage {currentQ + 1} von {QUESTIONS.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}>

            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight text-center mb-8">
              {question.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {question.options.map((opt, i) => {
                const isSelected = answers[question.id] === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(opt.id)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-[0_0_25px_rgba(0,200,80,0.25)]'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                    }`}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{opt.icon}</span>
                      <p className={`font-bold text-sm leading-tight transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                        {opt.label}
                      </p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

          </motion.div>
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={!canContinue}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40">
          {isLast ? 'Empfehlung erstellen →' : 'Weiter →'}
        </motion.button>
      </div>
    </div>
  );
}