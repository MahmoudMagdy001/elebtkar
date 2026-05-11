import React, { useEffect } from 'react';
import { motion } from '../utils/lazyFramer';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileText, Lock } from 'lucide-react';

const LegalPage = ({ title, subtitle, lastUpdated, children, icon: Icon }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative pt-24 md:pt-44 pb-24 section-padding bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="hidden md:block absolute top-[-10%] right-[-10%] md:w-[40%] md:h-[60%] bg-accent blur-[120px] rounded-full" />
          <div className="hidden md:block absolute bottom-[-10%] left-[-10%] md:w-[40%] md:h-[60%] bg-primary blur-[120px] rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-white/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10">
              {Icon && <Icon size={40} />}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-prose mx-auto leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <section className="py-24 section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-extrabold prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-accent prose-strong:text-primary"
          >
            <span className="inline-block text-accent font-bold mb-8 text-sm bg-accent/10 px-4 py-1.5 rounded-full">
              آخر تحديث: {lastUpdated}
            </span>
            
            <div className="article-content">
              {children}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100">
              <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors group">
                <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                العودة للرئيسية
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;
