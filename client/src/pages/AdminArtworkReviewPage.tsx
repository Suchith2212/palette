import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { IArtwork } from '../types/artwork';
import './AdminArtworkReviewPage.css'; // Optional: for specific styling
import { toMediaUrl } from '../utils/mediaUrl';

const AdminArtworkReviewPage = () => {
  const { user, isLoggedIn, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [pendingArtworks, setPendingArtworks] = useState<IArtwork[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn || !user?.isAdmin) {
        navigate('/login'); // Redirect if not admin
      } else {
        fetchPendingArtworks();
      }
    }
  }, [authLoading, isLoggedIn, user, navigate]);

  const fetchPendingArtworks = async () => {
    setPageLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: 'pending' // Request pending artworks
        }
      };
      const res = await axios.get('/api/artwork', config);
      setPendingArtworks(res.data);
    } catch (err: any) {
      console.error('Failed to fetch pending artworks:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch pending artworks.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this artwork? This action cannot be undone.')) {
      return;
    }
    setMessage(null);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/artwork/${artworkId}`, config);
      setMessage(`Artwork ${artworkId} deleted successfully.`);
      fetchPendingArtworks(); // Refresh the list after deletion
    } catch (err: any) {
      console.error('Error deleting artwork:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete artwork.');
    }
  };

  const updateArtworkStatus = async (artworkId: string, status: 'approved' | 'rejected') => {
    setMessage(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.put(`/api/artwork/${artworkId}/status`, { status }, config);
      setMessage(`Artwork ${artworkId} ${status}.`);
      fetchPendingArtworks(); // Refresh list
    } catch (err: any) {
      console.error('Error updating status:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update artwork status.');
    }
  };

  const addArtworkScore = async (artworkId: string, score: number) => {
    setMessage(null);
    try {
      if (score < 0 || score > 100) {
        setError('Score must be between 0 and 100.');
        return;
      }
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.put(`/api/artwork/${artworkId}/score`, { score }, config);
      setMessage(`Score ${score} added to artwork ${artworkId}.`);
      fetchPendingArtworks(); // Refresh list to see updated scores
    } catch (err: any) {
      console.error('Error adding score:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to add artwork score.');
    }
  };

  if (authLoading || pageLoading) return <div className="text-center py-5"><p>Loading...</p></div>;
  if (!isLoggedIn || !user?.isAdmin) return null; // Should redirect by useEffect

  return (
    <div className="container py-5">
      <h2 className="page-title text-center mb-4">Admin Dashboard</h2>

      <h3 className="text-center mb-4 mt-5">Pending Artworks for Review</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {pendingArtworks.length > 0 ? (
        <div className="row">
          {pendingArtworks.map(artwork => (
            <div key={artwork._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card artwork-review-card shadow-sm h-100">
                <img src={toMediaUrl(artwork.imageUrl)} alt={artwork.title} className="card-img-top" />
                <div className="card-body">
                  <h5 className="card-title">{artwork.title}</h5>
                  <p className="card-text">By: {artwork.artist.name}</p>
                  {artwork.description && <p className="card-text fst-italic">{artwork.description}</p>}
                  <p className="card-text">Status: <span className="fw-bold text-capitalize">{artwork.status}</span></p>
                  {artwork.score !== undefined && artwork.score !== null && <p className="card-text">Current Score: <span className="fw-bold">{artwork.score}</span></p>}

                  <div className="d-flex flex-column mt-3">
                    <div className="mb-2">
                      <button className="btn btn-primary me-2" onClick={() => updateArtworkStatus(artwork._id, 'approved')}>Approve</button>
                      <button className="btn btn-outline-danger me-2" onClick={() => updateArtworkStatus(artwork._id, 'rejected')}>Reject</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteArtwork(artwork._id)}>Delete</button>
                    </div>
                    <div className="input-group">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Add Score (0-100)"
                        className="form-control"
                        id={`score-${artwork._id}`} // Added ID for specific targeting
                        onBlur={(e) => {
                          const score = parseInt(e.target.value);
                          if (!isNaN(score)) addArtworkScore(artwork._id, score);
                        }}
                      />
                      <button className="btn btn-secondary" onClick={() => {
                        const input = document.getElementById(`score-${artwork._id}`) as HTMLInputElement;
                        if (input && !isNaN(parseInt(input.value))) {
                          addArtworkScore(artwork._id, parseInt(input.value));
                        }
                      }}>Set Score</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p>No pending artworks for review at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AdminArtworkReviewPage;
