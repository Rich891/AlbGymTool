import React from 'react';
import { Check } from 'lucide-react';

export default function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <React.Fragment key={index}>
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                ${isCompleted ? 'bg-primary text-primary-foreground' : 
                  isCurrent ? 'bg-primary/20 text-primary border border-primary/40' : 
                  'bg-secondary text-muted-foreground'}`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`hidden md:block text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full min-w-[20px] ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}