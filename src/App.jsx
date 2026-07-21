import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './shared/components/Navbar';
import Footer from './shared/components/Footer';
import ContactWidget from './shared/components/ContactWidget';
import RedirectHandler from './shared/components/RedirectHandler';
import { injectScripts } from './shared/utils/scriptInjector';
import { supabase } from './shared/utils/supabase';

// Lazy load user-facing pages
const Home = lazy(() => import('./features/home'));
const BlogPage = lazy(() => import('./features/blog/pages/BlogPage'));
const PostDetail = lazy(() => import('./features/blog/pages/PostDetail'));
const ServicesPage = lazy(() => import('./features/services/pages/ServicesPage'));
const ServiceDetail = lazy(() => import('./features/services/pages/ServiceDetail'));
const PrivacyPolicy = lazy(() => import('./shared/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./shared/legal/TermsOfService'));
const NotFoundPage = lazy(() => import('./shared/legal/NotFoundPage'));

// Lazy load admin framework and guard
const ProtectedRoute = lazy(() => import('./shared/components/layout/ProtectedRoute'));
const AdminLayout = lazy(() => import('./shared/components/layout/AdminLayout'));
const Login = lazy(() => import('./features/auth/pages/Login'));

// Lazy load admin feature pages
const AdminPosts = lazy(() => import('./features/blog/pages/AdminPosts'));
const AdminPostForm = lazy(() => import('./features/blog/pages/AdminPostForm'));
const AdminServices = lazy(() => import('./features/services/pages/AdminServices'));
const AdminServiceForm = lazy(() => import('./features/services/pages/AdminServiceForm'));
const AdminPricingPlans = lazy(() => import('./features/pricing/pages/AdminPricingPlans'));
const AdminPricingPlanForm = lazy(() => import('./features/pricing/pages/AdminPricingPlanForm'));
const AdminDiscountCodes = lazy(() => import('./features/discounts/pages/AdminDiscountCodes'));
const AdminPurchases = lazy(() => import('./features/purchases/pages/AdminPurchases'));
const AdminContactMessages = lazy(() => import('./features/contact/pages/AdminContactMessages'));
const AdminPages = lazy(() => import('./features/pages-manager/pages/AdminPages'));
const AdminPartners = lazy(() => import('./features/partners/pages/AdminPartners'));
const AdminStats = lazy(() => import('./features/stats/pages/AdminStats'));
const AdminMedia = lazy(() => import('./features/media/pages/AdminMedia'));
const AdminCategories = lazy(() => import('./features/categories/pages/AdminCategories'));
const AdminRedirects = lazy(() => import('./features/redirects/pages/AdminRedirects'));
const AdminSettings = lazy(() => import('./features/settings/pages/AdminSettings'));

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
            {/* User-facing routes */}
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<PostDetail />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsOfService />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="posts" replace />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="posts/new" element={<AdminPostForm />} />
              <Route path="posts/edit/:id" element={<AdminPostForm />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="services/new" element={<AdminServiceForm />} />
              <Route path="services/edit/:id" element={<AdminServiceForm />} />
              <Route path="pricing" element={<AdminPricingPlans />} />
              <Route path="pricing/new" element={<AdminPricingPlanForm />} />
              <Route path="pricing/edit/:id" element={<AdminPricingPlanForm />} />
              <Route path="discounts" element={<AdminDiscountCodes />} />
              <Route path="purchases" element={<AdminPurchases />} />
              <Route path="contact" element={<AdminContactMessages />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="stats" element={<AdminStats />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="redirects" element={<AdminRedirects />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="posts" replace />} />
            </Route>

            {/* Catch-all */}
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
