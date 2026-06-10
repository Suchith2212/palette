import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import RouteLoader from './components/RouteLoader';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import EExhibitionPage from './pages/EExhibitionPage';
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
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminEventCreatePage from './pages/AdminEventCreatePage';
import InterIITPage from './pages/InterIITPage';
import ContactUsPage from './pages/ContactUsPage';
import AdminContactResponsesPage from './pages/AdminContactResponsesPage';
import AdminExhibitionCreatePage from './pages/AdminExhibitionCreatePage';
import AdminEventEditPage from './pages/AdminEventEditPage';
import AdminExhibitionEditPage from './pages/AdminExhibitionEditPage';
import AdminSelectEventsPage from './pages/AdminSelectEventsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutUsPage from './pages/AboutUsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import './theme.css';
import './index.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  const [isRouteLoading, setIsRouteLoading] = useState(true);

  useEffect(() => {
    setIsRouteLoading(true);
    const timeoutId = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname]);

  return (
    <>
      <RouteLoader active={isRouteLoading} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] as any } }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] as any } }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/upcoming-events" element={<UpcomingEventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/past-events" element={<PastEventsPage />} />
            <Route path="/e-exhibition" element={<EExhibitionPage />} />
            <Route path="/event-photos" element={<EventPhotosPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/inter-iit" element={<InterIITPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/submit-artwork" element={<SubmitArtworkPage />} />
            <Route path="/admin/artwork-review" element={<AdminRoute><AdminArtworkReviewPage /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/events/create" element={<AdminRoute><AdminEventCreatePage /></AdminRoute>} />
            <Route path="/admin/events/edit/:id" element={<AdminRoute><AdminEventEditPage /></AdminRoute>} />
            <Route path="/admin/events/select" element={<AdminRoute><AdminSelectEventsPage /></AdminRoute>} />
            <Route path="/admin/contact-responses" element={<AdminRoute><AdminContactResponsesPage /></AdminRoute>} />
            <Route path="/admin/exhibition/create" element={<AdminRoute><AdminExhibitionCreatePage /></AdminRoute>} />
            <Route path="/admin/exhibition/edit/:id" element={<AdminRoute><AdminExhibitionEditPage /></AdminRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
