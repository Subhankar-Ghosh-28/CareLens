import React from 'react';
import { motion } from 'motion/react';

interface VoiceWaveformProps {
  isListening: boolean;
  color?: string;
  barsCount?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isListening,
  color = 'bg-teal-600',
  barsCount = 18
}) => {
  const bars = Array.from({ length: barsCount });

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4 py-2 bg-slate-100/80 rounded-full border border-slate-200">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={
            isListening
              ? {
                  height: [8, Math.sin(i * 0.7) * 24 + 12, 8],
                  opacity: [0.6, 1, 0.6]
                }
              : {
                  height: 6,
                  opacity: 0.3
                }
          }
          transition={
            isListening
              ? {
                  repeat: Infinity,
                  duration: 0.8 + (i % 4) * 0.15,
                  ease: 'easeInOut',
                  delay: (i % 5) * 0.08
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
};
