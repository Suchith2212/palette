import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserGalleryPage.css'; // New CSS file for styling

interface IUserArtwork { // Define interface for user artworks
  _id: string;
  imageUrl: string;
  title: string;
  artist: string; // Assuming artist name can be displayed
  // Add other fields as necessary
}

const UserGalleryPage = () => {
  const [userArtworks, setUserArtworks] = useState<IUserArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This will be where you'd fetch real user artworks from your backend
    // For now, it will just simulate loading and return no data
    const fetchUserArtworks = async () => {
      try {
        setLoading(true);
        // Example: const res = await axios.get('/api/user-artworks');
        // setUserArtworks(res.data);
        setUserArtworks([]); // Simulate no user artworks initially
      } catch (err) {
        console.error('Error fetching user artworks:', err);
        setError('Failed to load user artworks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserArtworks();
  }, []);

  if (loading) return <div className="text-center py-5"><p>Loading user artworks...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="user-gallery-page"> {/* Wrapper div for page background */}
      <div className="container py-5">
        <h2 className="page-title text-center mb-5">User Gallery</h2>

        {userArtworks.length > 0 ? (
          <div className="row">
            {userArtworks.map(artwork => (
              <div className="col-md-6 col-lg-4 mb-4" key={artwork._id}>
                <div className="card user-artwork-card h-100 shadow-sm">
                  <img src={artwork.imageUrl} alt={artwork.title} className="card-img-top" />
                  <div className="card-body text-center">
                    <h5 className="card-title">{artwork.title}</h5>
                    <p className="card-text">By: {artwork.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No user artworks to display yet. Encourage your users to submit their creations!</p>
            {/* Admin could add new user artworks here via an admin interface, or users upload */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGalleryPage;
