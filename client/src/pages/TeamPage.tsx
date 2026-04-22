import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaInstagram } from 'react-icons/fa';
import './TeamPage.css';

const buildGmailUrl = (email: string) => {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email });
  return `https://mail.google.com/mail/?${params.toString()}`;
};

const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>, email: string) => {
  const win = window.open(buildGmailUrl(email), '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = `mailto:${email}`;
  e.preventDefault();
};

const SocialRow: React.FC<{
  email?: string; linkedinUrl?: string; instagramUrl?: string; small?: boolean;
}> = ({ email, linkedinUrl, instagramUrl }) => (
  <div className="team-social-row">
    {email && (
      <a href={`mailto:${email}`} className="team-social-btn tsb-mail" aria-label="Email"
        onClick={(e) => handleEmailClick(e, email)}>
        <FaEnvelope />
      </a>
    )}
    {linkedinUrl && (
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="team-social-btn tsb-linkedin" aria-label="LinkedIn">
        <FaLinkedin />
      </a>
    )}
    {instagramUrl && (
      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="team-social-btn tsb-instagram" aria-label="Instagram">
        <FaInstagram />
      </a>
    )}
  </div>
);

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
    head: { name: 'Manavi', photoUrl: '/uploads/exhibition/creative_head.jpeg', email: 'manavi@example.com', linkedinUrl: 'https://www.linkedin.com/in/manavi', instagramUrl: 'https://www.instagram.com/manavi' },
    members: ['Thrisha Kunala', 'Abhishek Verma', 'Rahul Ramteke', 'Aris', 'Sashvat', 'Prashant', 'Soureen', 'Radhe', 'Toshika', 'Prince', 'Tanay', 'Akarsh', 'Arpita', 'Arman', 'Aditya'],
  },
  {
    role: 'Design Team',
    head: { name: 'Ankita Kushwaha', photoUrl: '/uploads/exhibition/design_head.jpeg', email: 'ankita@example.com', linkedinUrl: 'https://www.linkedin.com/in/ankita', instagramUrl: 'https://www.instagram.com/ankita' },
    members: ['Kavya Durga Sri', 'Prayagraj', 'Nischala', 'Anushree', 'Rishitha', 'Triveni', 'Himani'],
  },
  {
    role: 'Management Team',
    head: { name: 'Yashraj', photoUrl: '/uploads/exhibition/management_head.jpeg', email: 'yashraj@example.com', linkedinUrl: 'https://www.linkedin.com/in/yashraj', instagramUrl: 'https://www.instagram.com/yashraj' },
    members: ['Ganesh Kamble', 'Padmavathi', 'Kushi Shah', 'Pintu', 'Manan', 'Seema', 'Shivaji', 'Roshni', 'Kunal', 'Nikita', 'Jeenal'],
  },
];

const pastSecretaries = [
  { role: 'Secretary · Jul 2024 – Apr 2025', name: 'Anshika Singh', photoUrl: '/uploads/exhibition/Anshika_Singh.jpeg', email: 'anshika@example.com', linkedinUrl: 'https://www.linkedin.com/in/anshika', instagramUrl: 'https://www.instagram.com/anshika' },
  { role: 'Secretary · Jul 2023 – Apr 2024', name: 'Ishani M Kumar', photoUrl: '/uploads/exhibition/secretary_july23_april24.jpeg', email: 'ishani@example.com', linkedinUrl: 'https://www.linkedin.com/in/ishani', instagramUrl: 'https://www.instagram.com/ishani' },
  { role: 'Secretary · Jul 2022 – Apr 2023', name: 'Sukruta Midigeshi', photoUrl: '/uploads/exhibition/secretary_22_23.jpeg', email: 'sukruta@example.com', linkedinUrl: 'https://www.linkedin.com/in/sukruta', instagramUrl: 'https://www.instagram.com/sukruta' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TeamPage = () => (
  <div className="team-page-wrap container">
    {/* Header */}
    <div className="team-page-header">
      <h1 className="page-title">Our Team</h1>
      <p className="team-page-sub">
        Meet the passionate individuals who bring Palette to life :- <br />organizing events, fostering creativity, and building community.
      </p>
    </div>

    {/* Secretary */}
    <motion.div
      className="secretary-hero"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
    >
      <div className="secretary-photo-wrap">
        <img src={secretary.photoUrl} alt={secretary.name} className="secretary-photo" />
      </div>
      <span className="secretary-role-badge">{secretary.role}</span>
      <h2 className="secretary-name">{secretary.name}</h2>
      <SocialRow email={secretary.email} linkedinUrl={secretary.linkedinUrl} instagramUrl={secretary.instagramUrl} />
    </motion.div>

    {/* Org connector */}
    <div className="org-connector">
      <div className="org-vline" />
    </div>

    {/* Team Branches */}
    <motion.div
      className="team-branches"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {teamHeads.map((team) => (
        <motion.div key={team.role} className="team-branch-card" variants={fadeUp}>
          <div className="team-branch-header">
            <p className="team-branch-role">{team.role}</p>
          </div>

          {/* Head */}
          <div className="team-head-card">
            <img src={team.head.photoUrl} alt={team.head.name} className="team-head-photo" />
            <div className="team-head-info">
              <h3 className="team-head-name">{team.head.name}</h3>
              <p className="team-head-label">Team Head</p>
              <SocialRow email={team.head.email} linkedinUrl={team.head.linkedinUrl} instagramUrl={team.head.instagramUrl} />
            </div>
          </div>

          {/* Members */}
          {team.members.length > 0 && (
            <div className="team-members-section">
              <p className="team-members-heading">Members ({team.members.length})</p>
              <div className="team-members-chips">
                {team.members.map((name) => (
                  <span key={name} className="member-chip">
                    <span className="member-chip-dot" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>

    {/* Past Secretaries */}
    <div className="past-secretaries-section text-center">
      <h2 className="page-title past-secretaries-title">Past Secretaries</h2>
      <motion.div
        className="past-secretaries-grid"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {pastSecretaries.map((ps) => (
          <motion.div key={ps.name} className="past-secretary-card" variants={fadeUp}>
            <img src={ps.photoUrl} alt={ps.name} className="past-sec-photo" />
            <p className="past-sec-role">{ps.role}</p>
            <h3 className="past-sec-name">{ps.name}</h3>
            <SocialRow email={ps.email} linkedinUrl={ps.linkedinUrl} instagramUrl={ps.instagramUrl} />
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* About blurb */}
    <div className="club-blurb text-center">
      <p className="lead">
        Step into <strong>Palette,</strong> IIT Gandhinagar’s creative space where ideas transform into art, and expression knows no limits.
      </p>
      <p className="lead">What awaits you:</p>
      <ul>
        <li>Discover upcoming <strong>Workshops</strong> and <strong>Competitions</strong></li>
        <li>Explore our <strong>E-exhibition</strong> featuring artworks</li>
        <li>View <strong>Event Photos</strong> and past highlights</li>
        <li><strong>Submit your artwork</strong> for display</li>
        <li>Connect with <strong>Core members</strong> and <strong>Coordinators</strong></li>
      </ul>
      <p className="lead">Palette is where your artistic journey at IITGN truly finds its voice. <strong>Join us!</strong></p>
    </div>
  </div>
);

export default TeamPage;
