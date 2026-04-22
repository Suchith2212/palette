import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ProfilePage.css';
import { useNavigate, Link } from 'react-router-dom';
import { IArtwork } from '../types/artwork';
import { IEvent } from '../types/event';
import { toMediaUrl } from '../utils/mediaUrl';

const ProfilePage = () => {
  const DEFAULT_PROFILE_PHOTO = '/uploads/defaults/avatar-default.svg';
  const { user, loading, token } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    phoneNumber: ''
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profileUser, setProfileUser] = useState(user);
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
      setProfileUser(user);
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
    if (e.target.name === 'photo') {
      setProfilePhoto(e.target.files?.[0] || null);
      setUpdateError(null);
      setUpdateSuccess(null);
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);
    if (!formData.phoneNumber.trim()) {
      setUpdateError('Phone number is required.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('personalEmail', formData.personalEmail);
      payload.append('phoneNumber', formData.phoneNumber);
      if (profilePhoto) {
        payload.append('photo', profilePhoto);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.put('/api/auth/profile', payload, config);
      console.log('Profile updated successfully:', res.data);
      setProfileUser((prev) => ({ ...(prev ?? user ?? {}), ...res.data } as typeof user));
      setEditMode(false);
      setUpdateSuccess('Profile updated successfully!');
      setProfilePhoto(null);
      // A more robust solution would involve updating the user object in AuthContext.
      // For this prototype, we'll rely on the next page load or specific refresh
      // or implement a direct update to AuthContext's user state if available.
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data || err.message);
      setUpdateError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const approvedArtCount = myArtworks.filter((art) => art.status === 'approved').length;
  const pendingArtCount = myArtworks.filter((art) => art.status === 'pending').length;

  if (loading || artworkLoading || eventLoading) return <div className="text-center py-5"><p>Loading profile...</p></div>;
  if (!user) return <div className="alert alert-warning text-center">Please log in to view your profile.</div>;
  const displayUser = profileUser || user;

  const formatDateRange = (event: IEvent) => {
    const start = new Date(event.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    if (!event.endDate) return start;
    const end = new Date(event.endDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  return (
    <div className="profile-page">
      <div className="container profile-shell">
        <section className="profile-hero">
          {displayUser.photoUrl ? (
            <img
              src={toMediaUrl(displayUser.photoUrl)}
              alt={`${displayUser.name} profile`}
              className="profile-avatar profile-avatar-image"
            />
          ) : (
            <img
              src={toMediaUrl(DEFAULT_PROFILE_PHOTO)}
              alt={`${displayUser.name} profile`}
              className="profile-avatar profile-avatar-image"
            />
          )}
          <div className="profile-hero-main">
            <h1 className="page-title profile-title">My Profile</h1>
            <p className="profile-subtitle">Manage your account details, submissions, and event activity from one place.</p>
            <div className="profile-badges">
              <span className="profile-badge">Artworks: {myArtworks.length}</span>
              <span className="profile-badge">Approved: {approvedArtCount}</span>
              <span className="profile-badge">Pending: {pendingArtCount}</span>
              <span className="profile-badge">Events: {myEvents.length}</span>
            </div>
          </div>
        </section>

        {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}
        {updateError && <div className="alert alert-danger">{updateError}</div>}

        <section className="profile-card profile-details-card">
          <div className="profile-card-head">
            <h2>Account Details</h2>
            {!editMode && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <form className="profile-edit-form" onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={onChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="personalEmail" className="form-label">Personal Email</label>
                <input type="email" id="personalEmail" name="personalEmail" className="form-control" value={formData.personalEmail} onChange={onChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input type="text" id="phoneNumber" name="phoneNumber" className="form-control" value={formData.phoneNumber} onChange={onChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="photo" className="form-label">Profile Photo (Optional)</label>
                <input type="file" id="photo" name="photo" className="form-control" accept="image/*" onChange={onChange} />
                <small className="text-muted">If not uploaded, a default avatar is used.</small>
              </div>
              <div className="profile-edit-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-detail-grid">
              <article className="profile-detail-item"><span>Name</span><strong>{displayUser.name}</strong></article>
              <article className="profile-detail-item"><span>Personal Email</span><strong>{displayUser.personalEmail || 'Not set'}</strong></article>
              <article className="profile-detail-item"><span>IITGN Email</span><strong>{displayUser.iitgEmail}</strong></article>
              <article className="profile-detail-item"><span>Phone Number</span><strong>{displayUser.phoneNumber || 'Not set'}</strong></article>
            </div>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-head">
            <h3 className="profile-section-title">My Submitted Artwork</h3>
            <Link to="/submit-artwork" className="btn btn-success btn-sm">Submit New Artwork</Link>
          </div>
          {artworkError && <div className="alert alert-danger">{artworkError}</div>}
          {myArtworks.length > 0 ? (
            <div className="profile-grid profile-art-grid">
              {myArtworks.map((artwork) => (
                <article key={artwork._id} className="profile-media-card">
                  <img src={toMediaUrl(artwork.imageUrl)} alt={artwork.title} className="profile-media-image" />
                  <div className="profile-media-body">
                    <h4>{artwork.title}</h4>
                    <p className="muted mb-2">Status: <span className={`text-capitalize status-${artwork.status}`}>{artwork.status}</span></p>
                    {artwork.description && <p className="profile-clamp">{artwork.description}</p>}
                    {artwork.score !== undefined && artwork.score !== null && (
                      <p className="mb-0">Score: <strong>{artwork.score}</strong></p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty-state">You have not submitted any artwork yet.</div>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-head">
            <h3 className="profile-section-title">My Registered Events</h3>
          </div>
          {eventError && <div className="alert alert-danger">{eventError}</div>}
          {myEvents.length > 0 ? (
            <div className="profile-grid profile-event-grid">
              {myEvents.map((event) => (
                <article key={event._id} className="profile-media-card">
                  <div className="profile-media-body">
                    <h4>{event.title}</h4>
                    <p className="profile-clamp">{event.description}</p>
                    <p className="mb-1"><strong>Date:</strong> {formatDateRange(event)}</p>
                    <p className="mb-1"><strong>Type:</strong> <span className="text-capitalize">{event.type}</span></p>
                    {event.location && <p className="mb-0"><strong>Location:</strong> {event.location}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty-state">You have not registered for any events yet.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
