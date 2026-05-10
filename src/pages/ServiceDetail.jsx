import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { cn } from '../utils/cn';
import SEO from '../components/SEO';
import Pricing from '../sections/Pricing';
import PaymentModal from '../components/PaymentModal';

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentOpen(true);
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) throw error || new Error('Not found');
        setService(data);
      } catch (err) {
        console.error('Error fetching service:', err);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="pt-[150px] pb-24 px-[5%] max-w-[1000px] mx-auto animate-pulse">
        <SEO title="جاري التحميل..." />
        <div className="h-[400px] bg-gray-200 rounded-3xl mb-12" />
        <div className="h-10 w-2/3 bg-gray-200 rounded mb-6" />
        <div className="h-6 w-full bg-gray-200 rounded mb-4" />
        <div className="h-6 w-5/6 bg-gray-200 rounded mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title={service.title}
        description={service.subtitle || service.description?.substring(0, 160)}
        image={service.bg_icon}
      />
      {/* Hero */}
      <header className="relative pt-[180px] pb-32 px-[5%] bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] bg-accent blur-[150px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-primary blur-[150px] rounded-full" />
        </div>

        <div className="max-w-[1000px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-right"
          >
            <Link to="/services" className="inline-flex items-center gap-2 text-accent font-bold mb-8 hover:text-white transition-colors group">
              <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
              عرض كل الخدمات
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              {service.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-[700px] md:mr-0 md:ml-auto leading-relaxed">
              {service.subtitle}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <section className="py-24 px-[5%] relative z-10 -mt-16">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-start">
            {/* Features & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-primary">مميزات الخدمة</h2>
                  <p className="text-gray-500">حلول مخصصة تناسب احتياجاتك</p>
                </div>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {(service.features || []).map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl text-gray-700 font-bold text-sm border border-transparent hover:border-accent/30 hover:bg-white transition-all group">
                    <CheckCircle2 size={20} className="text-accent shrink-0 group-hover:scale-110 transition-transform" />
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={`https://wa.me/966579644123?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن خدمة: ${service.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 justify-center py-4 text-lg"
                >
                  اطلب الخدمة الآن
                </a>
              </div>
            </motion.div>

            {/* Showcase Image/Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="h-[400px] lg:h-[500px] w-full bg-primary-gradient rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
              
              {service.bg_icon?.startsWith('http') || service.bg_icon?.startsWith('/') ? (
                <img 
                  src={service.bg_icon} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <i className={cn(service.bg_icon || 'ph-duotone ph-diamonds-four', 'text-[180px] text-white opacity-90 filter drop-shadow-2xl')}></i>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 pt-20 border-t border-gray-100 w-full overflow-hidden"
          >
            <h3 className="text-3xl font-extrabold text-primary mb-8 text-center md:text-right">تفاصيل إضافية عن الخدمة</h3>
            <div className="article-content text-lg text-gray-600 leading-relaxed w-full">
              {service.description ? (
                <div dangerouslySetInnerHTML={{ __html: service.description }} />
              ) : (
                'نحن نؤمن بأن كل مشروع هو فرصة للابتكار. خدماتنا مصممة لتلبية تطلعاتك وتحقيق أهدافك التجارية بأحدث التقنيات وأفضل الممارسات العالمية.'
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing onSelectPlan={handleSelectPlan} />

      {/* Final CTA */}
      <section className="py-24 px-[5%] bg-white text-center">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary-gradient p-12 md:p-20 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 relative z-10">هل أنت مستعد للبدء؟</h2>
            <p className="text-xl text-white/80 mb-12 relative z-10">انضم إلى قائمة شركائنا المتميزين وابدأ رحلة ابتكارك اليوم</p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <a href="https://wa.me/966579644123" target="_blank" rel="noopener noreferrer" className="btn-primary bg-white text-primary hover:bg-accent-light">
                تواصل معنا الآن
              </a>
              <Link to="/contact" className="btn-secondary border-white text-white hover:bg-white/10">
                طلب استشارة مجانية
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PaymentModal 
        plan={selectedPlan}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
};

export default ServiceDetail;
