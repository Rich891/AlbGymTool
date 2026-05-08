import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'main_feeling',
    question: 'Was möchtest du bei uns am meisten verändern?',
    options: [
      { text: 'Ich möchte mich wieder wohler in meinem Körper fühlen', emoji: '✨' },
      { text: 'Ich will fitter, kräftiger und belastbarer werden', emoji: '💪' },
      { text: 'Ich will Schmerzen und Einschränkungen angehen', emoji: '🩹' },
      { text: 'Ich suche eine einfache Lösung für meinen Alltag', emoji: '🎯' },
      { text: 'Ich möchte gezielt etwas für meine Gesundheit tun', emoji: '❤️' },
      { text: 'Ich will Stress abbauen und Energie tanken', emoji: '🧘' },
    ],
    multi: false,
  },
  {
    id: 'barriers',
    question: 'Was hat dich bisher vom Training abgehalten?',
    options: [
      { text: 'Keine Zeit im Alltag', emoji: '⏰' },
      { text: 'Unsicherheit – ich kenne die Geräte nicht', emoji: '🤔' },
      { text: 'Körperliche Beschwerden oder Schmerzen', emoji: '🩹' },
      { text: 'Fehlende Motivation alleine', emoji: '😴' },
      { text: 'Nichts – ich bin bereit und motiviert!', emoji: '🚀' },
    ],
    multi: true,
  },
  {
    id: 'confidence',
    question: 'Wie sicher fühlst du dich beim Training?',
    options: [
      { text: 'Gar nicht – ich brauche Anleitung und Struktur', emoji: '🆕' },
      { text: 'Ein bisschen Erfahrung, aber unsicher', emoji: '🤷' },
      { text: 'Ich fühle mich sicher und kenne mich aus', emoji: '👍' },
      { text: 'Sehr erfahren – ich weiß genau was ich tue', emoji: '🏆' },
    ],
    multi: false,
  },
  {
    id: 'frequency',
    question: 'Wie oft möchtest du realistisch trainieren?',
    options: [
      { text: '1× pro Woche – wenig Zeit, aber konstant', emoji: '📅' },
      { text: '2–3× pro Woche – das passt gut in meinen Alltag', emoji: '📆' },
      { text: '4× oder öfter – ich will richtig Gas geben', emoji: '🔥' },
    ],
    multi: false,
  },
  {
    id: 'complaints',
    question: 'Gibt es Beschwerden, die wir berücksichtigen sollen?',
    options: [
      { text: 'Rücken- oder Nackenbeschwerden', emoji: '🦴' },
      { text: 'Knie- oder Hüftprobleme', emoji: '🦵' },
      { text: 'Schulter- oder Armbeschwerden', emoji: '💪' },
      { text: 'Herz-Kreislauf – ich bin vorsichtig', emoji: '❤️' },
      { text: 'Keine – mir geht es gut', emoji: '✅' },
    ],
    multi: true,
  },
  {
    id: 'training_style',
    question: 'Was wäre dir für deinen Start besonders wichtig?',
    options: [
      { text: 'Geführt und strukturiert – ich brauche einen Plan', emoji: '📋' },
      { text: 'Mix – manchmal geführt, manchmal frei', emoji: '⚖️' },
      { text: 'Frei trainieren – ich entscheide selbst', emoji: '🎮' },
    ],
    multi: false,
  },
  {
    id: 'wellness',
    question: 'Ist Wellness und Entspannung nach dem Training wichtig für dich?',
    options: [
      { text: 'Ja, sehr! Regeneration ist mir wichtig', emoji: '🛁' },
      { text: 'Wäre schön, aber kein Muss', emoji: '😊' },
      { text: 'Nein – ich komme wegen des Trainings', emoji: '🏋️' },
    ],
    multi: false,
  },
];

export default function AnamnesisStep({ anamnesis, setAnamnesis, onNext, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const handleSelect = (option) => {
    if (question.multi) {
      const current = anamnesis[question.id] || [];
      const updated = current.includes(option.text)
        ? current.filter(o => o !== option.text)
        : [...current, option.text];
      setAnamnesis(prev => ({ ...prev, [question.id]: updated }));
    } else {
      setAnamnesis(prev => ({ ...prev, [question.id]: option.text }));
      if (currentQ < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQ(currentQ + 1), 280);
      } else {
        setTimeout(() => onNext(), 280);
      }
    }
  };

  const isSelected = (option) => {
    if (question.multi) return (anamnesis[question.id] || []).includes(option.text);
    return anamnesis[question.id] === option.text;
  };

  const canProceed = anamnesis[question.id] &&
    (question.multi ? (anamnesis[question.id] || []).length > 0 : true);

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) setCurrentQ(currentQ + 1);
    else onNext();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Frage {currentQ + 1} von {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col px-6 pt-8 pb-4"
        >
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 leading-tight">
            {question.question}
          </h2>
          {question.multi && (
            <p className="text-sm text-muted-foreground mb-6">Mehrfachauswahl möglich</p>
          )}

          {/* Answer cards */}
          <div className="grid grid-cols-1 gap-3 mt-4">
            {question.options.map((option) => {
              const selected = isSelected(option);
              return (
                <button
                  key={option.text}
                  onClick={() => handleSelect(option)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]
                    ${selected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50 text-foreground'
                    }`}
                >
                  <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                  <span className="text-base font-semibold leading-snug">{option.text}</span>
                  {selected && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="px-6 pb-8 pt-4 flex gap-3">
        <button
          onClick={currentQ > 0 ? () => setCurrentQ(currentQ - 1) : onBack}
          className="h-14 px-6 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center gap-2 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {question.multi && (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Weiter →
          </button>
        )}
      </div>
    </div>
  );
}