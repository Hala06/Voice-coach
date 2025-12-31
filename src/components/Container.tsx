'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AmbientBackground } from './AmbientBackground';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  gradient?: 'hero' | 'subtle';
  ambientVariant?: 'blobs' | 'stars' | 'both' | 'none';
}

export function Container({
  children,
  className = '',
  gradient = 'subtle',
  ambientVariant = 'both',
}: ContainerProps) {
  const gradients = {
    hero: 'bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900',
    subtle: 'bg-gradient-to-b from-slate-900 to-slate-950',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen w-full relative ${gradients[gradient]} ${className}`}
    >
      <AmbientBackground variant={ambientVariant} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
