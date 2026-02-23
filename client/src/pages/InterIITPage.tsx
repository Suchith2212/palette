import React from 'react';
// import './InterIITPage.css'; // Optional: for specific styling

const InterIITPage: React.FC = () => {
  const interIITTeamMembers = [
    "Nistchala",
    "Tushar",
    "Pragyaraj",
    "Manavi",
    "Khushi",
    "Omkar",
    "Divyansh"
  ];

  return (
    <div className="container py-5">
      <h2 className="page-title text-center mb-4">Inter IIT</h2>
      <div className="text-center mb-4">
        <img src="/uploads/exhibition/inter_iit.jpeg" alt="Inter IIT Team" className="img-fluid" style={{ maxWidth: '80%', height: 'auto' }} />
      </div>
      <p className="text-center">Welcome to the Inter IIT Arts Meet page!</p>

      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <h3 className="text-center mb-3">Our Inter IIT Team</h3>
          <ul className="list-group list-group-flush">
            {interIITTeamMembers.map((member, index) => (
              <li key={index} className="list-group-item text-center">{member}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center mt-5">More details about our participation and achievements will be updated soon!</p>
    </div>
  );
};

export default InterIITPage;
