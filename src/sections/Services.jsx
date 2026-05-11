import React, { useEffect, useState } from 'react';
import { motion } from '../utils/lazyFramer';
import { cn } from '../utils/cn';
import { supabase } from '../utils/supabase';

const ServiceCard = ({ service, index }) => {
  const isAccent = false;
  const isNew = false;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative p-8 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
        isAccent 
          ? "bg-primary-gradient border-transparent text-white" 
          : "bg-white border-gray-200 hover:border-primary/20 hover:shadow-lg hover:-translate-y-2"
      )}
      onClick={() => window.location.href = `/services/${service.slug}`}
    >
      {/* Accent Line */}
      <div className={cn(
        "absolute top-0 right-0 w-1 h-0 bg-accent-gradient transition-all duration-400 group-hover:h-full",
        isAccent && "h-full"
      )} />

      {isNew && (
        <span className="absolute top-4 left-4 bg-accent text-[#1a0a00] text-[0.7rem] font-extrabold px-2.5 py-1 rounded-full">
          جديد
        </span>
      )}

      <div className={cn(
        "w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
        isAccent 
          ? "bg-white/10 text-accent" 
          : "bg-primary/5 text-primary group-hover:bg-accent-gradient group-hover:text-[#1a0a00]"
      )}>
        {service.bg_icon?.startsWith('http') || service.bg_icon?.startsWith('/') ? (
          <img src={service.bg_icon} alt={service.title} className="w-8 h-8 object-contain" />
        ) : (
          <i className={cn(service.bg_icon || 'ph-duotone ph-diamonds-four', 'text-[32px]')}></i>
        )}
      </div>

      <h3 className={cn(
        "text-xl font-extrabold mb-3",
        !isAccent && "text-primary"
      )}>
        {service.title}
      </h3>
      
      <p className={cn(
        "text-sm leading-relaxed line-clamp-3",
        isAccent ? "text-white/80" : "text-gray-600"
      )}>
        {service.subtitle || service.description}
      </p>
    </motion.div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <section id="services" className="bg-white section-padding">
      <div className="section-inner">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">خدماتنا</span>
            <h2 className="section-title">خدمات متكاملة.. لنتائج استثنائية</h2>
            <p className="section-subtitle mx-auto">نقدم لك مجموعة واسعة من الخدمات المصممة لتنمية نشاطك التجاري رقمياً</p>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
