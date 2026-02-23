import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { IEvent } from '../types/event';
import { IArtwork } from '../types/artwork';
import FadeInOnScroll from '../components/FadeInOnScroll';
import InfinitePhotoLoop from '../components/InfinitePhotoLoop';
import { toMediaUrl } from '../utils/mediaUrl';
import { FaEnvelope, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import paletteIntroVideo from '../components/palette-intro.mp4';

const HomePage = () => {
  const { isLoggedIn } = useAuth();
  const [showHeroIntro, setShowHeroIntro] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
  const [latestArtworks, setLatestArtworks] = useState<IArtwork[]>([]);
  const [pastEventsForLoop, setPastEventsForLoop] = useState<IEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [loadingPastEvents, setLoadingPastEvents] = useState(true);

  useEffect(() => {
    const heroIntroSeen = sessionStorage.getItem('paletteHeroIntroSeen');
    if (!heroIntroSeen) {
      setShowHeroIntro(true);
    }

    const fetchUpcomingEvents = async () => {
      try {
        const workshopsRes = await axios.get('/api/events/workshops');
        const competitionsRes = await axios.get('/api/events/competitions');
        const combined = [...workshopsRes.data, ...competitionsRes.data];
        const sorted = combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingEvents(sorted.slice(0, 3));
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    const fetchLatestArtworks = async () => {
      try {
        const res = await axios.get('/api/artwork');
        if (Array.isArray(res.data)) {
          setLatestArtworks(res.data.slice(0, 3));
        } else {
          setLatestArtworks([]);
        }
      } catch (error) {
        console.error('Error fetching latest artworks:', error);
      } finally {
        setLoadingArtworks(false);
      }
    };

    const fetchPastEventsForLoop = async () => {
      try {
        setLoadingPastEvents(true);
        const res = await axios.get('/api/events/past');
        if (Array.isArray(res.data)) {
          const eventsWithImages = res.data.filter((event: IEvent) =>
            event.imageUrl &&
            event.imageUrl.trim() !== '' &&
            !event.imageUrl.includes('placeholder.jpg') &&
            !event.imageUrl.includes('placeholder.png')
          );

          const sortedEvents = eventsWithImages.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setPastEventsForLoop(sortedEvents.slice(0, 12));
        } else {
          setPastEventsForLoop([]);
        }
      } catch (error) {
        console.error('Error fetching past events for loop:', error);
      } finally {
        setLoadingPastEvents(false);
      }
    };

    fetchUpcomingEvents();
    fetchLatestArtworks();
    fetchPastEventsForLoop();
  }, []);

  const handleHeroIntroComplete = () => {
    sessionStorage.setItem('paletteHeroIntroSeen', 'true');
    setShowHeroIntro(false);
  };

  useEffect(() => {
    if (!showHeroIntro) {
      return;
    }

    const timeoutId = window.setTimeout(handleHeroIntroComplete, 9000);
    return () => window.clearTimeout(timeoutId);
  }, [showHeroIntro]);

  const myPhotoLoopImages: string[] = pastEventsForLoop.map((event) => {
    if (event.imageUrl.startsWith('http')) {
      return event.imageUrl;
    }

    return toMediaUrl(event.imageUrl);
  });

  const eventDetails = pastEventsForLoop.map((event) => ({
    title: event.title,
    date: event.date,
    location: event.location,
    description: event.description,
  }));

  return (
    <>
      <div className="hero-section text-center">
        <div className="container">
          <div className="hero-panel">
            <p className="hero-kicker">A Creative Collective at IIT Gandhinagar</p>
            <div className="hero-text">
              <h1 className="main-title">Palette</h1>
              <p className="subtitle">IIT Gandhinagar</p>
              <p className="subtitle">Art Club</p>
            </div>
            {showHeroIntro && (
              <div className="hero-video-wrap">
                <video
                  className="hero-video"
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  onEnded={handleHeroIntroComplete}
                  onError={handleHeroIntroComplete}
                >
                  <source src={paletteIntroVideo} type="video/mp4" />
                </video>
              </div>
            )}
            <div className="hero-metrics" aria-label="Palette highlights">
              <span>Workshops</span>
              <span>Competitions</span>
              <span>Exhibitions</span>
              <span>Open Community</span>
            </div>
            <div className="hero-actions">
              <Link to="/e-exhibition" className="btn btn-outline-light btn-lg">
                View E-exhibition
              </Link>
              {isLoggedIn ? (
                <Link to="/submit-artwork" className="btn btn-primary btn-lg">
                  Submit Your Art
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg">
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {loadingPastEvents ? (
        <div className="text-center py-3">
          <p>Loading event highlights...</p>
        </div>
      ) : myPhotoLoopImages.length > 0 ? (
        <InfinitePhotoLoop
          images={myPhotoLoopImages}
          events={eventDetails}
          speed="normal"
          direction="left"
        />
      ) : (
        <div className="text-center py-3">
          <p>No past event photos available yet.</p>
        </div>
      )}

      <FadeInOnScroll>
        <section className="events-section py-5">
          <div className="container">
            <h2 className="text-center mb-4 page-title">Upcoming Events</h2>
            {loadingEvents ? (
              <div className="text-center">
                <p>Loading events...</p>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="row justify-content-center">
                {upcomingEvents.map((event) => (
                  <div className="col-md-4 mb-4" key={event._id}>
                    <div className="card h-100 event-card">
                      <div className="card-body">
                        <h5 className="card-title">{event.title}</h5>
                        <p className="card-text text-muted">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="card-text">{event.description.substring(0, 100)}...</p>
                        <Link
                          to={event.type === 'workshop' ? '/workshops' : '/competitions'}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p>No upcoming events are scheduled right now.</p>
              </div>
            )}
            <div className="text-center mt-4">
              <Link to="/workshops" className="btn btn-outline-secondary me-2">
                All Workshops
              </Link>
              <Link to="/competitions" className="btn btn-outline-secondary">
                All Competitions
              </Link>
            </div>
          </div>
        </section>
      </FadeInOnScroll>

      <FadeInOnScroll delay={200}>
        <section className="artworks-section py-5">
          <div className="container">
            <h2 className="text-center mb-4 page-title">Latest from the Gallery</h2>
            {loadingArtworks ? (
              <div className="text-center">
                <p>Loading artworks...</p>
              </div>
            ) : latestArtworks.length > 0 ? (
              <div className="row justify-content-center">
                {latestArtworks.map((artwork) => (
                  <div className="col-md-4 mb-4" key={artwork._id}>
                    <div className="card h-100 artwork-card">
                      <img src={toMediaUrl(artwork.imageUrl)} alt={artwork.title} className="card-img-top" />
                      <div className="card-body">
                        <h5 className="card-title">{artwork.title}</h5>
                        <p className="card-text">By: {artwork.artist.name}</p>
                        <Link to="/e-exhibition" className="btn btn-sm btn-outline-primary">
                          View in E-exhibition
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p>No artworks available yet.</p>
              </div>
            )}
            <div className="text-center mt-4">
              <Link to="/e-exhibition" className="btn btn-outline-secondary">
                View Full E-exhibition
              </Link>
            </div>
          </div>
        </section>
      </FadeInOnScroll>

      <FadeInOnScroll delay={400}>
        <section className="about-us-teaser py-5">
          <div className="container text-center">
            <h2 className="page-title mb-4">About Palette</h2>
            <div className="row justify-content-center mb-4">
              <div className="col-md-8">
                <p className="lead">
                  Palette is more than just a club; it's a vibrant community where creativity thrives. We host workshops,
                  competitions, and provide a platform for artists to showcase their talent.
                </p>
              </div>
            </div>
            <Link to="/team" className="btn btn-primary btn-lg">
              Learn More About Us
            </Link>
          </div>
        </section>
      </FadeInOnScroll>

      <section className="website-designer-section py-5 bg-light">
        <div className="container text-center">
          <h2 className="page-title mb-4">Website Designed By</h2>
          <div className="designer-info d-flex flex-column align-items-center">
            <img
              src={toMediaUrl('/uploads/exhibition/author.jpeg')}
              alt="Website Designer"
              className="rounded-circle mb-3"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <h3>S. J. V. Suchith</h3>
            <p className="text-muted mb-1">Btech'24</p>
            <p className="text-muted">
              Contact: <a href="mailto:24110313@iitgn.ac.in">24110313@iitgn.ac.in</a>
            </p>
            <div className="social-icons mt-3 d-flex justify-content-center gap-3">
              <a href="mailto:24110313@iitgn.ac.in" target="_blank" rel="noopener noreferrer" className="social-icon mail">
                <FaEnvelope size={30} />
              </a>
              <a href="https://www.linkedin.com/in/suchithv/" target="_blank" rel="noopener noreferrer" className="social-icon linkedin">
                <FaLinkedinIn size={30} />
              </a>
              <a href="https://www.instagram.com/suchith_v/" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                <FaInstagram size={30} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
