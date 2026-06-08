import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactWidget from './components/ContactWidget';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-almarai text-right" dir="rtl">
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<PostDetail />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsOfService />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <ContactWidget />}
    </div>
  );
}

export default App;
