/**
 * helpers.js — Shared Utility Functions
 * ─────────────────────────────────────
 * Single source of truth for all reusable logic across every page.
 * Loaded before any page-specific script.
 */

// ─── HTML Escaping ────────────────────────────
/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
const escHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// Alias used in some pages
window.esc = escHtml;
window.escHtml = escHtml;

// ─── Date Formatting ─────────────────────────
/**
 * Returns an Arabic-formatted date string from an ISO date string.
 * @param {string} iso  — ISO date string
 * @param {'long'|'medium'|'short'} style
 * @returns {string}
 */
const formatDate = (iso, style = 'long') => {
  if (!iso) return '';
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: style }).format(new Date(iso));
};
window.formatDate = formatDate;

// ─── Mobile Menu ─────────────────────────────
/**
 * Toggles the mobile navigation menu open/closed.
 */
const toggleMenu = () => {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
};
window.toggleMenu = toggleMenu;

// ─── Floating Contact Widget ─────────────────
/**
 * Toggles the floating contact menu open/closed.
 */
const toggleContactMenu = () => {
  const menu = document.getElementById('contactMenu');
  if (menu) menu.classList.toggle('active');
};
window.toggleContactMenu = toggleContactMenu;

// ─── Back-to-Top Button ───────────────────────
/**
 * Shows/hides the #backTop button based on scroll position.
 * Call once on page load to attach the scroll listener.
 */
const initBackTop = () => {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  const handleScroll = () => {
    btn.classList.toggle('show', window.scrollY > 400);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // check on load
};
window.initBackTop = initBackTop;

// ─── Navbar Scroll Effect ────────────────────
/**
 * Adds/removes the .scrolled class on #navbar when the user scrolls.
 */
const initNavScrolled = () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // check on load
};
window.initNavScrolled = initNavScrolled;

// ─── Fade-In Observer ────────────────────────
/**
 * Initialises the IntersectionObserver for .fade-in elements.
 * Optionally triggers counter animation when relevant sections appear.
 * @param {boolean} withCounters — whether to watch for counter elements
 */
const initFadeObserver = (withCounters = false) => {
  let countersStarted = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');

      if (
        withCounters &&
        !countersStarted &&
        (entry.target.closest('#who') || entry.target.closest('#why'))
      ) {
        countersStarted = true;
        animateCounters();
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  return observer;
};
window.initFadeObserver = initFadeObserver;

// ─── Counter Animation ───────────────────────
/**
 * Animates all [data-count] elements from 0 to their target value.
 */
const animateCounters = () => {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target   = +el.dataset.count;
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const step     = target / (duration / 16);
    let current    = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
};
window.animateCounters = animateCounters;
