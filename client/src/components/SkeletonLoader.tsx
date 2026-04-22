import React from 'react';
import './SkeletonLoader.css';

interface SkeletonCardProps {
  variant?: 'card' | 'artwork' | 'event' | 'team' | 'text';
  count?: number;
}

const SkeletonCard: React.FC<{ variant: string }> = ({ variant }) => {
  if (variant === 'artwork') {
    return (
      <div className="skeleton-artwork-card">
        <div className="skeleton skeleton-img-tall" />
        <div className="skeleton-artwork-meta">
          <div className="skeleton skeleton-line skeleton-line-wide" />
          <div className="skeleton skeleton-line skeleton-line-short" />
        </div>
      </div>
    );
  }

  if (variant === 'event') {
    return (
      <div className="skeleton-event-card">
        <div className="skeleton skeleton-img" />
        <div className="skeleton-event-body">
          <div className="skeleton skeleton-badge" />
          <div className="skeleton skeleton-line skeleton-line-wide" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line-short" />
          <div className="skeleton skeleton-btn" />
        </div>
      </div>
    );
  }

  if (variant === 'team') {
    return (
      <div className="skeleton-team-card">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton skeleton-line skeleton-line-short" style={{ margin: '0.6rem auto 0.3rem' }} />
        <div className="skeleton skeleton-line" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="skeleton-text-block">
        <div className="skeleton skeleton-line skeleton-line-wide" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line-short" />
      </div>
    );
  }

  // Default card
  return (
    <div className="skeleton-generic-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-card-body">
        <div className="skeleton skeleton-line skeleton-line-wide" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line-short" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
};

const SkeletonLoader: React.FC<SkeletonCardProps> = ({ variant = 'card', count = 3 }) => {
  return (
    <div className={`skeleton-grid skeleton-grid--${variant}`} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
