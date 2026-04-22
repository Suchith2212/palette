import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IEvent } from '../types/event';
import './UpcomingEventsPage.css'; /* Shared CSS */
import { useAuth } from '../context/AuthContext';
import { toMediaUrl } from '../utils/mediaUrl';
import SkeletonLoader from '../components/SkeletonLoader';

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn, token } = useAuth();

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/events/workshops');
        const sorted = res.data.sort(
          (a: IEvent, b: IEvent) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setWorkshops(sorted);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load workshops.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Delete this workshop?')) return;
    try {
      await axios.delete(`/api/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      setWorkshops((prev) => prev.filter((e) => e._id !== eventId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div className="upcoming-events-page">
      <div className="container py-5">
        <div className="events-page-header">
          <h1 className="page-title">Workshops</h1>
          <p className="events-page-subtitle">Hands-on sessions to sharpen your artistic skills</p>
          {isLoggedIn && user?.isAdmin && (
            <Link to="/admin/events/create?type=workshop" className="btn btn-success mt-3">
              + Add Workshop
            </Link>
          )}
        </div>

        {loading ? (
          <SkeletonLoader variant="event" count={3} />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : workshops.length > 0 ? (
          <div className="events-page-grid">
            {workshops.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="event-card type-workshop">
                  {event.imageUrl && (
                    <Link to={`/events/${event._id}`} className="event-card-link-wrap">
                      <div className="event-card-img-wrap">
                        <img src={toMediaUrl(event.imageUrl)} alt={event.title} loading="lazy" />
                      </div>
                    </Link>
                  )}
                  <div className="event-card-body">
                    <span className="event-card-badge badge-workshop">Workshop</span>
                    <Link to={`/events/${event._id}`} className="event-card-link-wrap">
                      <h2 className="event-card-title">{event.title}</h2>
                    </Link>
                    <p className="event-card-date">
                      📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                          <Link to={`/admin/events/edit/${event._id}`} state={{ returnTo: '/workshops' }} className="btn btn-sm btn-info">Edit</Link>
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
            <p>No upcoming workshops right now — check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsPage;
