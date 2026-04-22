import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IEvent } from '../types/event';
import './UpcomingEventsPage.css';
import { useAuth } from '../context/AuthContext';
import { toMediaUrl } from '../utils/mediaUrl';
import SkeletonLoader from '../components/SkeletonLoader';

const UpcomingEventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn, token } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/api/events/upcoming', { params: { type: 'event' } });
        const sorted = (res.data as IEvent[]).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setUpcomingEvents(sorted);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load upcoming events.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  return (
    <div className="upcoming-events-page">
      <div className="container py-5">
        <div className="events-page-header">
          <h1 className="page-title">Upcoming Events</h1>
          <p className="events-page-subtitle">Stay in the loop — here's what's coming next</p>
          {isLoggedIn && user?.isAdmin && (
            <Link to="/admin/events/create?type=event" className="btn btn-success mt-3">
              + Add General Event
            </Link>
          )}
        </div>

        {loading ? (
          <SkeletonLoader variant="event" count={3} />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : upcomingEvents.length > 0 ? (
          <div className="events-page-grid">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className={`event-card type-${event.type}`}>
                  {event.imageUrl && (
                    <Link to={`/events/${event._id}`} className="event-card-link-wrap">
                      <div className="event-card-img-wrap">
                        <img src={toMediaUrl(event.imageUrl)} alt={event.title} loading="lazy" />
                      </div>
                    </Link>
                  )}
                  <div className="event-card-body">
                    <span className={`event-card-badge badge-${event.type}`}>{event.type}</span>
                    <Link to={`/events/${event._id}`} className="event-card-link-wrap">
                      <h2 className="event-card-title">{event.title}</h2>
                    </Link>
                    <p className="event-card-date">
                      📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {event.endDate && ` – ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                    {event.location && <p className="event-card-location">📍 {event.location}</p>}
                    <p className="event-card-time">
                      🕐 {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="event-card-desc">{event.description?.substring(0, 120)}…</p>
                    <div className="event-card-actions">
                      {isLoggedIn ? (
                        <Link to={`/events/${event._id}`} className="event-card-link">View Details →</Link>
                      ) : (
                        <Link to="/login" className="event-card-link">Login to view →</Link>
                      )}
                      {isLoggedIn && user?.isAdmin && (
                        <div className="admin-event-controls">
                          <Link to={`/admin/events/edit/${event._id}`} state={{ returnTo: '/upcoming-events' }} className="btn btn-sm btn-info">Edit</Link>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event._id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="events-empty">
            <p>No upcoming general events right now — check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsPage;
