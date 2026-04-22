import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './RouteLoader.css';

interface RouteLoaderProps {
  active: boolean;
}

const brandText = 'Palette';

const RouteLoader: React.FC<RouteLoaderProps> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="route-loader-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          aria-live="polite"
          aria-label="Loading page"
        >
          <div className="route-loader-word" role="status">
            {brandText.split('').map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="route-loader-letter"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteLoader;
