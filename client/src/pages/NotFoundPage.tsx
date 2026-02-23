import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center">
      <h1 className="page-title mb-3">Page Not Found</h1>
      <p className="mb-4">The page you requested does not exist or has been moved.</p>
      <div className="d-flex justify-content-center gap-2">
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <Link to="/upcoming-events" className="btn btn-outline-secondary">View Events</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
