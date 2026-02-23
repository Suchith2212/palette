import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IEvent } from '../types/event';
import { toMediaUrl } from '../utils/mediaUrl';
import './EventDetailsPage.css';

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, user, token } = useAuth();

  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Event not found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const isPastEvent = useMemo(() => {
    if (!event) {
      return false;
    }

    const pivotDate = event.endDate ? new Date(event.endDate) : new Date(event.date);
    return Number.isNaN(pivotDate.getTime()) ? false : pivotDate.getTime() < Date.now();
  }, [event]);

  const isFull = useMemo(() => {
    if (!event?.maxParticipants) {
      return false;
    }

    return event.registeredParticipants.length >= event.maxParticipants;
  }, [event]);

  const handleApply = async () => {
    if (!event || !token) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      await api.post(
        `/events/${event._id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Application submitted successfully.');
      const refreshed = await api.get(`/events/${event._id}`);
      setEvent(refreshed.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not apply for this event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading event details...</div>;
  }

  if (error && !event) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger mb-3">{error}</div>
        <Link className="btn btn-outline-secondary" to="/upcoming-events">Back to events</Link>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="event-details-page py-5">
      <div className="container">
        <div className="event-details-card card shadow-sm">
          {event.imageUrl && (
            <img
              src={toMediaUrl(event.imageUrl)}
              alt={event.title}
              className="event-details-image card-img-top"
            />
          )}
          <div className="card-body p-4 p-md-5">
            <span className="badge text-bg-dark text-capitalize mb-3">{event.type}</span>
            <h1 className="event-details-title">{event.title}</h1>
            <p className="text-muted mb-2">
              {new Date(event.date).toLocaleDateString()}
              {event.endDate ? ` - ${new Date(event.endDate).toLocaleDateString()}` : ''}
            </p>
            <p className="text-muted mb-4">{event.location}</p>
            <p className="event-details-description">{event.description}</p>

            {error && <div className="alert alert-danger mt-4 mb-0">{error}</div>}
            {message && <div className="alert alert-success mt-4 mb-0">{message}</div>}

            <div className="d-flex flex-wrap gap-2 mt-4">
              <Link to="/upcoming-events" className="btn btn-outline-secondary">
                Back to events
              </Link>
              {!isPastEvent && !user?.isAdmin && (
                isLoggedIn ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApply}
                    disabled={submitting || isFull}
                  >
                    {isFull ? 'Event Full' : submitting ? 'Applying...' : 'Apply Now'}
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary">Login to apply</Link>
                )
              )}
              {user?.isAdmin && (
                <Link to={`/admin/events/edit/${event._id}`} className="btn btn-outline-primary">
                  Edit event
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
