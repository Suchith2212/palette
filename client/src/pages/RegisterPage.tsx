import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css'; // Import the new CSS file

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    iitgEmail: '',
    personalEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { name, iitgEmail, personalEmail, phoneNumber, password, confirmPassword } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'photo') {
      setPhoto(e.target.files?.[0] || null);
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitError(null);
    // Clear error for the current field as user types
    if (errors[e.target.name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const iitgEmailRegex = /^[a-zA-Z0-9._%+-]+@iitgn\.ac\.in$/;
    const personalEmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!iitgEmail.trim()) {
      newErrors.iitgEmail = 'IITGN Email is required';
    } else if (!iitgEmailRegex.test(iitgEmail)) {
      newErrors.iitgEmail = 'Invalid IIT Gandhinagar email address';
    }
    if (!personalEmail.trim()) {
      newErrors.personalEmail = 'Personal Email is required';
    } else if (!personalEmailRegex.test(personalEmail)) {
      newErrors.personalEmail = 'Invalid personal email address';
    }
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) {
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', name);
      payload.append('iitgEmail', iitgEmail);
      payload.append('personalEmail', personalEmail);
      payload.append('phoneNumber', phoneNumber);
      payload.append('password', password);
      if (photo) {
        payload.append('photo', photo);
      }

      const res = await axios.post('/api/auth/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/verify-email', { state: { iitgEmail: res.data.iitgEmail } }); // Redirect to verification page
    } catch (err: any) {
      console.error('Registration error:', err.response?.data || err.message);
      setSubmitError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Register a New Account</h2>
          <p className="auth-intro text-center">Create your Palette account to submit artwork, join events, and stay connected with the club.</p>
          <form onSubmit={onSubmit}>
            {submitError && <div className="alert alert-danger">{submitError}</div>}
            {/* Row 1: Full Name */}
            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="form-control" 
                  value={name} 
                  onChange={onChange} 
                  required 
                />
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </div>
            </div>

            {/* Row 2: IITGN Email and Personal Email side by side */}
            <div className="form-row">
              <div>
                <label htmlFor="iitgEmail" className="form-label">IITGN Email</label>
                <input 
                  type="email" 
                  id="iitgEmail" 
                  name="iitgEmail" 
                  className="form-control" 
                  value={iitgEmail} 
                  onChange={onChange} 
                  required 
                />
                {errors.iitgEmail && <div className="text-danger">{errors.iitgEmail}</div>}
              </div>
              <div>
                <label htmlFor="personalEmail" className="form-label">Personal Email</label>
                <input 
                  type="email" 
                  id="personalEmail" 
                  name="personalEmail" 
                  className="form-control" 
                  value={personalEmail} 
                  onChange={onChange} 
                  required 
                />
                {errors.personalEmail && <div className="text-danger">{errors.personalEmail}</div>}
              </div>
            </div>

            {/* Row 3: Phone Number and Password side by side */}
            <div className="form-row">
              <div>
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  className="form-control" 
                  value={phoneNumber} 
                  onChange={onChange} 
                  required
                />
                {errors.phoneNumber && <div className="text-danger">{errors.phoneNumber}</div>}
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="form-control" 
                  value={password} 
                  onChange={onChange} 
                  required 
                />
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </div>
            </div>

            {/* Row 4: Confirm Password and Photo */}
            <div className="form-row">
              <div>
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="form-control" 
                  value={confirmPassword} 
                  onChange={onChange} 
                  required 
                />
                {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
              </div>
              <div>
                <label htmlFor="photo" className="form-label">Photo (Optional)</label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  className="form-control"
                  accept="image/*"
                  onChange={onChange}
                />
                <small className="text-muted">If not uploaded, a default avatar will be used.</small>
              </div>
            </div>

            {/* Submit button */}
            <div className="form-full-width">
              <button type="submit" className="btn-accent">Register</button>
            </div>
          </form>
          <div className="text-center">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
