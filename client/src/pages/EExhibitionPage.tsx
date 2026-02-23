import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EExhibitionPage.css';
import { IArtwork } from '../types/artwork'; // Import IArtwork type
import { toMediaUrl } from '../utils/mediaUrl';

// The IExhibitionItem interface is no longer needed as we are using IArtwork
// interface IExhibitionItem {
//   _id: string;
//   credits: string;
//   title: string;
//   description: string;
//   date: string;
//   time: string;
//   venue: string;
//   imageUrl: string;
// }

const EExhibitionPage = () => {
  const [artworks, setArtworks] = useState<IArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/artwork', { params: { status: 'approved' } }); // Fetch approved artworks
      setArtworks(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch artworks. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  if (loading) return <div className="text-center py-5"><p>Loading E-exhibition...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="e-exhibition-page">
      <div className="container py-5">
        <h2 className="page-title text-center mb-4">E-exhibition</h2>

        {isLoggedIn && ( // Any logged-in user can submit artwork
          <div className="text-center mb-4">
            <Link to="/submit-artwork" className="btn btn-primary">Submit Your Artwork</Link>
          </div>
        )}
        
        {artworks.length > 0 ? (
          <div className="row">
            {artworks.map(artwork => (
              <div key={artwork._id} className="col-12 col-md-6 col-lg-3 mb-4"> {/* 4 items per row on large screens */}
                  <div className="artwork-card card shadow-sm h-100">
                    {artwork.imageUrl && (
                      <img src={toMediaUrl(artwork.imageUrl)} className="artwork-image card-img-top" alt={artwork.title} />
                    )}
                    <div className="artwork-overlay">
                      <h5 className="artwork-title">{artwork.title}</h5>
                      <p className="artwork-artist">By: {artwork.artist.name}</p>
                      <p className="artwork-credits">Credits: {artwork.credits}</p>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No artworks to display at the moment.</p>
          </div>
        )}


      </div>
    </div>
  );
};

export default EExhibitionPage;
