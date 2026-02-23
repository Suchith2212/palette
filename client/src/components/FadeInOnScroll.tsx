import React, { useRef, useEffect, useState } from 'react';
import './FadeInOnScroll.css';

interface FadeInOnScrollProps {
  children: React.ReactNode;
  delay?: number; // Delay in ms before animation starts
  duration?: number; // Duration in ms of the animation
  offset?: string; // CSS offset (e.g., '0px 0px -10% 0px') for when to trigger
}

const FadeInOnScroll: React.FC<FadeInOnScrollProps> = ({ children, delay = 0, duration = 1000, offset = '0px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Stop observing once visible
        }
      });
    }, {
      rootMargin: offset,
      threshold: 0.1, // Trigger when 10% of the item is visible
    });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    // Cleanup
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, [offset]);

  return (
    <div
      className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
      ref={domRef}
    >
      {children}
    </div>
  );
};

export default FadeInOnScroll;
