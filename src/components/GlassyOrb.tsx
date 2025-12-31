'use client';

import { motion } from 'framer-motion';

interface GlassyOrbProps {
  isThinking?: boolean;
  size?: 'md' | 'lg' | 'xl';
}

export function GlassyOrb({ isThinking = false, size = 'lg' }: GlassyOrbProps) {
  const sizeMap = {
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <motion.div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-300 relative overflow-hidden shadow-2xl`}
      animate={isThinking ? { scale: [1, 1.1, 1] } : {}}
      transition={isThinking ? { duration: 2, repeat: Infinity } : {}}
    >
      {/* Liquid gradient effect */}
      <motion.div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />

      {/* Particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            repeatType: 'loop' as const,
          }}
          style={{
            top: `${30 + i * 20}%`,
            left: `${30 + i * 20}%`,
          }}
        />
      ))}

      {/* Breathing effect */}
      {isThinking && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
