// ponytail: Premium dark-blue sidebar layout with page entry motion animations and active gold states.
import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { motion } from '../../utils/lazyFramer';

const navItems = [
  { path: 'posts', label: 'المدونة', icon: 'ph-article-ny-times' },
  { path: 'services', label: 'الخدمات', icon: 'ph-squares-four' },
  { path: 'pricing', label: 'خطط الأسعار', icon: 'ph-wallet' },
  { path: 'discounts', label: 'كوبونات الخصم', icon: 'ph-ticket' },
  { path: 'purchases', label: 'الطلبات والمشتريات', icon: 'ph-credit-card' },
  { path: 'contact', label: 'الرسائل الواردة', icon: 'ph-envelope-open' },
  { path: 'pages', label: 'الصفحات الثابتة', icon: 'ph-browser' },
  { path: 'partners', label: 'الشركاء', icon: 'ph-handshake' },
  { path: 'stats', label: 'الإحصائيات', icon: 'ph-chart-line-up' },
  { path: 'media', label: 'الوسائط', icon: 'ph-image' },
  { path: 'categories', label: 'التصنيفات', icon: 'ph-tag' },
  { path: 'redirects', label: 'التحويلات', icon: 'ph-arrows-merge' },
  { path: 'settings', label: 'الإعدادات', icon: 'ph-gear' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await supabase.auth.signOut();
      navigate('/admin/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-almarai text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-[#023B65] text-white flex flex-col fixed top-0 bottom-0 start-0 z-50 shadow-xl max-md:w-20 transition-all duration-300">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-3 max-md:justify-center">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img src="/images/logo.png" alt="Ebtkar Logo" className="h-8 max-md:h-6 transition-transform duration-300 hover:scale-105" />
            <div className="flex flex-col text-start max-md:hidden">
              <span className="font-extrabold text-sm text-white tracking-wide">لوحة تحكم</span>
              <span className="text-[10px] text-accent-light font-bold">ADMIN CONTROL</span>
            </div>
          </Link>
        </div>

        {/* Menu Navigation Links */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 rounded-xl font-bold transition-all text-sm group ${
                  isActive
                    ? 'bg-[#F5AD1C] text-[#023B65] shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <i className={`ph-duotone ${item.icon} text-lg shrink-0`} />
              <span className="max-md:hidden">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-red-300 font-bold hover:bg-red-950/30 hover:text-red-200 transition-colors cursor-pointer text-sm"
          >
            <i className="ph ph-sign-out text-lg shrink-0" />
            <span className="max-md:hidden">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ps-64 max-md:ps-20 min-h-screen flex flex-col transition-all duration-300">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <span className="text-gray-500 font-bold text-sm max-md:hidden">مرحباً بك في لوحة تحكم وكالة ابتكار الرقمية</span>
          <Link to="/" className="text-primary hover:text-accent font-bold text-sm flex items-center gap-2 no-underline transition-colors">
            <i className="ph ph-arrow-right" />
            العودة للموقع
          </Link>
        </header>

        <main className="flex-1 p-8 sm:p-10 bg-slate-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
