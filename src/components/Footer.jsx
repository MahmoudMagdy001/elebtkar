import React, { useEffect, useState } from 'react';
import { cn } from '../utils/cn';
import { supabase } from '../utils/supabase';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const socialLinks = [
  { iconClass: 'ph ph-twitter-logo', href: 'https://x.com/Elebtkarsa', label: 'تويتر' },
  { iconClass: 'ph ph-instagram-logo', href: 'https://www.instagram.com/elebtkar.sa/', label: 'انستغرام' },
  { iconClass: 'ph ph-facebook-logo', href: 'https://www.facebook.com/profile.php?id=61587739753425', label: 'فيسبوك' },
  { iconClass: 'ph ph-snapchat-logo', href: 'https://www.snapchat.com/add/elebtikar.sa', label: 'سناب شات' },
  { iconClass: 'ph ph-tiktok-logo', href: 'https://www.tiktok.com/@elebtkar.sa', label: 'تيك توك' },
  { iconClass: 'ph ph-linkedin-logo', href: 'https://www.linkedin.com/company/elebtkar', label: 'لينكد إن' },
  { iconClass: 'ph ph-whatsapp-logo', href: 'https://wa.me/966579644123', label: 'واتساب' },
];

const Footer = () => {
  const [services, setServices] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('title, slug')
          .order('order_num', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services for footer:', err);
      }
    };

    fetchServices();
  }, []);
  return (
    <footer className="bg-[#00253a] pt-16 px-6 text-white/60">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <div className="mb-6">
              <Link to="/" onClick={handleHomeClick}>
                <img src="/src/assets/images/logo.png" alt="الابتكار logo" className="h-[50px] w-auto transition-transform duration-300 hover:scale-105" />
              </Link>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              شريكك في التسويق الرقمي والتقنية في المملكة العربية السعودية
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all hover:bg-accent-gradient hover:text-[#1a0a00] hover:-translate-y-1 hover:border-transparent shrink-0"
                >
                  <i className={`${social.iconClass} text-[20px]`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-accent-light font-extrabold text-base">روابط سريعة</h4>
            <ul className="space-y-3 list-none">
              <li><Link to="/" onClick={handleHomeClick} className="text-sm hover:text-white transition-colors">الرئيسية</Link></li>
              <li><a href="/#who" className="text-sm hover:text-white transition-colors">من نحن</a></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">خدماتنا</Link></li>
              <li><Link to="/blog" className="text-sm hover:text-white transition-colors">المدونة</Link></li>
              <li><a href="/#contact" className="text-sm hover:text-white transition-colors">تواصل معنا</a></li>
              <li><Link to="/privacy-policy" className="text-sm hover:text-white transition-colors">سياسة الخصوصية</Link></li>
              <li><Link to="/terms-and-conditions" className="text-sm hover:text-white transition-colors">الشروط والأحكام</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-accent-light font-extrabold text-base">خدماتنا</h4>
            <ul className="space-y-3 list-none">
              {services.length > 0 ? (
                services.map((service) => (
                  <li key={service.slug}>
                    <Link to={`/services/${service.slug}`} className="text-sm hover:text-white transition-colors">
                      {service.title}
                    </Link>
                  </li>
                ))
              ) : (
                [
                  'SEO & GEO',
                  'المتاجر والمواقع الإلكترونية',
                  'تطوير المحتوى',
                  'إدارة منصات التواصل الاجتماعي',
                  'إدارة الإعلانات',
                  'تطبيقات الهواتف الذكية',
                  'الذكاء الاصطناعي المؤسسي'
                ].map((s) => (
                  <li key={s}>
                    <Link to="/services" className="text-sm hover:text-white transition-colors">{s}</Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-accent-light font-extrabold text-base">تواصل معنا</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent-gradient group-hover:text-[#1a0a00] transition-all">
                  <i className="ph-duotone ph-envelope text-[18px]"></i>
                </div>
                <a href="mailto:Info@elebtikar-sa.com" className="text-sm hover:text-white transition-colors">
                  Info@elebtikar-sa.com
                </a>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent-gradient group-hover:text-[#1a0a00] transition-all">
                  <i className="ph-duotone ph-phone text-[18px]"></i>
                </div>
                <a href="tel:+966175107335" dir="ltr" className="text-sm hover:text-white transition-colors">
                  +966 17 510 7335
                </a>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent-gradient group-hover:text-[#1a0a00] transition-all">
                  <i className="ph-duotone ph-map-pin text-[18px]"></i>
                </div>
                <span className="text-sm">نجران حي الشرفة الشمالية</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="/assets/docs/sgl.pdf" target="_blank" className="flex flex-col items-center gap-2 group text-center">
                <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden group-hover:border-accent group-hover:scale-110 transition-all">
                  <img src="/src/assets/images/1.png" alt="SGL" className="w-full h-full object-cover" />
                </div>
                <span className="text-[0.7rem] group-hover:text-white">السجل التجاري</span>
              </a>
              <a href="/assets/docs/location.pdf" target="_blank" className="flex flex-col items-center gap-2 group text-center">
                <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden group-hover:border-accent group-hover:scale-110 transition-all">
                  <img src="/src/assets/images/2.webp" alt="Location" className="w-full h-full object-cover" />
                </div>
                <span className="text-[0.7rem] group-hover:text-white">العنوان الوطني</span>
              </a>
            </div>
          </div>
        </div>

        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.8rem] opacity-60 text-center md:text-right">
          <p>© {new Date().getFullYear()} الابتكار - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
