import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface ContactResponse {
  _id: string;
  name: string;
  email: string;
  subject: string; // Add subject field
  message: string;
  createdAt: string;
}

const AdminContactResponsesPage = () => {
  const [responses, setResponses] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/contact');
      setResponses(data);
    } catch (err) {
      setError('Failed to fetch contact responses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact submission?')) {
      try {
        await api.delete(`/contact/${id}`);
        setResponses(responses.filter((response) => response._id !== id));
      } catch (err) {
        setError('Failed to delete contact submission.');
        console.error(err);
      }
    }
  };

  const generateMailtoLink = (email: string, subject: string, message: string) => {
    const defaultSubject = `Re: ${subject || 'Your recent inquiry'}`;
    const defaultBody = `Hi ${email},\n\nRegarding your message:\n"${message}"\n\n`;
    return `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(defaultBody)}`;
  };

  if (loading) {
    return <div className="text-center py-5"><p>Loading contact responses...</p></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Contact Us Responses</h2>
      {responses.length === 0 ? (
        <p className="text-center">No responses yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response._id}>
                  <td>{response.name}</td>
                  <td>{response.email}</td>
                  <td>{response.subject}</td>
                  <td>{response.message}</td>
                  <td>{new Date(response.createdAt).toLocaleDateString()}</td>
                  <td>
                    <a
                      href={generateMailtoLink(response.email, response.subject, response.message)}
                      className="btn btn-primary btn-sm me-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Respond
                    </a>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(response._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminContactResponsesPage;
