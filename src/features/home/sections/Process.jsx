import React from 'react';
import { motion } from '../../../shared/utils/lazyFramer';

const steps = [
  { num: 1, title: 'تحليل', desc: 'ندرس نشاطك ومنافسيك بدقة' },
  { num: 2, title: 'تخطيط', desc: 'نرسم استراتيجية مبتكرة تناسب أهدافك' },
  { num: 3, title: 'تنفيذ', desc: 'نبدأ في تنفيذ الخدمات المطلوبة' },
  { num: 4, title: 'تطوير', desc: 'نطور العمل باستمرار للحصول على أفضل النتائج' },
];

const Process = () => {
  return (
    <section id="process" className="bg-white section-padding overflow-hidden">
      <div className="section-inner">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">طريقة العمل</span>
            <h2 className="section-title">رحلة العمل معنا</h2>
          </motion.div>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 inset-x-4 md:inset-x-[12.5%] h-0.5 bg-gray-100 hidden md:block">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              className="h-full bg-accent-gradient"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center group"
              >
                <div className="w-16 h-16 rounded-full bg-primary-gradient text-white flex items-center justify-center text-2xl font-extrabold border-4 border-accent mb-6 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg relative z-20">
                  {step.num}
                  {/* Outer Glow */}
                  <div className="absolute inset-0 rounded-full bg-primary/10 -z-10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="text-center px-4">
                  <h3 className="text-lg font-extrabold text-primary mb-2 transition-colors group-hover:text-accent">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
