import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutUsPage = () => {
  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="row"
      >
        <div className="col-lg-8 mx-auto text-center">
          <span className="text-uppercase small fw-semibold" style={{ letterSpacing: '0.12em', color: 'var(--brand-primary)' }}>
            IIT Gandhinagar
          </span>
          <h2 className="page-title mt-2">About Palette</h2>
          <p className="lead mt-4">
            Palette is the official Art Club of IIT Gandhinagar — a vibrant community for students passionate
            about painting, sketching, digital art, design, and creative expression.
          </p>
          <p className="mt-3">
            We host workshops, competitions, exhibitions, and collaborative projects that help artists grow,
            showcase their work, and represent IITGN on national stages like Inter IIT.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            <Link to="/register" className="btn btn-primary px-4">Join the Club</Link>
            <Link to="/e-exhibition" className="btn btn-outline-primary px-4">Explore E-Exhibition</Link>
            <Link to="/team" className="btn btn-outline-secondary px-4">Meet the Team</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUsPage;
