import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './SubmitArtworkPage.css'; // Import for specific styling

const SubmitArtworkPage = () => {
  const { token, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    credits: '', // Add credits field
    image: null as File | null,
  });
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [authLoading, isLoggedIn, navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, image: null });
    }
    setError(null);
    setSuccess(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('Artwork title is required.');
      return;
    }
    if (!formData.credits.trim()) { // Add validation for credits
        setError('Artwork credits are required.');
        return;
    }
    if (!formData.image) {
      setError('Please select an image to upload.');
      return;
    }

    setSubmissionLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    if (formData.description) {
      data.append('description', formData.description);
    }
    data.append('credits', formData.credits); // Append credits
    data.append('image', formData.image);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
          'Authorization': `Bearer ${token}`,
        },
      };

      const res = await axios.post('/api/artwork', data, config);
      setSuccess('Artwork submitted successfully for review!');
      setFormData({ title: '', description: '', credits: '', image: null }); // Clear form including credits
      if (document.getElementById('image') instanceof HTMLInputElement) {
        (document.getElementById('image') as HTMLInputElement).value = ''; // Clear file input
      }
      console.log('Artwork submitted:', res.data);
      // Optionally redirect to profile or e-arts page
      // navigate('/e-arts');
    } catch (err: any) {
      console.error('Artwork submission error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to submit artwork. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (authLoading) return <div className="text-center"><p>Loading...</p></div>;
  if (!isLoggedIn) return null; // Should redirect by useEffect

  return (
    <div className="submit-artwork-page container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg p-4">
            <h2 className="card-title text-center mb-4 page-title">Submit Your Artwork</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows={4}
                  value={formData.description}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="credits" className="form-label">Credits</label>
                <input
                  type="text"
                  id="credits"
                  name="credits"
                  className="form-control"
                  value={formData.credits}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="image" className="form-label">Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  className="form-control"
                  accept="image/*"
                  onChange={onFileChange}
                  required
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={submissionLoading}>
                  {submissionLoading ? 'Submitting...' : 'Submit Artwork'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitArtworkPage;
