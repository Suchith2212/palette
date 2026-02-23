import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ProfilePage.css'; // Import the new CSS file
import { useNavigate, Link } from 'react-router-dom';
import { IArtwork } from '../types/artwork';
import { IEvent } from '../types/event';
import { toMediaUrl } from '../utils/mediaUrl';

const ProfilePage = () => {
  const { user, loading, token, logout, login } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    phoneNumber: ''
  });
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [myArtworks, setMyArtworks] = useState<IArtwork[]>([]);
  const [artworkLoading, setArtworkLoading] = useState(true);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [myEvents, setMyEvents] = useState<IEvent[]>([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      setFormData({
        name: user.name || '',
        personalEmail: user.personalEmail || '',
        phoneNumber: user.phoneNumber || ''
      });
      fetchMyArtworks();
      fetchMyEvents();
    }
  }, [user, loading, navigate]);

  const fetchMyArtworks = async () => {
    if (!user || !token) return;

    setArtworkLoading(true);
    setArtworkError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.get('/api/users/my-artwork', config); // Corrected endpoint as per userRoutes
      setMyArtworks(res.data);
    } catch (err: any) {
      console.error('Failed to fetch my artworks:', err.response?.data || err.message);
      setArtworkError('Failed to load your artworks.');
    } finally {
      setArtworkLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    if (!user || !token) return;

    setEventLoading(true);
    setEventError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.get('/api/users/my-events', config);
      setMyEvents(res.data);
    } catch (err: any) {
      console.error('Failed to fetch my events:', err.response?.data || err.message);
      setEventError('Failed to load your registered events.');
    } finally {
      setEventLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.put('/api/auth/profile', formData, config);
      console.log('Profile updated successfully:', res.data);
      setEditMode(false);
      setUpdateSuccess('Profile updated successfully!');
      // A more robust solution would involve updating the user object in AuthContext.
      // For this prototype, we'll rely on the next page load or specific refresh
      // or implement a direct update to AuthContext's user state if available.
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data || err.message);
      setUpdateError(err.response?.data?.message || 'Failed to update profile.');
    }
  };


  if (loading || artworkLoading || eventLoading) return <div className="text-center py-5"><p>Loading profile...</p></div>;
  if (!user) return <div className="alert alert-warning text-center">Please log in to view your profile.</div>;

  return (
    <div className="profile-page container py-5">
      <h2 className="page-title">My Profile</h2>

      {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}
      {updateError && <div className="alert alert-danger">{updateError}</div>}

      <div className="card profile-card shadow-sm mb-4">
        <div className="card-body">
          {editMode ? (
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={onChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="personalEmail" className="form-label">Personal Email</label>
                <input type="email" id="personalEmail" name="personalEmail" className="form-control" value={formData.personalEmail} onChange={onChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Phone Number (Optional)</label>
                <input type="text" id="phoneNumber" name="phoneNumber" className="form-control" value={formData.phoneNumber} onChange={onChange} />
              </div>
              <button type="submit" className="btn btn-primary me-2">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
            </form>
          ) : (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Personal Email:</strong> {user.personalEmail}</p>
              <p><strong>IITG Email:</strong> {user.iitgEmail}</p>
              <p><strong>Roll Number:</strong> {user.rollNumber}</p>
              <p><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</p>
              <button type="button" className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>

      <h3 className="profile-section-title mt-5">My Submitted Artwork</h3>
      <div className="row">
        <div className="col-12 mb-3">
            <Link to="/submit-artwork" className="btn btn-success">Submit New Artwork</Link>
        </div>
        {artworkError && <div className="alert alert-danger">{artworkError}</div>}
        {myArtworks.length > 0 ? (
          myArtworks.map(artwork => (
            <div key={artwork._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card artwork-display-card shadow-sm h-100">
                <img src={toMediaUrl(artwork.imageUrl)} alt={artwork.title} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{artwork.title}</h5>
                  {artwork.description && <p className="card-text flex-grow-1">{artwork.description}</p>}
                  <p className="card-text">Status: <span className="fw-bold text-capitalize">{artwork.status}</span></p>
                  {artwork.score !== undefined && artwork.score !== null && <p className="card-text">Score: <span className="fw-bold">{artwork.score}</span></p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-center">You have not submitted any artwork yet.</p>
          </div>
        )}
      </div>

      <h3 className="profile-section-title mt-5">My Registered Events</h3>
      <div className="row">
        {eventError && <div className="alert alert-danger">{eventError}</div>}
        {myEvents.length > 0 ? (
          myEvents.map(event => (
            <div key={event._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card event-display-card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{event.title}</h5>
                  <p className="card-text flex-grow-1">{event.description}</p>
                  <p className="card-text">Date: {new Date(event.date).toLocaleDateString()}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </p>
                  <p className="card-text">Type: <span className="text-capitalize">{event.type}</span></p>
                  {event.location && <p className="card-text">Location: {event.location}</p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-center">You have not registered for any events yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
