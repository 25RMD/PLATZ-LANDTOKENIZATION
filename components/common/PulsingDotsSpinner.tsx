"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PulsingDotsSpinnerProps {
  size?: number;
  color?: string; // Tailwind color class like 'bg-blue-500' or actual color value
  className?: string;
  dotClassName?: string; // Class for individual dots
}

const PulsingDotsSpinner: React.FC<PulsingDotsSpinnerProps> = ({
  size = 8,
  color,
  className = '',
  dotClassName = '',
}) => {
  const dotVariants = {
    initial: {
      y: '0%',
    },
    animate: {
      y: ['0%', '-70%', '0%'], // Pulse up and down
    },
  };

  const dotTransition = (delay: number) => ({
    duration: 0.7,
    repeat: Infinity,
    ease: 'easeInOut',
    delay,
  });

  // If a Tailwind bg color class is passed, use it. Otherwise, use a neutral default.
  const effectiveDotClassName = color 
    ? color 
    : 'bg-gray-500 dark:bg-gray-400';

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`} role="status" aria-label="Loading...">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${effectiveDotClassName} ${dotClassName}`}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
          }}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={dotTransition(i * 0.15)} // Stagger animation
        />
      ))}
    </div>
  );
};

export default PulsingDotsSpinner;
