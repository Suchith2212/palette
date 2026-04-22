import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface FadeInOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  className?: string;
}

const FadeInOnScroll: React.FC<FadeInOnScrollProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-70px' });

  const offsets: Record<string, { x: number; y: number }> = {
    up:    { x: 0,   y: 32 },
    left:  { x: -32, y: 0  },
    right: { x: 32,  y: 0  },
    none:  { x: 0,   y: 0  },
  };

  const offset = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInOnScroll;
