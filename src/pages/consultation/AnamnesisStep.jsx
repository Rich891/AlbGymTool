import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'main_goal',
    question: 'Was ist dein wichtigstes Ziel?',
    options: ['Abnehmen', 'Muskelaufbau', 'Rücken/Schmerzen lindern', 'Fitter werden', 'Stress abbauen', 'Einfach starten'],
    multi: false,
  },
  {
    id: 'barriers',
    question: 'Was hat dich bisher vom Training abgehalten?',
    options: ['Zeitmangel', 'Unsicherheit an Geräten', 'Motivation', 'Schmerzen/Beschwerden', 'Kosten', 'Nichts – bin motiviert!'],
    multi: true,
  },
  {
    id: 'frequency',
    question: 'Wie oft möchtest du realistisch trainieren?',
    options: ['1× pro Woche', '2× pro Woche', '3× pro Woche', '4× oder öfter'],
    multi: false,
  },
  {
    id: 'confidence',
    question: 'Wie sicher fühlst du dich an Geräten?',
    options: ['Gar nicht – brauche Anleitung', 'Ein wenig Erfahrung', 'Fühle mich sicher', 'Sehr erfahren'],
    multi: false,
  },
  {
    id: 'complaints',
    question: 'Gibt es Beschwerden oder Einschränkungen?',
    options: ['Rücken', 'Knie/Hüfte', 'Schulter/Nacken', 'Herz-Kreislauf', 'Keine Beschwerden'],
    multi: true,
  },
  {
    id: 'training_style',
    question: 'Willst du lieber frei trainieren oder geführt werden?',
    options: ['Geführt – ich brauche Struktur', 'Mix aus beidem', 'Frei trainieren – ich weiß was ich tue'],
    multi: false,
  },
  {
    id: 'wellness',
    question: 'Ist dir Wellness/Regeneration wichtig?',
    options: ['Ja, sehr!', 'Wäre schön', 'Nicht so wichtig', 'Nein'],
    multi: false,
  },
  {
    id: 'approach',
    question: 'Möchtest du möglichst einfach starten oder maximal individuell?',
    options: ['Einfach und schnell starten', 'Ausgewogen', 'Maximaler individueller Plan'],
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
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      setAnamnesis(prev => ({ ...prev, [question.id]: updated }));
    } else {
      setAnamnesis(prev => ({ ...prev, [question.id]: option }));
      // Auto-advance for single-select
      if (currentQ < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQ(currentQ + 1), 300);
      }
    }
  };

  const isSelected = (option) => {
    if (question.multi) {
      return (anamnesis[question.id] || []).includes(option);
    }
    return anamnesis[question.id] === option;
  };

  const canProceed = anamnesis[question.id] && 
    (question.multi ? anamnesis[question.id].length > 0 : true);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Frage {currentQ + 1} von {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center py-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {question.question}
        </h2>
        {question.multi && (
          <p className="text-sm text-muted-foreground mt-2">Mehrfachauswahl möglich</p>
        )}
      </div>

      {/* Answer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              ${isSelected(option) 
                ? 'border-primary bg-primary/10 text-foreground' 
                : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30 hover:bg-secondary'
              }`}
          >
            <span className="text-base md:text-lg font-medium">{option}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={currentQ > 0 ? () => setCurrentQ(currentQ - 1) : onBack}
          className="h-14 px-6 text-base gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Zurück
        </Button>
        {question.multi && (
          <Button
            onClick={() => {
              if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(currentQ + 1);
              } else {
                onNext();
              }
            }}
            disabled={!canProceed}
            className="flex-1 h-14 text-base font-semibold gap-2"
          >
            {currentQ < QUESTIONS.length - 1 ? 'Weiter' : 'Zur Zielauswahl'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
        {!question.multi && currentQ === QUESTIONS.length - 1 && (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 h-14 text-base font-semibold gap-2"
          >
            Zur Zielauswahl <ArrowRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}