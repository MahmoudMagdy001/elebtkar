import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../utils/lazyFramer';
import { cn } from '../utils/cn';

const ContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Menu */}
      <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-center gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col gap-3"
            >
              <a
                href="https://wa.me/966579644123"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 group relative"
              >
                <i className="ph ph-whatsapp-logo text-[24px]"></i>
                <span className="absolute right-16 bg-black/80 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  واتساب
                </span>
              </a>
              <a
                href="tel:+966175107335"
                className="w-12 h-12 rounded-full bg-[#0077a8] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 group relative"
              >
                <i className="ph-duotone ph-phone text-[24px]"></i>
                <span className="absolute right-16 bg-black/80 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  اتصال
                </span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
            isOpen ? "bg-red-500 text-white rotate-45" : "bg-primary text-white hover:scale-110"
          )}
        >
          {isOpen ? <i className="ph ph-x text-[28px]"></i> : <i className="ph-duotone ph-chat-centered-text text-[28px]"></i>}
        </button>
      </div>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 left-8 z-[999] w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-all hover:bg-accent hover:-translate-y-1"
          >
            <i className="ph ph-arrow-up text-[24px]"></i>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactWidget;
