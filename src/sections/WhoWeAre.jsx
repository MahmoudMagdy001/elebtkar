import React, { useState, useEffect } from 'react';
import { motion } from '../utils/lazyFramer';
import { ArrowLeft } from 'lucide-react';
import StatItem from '../components/StatItem';
import { supabase } from '../utils/supabase';

const WhoWeAre = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('statistics')
        .select('*')
        .eq('section', 'who')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <section id="who" className="bg-gray-50 section-padding">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">من نحن</span>
          <h2 className="section-title">شريكك في صناعة الأثر الرقمي</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center mt-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-600 leading-relaxed">
              نؤمن أن المحتوى القوي والتقنية المتطورة هما المحرك الحقيقي للمبيعات، ولا نعتمد على الحلول المؤقتة أو الإعلانات الممولة فقط. بل نجعل جمهورك يبحث عنك ويصل إليك بفضل جودة ما تقدمه.
            </p>
            <div className="bg-primary-gradient rounded-xl p-6 text-white text-lg font-bold leading-relaxed border-r-4 border-accent">
              فريقنا جاهز لمساعدتك في بناء حضور رقمي قوي تزامناً مع رؤية المملكة 2030
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="https://wa.me/966579644123" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-6 py-3">
                ابدأ رحلة ابتكارك الآن <ArrowLeft className="w-4 h-4" />
              </a>
              <a href="#contact" className="btn-secondary text-sm px-6 py-3 border-primary text-primary hover:bg-primary/5">
                تواصل معنا الآن
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {stats.length > 0 ? (
              stats.map((stat) => (
                <div key={stat.id} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md flex flex-col justify-center min-h-36">
                  <StatItem 
                    count={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix} 
                    label={stat.label} 
                  />
                </div>
              ))
            ) : (
              // Fallback skeleton or empty state while loading
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200 flex flex-col justify-center min-h-36 opacity-50">
                  <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
