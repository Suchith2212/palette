import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminExhibitionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    credits: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue || !formData.credits || !image) {
      setError('All fields including an image are required.');
      return;
    }

    const exhibitionData = new FormData();
    exhibitionData.append('title', formData.title);
    exhibitionData.append('description', formData.description);
    exhibitionData.append('date', formData.date);
    exhibitionData.append('time', formData.time);
    exhibitionData.append('venue', formData.venue);
    exhibitionData.append('credits', formData.credits);
    exhibitionData.append('image', image);

    try {
      await api.post('/exhibition', exhibitionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Exhibition item created successfully!');
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        credits: '',
      });
      setImage(null);
      navigate('/e-exhibition');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create exhibition item.');
    }
  };

  return (
    <div className="register-page"> {/* Using register-page class for styling */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Create New Exhibition Item</h2>
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="title" className="form-label">Title</label>
                <input type="text" className="form-control" id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Spring Art Showcase" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea className="form-control" id="description" name="description" rows={3} value={formData.description} onChange={handleChange} required placeholder="Brief description of the exhibition..." ></textarea>
              </div>
            </div>

            <div className="form-row">
              <div>
                <label htmlFor="date" className="form-label">Date</label>
                <input type="date" className="form-control" id="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="time" className="form-label">Time</label>
                <input type="text" className="form-control" id="time" name="time" value={formData.time} onChange={handleChange} required placeholder="e.g., 10:00 AM - 5:00 PM" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="venue" className="form-label">Venue</label>
                <input type="text" className="form-control" id="venue" name="venue" value={formData.venue} onChange={handleChange} required placeholder="e.g., Exhibition Hall A" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="credits" className="form-label">Credits</label>
                <input type="text" className="form-control" id="credits" name="credits" value={formData.credits} onChange={handleChange} required placeholder="e.g., John Doe (Curator)" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="image" className="form-label">Image</label>
                <input type="file" className="form-control" id="image" name="image" onChange={handleFileChange} required accept="image/*" />
                <small className="form-text text-muted">Allowed formats: JPG, JPEG, PNG, GIF</small>
              </div>
            </div>

            <div className="form-full-width">
              <button type="submit" className="btn-accent">Create Item</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminExhibitionCreatePage;