import React, { useState, useEffect } from 'react'; // Added useState and useEffect for dynamic fetching
import axios from 'axios'; // For API calls
import './EventPhotosPage.css'; // New CSS file for styling

interface IEventPhoto { // Define interface for event photos
  _id: string;
  url: string;
  caption: string;
  // Add other fields as necessary, e.g., eventId, date, uploadedBy
}

const EventPhotosPage = () => {
  const [eventPhotos, setEventPhotos] = useState<IEventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This will be where you'd fetch real event photos from your backend
    // For now, it will just simulate loading and return no data
    const fetchEventPhotos = async () => {
      try {
        setLoading(true);
        // Example: const res = await axios.get('/api/event-photos');
        // setEventPhotos(res.data);
        setEventPhotos([]); // Simulate no photos initially
      } catch (err) {
        console.error('Error fetching event photos:', err);
        setError('Failed to load event photos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventPhotos();
  }, []);

  if (loading) return <div className="text-center py-5"><p>Loading event photos...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="event-photos-page"> {/* Wrapper div for page background */}
      <div className="container py-5">
        <h2 className="page-title text-center mb-5">Event Photos</h2>

        {eventPhotos.length > 0 ? (
          <div className="row">
            {eventPhotos.map(photo => (
              <div className="col-md-6 col-lg-4 mb-4" key={photo._id}>
                <div className="card event-photo-card h-100 shadow-sm">
                  <img src={photo.url} alt={photo.caption} className="card-img-top" />
                  <div className="card-body text-center">
                    <p className="card-text">{photo.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No event photos to display yet. Check back soon!</p>
            {/* Admin could add new event photos here via an admin interface */}
          </div>
        )}
      </div>
    </div>
  );

};

export default EventPhotosPage;
