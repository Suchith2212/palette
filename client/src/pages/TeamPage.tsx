import React from 'react';
import { FaEnvelope, FaLinkedin, FaInstagram } from 'react-icons/fa';
import './TeamPage.css';

const TeamPage = () => {
  const secretary = {
    role: 'Secretary',
    name: 'Dishant Tanmay',
    photoUrl: '/uploads/exhibition/secretary.jpeg',
    email: 'dishant@example.com',
    linkedinUrl: 'https://www.linkedin.com/in/dishant',
    instagramUrl: 'https://www.instagram.com/dishant',
  };

  const teamHeads = [
    {
      role: 'Creative Team',
      head: {
        name: 'Manavi',
        photoUrl: '/uploads/exhibition/creative_head.jpeg',
        email: 'manavi@example.com',
        linkedinUrl: 'https://www.linkedin.com/in/manavi',
        instagramUrl: 'https://www.instagram.com/manavi',
      },
      members: [
        { name: 'Thrisha Kunala' },
        { name: 'Abhishek Verma' },
        { name: 'Rahul Ramteke' },
        { name: 'Aris' },
        { name: 'Sashvat' },
        { name: 'Prashant' },
        { name: 'Soureen' },
        { name: 'Radhe' },
        { name: 'Toshika' },
        { name: 'Prince' },
        { name: 'Tanay' },
        { name: 'Akarsh' },
        { name: 'Arpita' },
        { name: 'Arman' },
        { name: 'Aditya' },
      ],
    },
    {
      role: 'Design Team',
      head: {
        name: 'Ankita Kushwaha',
        photoUrl: '/uploads/exhibition/design_head.jpeg',
        email: 'ankita@example.com',
        linkedinUrl: 'https://www.linkedin.com/in/ankita',
        instagramUrl: 'https://www.instagram.com/ankita',
      },
      members: [
        { name: 'Kavya Durga Sri' },
        { name: 'Prayagraj' },
        { name: 'Nischala' },
        { name: 'Anushree' },
        { name: 'Rishitha' },
        { name: 'Triveni' },
        { name: 'Himani' },
      ],
    },
    {
      role: 'Management Team',
      head: {
        name: 'Yashraj',
        photoUrl: '/uploads/exhibition/management_head.jpeg',
        email: 'yashraj@example.com',
        linkedinUrl: 'https://www.linkedin.com/in/yashraj',
        instagramUrl: 'https://www.instagram.com/yashraj',
      },
      members: [
        { name: 'Ganesh Kamble' },
        { name: 'Padmavathi' },
        { name: 'Kushi Shah' },
        { name: 'Pintu' },
        { name: 'Manan' },
        { name: 'Seema' },
        { name: 'Shivaji' },
        { name: 'Roshni' },
        { name: 'Kunal' },
        { name: 'Nikita' },
        { name: 'Jeenal' },
      ],
    },
  ];

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 page-title">Our Team</h1>

      <div className="team-tree-container">
        <div className="tree-root">
          <div className="secretary-card">
            <div className="member-photo-container">
              <img src={secretary.photoUrl} alt={secretary.name} className="member-photo" />
            </div>
            <h2 className="member-role-title">{secretary.role}</h2>
            <h3 className="member-name">{secretary.name}</h3>
            <div className="social-links">
              {secretary.email && (
                <a href={`mailto:${secretary.email}`} className="social-link">
                  <FaEnvelope />
                </a>
              )}
              {secretary.linkedinUrl && (
                <a href={secretary.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaLinkedin />
                </a>
              )}
              {secretary.instagramUrl && (
                <a href={secretary.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaInstagram />
                </a>
              )}
            </div>
          </div>
          <div className="vertical-line"></div>
        </div>

        <div className="team-branches-wrapper">
          <div className="horizontal-connector"></div>
          <div className="teams-grid">
            {teamHeads.map((team, index) => (
              <div key={index} className="team-branch">
                <div className="branch-line"></div>

                <div className="team-container">
                  <h3 className="team-title">{team.role}</h3>

                  <div className="team-head-card">
                    <div className="head-photo-container">
                      <img src={team.head.photoUrl} alt={team.head.name} className="head-photo" />
                    </div>
                    <h4 className="head-name">{team.head.name}</h4>
                    <div className="head-label">Team Head</div>
                    <div className="social-links social-links-small">
                      {team.head.email && (
                        <a href={`mailto:${team.head.email}`} className="social-link" onClick={(e) => e.stopPropagation()}>
                          <FaEnvelope />
                        </a>
                      )}
                      {team.head.linkedinUrl && (
                        <a href={team.head.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-link" onClick={(e) => e.stopPropagation()}>
                          <FaLinkedin />
                        </a>
                      )}
                      {team.head.instagramUrl && (
                        <a href={team.head.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link" onClick={(e) => e.stopPropagation()}>
                          <FaInstagram />
                        </a>
                      )}
                    </div>
                  </div>

                  {team.members && team.members.length > 0 && (
                    <div className="team-members-list">
                      <div className="members-divider"></div>
                      <h5 className="members-heading">Team Members</h5>
                      <div className="members-grid">
                        {team.members.map((member, memberIndex) => (
                          <div key={memberIndex} className="member-card-simple">
                            <div className="member-icon">Art</div>
                            <div className="member-name-simple">{member.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="club-description text-center mb-5">
        <p className="lead">
          Welcome to Palette, the official Arts Club of IIT Gandhinagar! We are a vibrant community dedicated to fostering creativity, celebrating artistic expression, and providing a platform for students to explore various art forms.
        </p>
        <p>
          Our club organizes a diverse range of activities including workshops on different art techniques, exciting competitions to showcase talent, and engaging events that bring art closer to everyone. This website serves as a central hub for all things Palette. Here, you can:
        </p>
        <ul>
          <li>Discover upcoming <strong>workshops</strong> and <strong>competitions</strong>.</li>
          <li>Explore our <strong>E-exhibition</strong> featuring artworks from our talented members.</li>
          <li>View <strong>event photos</strong> and see what we&apos;ve been up to.</li>
          <li><strong>Submit your own artwork</strong> for review and display.</li>
          <li>Connect with <strong>core members</strong> and <strong>coordinators</strong>.</li>
          <li>Stay updated with <strong>past events</strong> and our artistic journey.</li>
        </ul>
        <p>
          Palette is where your artistic journey at IIT Gandhinagar truly finds its voice. Join us in creating, sharing, and appreciating art!
        </p>
      </div>
    </div>
  );
};

export default TeamPage;
