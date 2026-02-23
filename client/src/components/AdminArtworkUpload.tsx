import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AdminArtworkUpload.css'; // Assuming a CSS file for styling
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminArtworkUpload: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, loading, isLoggedIn, token } = useAuth(); // Destructure user, loading, isLoggedIn
  const navigate = useNavigate(); // Initialize useNavigate

  // Word count state and limits
  const DESCRIPTION_MIN_WORDS = 150;
  const DESCRIPTION_MAX_WORDS = 200;
  const descriptionWordCount = description.split(/\s+/).filter(Boolean).length;

  // Conditional rendering for non-admin users or while loading
  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  if (!isLoggedIn || !user?.isAdmin) {
    // Redirect to login if not admin or not logged in
    navigate('/login');
    // Or show an unauthorized message
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger">Unauthorized Access</h3>
        <p>You must be an administrator to upload artwork.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Frontend validation for description word count
    if (descriptionWordCount < DESCRIPTION_MIN_WORDS || descriptionWordCount > DESCRIPTION_MAX_WORDS) {
      setError(`Description must be between ${DESCRIPTION_MIN_WORDS} and ${DESCRIPTION_MAX_WORDS} words.`);
      return;
    }

    if (!title || !imageFile) {
      setError('Please provide a title and select an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', imageFile);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.post('/api/artwork', formData, config);
      setMessage(res.data.message || 'Artwork uploaded successfully!');
      setTitle('');
      setDescription('');
      setImageFile(null);
      // Optionally reset file input
      (document.getElementById('imageFile') as HTMLInputElement).value = '';

    } catch (err: any) {
      console.error('Artwork upload failed:', err);
      setError(err.response?.data?.message || 'Artwork upload failed. Please try again.');
    }
  };

  return (
    <div className="admin-artwork-upload-container">
      <h3 className="page-title text-center mb-4">Upload New Artwork (Admin)</h3>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="admin-artwork-form">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description ({descriptionWordCount} words - min {DESCRIPTION_MIN_WORDS}, max {DESCRIPTION_MAX_WORDS})</label>
          <textarea
            className={`form-control ${descriptionWordCount < DESCRIPTION_MIN_WORDS || descriptionWordCount > DESCRIPTION_MAX_WORDS ? 'is-invalid' : ''}`}
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {(descriptionWordCount < DESCRIPTION_MIN_WORDS || descriptionWordCount > DESCRIPTION_MAX_WORDS) && (
            <div className="invalid-feedback">
              Description must be between {DESCRIPTION_MIN_WORDS} and {DESCRIPTION_MAX_WORDS} words.
            </div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="imageFile" className="form-label">Image File</label>
          <input
            type="file"
            className="form-control"
            id="imageFile"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Upload Artwork</button>
      </form>
    </div>
  );
};

export default AdminArtworkUpload;
