import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          'fixed top-0 right-0 left-0 z-[1000] h-[70px] px-[5%] flex items-center justify-between transition-all duration-350',
          scrolled
            ? 'bg-primary-dark/85 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        )}
      >
        <Link to="/" onClick={handleHomeClick} className="flex items-center group">
          <img
            src="/images/logo.png"
            alt="الابتكار logo"
            className="h-[45px] w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                onClick={link.href === '/' ? handleHomeClick : undefined}
                className="relative text-[0.95rem] text-white/85 hover:text-white transition-colors duration-300 group"
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
              className="bg-accent text-white px-6 py-2 rounded-full font-bold text-[0.9rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-pulse hover:animate-none"
            >
              ابدأ الآن
            </a>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={cn('w-6.5 h-0.5 bg-white rounded-full transition-all', isOpen && 'rotate-45 translate-y-2')} />
          <span className={cn('w-6.5 h-0.5 bg-white rounded-full transition-all', isOpen && 'opacity-0')} />
          <span className={cn('w-6.5 h-0.5 bg-white rounded-full transition-all', isOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-primary-dark/97 flex flex-col items-center justify-center gap-8"
          >
            <button
              className="absolute top-5 left-5 text-white p-2"
              onClick={toggleMenu}
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
                  className="text-white text-2xl font-bold"
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
              className="bg-accent text-white px-8 py-3 rounded-full font-bold text-xl"
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
