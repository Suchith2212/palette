import React from 'react';
import './InterIITPage.css';

const InterIITPage: React.FC = () => {
  const interIITTeamMembers = [
    {
      name: 'Manavi',
      photoUrl: '/uploads/exhibition/manavi.jpeg',
    },
    {
      name: 'Khushi',
      photoUrl: '/uploads/exhibition/Khushi.jpeg',
    },
    {
      name: 'Tushar',
      photoUrl: '/uploads/exhibition/Tushar.jpeg',
    },
    {
      name: 'Prayagraj',
      photoUrl: '/uploads/exhibition/prayagraj.jpeg',
    },
    {
      name: 'Nistchala',
      photoUrl: '/uploads/exhibition/nistchala.jpeg',
    },
    {
      name: 'Omkar',
      photoUrl: '/uploads/exhibition/omkar.jpeg',
    },
  ];

  return (
    <div className="container interiit-page-wrap">
      <section className="interiit-hero">
        <h2 className="page-title interiit-title">Our Inter IIT Cultural Meet 2025 Team</h2>
        <p className="interiit-subtitle">
         A dedicated creative team representing IIT Gandhinagar across fine art, digital art, and costume design.
        </p>
        <div className="interiit-hero-image-wrap">
          <img
            src="/uploads/exhibition/inter_iit.jpeg"
            alt="Inter IIT Team"
            className="img-fluid interiit-hero-image"
          />
        </div>
        <div className="interiit-meta-row">
          <span className="interiit-meta-chip">6 Team Members</span>
          <span className="interiit-meta-chip">Palette Representation</span>
          <span className="interiit-meta-chip">Inter IIT 2025</span>
        </div>
      </section>

      <section className="interiit-team-section">
        <div className="interiit-section-head">
          <h3 className="interiit-section-title">Meet The Individual</h3>
        </div>
        <div className="interiit-grid">
          {interIITTeamMembers.map((member, index) => (
            <article key={index} className="interiit-member-card">
              <div className="interiit-member-photo-wrap">
                <img src={member.photoUrl} alt={member.name} className="interiit-member-photo" />
              </div>
              <div className="interiit-member-content">
                <h6 className="interiit-member-name">{member.name}</h6>
                <p className="interiit-member-role">Inter IIT Arts Team</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="interiit-note">
        <p className="mb-0">More updates on participation, showcases, and achievements will be published here.</p>
      </div>
    </div>
  );
};

export default InterIITPage;
