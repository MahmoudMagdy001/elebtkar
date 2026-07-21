import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactWidget from './components/ContactWidget';
import RedirectHandler from './components/RedirectHandler';
import { injectScripts } from './utils/scriptInjector';
import { supabase } from './utils/supabase';

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
      <RedirectHandler>
        <AppContent />
      </RedirectHandler>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Inject site settings custom marketing scripts once on load
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('scripts')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.scripts) {
          injectScripts(data.scripts);
        }
      });
  }, []);

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
      <Analytics />
    </div>
  );
}

export default App;
