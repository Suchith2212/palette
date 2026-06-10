import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import './HomePage.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../services/api';
import { IEvent } from '../types/event';
import { IArtwork } from '../types/artwork';
import InfinitePhotoLoop from '../components/InfinitePhotoLoop';
import SkeletonLoader from '../components/SkeletonLoader';
import { toMediaUrl } from '../utils/mediaUrl';
import { FaPaintBrush, FaTrophy, FaCamera, FaUsers } from 'react-icons/fa';

/* ── Animated counter hook ── */
const useCounter = (target: number, start: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame = 0;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start]);
  return count;
};

/* ── Reusable scroll-triggered Section ── */
const Section: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
};

/* ── Stat item ── */
const StatItem: React.FC<{ icon: React.ReactNode; value: number; suffix?: string; label: string; start: boolean }> = ({
  icon, value, suffix = '+', label, start,
}) => {
  const count = useCounter(value, start);
  return (
    <div className="stat-item">
      <div className="stat-icon">{icon}</div>
      <span className="stat-value">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

/* ─────────────────────────────────────────── */

const formatDisplayDate = (value: Date | string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'TBA';
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getShortText = (text: string | undefined, maxLength = 110) =>
  !text ? 'Details coming soon.' : text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;

type HomeStats = {
  workshops: number;
  competitions: number;
  artworks: number;
  engaged: number;
};

const DEFAULT_HOME_STATS: HomeStats = {
  workshops: 25,
  competitions: 12,
  artworks: 100,
  engaged: 600,
};

/* ─────────────────────────────────────────── */

const HomePage = () => {
  const { isLoggedIn, user } = useAuth();
  const [showHeroIntro, setShowHeroIntro] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
  const [latestArtworks, setLatestArtworks] = useState<IArtwork[]>([]);
  const [pastEventsForLoop, setPastEventsForLoop] = useState<IEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [loadingPastEvents, setLoadingPastEvents] = useState(true);
  const [homeStats, setHomeStats] = useState<HomeStats>(DEFAULT_HOME_STATS);
  const [statsDraft, setStatsDraft] = useState<HomeStats>(DEFAULT_HOME_STATS);
  const [statsSaving, setStatsSaving] = useState(false);
  const [statsMessage, setStatsMessage] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  useEffect(() => {
    const heroIntroSeen = sessionStorage.getItem('paletteHeroIntroSeen');
    if (!heroIntroSeen) setShowHeroIntro(true);

    const fetchUpcomingEvents = async () => {
      try {
        const [workshopsRes, competitionsRes] = await Promise.all([
          axios.get('/api/events/workshops'),
          axios.get('/api/events/competitions'),
        ]);
        const combined = [...workshopsRes.data, ...competitionsRes.data];
        const sorted = combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingEvents(sorted.slice(0, 3));
      } catch { /* silent */ } finally { setLoadingEvents(false); }
    };

    const fetchLatestArtworks = async () => {
      try {
        const res = await axios.get('/api/artwork');
        setLatestArtworks(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
      } catch { /* silent */ } finally { setLoadingArtworks(false); }
    };

    const fetchPastEventsForLoop = async () => {
      try {
        const res = await axios.get('/api/events/loop');
        if (Array.isArray(res.data)) {
          const withImages = res.data.filter((e: IEvent) =>
            e.imageUrl && e.imageUrl.trim() !== '' &&
            !e.imageUrl.includes('placeholder')
          );
          const sorted = withImages.sort((a: IEvent, b: IEvent) => {
            const orderA = (a as any).loopOrder ?? Number.MAX_SAFE_INTEGER;
            const orderB = (b as any).loopOrder ?? Number.MAX_SAFE_INTEGER;
            return orderA !== orderB ? orderA - orderB : new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setPastEventsForLoop(sorted.slice(0, 12));
        }
      } catch { /* silent */ } finally { setLoadingPastEvents(false); }
    };

    const fetchHomeStats = async () => {
      try {
        const res = await api.get('/home/stats');
        const nextStats: HomeStats = {
          workshops: Number(res.data?.workshops) || DEFAULT_HOME_STATS.workshops,
          competitions: Number(res.data?.competitions) || DEFAULT_HOME_STATS.competitions,
          artworks: Number(res.data?.artworks) || DEFAULT_HOME_STATS.artworks,
          engaged: Number(res.data?.engaged) || DEFAULT_HOME_STATS.engaged,
        };
        setHomeStats(nextStats);
        setStatsDraft(nextStats);
      } catch {
        setHomeStats(DEFAULT_HOME_STATS);
        setStatsDraft(DEFAULT_HOME_STATS);
      }
    };

    fetchUpcomingEvents();
    fetchLatestArtworks();
    fetchPastEventsForLoop();
    fetchHomeStats();
  }, []);

  useEffect(() => {
    if (!showHeroIntro) return;
    const id = window.setTimeout(() => {
      sessionStorage.setItem('paletteHeroIntroSeen', 'true');
      setShowHeroIntro(false);
    }, 2800);
    return () => window.clearTimeout(id);
  }, [showHeroIntro]);

  const handleHeroIntroComplete = () => {
    sessionStorage.setItem('paletteHeroIntroSeen', 'true');
    setShowHeroIntro(false);
  };

  const isAdmin = Boolean(user?.isAdmin);
  const isStatsDirty =
    homeStats.workshops !== statsDraft.workshops ||
    homeStats.competitions !== statsDraft.competitions ||
    homeStats.artworks !== statsDraft.artworks ||
    homeStats.engaged !== statsDraft.engaged;

  const updateStatDraft = (key: keyof HomeStats, rawValue: string) => {
    const parsed = Number(rawValue);
    setStatsDraft((prev) => ({
      ...prev,
      [key]: Number.isNaN(parsed) || parsed < 0 ? 0 : Math.floor(parsed),
    }));
  };

  const handleSaveHomeStats = async () => {
    try {
      setStatsSaving(true);
      setStatsError(null);
      setStatsMessage(null);
      const res = await api.put('/home/stats', statsDraft);
      const nextStats: HomeStats = {
        workshops: Number(res.data?.stats?.workshops) || statsDraft.workshops,
        competitions: Number(res.data?.stats?.competitions) || statsDraft.competitions,
        artworks: Number(res.data?.stats?.artworks) || statsDraft.artworks,
        engaged: Number(res.data?.stats?.engaged) || statsDraft.engaged,
      };
      setHomeStats(nextStats);
      setStatsDraft(nextStats);
      setStatsMessage('Homepage stats updated.');
    } catch (err: any) {
      setStatsError(err.response?.data?.message || 'Failed to update homepage stats.');
    } finally {
      setStatsSaving(false);
    }
  };

  const myPhotoLoopImages = pastEventsForLoop.map(ev =>
    ev.imageUrl.startsWith('http') ? ev.imageUrl : toMediaUrl(ev.imageUrl)
  );
  const eventDetails = pastEventsForLoop.map(ev => ({
    title: ev.title, date: ev.date, location: ev.location, description: ev.description,
  }));

  return (
    <>
      {/* ════════════ HERO ════════════ */}
      <div className="hero-section" role="banner">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-3" aria-hidden="true" />

        <div className="container hero-container">
          <motion.div
            className="hero-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.34, 1.26, 0.64, 1] }}
          >
            <motion.p
              className="hero-kicker"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ✦ A Creative Collective at IIT Gandhinagar
            </motion.p>

            <motion.div
              className="hero-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h1 className="main-title">
                <span className="main-title-text">Palette</span>
              </h1>
              <p className="hero-subtitle">
                <span>IIT Gandhinagar</span>
                <span className="hero-subtitle-dot" aria-hidden="true">·</span>
                <span>Art Club</span>
              </p>
            </motion.div>

            {showHeroIntro && (
              <motion.button
                type="button"
                className="hero-intro-splash"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, delay: 0.35 }}
                onClick={handleHeroIntroComplete}
                aria-label="Dismiss welcome animation"
              >
                <span className="hero-intro-ring" aria-hidden="true" />
                <span className="hero-intro-mark" aria-hidden="true">✦</span>
                <span className="hero-intro-text">Welcome to Palette</span>
              </motion.button>
            )}

            {/* Chips */}
            <motion.div
              className="hero-chips"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              aria-label="Palette highlights"
            >
              {[
                { label: 'Workshops', cls: 'chip-workshops' },
                { label: 'Competitions', cls: 'chip-competitions' },
                { label: 'Exhibitions', cls: 'chip-exhibitions' },
                { label: 'Open Community', cls: 'chip-community' },
              ].map((c) => (
                <span key={c.label} className={`hero-chip ${c.cls}`}>{c.label}</span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Link to="/e-exhibition" className="btn btn-outline-light hero-btn">
                View E-exhibition
              </Link>
              {isLoggedIn ? (
                <Link to="/submit-artwork" className="btn btn-hero-primary hero-btn">
                  Submit Your Art
                </Link>
              ) : (
                <Link to="/register" className="btn btn-hero-primary hero-btn">
                  ✦ Join Palette
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.a
          href="#home-stats"
          className="hero-scroll-hint"
          aria-label="Scroll to explore"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <span>Explore</span>
          <span className="hero-scroll-chevron" aria-hidden="true" />
        </motion.a>
      </div>

      {/* ════════════ STATS ════════════ */}
      <div className="stats-section" id="home-stats" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <StatItem icon={<FaPaintBrush />} value={homeStats.workshops} suffix="+" label="Workshops Hosted" start={statsInView} />
            <StatItem icon={<FaTrophy />} value={homeStats.competitions} suffix="+" label="Competitions" start={statsInView} />
            <StatItem icon={<FaCamera />} value={homeStats.artworks} suffix="+" label="Artworks Showcased" start={statsInView} />
            <StatItem icon={<FaUsers />} value={homeStats.engaged} suffix="+" label="Engaged People" start={statsInView} />
          </div>

          {isAdmin && (
            <div className="stats-admin-panel">
              <div className="stats-admin-header">
                <h3>Edit Homepage Stats</h3>
                <span>Admin only</span>
              </div>

              <div className="stats-admin-grid">
                <label className="stats-admin-field">
                  <span>Workshops</span>
                  <input
                    type="number"
                    min={0}
                    value={statsDraft.workshops}
                    onChange={(e) => updateStatDraft('workshops', e.target.value)}
                  />
                </label>
                <label className="stats-admin-field">
                  <span>Competitions</span>
                  <input
                    type="number"
                    min={0}
                    value={statsDraft.competitions}
                    onChange={(e) => updateStatDraft('competitions', e.target.value)}
                  />
                </label>
                <label className="stats-admin-field">
                  <span>Artworks</span>
                  <input
                    type="number"
                    min={0}
                    value={statsDraft.artworks}
                    onChange={(e) => updateStatDraft('artworks', e.target.value)}
                  />
                </label>
                <label className="stats-admin-field">
                  <span>Engaged People</span>
                  <input
                    type="number"
                    min={0}
                    value={statsDraft.engaged}
                    onChange={(e) => updateStatDraft('engaged', e.target.value)}
                  />
                </label>
              </div>

              <div className="stats-admin-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!isStatsDirty || statsSaving}
                  onClick={handleSaveHomeStats}
                >
                  {statsSaving ? 'Saving...' : 'Save Stats'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={!isStatsDirty || statsSaving}
                  onClick={() => {
                    setStatsDraft(homeStats);
                    setStatsError(null);
                    setStatsMessage(null);
                  }}
                >
                  Reset
                </button>
              </div>

              {statsMessage && <p className="stats-admin-message stats-admin-message--ok">{statsMessage}</p>}
              {statsError && <p className="stats-admin-message stats-admin-message--error">{statsError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* ════════════ INFINITE LOOP ════════════ */}
      {!loadingPastEvents && myPhotoLoopImages.length > 0 && (
        <InfinitePhotoLoop images={myPhotoLoopImages} events={eventDetails} speed="normal" direction="left" />
      )}

      {/* ════════════ UPCOMING EVENTS ════════════ */}
      <Section className="events-section" delay={0}>
        <div className="container">
          <div className="section-header">
            <h2 className="page-title">Upcoming Events</h2>
            <p className="section-subtitle">Don't miss what's next at Palette</p>
          </div>
          {loadingEvents ? (
            <SkeletonLoader variant="event" count={3} />
          ) : upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map((event, i) => (
                <motion.div
                  key={event._id}
                  className="event-card-new"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -6 }}
                >
                  <div className={`event-type-bar type-${event.type}`} />
                  <div className="event-card-body">
                    <span className={`event-type-badge badge-${event.type}`}>
                      {event.type}
                    </span>
                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-date">📅 {formatDisplayDate(event.date)}</p>
                    {event.location && <p className="event-card-loc">📍 {event.location}</p>}
                    <p className="event-card-desc">{getShortText(event.description)}</p>
                    <Link
                      to={event.type === 'workshop' ? '/workshops' : '/competitions'}
                      className="event-card-link-btn"
                    >
                      View Details →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No upcoming events right now — check back soon!</p>
          )}
          <div className="section-actions">
            <Link to="/workshops" className="btn btn-outline-secondary">All Workshops</Link>
            <Link to="/competitions" className="btn btn-outline-secondary">All Competitions</Link>
          </div>
        </div>
      </Section>

      {/* ════════════ GALLERY PREVIEW ════════════ */}
      <Section className="artworks-section" delay={0.1}>
        <div className="container">
          <div className="section-header">
            <h2 className="page-title">Latest from the Gallery</h2>
            <p className="section-subtitle">A glimpse of our members' creativity</p>
          </div>
          {loadingArtworks ? (
            <SkeletonLoader variant="artwork" count={6} />
          ) : latestArtworks.length > 0 ? (
            <div className="artworks-masonry">
              {latestArtworks.map((artwork, i) => (
                <motion.div
                  key={artwork._id}
                  className="artwork-tile"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Link to="/e-exhibition" className="artwork-tile-link" aria-label={`View ${artwork.title}`}>
                    <img
                      src={toMediaUrl(artwork.imageUrl)}
                      alt={artwork.title}
                      className="artwork-tile-img"
                      loading="lazy"
                    />
                    <div className="artwork-tile-overlay">
                      <span className="artwork-tile-title">{artwork.title}</span>
                      <span className="artwork-tile-artist">by {artwork.artist?.name || 'Palette Artist'}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No artworks yet — be the first to submit!</p>
          )}
          <div className="section-actions">
            <Link to="/e-exhibition" className="btn btn-primary">Explore Full Gallery →</Link>
          </div>
        </div>
      </Section>

      {/* ════════════ ABOUT TEASER ════════════ */}
      <Section className="about-section" delay={0.1}>
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="about-label">About Us</span>
              <h2 className="about-title">Not just a club : <br />a space to imagine, create, and inspire</h2>
              <p className="about-body">
                At Palette, creativity finds its voice. We are a collective of artists and visionaries shaping ideas into expression through workshops, competitions, and exhibitions. No boundaries, no prerequisites — just pure creative energy.
              </p>
              <div className="about-features">
                {['Inclusive community', 'Expert-led workshops', 'Annual exhibitions', 'Inter-IIT competitions'].map((f) => (
                  <span key={f} className="about-feature-chip">✓ {f}</span>
                ))}
              </div>
              <Link to="/team" className="btn btn-primary mt-4">Meet Our Team →</Link>
            </div>
            <div className="about-visual" aria-hidden="true">
              <div className="about-blob about-blob-1" />
              <div className="about-blob about-blob-2" />
              <div className="about-blob about-blob-3" />
              <div className="about-art-frame">
                <FaPaintBrush size={48} />
                <span>est. IIT Gandhinagar</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default HomePage;
