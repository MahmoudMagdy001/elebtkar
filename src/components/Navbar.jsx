import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../utils/lazyFramer';
import { Menu, X, ArrowLeft, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const navLinks = [
  { name: 'الرئيسية', href: '/' },
  { name: 'من نحن', href: '/#who' },
  { name: 'خدماتنا', href: '/services' },
  { name: 'لماذا الابتكار', href: '/#why' },
  { name: 'المدونة', href: '/blog' },
  { name: 'تواصل معنا', href: '/#contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Prevent body scroll when mobile menu is open to avoid background overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
    setIsOpen(false);
  };

  return (
    <>
      <nav
        className={cn(
          // Mobile-first: default small height + padding, scale up at md
          'fixed inset-x-0 top-0 z-[1000] h-16 px-6 sm:px-8 flex items-center justify-between transition-all duration-300',
          'md:h-20 lg:px-12',
          scrolled ? 'bg-primary-dark/85 backdrop-blur-md shadow-lg' : 'bg-transparent'
        )}
      >
        <Link to="/" onClick={handleHomeClick} className="flex items-center group">
          <img
            src="/images/logo.png"
            alt="الابتكار logo"
            // Make logo responsive: smaller on mobile to avoid crowding
            className="h-8 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Links */}
        {/* Desktop links: hidden on mobile, show from md and up */}
        <ul className="hidden md:flex items-center gap-6 list-none">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                onClick={link.href === '/' ? handleHomeClick : undefined}
                // Responsive typography: slightly smaller on mobile, base on md
                className="relative text-sm md:text-base text-white/85 hover:text-white transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute -bottom-1 right-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://wa.me/966579644123"
              target="_blank"
              rel="noopener noreferrer"
              // Touch-friendly padding and responsive text
              className="bg-accent text-white px-4 py-2 sm:px-6 rounded-full font-bold text-sm sm:text-[0.95rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-pulse hover:animate-none"
            >
              ابدأ الآن
            </a>
          </li>
        </ul>

        {/* Mobile Toggle */}
        {/* Mobile hamburger: accessible and touch-friendly */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
          onClick={toggleMenu}
          aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className={cn('block w-6 h-0.5 bg-white rounded-full transition-transform', isOpen && 'rotate-45 translate-y-1.5')} />
          <span className={cn('block w-6 h-0.5 bg-white rounded-full transition-opacity', isOpen && 'opacity-0')} />
          <span className={cn('block w-6 h-0.5 bg-white rounded-full transition-transform', isOpen && '-rotate-45 -translate-y-1.5')} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            aria-modal="true"
            role="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-primary-dark/97 flex flex-col items-center justify-center gap-8 overflow-y-auto py-20"
          >
            <button 
              className="absolute top-6 right-8 text-white p-2 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full transition-colors"
              onClick={toggleMenu}
              aria-label="إغلاق القائمة"
            >
              <X size={32} />
            </button>
            
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <a
                  href={link.href}
                  className="text-white text-2xl font-bold hover:text-accent transition-colors focus:text-accent focus:outline-none"
                  onClick={(e) => {
                    if (link.href === '/') {
                      handleHomeClick(e);
                    } else {
                      toggleMenu();
                    }
                  }}
                >
                  {link.name}
                </a>
              </motion.div>
            ))}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.1 }}
              href="https://wa.me/966579644123"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg hover:shadow-accent/40 transition-all focus:ring-4 focus:ring-accent/50"
              onClick={toggleMenu}
            >
              ابدأ الآن
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
