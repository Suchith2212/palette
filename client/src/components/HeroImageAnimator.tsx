import React, { useState, useEffect } from 'react';
import './HeroImageAnimator.css';
import InfinitePhotoLoop from './InfinitePhotoLoop';
      
interface HeroImageAnimatorProps {
  images: string[]; // Array of image URLs
  duration?: number; // How long each image is visible (in ms)
  transitionDuration?: number; // How long the fade transition takes (in ms)
}

const HeroImageAnimator: React.FC<HeroImageAnimatorProps> = ({
  images,
  duration = 10000, // Match the animation duration
  transitionDuration = 1500, // Slower fade
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, duration);

    return () => clearInterval(interval);
  }, [images, duration]);

  if (!images || images.length === 0) {
    return null; // Or a fallback div
  }

  return (
    <div className="hero-image-animator">
      {images.map((image, index) => {
        const isActive = index === currentImageIndex;
        return (
          <div
            key={image}
            className={`hero-image-slide ${isActive ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${image})`,
              transition: `opacity ${transitionDuration}ms ease-in-out`,
            }}
          />
        );
      })}
      <div className="hero-image-overlay" /> {/* Subtle overlay for text readability */}
    </div>
  );
};

export default HeroImageAnimator;

