import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminEventEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get event ID from URL
  const { user, isLoggedIn } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    type: 'event',
    maxParticipants: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user?.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchEvent = async () => {
      if (!id) {
        setError('Event ID is missing.');
        setLoadingEvent(false);
        return;
      }
      try {
        const { data } = await axios.get(`/api/events/${id}`);
        setFormData({
          title: data.title,
          description: data.description,
          date: new Date(data.date).toISOString().split('T')[0], // Format for date input
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
          location: data.location,
          type: data.type,
          maxParticipants: data.maxParticipants || '',
        });
        setLoadingEvent(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch event details.');
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [id, isLoggedIn, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.type) {
      setError('Required fields cannot be empty.');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.date)) {
      setError('End date cannot be before start date.');
      return;
    }

    const eventData = new FormData();
    eventData.append('title', formData.title);
    eventData.append('description', formData.description);
    eventData.append('date', formData.date);
    if (formData.endDate) {
      eventData.append('endDate', formData.endDate);
    }
    eventData.append('location', formData.location);
    eventData.append('type', formData.type);
    if (formData.maxParticipants) {
      eventData.append('maxParticipants', formData.maxParticipants);
    }
    if (image) {
      eventData.append('image', image);
    }

    try {
      await axios.put(`/api/events/${id}`, eventData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use token from localStorage
        },
      });
      setSuccess('Event updated successfully!');
      navigate('/upcoming-events'); // Redirect to upcoming events after update
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update event.');
    }
  };

  if (loadingEvent) return <div className="text-center py-5"><p>Loading event...</p></div>;
  if (error && !id) return <div className="alert alert-danger">{error}</div>; // Only show error if no ID

  return (
    <div className="register-page">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Edit Event</h2>
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="mb-3">
              <label htmlFor="type" className="form-label">Event Type</label>
              <select
                className="form-control"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="event">General Event</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="date" className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="endDate" className="form-label">End Date (Optional)</label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.date}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="maxParticipants" className="form-label">Max Participants (Optional)</label>
              <input
                type="number"
                className="form-control"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="image" className="form-label">Event Image (Leave blank to keep current)</label>
              <input
                type="file"
                className="form-control"
                id="image"
                name="image"
                onChange={handleFileChange}
                accept="image/png"
              />
            </div>

            <button type="submit" className="btn-accent">Update Event</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEventEditPage;