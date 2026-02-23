import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './PastEventsPage.css'; // Import the new CSS file
import { IEvent } from '../types/event'; // Import the centralized IEvent interface
import { useAuth } from '../context/AuthContext'; // Import useAuth
import FadeInOnScroll from '../components/FadeInOnScroll'; // Reusing existing component
import { toMediaUrl } from '../utils/mediaUrl';

const PastEventsPage = () => {
  const [pastEvents, setPastEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn, token } = useAuth(); // Get user, isLoggedIn, and token from AuthContext

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/events/past');
      setPastEvents(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch past events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this past event? This action cannot be undone.')) {
      return;
    }
    try {
      setError(null);
      await api.delete(`/events/${eventId}`, { // Use the custom api instance
        headers: {
          Authorization: `Bearer ${token}`, // Manually pass token
        },
      });
      // Filter out the deleted event from the state
      setPastEvents(pastEvents.filter(event => event._id !== eventId));
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  if (loading) return <div className="text-center"><p>Loading past events...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="past-events-page"> {/* Wrapper div for page background */}
      <div className="container py-5">
        <h2 className="page-title text-center mb-5">Past Events</h2>
        {isLoggedIn && user?.isAdmin && (
          <div className="text-center mb-4">
            <Link to="/admin/events/create" className="btn btn-primary">Add Event</Link>
          </div>
        )}
        <div className="row">
          {pastEvents.length > 0 ? (
            pastEvents.map(event => (
              <div key={event._id} className="col-12 mb-4"> {/* Full width */}
                <FadeInOnScroll> {/* Add fade-in animation */}
                  <div className="card event-card past-event-card shadow-sm"> {/* Added past-event-card class */}
                    {event.imageUrl && ( // Display image if available
                      <img src={toMediaUrl(event.imageUrl)} className="past-event-image card-img-top" alt={event.title} />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{event.title}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">
                        {new Date(event.date).toLocaleDateString()}
                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                        {' '}
                        {event.location && `- ${event.location}`} {/* Display location */}
                      </h6>
                      <p className="card-text">{event.description}</p> {/* Full description */}
                      <span className={`badge ${event.type === 'workshop' ? 'bg-info' : event.type === 'competition' ? 'bg-warning' : 'bg-primary'} mb-2`}>
                        {event.type}
                      </span>
                      <div className="d-flex justify-content-end align-items-center mt-3">
                        {isLoggedIn && user?.isAdmin && (
                          <div>
                            <Link to={`/admin/events/edit/${event._id}`} className="btn btn-sm btn-info me-2">Edit</Link>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteEvent(event._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeInOnScroll>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="text-center">No past events to show.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastEventsPage;
