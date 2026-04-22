import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheck, FiRefreshCw, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { IArtwork } from '../types/artwork';
import './AdminArtworkReviewPage.css';
import { toMediaUrl } from '../utils/mediaUrl';

const AdminArtworkReviewPage = () => {
  const { user, isLoggedIn, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [pendingArtworks, setPendingArtworks] = useState<IArtwork[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [query, setQuery] = useState('');
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const fetchPendingArtworks = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setPageLoading(true);

    setError(null);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'pending' },
      };
      const res = await axios.get('/api/artwork/admin/all', config);
      const next = Array.isArray(res.data) ? res.data : [];
      setPendingArtworks(next);
      setLastLoadedAt(new Date());
      setScoreDrafts((prev) => {
        const updated = { ...prev };
        next.forEach((artwork: IArtwork) => {
          if (updated[artwork._id] === undefined) {
            updated[artwork._id] = artwork.score !== undefined && artwork.score !== null ? String(artwork.score) : '';
          }
        });
        return updated;
      });
    } catch (err: any) {
      console.error('Failed to fetch pending artworks:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch pending artworks.');
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !user?.isAdmin) {
      navigate('/login');
      return;
    }

    fetchPendingArtworks();
    const intervalId = window.setInterval(() => fetchPendingArtworks(true), 30000);
    return () => window.clearInterval(intervalId);
  }, [authLoading, isLoggedIn, user?.isAdmin, navigate, fetchPendingArtworks]);

  const filteredArtworks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pendingArtworks;
    return pendingArtworks.filter((artwork) =>
      [artwork.title, artwork.description || '', artwork.credits || '', artwork.artist?.name || '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [pendingArtworks, query]);

  const runAction = async (artworkId: string, action: () => Promise<void>, successText: string) => {
    setMessage(null);
    setError(null);
    setActiveActionId(artworkId);
    try {
      await action();
      setMessage(successText);
      await fetchPendingArtworks(true);
    } catch (err: any) {
      console.error('Admin artwork action error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to complete action.');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!window.confirm('Delete this artwork permanently? This action cannot be undone.')) return;
    await runAction(
      artworkId,
      () => axios.delete(`/api/artwork/${artworkId}`, { headers: { Authorization: `Bearer ${token}` } }),
      'Artwork deleted successfully.'
    );
  };

  const updateArtworkStatus = async (artworkId: string, status: 'approved' | 'rejected') => {
    await runAction(
      artworkId,
      () =>
        axios.put(
          `/api/artwork/${artworkId}/status`,
          { status },
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        ),
      `Artwork ${status}.`
    );
  };

  const addArtworkScore = async (artworkId: string) => {
    const raw = scoreDrafts[artworkId];
    const score = Number(raw);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      setError('Score must be between 0 and 100.');
      return;
    }

    await runAction(
      artworkId,
      () =>
        axios.put(
          `/api/artwork/${artworkId}/score`,
          { score },
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        ),
      `Score ${score} saved.`
    );
  };

  if (authLoading || pageLoading) {
    return <div className="text-center py-5"><p>Loading...</p></div>;
  }

  if (!isLoggedIn || !user?.isAdmin) return null;

  return (
    <div className="admin-review-page">
      <div className="container py-4">
        <div className="artwork-review-header">
          <div>
            <h2 className="page-title mb-1">Artwork Review</h2>
            <p className="text-muted mb-0">Moderate pending submissions, assign scores, and publish quality work.</p>
          </div>
          <div className="review-header-meta">
            <span className="review-count">{pendingArtworks.length} pending</span>
            <button className="btn btn-outline-primary" onClick={() => fetchPendingArtworks(true)}>
              <FiRefreshCw /> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {message && <div className="alert alert-success mt-3">{message}</div>}

        <div className="review-toolbar">
          <div className="review-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search title, artist, credits, description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="review-last-updated">
            Last refreshed at {lastLoadedAt ? lastLoadedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
          </div>
        </div>

        {filteredArtworks.length > 0 ? (
          <div className="row g-4">
            {filteredArtworks.map((artwork) => (
              <div key={artwork._id} className="col-md-6 col-xl-4">
                <div className="card artwork-review-card h-100">
                  <img src={toMediaUrl(artwork.imageUrl)} alt={artwork.title} className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title">{artwork.title}</h5>
                    <div className="artwork-review-meta">
                      <span className="review-pill">Pending</span>
                      {artwork.createdAt && (
                        <span className="review-pill">Submitted {new Date(artwork.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="card-text review-artist">By: {artwork.artist.name}</p>
                    {artwork.credits && <p className="card-text review-credits">Credits: {artwork.credits}</p>}
                    {artwork.description && <p className="card-text review-description">{artwork.description}</p>}

                    <div className="artwork-review-actions">
                      <div className="action-row">
                        <button
                          className="btn btn-primary"
                          onClick={() => updateArtworkStatus(artwork._id, 'approved')}
                          disabled={activeActionId === artwork._id}
                        >
                          <FiCheck /> Approve
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => updateArtworkStatus(artwork._id, 'rejected')}
                          disabled={activeActionId === artwork._id}
                        >
                          <FiX /> Reject
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteArtwork(artwork._id)}
                          disabled={activeActionId === artwork._id}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>

                      <div className="input-group score-row">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Score (0-100)"
                          className="form-control"
                          value={scoreDrafts[artwork._id] ?? ''}
                          onChange={(e) => setScoreDrafts((prev) => ({ ...prev, [artwork._id]: e.target.value }))}
                        />
                        <button
                          className="btn btn-secondary"
                          onClick={() => addArtworkScore(artwork._id)}
                          disabled={activeActionId === artwork._id}
                        >
                          Set Score
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-review-state">
            <p>No pending artworks for review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArtworkReviewPage;
