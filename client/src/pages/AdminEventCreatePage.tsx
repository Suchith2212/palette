import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const AdminEventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    type: 'event', // Default type
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type');
    if (type && ['event', 'workshop', 'competition'].includes(type)) {
      setFormData((prev) => ({ ...prev, type }));
    }
  }, [location.search]);

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

    if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.type || !image) {
      setError('All required fields including an image are required.');
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
    eventData.append('image', image);

    try {
      const response = await api.post('/events', eventData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Event created successfully!');
      setFormData({
        title: '',
        description: '',
        date: '',
        endDate: '',
        location: '',
        type: 'event',
      });
      setImage(null);
      (document.getElementById('image') as HTMLInputElement).value = '';
      navigate('/upcoming-events');
    } catch (err: any) {
      console.error('Error creating event:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create event.');
    }
  };

  return (
    <div className="register-page"> {/* Using register-page class for styling */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Create New Event</h2>
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
                placeholder="e.g., Annual Art Exhibition"
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
                placeholder="Provide a detailed description of the event..."
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
                placeholder="e.g., SAC Multi-purpose Hall"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="image" className="form-label">Event Image</label>
              <input
                type="file"
                className="form-control"
                id="image"
                name="image"
                onChange={handleFileChange}
                required
                accept="image/png"
              />
              <small className="form-text text-muted">Only PNG images are allowed.</small>
            </div>

            <button type="submit" className="btn-accent">Create Event</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEventCreatePage;
