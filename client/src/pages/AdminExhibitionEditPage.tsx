import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminExhibitionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get exhibition ID from URL
  const { user, isLoggedIn } = useAuth();

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
  const [loadingExhibition, setLoadingExhibition] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user?.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchExhibition = async () => {
      if (!id) {
        setError('Exhibition ID is missing.');
        setLoadingExhibition(false);
        return;
      }
      try {
        const { data } = await api.get(`/exhibition/${id}`);
        setFormData({
          title: data.title,
          description: data.description,
          date: data.date, // Assuming date comes as a string, adjust if it's a Date object
          time: data.time,
          venue: data.venue,
          credits: data.credits,
        });
        setLoadingExhibition(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch exhibition details.');
        setLoadingExhibition(false);
      }
    };

    fetchExhibition();
  }, [id, isLoggedIn, user, navigate]);

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

    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue || !formData.credits) {
      setError('Required fields cannot be empty.');
      return;
    }

    const exhibitionData = new FormData();
    exhibitionData.append('title', formData.title);
    exhibitionData.append('description', formData.description);
    exhibitionData.append('date', formData.date);
    exhibitionData.append('time', formData.time);
    exhibitionData.append('venue', formData.venue);
    exhibitionData.append('credits', formData.credits);
    if (image) {
      exhibitionData.append('image', image);
    }

    try {
      await api.put(`/exhibition/${id}`, exhibitionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Exhibition item updated successfully!');
      navigate('/e-exhibition'); // Redirect to exhibition page after update
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update exhibition item.');
    }
  };

  if (loadingExhibition) return <div className="text-center py-5"><p>Loading exhibition...</p></div>;
  if (error && !id) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="register-page"> {/* Using register-page class for styling */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Edit Exhibition Item</h2>
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
                <label htmlFor="image" className="form-label">Image (Leave blank to keep current)</label>
                <input type="file" className="form-control" id="image" name="image" onChange={handleFileChange} accept="image/*" />
                <small className="form-text text-muted">Allowed formats: JPG, JPEG, PNG, GIF</small>
              </div>
            </div>

            <div className="form-full-width">
              <button type="submit" className="btn-accent">Update Item</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminExhibitionEditPage;