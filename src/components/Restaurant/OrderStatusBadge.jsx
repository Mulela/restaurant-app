import React from 'react';
import { Clock, ChefHat, CircleCheck } from 'lucide-react';

const statusConfig = {
  en_attente: {
    label: 'En attente',
    icon: Clock,
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    textClass: 'text-yellow-400',
  },
  en_preparation: {
    label: 'En preparation',
    icon: ChefHat,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-400',
  },
  prete: {
    label: 'Prete',
    icon: CircleCheck,
    bgClass: 'bg-green-500/10 border-green-500/30',
    textClass: 'text-green-400',
  },
};

export default function OrderStatusBadge({ statut, size = 'sm' }) {
  const config = statusConfig[statut] || statusConfig.en_attente;
  const Icon = config.icon;

  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-sm gap-2' : 'px-3 py-1.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-inter font-semibold rounded-full border ${config.bgClass} ${config.textClass} ${sizeClasses}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}
