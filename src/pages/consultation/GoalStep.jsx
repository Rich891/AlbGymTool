import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { GOALS } from '@/lib/goalConfig';
import GoalIcon from '@/components/shared/GoalIcon';

export default function GoalStep({ selectedGoals, setSelectedGoals, onNext, onBack }) {
  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Was möchtest du erreichen?
        </h2>
        <p className="text-muted-foreground mt-2">
          Wähle alle Ziele aus, die dir wichtig sind
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
        {GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]
                ${isSelected 
                  ? `${goal.border} ${goal.bg} border-2` 
                  : 'border-border bg-card hover:bg-secondary'
                }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSelected ? goal.bg : 'bg-secondary'}`}>
                <GoalIcon iconName={goal.icon} className={`w-7 h-7 ${isSelected ? goal.color : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm font-semibold text-center leading-tight ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                {goal.label}
              </span>
              {isSelected && (
                <div className={`w-2 h-2 rounded-full ${goal.color.replace('text-', 'bg-')}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="h-14 px-6 text-base gap-2">
          <ArrowLeft className="w-5 h-5" /> Zurück
        </Button>
        <Button 
          onClick={onNext} 
          disabled={selectedGoals.length === 0}
          className="flex-1 h-14 text-base font-semibold gap-2"
        >
          Empfehlung berechnen <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}