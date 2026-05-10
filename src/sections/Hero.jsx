import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const Hero = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 px-[5%]">
      {/* Background with Overlays */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 37, 58, 0.7), rgba(0, 37, 58, 0.8)), url('/src/assets/images/${isMobile ? 'header_mobile.png' : 'header.png'}')` 
        }}
      />
      
      {/* Decorative Shapes */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
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

      <div className="relative z-10 max-w-[900px] w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="inline-flex items-center gap-2 bg-accent/15 border border-accent/40 text-accent-light px-4 py-1.5 rounded-full text-sm font-bold mb-6"
        >
          رؤية المملكة 2030 شريكك الرقمي
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-white text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
        >
          لتتصدر سوق المملكة..<br/>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-lg md:text-xl text-white/75 leading-relaxed mb-3 max-w-[800px] mx-auto"
        >
          نصنع لك أصولاً تقنية وتسويقية تُغنيك عن تكاليف الإعلانات المتكررة، عبر استراتيجيات ذكية وحلول متكاملة
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-base text-white/55 mb-10 tracking-wide"
        >
          استراتيجيات ذكية وحلول متكاملة
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a href="https://wa.me/966579644123" target="_blank" rel="noopener noreferrer" className="btn-primary">
            ابدأ رحلة ابتكارك الآن <ArrowLeft className="w-5 h-5" />
          </a>
          <a href="#contact" className="btn-secondary">
            اطلب استشارة مجانية
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
