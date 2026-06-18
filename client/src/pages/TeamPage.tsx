import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { toMediaUrl } from '../utils/mediaUrl';
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
  email: 'dishant.tanmay@iitgn.ac.in',
  linkedinUrl: 'https://www.linkedin.com/in/dishant-t-0364a628a',
  instagramUrl: 'https://www.instagram.com/uuhsidd?igsh=dG1obnI2NjhjamQx',
};

const teamHeads = [
  {
    role: 'Creative Team',
    head: { name: 'Manavi', photoUrl: '/uploads/exhibition/creative_head.jpeg', email: 'manavi.24110193@iitgn.ac.in', linkedinUrl: 'https://www.linkedin.com/in/manavi-dandia-3a263031a?utm_source=share_via&utm_content=profile&utm_medium=member_android', instagramUrl: 'https://www.instagram.com/vivid_manu?igsh=MXdzazc3bDc2OGt0bA==' },
    members: ['Thrisha Kunala', 'Abhishek Verma', 'Rahul Ramteke', 'Aris', 'Sashvat', 'Prashant', 'Soureen', 'Radhe', 'Toshika', 'Prince', 'Tanay', 'Akarsh', 'Arpita', 'Arman', 'Aditya'],
  },
  {
    role: 'Design Team',
    head: { name: 'Ankita Kushwaha', photoUrl: '/uploads/exhibition/design_head.jpeg', email: 'ankita.kushwaha@iitgn.ac.in', linkedinUrl: 'https://www.linkedin.com/in/ankita-kushwaha-7a4201376?utm_source=share_via&utm_content=profile&utm_medium=member_android', instagramUrl: 'https://www.instagram.com/ankita__111210?igsh=MTR0ZmYwbTRvOGNxeg==' },
    members: ['Kavya Durga Sri', 'Prayagraj', 'Nitschala', 'Anushree', 'Rishitha', 'Triveni', 'Himani'],
  },
  {
    role: 'Management Team',
    head: { name: 'Yashraj', photoUrl: '/uploads/exhibition/management_head.jpeg', email: 'yashraj.meena@iitgn.ac.in', linkedinUrl: 'https://www.linkedin.com/in/yashraj-meena-861814327?utm_source=share_via&utm_content=profile&utm_medium=member_android', instagramUrl: 'https://www.instagram.com/__yashraj__01_?igsh=YmNtZmZibjYyc3Ey' },
    members: ['Ganesh Kamble', 'Padmavathi', 'Khushi Shah', 'Pintu', 'Manan', 'Seema', 'Shivali', 'Roshni', 'Kunal', 'Nikita', 'Jeenal'],
  },
];

const webDesigner = {
  role: 'Web & Platform',
  name: 'S. J. V. Suchith',
  photoUrl: '/uploads/exhibition/author.jpeg',
  email: '24110313@iitgn.ac.in',
  linkedinUrl: 'https://www.linkedin.com/in/suchith-saladi-456500344/',
  instagramUrl: 'https://www.instagram.com/suchith_sv/',
  batch: "BTech '24 · IIT Gandhinagar",
};

const pastSecretaries = [
  { role: 'Secretary · Jul 2024 – Apr 2025', name: 'Anshika Singh', photoUrl: '/uploads/exhibition/Anshika_Singh.jpeg', email: 'anshika.singh@iitgn.ac.in', linkedinUrl: '', instagramUrl: 'https://www.instagram.com/_.anshika.singh._?igsh=NGx5eGZyM2Mya2sx' },
  { role: 'Secretary · Jul 2023 – Apr 2024', name: 'Ishani M Kumar', photoUrl: '/uploads/exhibition/Secretary_July23_April24.jpeg', email: 'ishani.kumar@iitgn.ac.in', linkedinUrl: 'https://www.linkedin.com/in/ishani-kumar-02b789258?utm_source=share_via&utm_content=profile&utm_medium=member_android', instagramUrl: 'https://www.instagram.com/cant.tch.dis?igsh=YjlsdnBuYzF1MmZ6' },
  { role: 'Secretary · Jul 2022 – Apr 2023', name: 'Sukruta Midigeshi', photoUrl: '/uploads/exhibition/Secretary_22_23.jpeg', email: 'sukruta.midigeshi@alumni.iitgn.ac.in', linkedinUrl: 'https://www.linkedin.com/in/sukruta-midigeshi?utm_source=share_via&utm_content=profile&utm_medium=member_android', instagramUrl: '' },
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
        <img src={toMediaUrl(secretary.photoUrl)} alt={secretary.name} className="secretary-photo" />
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
            <img src={toMediaUrl(team.head.photoUrl)} alt={team.head.name} className="team-head-photo" />
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
            <img src={toMediaUrl(ps.photoUrl)} alt={ps.name} className="past-sec-photo" />
            <p className="past-sec-role">{ps.role}</p>
            <h3 className="past-sec-name">{ps.name}</h3>
            <SocialRow email={ps.email} linkedinUrl={ps.linkedinUrl} instagramUrl={ps.instagramUrl} />
          </motion.div>
        ))}
      </motion.div>
    </div>

    <section className="web-platform-section text-center" aria-labelledby="web-platform-title">
      <span className="text-kicker">Digital home of Palette</span>
      <h2 id="web-platform-title" className="page-title web-platform-title">Website Designed By</h2>
      <p className="web-platform-sub">Built and maintained for the Art Club community at IIT Gandhinagar.</p>
      <motion.div
        className="designer-card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
        <img
          src={toMediaUrl(webDesigner.photoUrl)}
          alt={`Website designer ${webDesigner.name}`}
          className="designer-avatar"
        />
        <div className="designer-info">
          <p className="designer-role">{webDesigner.role}</p>
          <h3>{webDesigner.name}</h3>
          <p className="designer-batch">{webDesigner.batch}</p>
          <p className="designer-email">
            <a href={`mailto:${webDesigner.email}`} onClick={(e) => handleEmailClick(e, webDesigner.email)}>
              {webDesigner.email}
            </a>
          </p>
          <SocialRow
            email={webDesigner.email}
            linkedinUrl={webDesigner.linkedinUrl}
            instagramUrl={webDesigner.instagramUrl}
          />
        </div>
      </motion.div>
    </section>

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
