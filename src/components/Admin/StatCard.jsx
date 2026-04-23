import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon, colorClass, delay = 0 }) {
  const MotionDiv = motion.div;
  const Icon = icon;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="font-inter text-xs text-muted-foreground leading-tight">{label}</p>
        <p className="font-inter font-black text-foreground text-2xl leading-tight mt-0.5">{value}</p>
      </div>
    </MotionDiv>
  );
}
