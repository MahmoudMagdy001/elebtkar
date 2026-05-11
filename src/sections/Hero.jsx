import React from 'react';
import { motion } from '../utils/lazyFramer';
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
    <section id="hero" className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden py-20 section-padding">
      {/* Background with Overlays */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 37, 58, 0.7), rgba(0, 37, 58, 0.8)), url('/images/${isMobile ? 'header_mobile.png' : 'header.png'}')` 
        }}
      />
      
      {/* Decorative Shapes */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* Decorative shapes: hide large shapes on small screens to avoid overflow */}
        <motion.div 
          animate={{ translateY: [0, -30, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:block absolute md:w-96 md:h-96 -top-24 -left-36 rounded-full bg-white/5"
        />
        <motion.div 
          animate={{ translateY: [0, -30, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="hidden lg:block absolute lg:w-80 lg:h-80 -bottom-20 -right-20 rounded-full bg-white/5"
        />
        <motion.div 
          animate={{ translateY: [0, -30, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="hidden md:block absolute md:w-40 md:h-40 top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-accent/10"
        />
        <div className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 section-inner text-center">
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
          // Responsive typography: adjusted for mobile to prevent awkward wrapping
          className="text-white text-[1.45rem] sm:text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 px-2"
        >
          لتتصدر سوق المملكة..<br/>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-base md:text-lg text-white/75 leading-relaxed mb-3 max-w-[720px] mx-auto"
        >
          نصنع لك أصولاً تقنية وتسويقية تُغنيك عن تكاليف الإعلانات المتكررة، عبر استراتيجيات ذكية وحلول متكاملة
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-sm md:text-base text-white/55 mb-10 tracking-wide"
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
