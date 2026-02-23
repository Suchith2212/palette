import React, { useState } from 'react';
import { FaEnvelope, FaLinkedin, FaInstagram } from 'react-icons/fa'; // Import social media icons
import api from '../services/api';
import './ContactUsPage.css'; // Assuming a CSS file for styling

const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, email, subject, message } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!name.trim()) newErrors.name = 'Your Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionMessage(null);
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/contact', formData); 
      console.log('Contact form submitted:', formData);
      setSubmissionMessage('Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setSubmissionMessage('Failed to send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-us-page">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Contact Us</h2>
          {submissionMessage && (
            <div className={`alert ${submissionMessage.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
              {submissionMessage}
            </div>
          )}
          <form onSubmit={onSubmit}>
            {/* Row 1: Name and Email side by side */}
            <div className="form-row">
              <div>
                <label htmlFor="name" className="form-label">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={name}
                  onChange={onChange}
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div>
                <label htmlFor="email" className="form-label">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={onChange}
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            {/* Row 2: Subject - full width */}
            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                  value={subject}
                  onChange={onChange}
                  required
                />
                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
              </div>
            </div>

            {/* Row 3: Message - full width */}
            <div className="form-row">
              <div className="form-full-width">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                  value={message}
                  onChange={onChange}
                  required
                ></textarea>
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>
            </div>
            
            <div className="form-full-width">
              <button type="submit" className="btn-accent" disabled={isSubmitting}> {/* Changed to btn-accent */}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>


    </div>
  );
};

export default ContactUsPage;