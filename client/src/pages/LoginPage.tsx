import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const { loginIdentifier, password } = formData;

  const { login } = useAuth(); // Use the login function from AuthContext
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Clear error when user types
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!loginIdentifier || !password) {
      setError('Please enter both email/roll number and password.');
      return;
    }

    try {
      await login(loginIdentifier, password);
      navigate('/'); // Redirect to homepage or profile
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg p-4">
              <h2 className="card-title text-center mb-4">Welcome Back!</h2>
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginIdentifier" className="form-label">Email / Roll Number</label>
                  <input type="text" id="loginIdentifier" name="loginIdentifier" className="form-control" value={loginIdentifier} onChange={onChange} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="password"className="form-label">Password</label>
                  <input type="password" id="password" name="password" className="form-control" value={password} onChange={onChange} required />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Login</button>
                </div>
              </form>
              <div className="text-center mt-3">
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;