'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  delay?: number;
}

export function Card({ children, className = '', glass = true, hover = true, delay = 0 }: CardProps) {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';
  const glassStyles = 'glass-morphism';
  const hoverStyles = hover ? 'hover:shadow-xl hover:shadow-purple-500/20' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${baseStyles} ${glass ? glassStyles : ''} ${hoverStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
}
