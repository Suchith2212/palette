import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import './PastEventsPage.css';
import { IEvent } from '../types/event';
import { useAuth } from '../context/AuthContext';
import { toMediaUrl } from '../utils/mediaUrl';
import SkeletonLoader from '../components/SkeletonLoader';

const PastEventsPage = () => {
  const [pastEvents, setPastEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pastViewMode, setPastViewMode] = useState<'archived' | 'unarchived'>('archived');
  const [savingArchive, setSavingArchive] = useState<string | null>(null);
  const { user, isLoggedIn, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/events/past');
      setPastEvents(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch past events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPastEvents(); }, []);

  useEffect(() => {
    const navState = (location.state as { eventUpdated?: boolean } | null) || null;
    if (navState?.eventUpdated) {
      fetchPastEvents();
      setSuccess('Event updated successfully.');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    const hasArchived = pastEvents.some((e) => e.archiveOrder !== null && e.archiveOrder !== undefined);
    if (!hasArchived && pastViewMode === 'archived') setPastViewMode('unarchived');
  }, [pastEvents, pastViewMode]);

  const handleArchiveUpdate = async (eventId: string, archiveOrder: number | null) => {
    try {
      setSavingArchive(eventId);
      await api.put(`/events/${eventId}`, { archiveOrder }, { headers: { Authorization: `Bearer ${token}` } });
      setPastEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, archiveOrder } : e)),
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update archive.');
    } finally {
      setSavingArchive(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Delete this past event?')) return;
    try {
      await api.delete(`/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPastEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const archivedEvents = pastEvents
    .filter((e) => e.archiveOrder !== null && e.archiveOrder !== undefined)
    .sort((a, b) => {
      const diff = (a.archiveOrder ?? 0) - (b.archiveOrder ?? 0);
      return diff !== 0 ? diff : new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const regularEvents = pastEvents
    .filter((e) => e.archiveOrder === null || e.archiveOrder === undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedEvents = pastViewMode === 'archived' ? archivedEvents : regularEvents;

  return (
    <div className="past-events-page">
      <div className="container py-5">
        <div className="past-events-header">
          <h1 className="page-title">Past Events</h1>
          {isLoggedIn && user?.isAdmin && (
            <Link to="/admin/events/create" className="btn btn-primary mt-3">
              + Add Event
            </Link>
          )}
        </div>

        {pastEvents.length > 0 && (
          <div className="past-events-controls">
            <label className="form-label" htmlFor="past-view-select">View:</label>
            <select
              id="past-view-select"
              className="form-select"
              value={pastViewMode}
              onChange={(e) => setPastViewMode(e.target.value as 'archived' | 'unarchived')}
            >
              <option value="archived">Archived highlights</option>
              <option value="unarchived">All past events</option>
            </select>
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <SkeletonLoader variant="event" count={3} />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : selectedEvents.length > 0 ? (
          <div>
            {selectedEvents.map((event, i) => (
              <motion.div
                key={event._id}
                className="past-event-card"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                {event.imageUrl && (
                  <div className="past-event-img-col">
                    <img src={toMediaUrl(event.imageUrl)} alt={event.title} loading="lazy" />
                  </div>
                )}
                <div className="past-event-body">
                  <span className={`badge mb-1 ${event.type === 'workshop' ? 'bg-info' : event.type === 'competition' ? 'bg-warning' : 'bg-primary'}`}>
                    {event.type}
                  </span>
                  <h2 className="past-event-title">{event.title}</h2>
                  <p className="past-event-meta">
                    📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {event.endDate && ` – ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    {event.location && ` · 📍 ${event.location}`}
                  </p>
                  <p className="past-event-desc">{event.description}</p>

                  {isLoggedIn && user?.isAdmin && (
                    <div className="past-event-actions">
                      <div className="archive-admin-controls">
                        <label className="form-label mb-0">Archive order:</label>
                        <input
                          type="number"
                          min={1}
                          className="form-control archive-order-input"
                          defaultValue={event.archiveOrder ?? 1}
                          onChange={(e) => {
                            const v = e.target.value === '' ? null : Number(e.target.value);
                            handleArchiveUpdate(event._id, v);
                          }}
                          disabled={savingArchive === event._id}
                        />
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleArchiveUpdate(event._id, null)}
                          disabled={savingArchive === event._id}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="admin-event-controls">
                        <Link to={`/admin/events/edit/${event._id}`} state={{ returnTo: '/past-events' }} className="btn btn-sm btn-info">Edit</Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="events-empty text-center py-5">
            <p>{pastViewMode === 'archived' ? 'No archived highlights yet.' : 'No past events to show.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastEventsPage;
