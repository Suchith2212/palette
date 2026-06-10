import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const seenSplash = localStorage.getItem('hasSeenSplashScreen');
    if (!seenSplash) {
      setShouldRender(true);
      setIsVisible(true);
      const timeoutId = window.setTimeout(() => {
        localStorage.setItem('hasSeenSplashScreen', 'true');
        setIsVisible(false);
        window.setTimeout(() => setShouldRender(false), 800);
      }, 2400);
      return () => window.clearTimeout(timeoutId);
    }
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div id="splash-screen" className={isVisible ? '' : 'hidden'} role="presentation">
      <div className="splash-brand">
        <span className="splash-mark" aria-hidden="true">✦</span>
        <p className="splash-title">Palette</p>
        <p className="splash-subtitle">Art Club · IIT Gandhinagar</p>
      </div>
    </div>
  );
};

export default SplashScreen;
