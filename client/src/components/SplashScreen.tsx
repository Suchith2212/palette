import React, { useState, useEffect } from 'react';
import './SplashScreen.css';
import paletteIntroVideo from './palette-intro.mp4'; // Adjust path if necessary

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false); // Start as not visible by default
  const [shouldRender, setShouldRender] = useState(false); // Control if component should render at all

  useEffect(() => {
    // Check if user has seen the splash screen before
    const seenSplash = localStorage.getItem('hasSeenSplashScreen');
    if (!seenSplash) {
      setShouldRender(true); // Only render if splash screen has NOT been seen
      setIsVisible(true); // Make it visible to start the animation
    }
  }, []);

  const handleVideoEnd = () => {
    setIsVisible(false); // Start fade-out
    // Set the flag in localStorage ONLY after the video has ended
    localStorage.setItem('hasSeenSplashScreen', 'true');
    // After fade-out, remove component from DOM
    setTimeout(() => {
      setShouldRender(false);
    }, 800); // Match CSS transition duration
  };

  if (!shouldRender) {
    return null; // Don't render anything if it's not the first time or after fade-out
  }

  return (
    <div id="splash-screen" className={isVisible ? '' : 'hidden'}>
      <video id="welcome-video" muted autoPlay playsInline onEnded={handleVideoEnd}>
        <source src={paletteIntroVideo} type="video/mp4" />
        {/* <source src="palette-intro.webm" type="video/webm" /> */}
      </video>
    </div>
  );
};

export default SplashScreen;
