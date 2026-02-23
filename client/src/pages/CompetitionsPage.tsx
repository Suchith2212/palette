import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { IEvent } from '../types/event';
import './UpcomingEventsPage.css'; // Reusing CSS for now, can create CompetitionsPage.css if distinct styling is needed
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { toMediaUrl } from '../utils/mediaUrl';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn, token } = useAuth(); // Get user, isLoggedIn, and token from AuthContext

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch only competitions
      const res = await axios.get('/api/events/competitions');
      
      const sortedCompetitions = res.data
        .sort((a: IEvent, b: IEvent) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending

      setCompetitions(sortedCompetitions);
      console.log('Fetched and sorted competitions:', sortedCompetitions); // Debugging log
    } catch (err: any) {
      console.error('Error fetching competitions:', err);
      setError(err.response?.data?.message || 'Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this competition? This action cannot be undone.')) {
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
      setCompetitions(competitions.filter(event => event._id !== eventId));
    } catch (err: any) {
      console.error('Error deleting competition:', err);
      setError(err.response?.data?.message || 'Failed to delete competition.');
    }
  };

  if (loading) return <div className="text-center py-5"><p>Loading competitions...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="upcoming-events-page"> {/* Reusing CSS class for page background */}
      <div className="container py-5">
              <h2 className="page-title text-center mb-5">Upcoming Competitions</h2>
              {isLoggedIn && user?.isAdmin && (
                <div className="text-center mb-4">
                  <Link to="/admin/events/create?type=competition" className="btn btn-success">
                    + Add Competition
                  </Link>
                </div>
              )}
              
              {competitions.length > 0 ? (
                <div className="row">
                  {competitions.map(event => (
                    <div className="col-md-6 col-lg-4 mb-4" key={event._id}>
                      {renderEventCard(event, isLoggedIn, user, token, handleDeleteEvent)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p>No upcoming competitions scheduled at the moment. Check back soon!</p>
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
      
export default CompetitionsPage;
