import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

function formatDateValue(date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DateFilter({ selectedDate, onDateChange }) {
  const handleStep = (amount) => {
    const next = new Date(selectedDate);
    next.setUTCDate(next.getUTCDate() + amount);
    onDateChange(next);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <p className="font-inter font-semibold text-foreground text-sm">Filtrer par date</p>
          <p className="font-inter text-xs text-muted-foreground">Consulte les commandes du jour choisi</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center hover:bg-secondary/70 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <input
          type="date"
          value={formatDateValue(selectedDate)}
          onChange={(event) => {
            const next = new Date(`${event.target.value}T00:00:00Z`);
            onDateChange(next);
          }}
          className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm font-inter text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center hover:bg-secondary/70 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
