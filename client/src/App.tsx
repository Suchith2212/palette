import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import EExhibitionPage from './pages/EExhibitionPage'; // Updated import
import WorkshopsPage from './pages/WorkshopsPage';
import CompetitionsPage from './pages/CompetitionsPage';
import PastEventsPage from './pages/PastEventsPage';
import ProfilePage from './pages/ProfilePage';
import SubmitArtworkPage from './pages/SubmitArtworkPage';
import AdminArtworkReviewPage from './pages/AdminArtworkReviewPage';
import TeamPage from './pages/TeamPage';
import EventPhotosPage from './pages/EventPhotosPage';
import UpcomingEventsPage from './pages/UpcomingEventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import VerifyEmailPage from './pages/VerifyEmailPage'; // Import the new verification page
import AdminEventCreatePage from './pages/AdminEventCreatePage'; // Import the new admin event creation page
import InterIITPage from './pages/InterIITPage'; // New: Import InterIITPage
import ContactUsPage from './pages/ContactUsPage'; // New: Import ContactUsPage
import AdminContactResponsesPage from './pages/AdminContactResponsesPage';
import AdminExhibitionCreatePage from './pages/AdminExhibitionCreatePage';
import AdminEventEditPage from './pages/AdminEventEditPage';
import AdminExhibitionEditPage from './pages/AdminExhibitionEditPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/upcoming-events" element={<UpcomingEventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/past-events" element={<PastEventsPage />} />
            <Route path="/e-exhibition" element={<EExhibitionPage />} /> {/* Updated route */}
            <Route path="/event-photos" element={<EventPhotosPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/inter-iit" element={<InterIITPage />} /> {/* New route */}
            <Route path="/contact-us" element={<ContactUsPage />} /> {/* New route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} /> {/* New route for email verification */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/submit-artwork" element={<SubmitArtworkPage />} />
            <Route path="/admin/artwork-review" element={<AdminArtworkReviewPage />} />
            <Route path="/admin/events/create" element={<AdminEventCreatePage />} /> {/* New route for admin to create events */}
            <Route path="/admin/events/edit/:id" element={<AdminEventEditPage />} />
            <Route path="/admin/contact-responses" element={<AdminContactResponsesPage />} />
            <Route path="/admin/exhibition/create" element={<AdminExhibitionCreatePage />} />
            <Route path="/admin/exhibition/edit/:id" element={<AdminExhibitionEditPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
