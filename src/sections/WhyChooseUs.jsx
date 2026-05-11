import React, { useState, useEffect } from 'react';
import { motion } from '../utils/lazyFramer';
import StatItem from '../components/StatItem';
import { supabase } from '../utils/supabase';

const whyData = [
  { num: '01', title: 'رقمي حقيقي وليس مؤقت', desc: 'نركز على النتائج الحقيقية والأصول الرقمية التي تبقى وتنمو مع الوقت' },
  { num: '02', title: 'فريق متخصص', desc: 'فريقنا يضم خبراء في التقنية والتسويق وصناعة المحتوى في آنٍ واحد' },
  { num: '03', title: 'حلول متكاملة', desc: 'كل ما يحتاجه نشاطك التجاري في مكان واحد دون الحاجة لأكثر من جهة' },
  { num: '04', title: 'عمل منظم وواضح', desc: 'نعمل وفق خطة واضحة وخطوات مدروسة تُبقيك على اطلاع دائم' },
];

const WhyChooseUs = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('statistics')
        .select('*')
        .eq('section', 'stats')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <section id="why" className="bg-gray-50 py-24 section-padding">
      <div className="section-inner">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">لماذا الابتكار</span>
            <h2 className="section-title">لماذا تختار الابتكار للتطوير الرقمي؟</h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {whyData.map((item, index) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 border border-gray-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md relative"
            >
              <div className="text-5xl font-extrabold text-primary/10 absolute top-4 left-4 leading-none select-none">
                {item.num}
              </div>
              <h3 className="text-lg font-extrabold text-primary mb-3 relative z-10">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* STATS ROW */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary-gradient rounded-xl p-10 flex flex-wrap items-center justify-center gap-8 md:gap-0"
        >
          {stats.length > 0 ? (
            stats.map((stat, index) => (
              <React.Fragment key={stat.id}>
                <StatItem 
                  count={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                  label={stat.label} 
                  className="text-center px-12 flex-1 min-w-36" 
                  light={true} 
                />
                {index < stats.length - 1 && (
                  <div className="hidden md:block w-px h-16 bg-white/20" />
                )}
              </React.Fragment>
            ))
          ) : (
            // Fallback skeleton
            [1, 2, 3].map((i, index) => (
              <React.Fragment key={i}>
                <div className="text-center px-12 flex-1 min-w-36 opacity-50">
                  <div className="h-10 w-20 bg-white/20 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 w-24 bg-white/20 rounded mx-auto animate-pulse"></div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block w-px h-16 bg-white/20" />
                )}
              </React.Fragment>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
