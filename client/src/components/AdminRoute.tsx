import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminRoute.css';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-route-gate" role="status" aria-live="polite">
        <div className="admin-route-spinner" aria-hidden="true" />
        <p>Verifying admin access…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="admin-route-gate admin-route-gate--forbidden">
        <span className="admin-route-kicker">Restricted</span>
        <h2>Admin access required</h2>
        <p>You need administrator privileges to open this workspace.</p>
        <div className="admin-route-actions">
          <Link to="/" className="btn btn-primary">Return home</Link>
          <Link to="/profile" className="btn btn-outline-secondary">Your profile</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
