import React, { useEffect, useState } from 'react';
import { motion } from '../utils/lazyFramer';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { cn } from '../utils/cn';
import SEO from '../components/SEO';
import { usePageSettings } from '../utils/usePageSettings';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings: pageSettings } = usePageSettings('services');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('order_num', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO 
        title="خدماتنا" 
        description="اكتشف مجموعة واسعة من الخدمات التقنية والبرمجية، من تطوير المواقع والتطبيقات إلى التسويق الرقمي وتصميم الهوية البصرية."
        seoSettings={pageSettings?.seo_settings}
      />
      {/* Hero */}
      <header className="relative pt-24 md:pt-44 pb-32 section-padding bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="hidden md:block absolute top-[-20%] right-[-10%] md:w-[50%] md:h-[70%] bg-accent blur-[150px] rounded-full" />
          <div className="hidden md:block absolute bottom-[-20%] left-[-10%] md:w-[50%] md:h-[70%] bg-primary blur-[150px] rounded-full" />
        </div>

        <div className="section-inner relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-right"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-accent font-bold mb-8 hover:text-white transition-colors group">
              <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
              العودة للرئيسية
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              حلول تقنية متكاملة
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-[700px] md:mr-0 md:ml-auto leading-relaxed">
              نقدم لك مجموعة واسعة من الخدمات المصممة خصيصاً لتنمية نشاطك التجاري
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <section className="py-24 section-padding relative z-10 -mt-16">
        <div className="section-inner">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-72 md:h-80 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Search className="mx-auto text-gray-200 mb-6" size={60} />
            <h2 className="text-2xl font-extrabold text-primary">لا توجد خدمات حالياً</h2>
            <p className="text-gray-500 mt-2">يرجى العودة لاحقاً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((srv, index) => (
              <motion.div
                key={srv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group flex flex-col"
              >
                <div className="h-48 bg-primary-gradient relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                  
                  {/* Icon or Image */}
                  {srv.bg_icon?.startsWith('http') || srv.bg_icon?.startsWith('/') ? (
                    <img src={srv.bg_icon} alt={srv.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <i className={cn(srv.bg_icon || 'ph-duotone ph-diamonds-four', 'text-[80px] text-white opacity-90 group-hover:scale-110 transition-transform duration-500')}></i>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-grow text-center">
                  <h3 className="text-xl font-extrabold text-primary mb-6 leading-tight group-hover:text-accent transition-colors">
                    {srv.title}
                  </h3>
                  <Link
                    to={`/services/${srv.slug}`}
                    className="mt-auto inline-flex items-center justify-center gap-2 bg-primary text-white py-3.5 px-8 rounded-full font-bold text-sm hover:bg-accent-gradient hover:text-[#1a0a00] transition-all group/btn"
                  >
                    اكتشف المزيد
                    <ArrowLeft size={18} className="group-hover/btn:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
