import React from 'react';
import { Clock, ChefHat, CircleCheck } from 'lucide-react';

const steps = [
  { key: 'en_attente', label: 'En attente', icon: Clock },
  { key: 'en_preparation', label: 'En preparation', icon: ChefHat },
  { key: 'prete', label: 'Prete', icon: CircleCheck },
];

export default function OrderProgressBar({ statut }) {
  const currentIndex = steps.findIndex((step) => step.key === statut);

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                    : isCompleted
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`font-inter text-xs text-center leading-tight ${
                  isActive
                    ? 'text-primary font-semibold'
                    : isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full -mt-5 transition-all duration-500 ${
                  index < currentIndex ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
