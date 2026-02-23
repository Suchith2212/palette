import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { IEvent } from '../types/event';
import './UpcomingEventsPage.css'; // Reusing CSS for now, can create WorkshopsPage.css if distinct styling is needed
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { toMediaUrl } from '../utils/mediaUrl';

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn, token } = useAuth(); // Get user, isLoggedIn, and token from AuthContext

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch only workshops
      const res = await axios.get('/api/events/workshops');
      
      const sortedWorkshops = res.data
        .sort((a: IEvent, b: IEvent) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending

      setWorkshops(sortedWorkshops);
      console.log('Fetched and sorted workshops:', sortedWorkshops); // Debugging log
    } catch (err: any) {
      console.error('Error fetching workshops:', err);
      setError(err.response?.data?.message || 'Failed to load workshops. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this workshop? This action cannot be undone.')) {
      return;
    }
    try {
      setError(null);
      await axios.delete(`/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use token directly from AuthContext
        },
      });
      // Filter out the deleted event from the state
      setWorkshops(workshops.filter(event => event._id !== eventId));
    } catch (err: any) {
      console.error('Error deleting workshop:', err);
      setError(err.response?.data?.message || 'Failed to delete workshop.');
    }
  };

  if (loading) return <div className="text-center py-5"><p>Loading workshops...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="upcoming-events-page"> {/* Reusing CSS class for page background */}
      <div className="container py-5">
              <h2 className="page-title text-center mb-5">Upcoming Workshops</h2>
              {isLoggedIn && user?.isAdmin && (
                <div className="text-center mb-4">
                  <Link to="/admin/events/create?type=workshop" className="btn btn-success">
                    + Add Workshop
                  </Link>
                </div>
              )}
              
              {workshops.length > 0 ? (
                <div className="row">
                  {workshops.map(event => (
                    <div className="col-md-6 col-lg-4 mb-4" key={event._id}>
                      {renderEventCard(event, isLoggedIn, user, token, handleDeleteEvent)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p>No upcoming workshops scheduled at the moment. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        );
      };
      
      // Helper function to render a single event card (copied from UpcomingEventsPage for consistency)
      const renderEventCard = (event: IEvent, isLoggedIn: boolean, user: any, token: string | null, handleDeleteEvent: (eventId: string) => Promise<void>) => (
        <div className="card event-card h-100 shadow-sm">
          {event.imageUrl && (
            <img src={toMediaUrl(event.imageUrl)} className="card-img-top" alt={event.title} />
          )}
          <div className="card-body">
            <h5 className="card-title">{event.title}</h5>
            <p className="card-text text-muted">
              {new Date(event.date).toLocaleDateString()}
              {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
              {' '}
              {event.location}
            </p>
            <p className="card-text">{event.description.substring(0, 120)}...</p>
            <span className={`badge ${event.type === 'workshop' ? 'bg-info' : event.type === 'competition' ? 'bg-warning' : 'bg-primary'} mb-2`}>
              {event.type}
            </span>
            <div className="d-flex justify-content-between align-items-center mt-3">
              {!isLoggedIn ? (
                <Link to="/login" className="btn btn-sm btn-success">Login to apply</Link>
              ) : (
                <Link to={`/events/${event._id}`} className="btn btn-sm btn-outline-primary">View Details</Link>
              )}
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
      );
      
export default WorkshopsPage;
