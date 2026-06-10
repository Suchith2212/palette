import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IArtwork } from '../types/artwork';
import { toMediaUrl } from '../utils/mediaUrl';
import SkeletonLoader from '../components/SkeletonLoader';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn } from 'react-icons/fi';
import './EExhibitionPage.css';

const FILTERS = ['All', 'Painting', 'Sketch', 'Digital', 'Other'] as const;
const TYPE_OPTIONS: Array<{ value: IArtwork['type']; label: string }> = [
  { value: 'painting', label: 'Painting' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'digital', label: 'Digital' },
  { value: 'other', label: 'Other' },
];

const CARD_VARIANTS = ['gallery-card--portrait', 'gallery-card--landscape', 'gallery-card--square'] as const;

const getFilterKey = (filter: string) => (filter === 'All' ? 'all' : filter.toLowerCase());

const EExhibitionPage = () => {
  const DEFAULT_PROFILE_PHOTO = '/uploads/defaults/avatar-default.svg';
  const [artworks, setArtworks] = useState<IArtwork[]>([]);
  const [filtered, setFiltered] = useState<IArtwork[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingArtwork, setDeletingArtwork] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    credits: '',
    type: 'other' as IArtwork['type'],
  });
  const { isLoggedIn, user } = useAuth();
  const lightboxRef = useRef<HTMLDivElement>(null);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/artwork', { params: { status: 'approved' } });
      setArtworks(res.data);
      setFiltered(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch artworks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtworks(); }, []);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: artworks.length };
    FILTERS.slice(1).forEach((filter) => {
      counts[getFilterKey(filter)] = artworks.filter((a) => a.type === getFilterKey(filter)).length;
    });
    return counts;
  }, [artworks]);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFiltered(artworks);
    } else {
      const key = getFilterKey(activeFilter);
      setFiltered(artworks.filter((a) => a.type === key));
    }
  }, [activeFilter, artworks]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsEditing(false);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    setIsEditing(false);
    document.body.style.overflow = '';
  }, []);

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setIsEditing(false);
    setSelectedIndex((selectedIndex + 1) % filtered.length);
  }, [selectedIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setIsEditing(false);
    setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length);
  }, [selectedIndex, filtered.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, closeLightbox, goNext, goPrev]);

  const selectedArtwork = selectedIndex !== null ? filtered[selectedIndex] : null;
  const isAdmin = !!user?.isAdmin;

  useEffect(() => {
    if (!selectedArtwork) return;
    setEditForm({
      title: selectedArtwork.title || '',
      description: selectedArtwork.description || '',
      credits: selectedArtwork.credits || '',
      type: selectedArtwork.type || 'other',
    });
  }, [selectedArtwork?._id]);

  const onEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = async () => {
    if (!selectedArtwork) return;
    if (!editForm.title.trim() || !editForm.credits.trim() || !editForm.type) {
      setError('Title, type, and credits are required for artwork edit.');
      return;
    }

    try {
      setSavingEdit(true);
      setError(null);
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        credits: editForm.credits.trim(),
        type: editForm.type,
      };
      const res = await api.put(`/artwork/${selectedArtwork._id}`, payload);
      const updated = res.data as IArtwork;

      setArtworks((prev) => prev.map((art) => (art._id === updated._id ? { ...art, ...updated } : art)));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update artwork.');
    } finally {
      setSavingEdit(false);
    }
  };

  const openAdminEdit = (index: number) => {
    openLightbox(index);
    setIsEditing(true);
  };

  const deleteCurrentArtwork = async () => {
    if (!selectedArtwork) return;
    if (!window.confirm('Remove this artwork from the exhibition?')) return;

    try {
      setDeletingArtwork(true);
      setError(null);
      await api.delete(`/artwork/${selectedArtwork._id}`);
      setArtworks((prev) => prev.filter((art) => art._id !== selectedArtwork._id));
      closeLightbox();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete artwork.');
    } finally {
      setDeletingArtwork(false);
    }
  };

  return (
    <div className="e-exhibition-page">
      <section className="exhibition-hero" aria-labelledby="exhibition-title">
        <div className="exhibition-hero-glow" aria-hidden="true" />
        <div className="container exhibition-hero-inner">
          <span className="text-kicker">Palette · IIT Gandhinagar</span>
          <h1 id="exhibition-title" className="exhibition-title">E-Exhibition</h1>
          <p className="exhibition-lead">
            A curated digital gallery celebrating the creativity of our members — paintings, sketches,
            digital art, and more.
          </p>
          <div className="exhibition-hero-meta">
            <span className="exhibition-stat-chip">{artworks.length} artworks</span>
            <span className="exhibition-stat-chip">{FILTERS.length - 1} mediums</span>
            {isLoggedIn && (
              <Link to="/submit-artwork" className="btn btn-primary exhibition-submit-btn">
                + Submit Your Artwork
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container exhibition-body">
        <div className="filter-tabs" role="tablist" aria-label="Filter artworks by medium">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={activeFilter === f}
              className={`filter-tab ${activeFilter === f ? 'filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              <span>{f}</span>
              <span className="filter-tab-count">{filterCounts[getFilterKey(f)] ?? 0}</span>
              {activeFilter === f && (
                <motion.div className="filter-tab-indicator" layoutId="filter-indicator" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonLoader variant="artwork" count={6} />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filtered.length > 0 ? (
          <motion.div
            className="gallery-grid"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            {filtered.map((artwork, index) => (
              <motion.button
                key={artwork._id}
                type="button"
                className={`gallery-card ${CARD_VARIANTS[index % CARD_VARIANTS.length]}`}
                aria-label={`View artwork: ${artwork.title}`}
                onClick={() => openLightbox(index)}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } },
                }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="gallery-card-frame">
                  <div className="gallery-card-img-wrap">
                    {artwork.type && (
                      <span className="gallery-type-badge text-capitalize">{artwork.type}</span>
                    )}
                    {isAdmin && <span className="gallery-admin-badge">Admin</span>}
                    <img
                      src={toMediaUrl(artwork.imageUrl)}
                      alt={artwork.title}
                      className="gallery-card-img"
                      loading="lazy"
                    />
                    <div className="gallery-card-overlay">
                      <FiZoomIn size={24} className="gallery-card-zoom" />
                      <div className="gallery-card-meta">
                        <span className="gallery-card-title">{artwork.title}</span>
                        <span className="gallery-card-artist">by {artwork.artist?.name || 'Palette Artist'}</span>
                        {artwork.credits && <span className="gallery-card-medium">{artwork.credits}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <div className="exhibition-empty">
            <p>No artworks match this filter. Try a different category.</p>
            <button className="btn btn-outline-secondary" onClick={() => setActiveFilter('All')}>
              Show All
            </button>
          </div>
        )}

        {isAdmin && filtered.length > 0 && (
          <section className="exhibition-admin-editor">
            <div className="exhibition-admin-head">
              <h3>Admin Artwork Editor</h3>
              <span>{filtered.length} visible artworks</span>
            </div>
            <div className="exhibition-admin-list">
              {filtered.map((artwork, index) => (
                <article key={`admin-edit-${artwork._id}`} className="exhibition-admin-item">
                  <div>
                    <strong>{artwork.title}</strong>
                    <p className="mb-0 text-capitalize">
                      {artwork.type} · by {artwork.artist?.name || 'Palette Artist'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => openAdminEdit(index)}
                  >
                    Edit
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            className="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={closeLightbox}
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Artwork: ${selectedArtwork.title}`}
          >
            <motion.div
              className="lightbox-modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: [0.34, 1.26, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
                <FiX size={22} />
              </button>

              <button className="lightbox-nav lightbox-nav--prev" onClick={goPrev} aria-label="Previous artwork">
                <FiChevronLeft size={24} />
              </button>
              <button className="lightbox-nav lightbox-nav--next" onClick={goNext} aria-label="Next artwork">
                <FiChevronRight size={24} />
              </button>

              <div className="lightbox-inner">
                <div className="lightbox-img-wrap">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedArtwork._id}
                      src={toMediaUrl(selectedArtwork.imageUrl)}
                      alt={selectedArtwork.title}
                      className="lightbox-img"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                    />
                  </AnimatePresence>
                </div>

                <motion.div
                  className="lightbox-details"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.26, ease: [0.25, 0.8, 0.25, 1] }}
                >
                  {selectedArtwork.type && (
                    <span className="lightbox-badge text-capitalize">{selectedArtwork.type}</span>
                  )}
                  <motion.h2 className="lightbox-title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.24 }}>
                    {selectedArtwork.title}
                  </motion.h2>
                  <motion.p className="lightbox-byline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.24 }}>
                    Submitted by <strong>{selectedArtwork.artist?.name}</strong>
                  </motion.p>
                  {isAdmin && (
                    <div className="lightbox-admin-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setIsEditing((prev) => !prev)}
                      >
                        {isEditing ? 'Cancel Edit' : 'Edit Artwork'}
                      </button>
                    </div>
                  )}
                  <motion.div className="lightbox-artist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.24 }}>
                    <img
                      src={toMediaUrl(selectedArtwork.artist?.photoUrl || DEFAULT_PROFILE_PHOTO)}
                      alt={`${selectedArtwork.artist?.name || 'Palette Artist'} profile`}
                      className="lightbox-artist-photo"
                    />
                    <span className="lightbox-artist-name">{selectedArtwork.artist?.name || 'Palette Artist'}</span>
                  </motion.div>

                  {isEditing ? (
                    <div className="lightbox-edit-form">
                      <div className="mb-2">
                        <label className="form-label">Title</label>
                        <input type="text" className="form-control" name="title" value={editForm.title} onChange={onEditChange} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Type</label>
                        <select className="form-control" name="type" value={editForm.type} onChange={onEditChange}>
                          {TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Credits</label>
                        <input type="text" className="form-control" name="credits" value={editForm.credits} onChange={onEditChange} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows={4} name="description" value={editForm.description} onChange={onEditChange} />
                      </div>
                      <button type="button" className="btn btn-primary btn-sm" onClick={saveEdit} disabled={savingEdit}>
                        {savingEdit ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-outline-danger btn-sm ms-2" onClick={deleteCurrentArtwork} disabled={deletingArtwork}>
                        {deletingArtwork ? 'Removing...' : 'Remove Artwork'}
                      </button>
                    </div>
                  ) : selectedArtwork.description && (
                    <motion.p className="lightbox-desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.26 }}>
                      {selectedArtwork.description}
                    </motion.p>
                  )}

                  <motion.div className="lightbox-meta-grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.24 }}>
                    {selectedArtwork.credits && (
                      <motion.div className="lightbox-meta-item" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.2 }}>
                        <span className="lightbox-meta-label">Medium</span>
                        <span className="lightbox-meta-value">{selectedArtwork.credits}</span>
                      </motion.div>
                    )}
                    {isAdmin && (
                      <>
                        <motion.div className="lightbox-meta-item">
                          <span className="lightbox-meta-label">Personal Email</span>
                          <span className="lightbox-meta-value">
                            {selectedArtwork.artist?.personalEmail || selectedArtwork.artist?.email || 'Not available'}
                          </span>
                        </motion.div>
                        <motion.div className="lightbox-meta-item">
                          <span className="lightbox-meta-label">IITGN Email</span>
                          <span className="lightbox-meta-value">
                            {selectedArtwork.artist?.iitgEmail || 'Not available'}
                          </span>
                        </motion.div>
                        {selectedArtwork.artist?.phoneNumber && (
                          <motion.div className="lightbox-meta-item">
                            <span className="lightbox-meta-label">Phone Number</span>
                            <span className="lightbox-meta-value">{selectedArtwork.artist.phoneNumber}</span>
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>

                  <motion.p className="lightbox-counter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42, duration: 0.2 }}>
                    {(selectedIndex ?? 0) + 1} / {filtered.length}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EExhibitionPage;
