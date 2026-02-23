import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmailPage.css'; // Assuming you'll create a CSS file for styling

const VerifyEmailPage: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const iitgEmail = location.state?.iitgEmail; // Get email passed from RegisterPage

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!iitgEmail) {
      setError('Email not found. Please register again.');
      return;
    }

    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      const res = await axios.post('/api/auth/verify-code', { iitgEmail, verificationCode });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login'); // Redirect to login after successful verification
      }, 2000);
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="verify-email-container">
      <h2 className="page-title text-center mb-4">Verify Your Email</h2>
      <p className="text-center mb-4">A 6-digit verification code has been sent to <strong>{iitgEmail || 'your IITG email address'}</strong>. Please enter it below to activate your account.</p>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="verify-email-form">
        <div className="mb-3">
          <label htmlFor="verificationCode" className="form-label">Verification Code</label>
          <input
            type="text"
            className="form-control"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Verify Account</button>
      </form>
    </div>
  );
};

export default VerifyEmailPage;
