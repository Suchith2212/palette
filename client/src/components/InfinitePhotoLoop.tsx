import React, { useMemo } from 'react';
import './InfinitePhotoLoop.css';

interface InfinitePhotoLoopProps {
  images: string[];
  events?: Array<{
    title: string;
    date: string | Date;
    location?: string;
    description?: string;
  }>;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
}

const InfinitePhotoLoop: React.FC<InfinitePhotoLoopProps> = ({
  images,
  events = [],
  direction = 'left',
  speed = 'normal',
}) => {
  const speedMap = useMemo(
    () => ({
      slow: '40s',
      normal: '35s',
      fast: '15s',
    }),
    []
  );

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const validImages = useMemo(
    () => images.filter((img) => img && typeof img === 'string' && img.trim() !== ''),
    [images]
  );

  if (validImages.length === 0) {
    return null;
  }

  const loopedImages = useMemo(() => [...validImages, ...validImages], [validImages]);
  const loopedEvents = useMemo(() => [...events, ...events], [events]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="infinite-photo-loop-container">
      <div className="fade-left"></div>
      <div className="fade-right"></div>

      <div
        className={`infinite-photo-loop-track infinite-photo-loop-${direction}`}
        style={{ animationDuration: speedMap[speed] }}
        role="region"
        aria-label="Event photos carousel"
      >
        {loopedImages.map((imageUrl, index) => {
          const event = loopedEvents[index % validImages.length];

          return (
            <div className="photo-item" key={`${imageUrl}-${index}`}>
              <img
                src={imageUrl}
                alt={event?.title || `Event ${(index % validImages.length) + 1}`}
                loading="lazy"
                draggable="false"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />

              {event && (
                <div className="photo-item-overlay">
                  <div className="photo-item-details">
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-date">{formatDate(event.date)}</p>
                    {event.location && <p className="event-location">{event.location}</p>}
                    {event.description && (
                      <p className="event-description">
                        {event.description.substring(0, 80)}
                        {event.description.length > 80 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfinitePhotoLoop;
