import React, { useEffect, useMemo, useState } from 'react';
import { FiMail, FiSearch, FiTrash2, FiSend, FiClock } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminContactResponsesPage.css';

interface ContactResponse {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const AdminContactResponsesPage = () => {
  const { loading: authLoading } = useAuth();
  const [responses, setResponses] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/contact');
      setResponses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch contact responses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchResponses();
  }, [authLoading]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return responses;
    return responses.filter((r) =>
      [r.name, r.email, r.subject, r.message].some((field) => field?.toLowerCase().includes(q))
    );
  }, [responses, query]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this contact submission? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await api.delete(`/contact/${id}`);
      setResponses((prev) => prev.filter((response) => response._id !== id));
    } catch (err) {
      setError('Failed to delete contact submission.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const generateMailtoLink = (email: string, subject: string, message: string) => {
    const defaultSubject = `Re: ${subject || 'Your recent inquiry'}`;
    const defaultBody = `Hi,\n\nRegarding your message:\n"${message}"\n\n`;
    return `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(defaultBody)}`;
  };

  if (authLoading || loading) {
    return <div className="text-center py-5"><p>Loading contact responses...</p></div>;
  }

  return (
    <div className="admin-contact-page">
      <div className="container py-4">
        <div className="contact-console-header">
          <div>
            <h2><FiMail /> Contact Responses</h2>
            <p>Review incoming messages, respond quickly, and keep the inbox clean.</p>
          </div>
          <div className="contact-header-metrics">
            <span>{responses.length} total</span>
            <span><FiClock /> {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <div className="contact-toolbar">
          <div className="contact-search-wrap">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name, email, subject, message"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="contact-empty">No matching contact submissions.</div>
        ) : (
          <div className="contact-grid">
            {filtered.map((response) => (
              <article className="contact-card" key={response._id}>
                <header className="contact-card-head">
                  <div>
                    <h3>{response.subject || 'No Subject'}</h3>
                    <p>{response.name} • {response.email}</p>
                  </div>
                  <span>{new Date(response.createdAt).toLocaleString()}</span>
                </header>

                <p className="contact-message">{response.message}</p>

                <div className="contact-card-actions">
                  <a
                    href={generateMailtoLink(response.email, response.subject, response.message)}
                    className="btn btn-primary btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiSend /> Respond
                  </a>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(response._id)}
                    disabled={deletingId === response._id}
                  >
                    <FiTrash2 /> {deletingId === response._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactResponsesPage;
