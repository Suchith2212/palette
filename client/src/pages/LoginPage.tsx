import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { loginIdentifier, password } = formData;
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/';

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(loginIdentifier, password);
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="card-body login-card-body">
          <h2 className="card-title">Sign In</h2>
          <p className="auth-intro text-center">Use IITGN email or personal email.</p>

          <form onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="loginIdentifier" className="form-label">Email</label>
                <input
                  type="text"
                  id="loginIdentifier"
                  name="loginIdentifier"
                  className="form-control"
                  value={loginIdentifier}
                  onChange={onChange}
                  placeholder="e.g. 24110xxx or name@iitgn.ac.in"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="form-full-width">
              <button type="submit" className="btn-accent" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p>Don&apos;t have an account? <Link to="/register">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
