// ponytail: Premium login page with validation states and smooth motion transitions.
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabase';
import { motion } from '../../../shared/utils/lazyFramer';
import SEO from '../../../shared/components/SEO';
import Button from '../../../shared/components/ui/Button';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/admin/posts';

  useEffect(() => {
    // If user is already logged in, redirect them
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectPath, { replace: true });
      }
    });
  }, [navigate, redirectPath]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'خطأ غير معروف في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-[#1b0a3d] px-6 py-12 text-right font-almarai" dir="rtl">
      <SEO title="تسجيل الدخول - لوحة التحكم" description="سجل دخولك لإدارة محتوى موقع الابتكار" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-primary-100 p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="Elebtkar Logo" className="h-14 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-primary mb-2">لوحة التحكم</h2>
          <p className="text-sm text-gray-500 font-bold">سجل دخولك لإدارة محتوى الموقع</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email" 
              required 
              disabled={loading}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-left" 
              style={{ direction: 'ltr' }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">كلمة المرور</label>
            <input 
              type="password" 
              name="password" 
              required 
              disabled={loading}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-left" 
              style={{ direction: 'ltr' }}
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading} 
            className="w-full py-3.5 mt-2 bg-[#023B65]"
          >
            {loading ? 'جاري التحميل...' : 'دخول'}
            <i className="ph ph-sign-in text-lg" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
