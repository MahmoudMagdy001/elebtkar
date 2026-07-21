import React from 'react';
import { motion } from '../../../shared/utils/lazyFramer';
import { Link } from 'react-router-dom';

const pillars = [
  {
    icon: "ph-duotone ph-chart-line-up",
    title: "تحسين الظهور في نتائج البحث",
    desc: "حضور دائم لا يتوقف",
  },
  {
    icon: "ph-duotone ph-layout",
    title: "إنشاء مواقع ومتاجر احترافية",
    desc: "أصل رقمي يعمل 24/7",
  },
  {
    icon: "ph-duotone ph-notebook",
    title: "صناعة محتوى مؤثر",
    desc: "يجذب العملاء ويبني الثقة",
  },
  {
    icon: "ph-duotone ph-fingerprint",
    title: "بناء هوية واضحة للعلامة التجارية",
    desc: "تُميّزك عن المنافسين",
  },
];

const WhyDifferent = () => {
  return (
    <section id="different" className="relative bg-primary overflow-hidden text-white section-padding">
      {/* Decorative Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="section-inner relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-extrabold mb-4 border border-white/20">
              فلسفتنا
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              التسويق بدون إعلانات
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-[700px] mx-auto leading-relaxed">
              كثير من الشركات تعتمد على الإعلانات فقط.. لكن الإعلانات تتوقف فور توقف الميزانية. في الابتكار نعمل بطريقة مختلفة.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-16 h-16 mx-auto bg-accent-gradient rounded-2xl flex items-center justify-center mb-6 text-white transform -rotate-6 hover:rotate-0 transition-transform">
                <i className={`${pillar.icon} text-3xl`}></i>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3">{pillar.title}</h3>
              <p className="text-white/70">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/services" className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 hover:-translate-y-1 transition-all group">
              اعرف المزيد عن خدماتنا
              <i className="ph ph-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;
