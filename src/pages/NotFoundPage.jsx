import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import SEO from '../components/SEO';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden py-24 px-[5%]">
      <SEO 
        title="404 - الصفحة غير موجودة" 
        description="عذراً، الصفحة التي تبحث عنها غير موجودة."
      />

      {/* Decorative Shapes (Matching Hero) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ translateY: [0, -30, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] -top-[100px] -left-[150px] rounded-full bg-white/5"
        />
        <motion.div 
          animate={{ translateY: [0, -30, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute w-[350px] h-[350px] -bottom-[80px] -right-[80px] rounded-full bg-white/5"
        />
        <motion.div 
          animate={{ translateY: [0, -30, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute w-[200px] h-[200px] top-[30%] left-[40%] rounded-full bg-accent/10"
        />
        <div className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <h1 className="text-[120px] md:text-[180px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-accent to-accent-light leading-none drop-shadow-lg">
            404
          </h1>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-8 text-white/20"
          >
            <span className="text-6xl">✨</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            عذراً، الصفحة غير موجودة!
          </h2>
          <p className="text-white/70 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
            يبدو أنك وصلت إلى رابط غير صحيح أو أن الصفحة التي تبحث عنها قد تم نقلها.
          </p>

          <Link to="/" className="inline-flex items-center justify-center gap-3 bg-accent hover:bg-accent-light text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20 group">
            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>العودة للرئيسية</span>
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
