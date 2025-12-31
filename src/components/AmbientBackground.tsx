'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AmbientBackgroundProps {
  variant?: 'blobs' | 'stars' | 'both' | 'none';
}

export function AmbientBackground({ variant = 'both' }: AmbientBackgroundProps) {
  if (variant === 'none') return null;

  const stars = useMemo(() => {
    const mulberry32 = (seed: number) => {
      return () => {
        let t = seed += 0x6d2b79f5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const rng = mulberry32(1337);
    return Array.from({ length: 40 }).map(() => ({
      top: `${rng() * 100}%`,
      left: `${rng() * 100}%`,
      duration: 3 + rng() * 2,
      delay: rng() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {(variant === 'blobs' || variant === 'both') && (
        <>
          <motion.div
            className="absolute top-10 left-4 w-72 h-72 bg-purple-500/25 rounded-full blur-3xl"
            animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-10 right-0 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl"
            animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </>
      )}

      {(variant === 'stars' || variant === 'both') && (
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <motion.span
              key={i}
              className="absolute w-1 h-1 bg-white/70 rounded-full"
              style={{
                top: star.top,
                left: star.left,
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
