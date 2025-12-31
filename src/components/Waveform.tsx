'use client';

import { motion } from 'framer-motion';

interface WaveformProps {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  barCount?: number;
  levels?: number[];
}

export function Waveform({ isActive = false, size = 'md', barCount = 40, levels }: WaveformProps) {
  const sizeMap = {
    sm: { height: 'h-8', gap: 'gap-0.5' },
    md: { height: 'h-12', gap: 'gap-1' },
    lg: { height: 'h-20', gap: 'gap-1.5' },
  };

  return (
    <motion.div
      className={`flex items-center justify-center ${sizeMap[size].gap}`}
      animate={isActive ? 'active' : 'inactive'}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const level = levels?.[i] ?? null;
        const isCenter = Math.abs(i - barCount / 2) < barCount / 4;
        const fallbackHeight = Math.random() * 0.8 + 0.2;

        return (
          <motion.div
            key={i}
            className={`w-1 ${sizeMap[size].height} bg-gradient-to-t from-blue-400 to-purple-400 rounded-full`}
            variants={{
              active: {
                scaleY:
                  level !== null
                    ? Math.max(0.2, level)
                    : isCenter
                      ? fallbackHeight
                      : 0.3 + Math.random() * 0.4,
                transition: {
                  duration: 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse' as const,
                },
              },
              inactive: {
                scaleY: 0.2,
                transition: { duration: 0.3 },
              },
            }}
          />
        );
      })}
    </motion.div>
  );
}
