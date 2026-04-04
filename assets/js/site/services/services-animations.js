/**
 * services-animations.js — Services Page Animations
 * GSAP animations, ripple effects, reading progress bar.
 */

window.ServicesAnimations = (() => {
  'use strict';

  /**
   * Initialize all animations
   */
  function init() {
    initRippleEffect();
    initReadingProgress();
    initTypewriter();
    initGSAP();
  }

  /**
   * Ripple effect on buttons
   */
  function initRippleEffect() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.srv-btn, .btn-primary, .btn-secondary');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `left:${x}px;top:${y}px;`;
      ripple.classList.add('ripple');
      btn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  }

  /**
   * Reading progress bar
   */
  function initReadingProgress() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    });
  }

  /**
   * Typewriter effect for hero title
   */
  function initTypewriter() {
    const titleEl = document.getElementById('typewriter');
    if (!titleEl) return;

    const text = 'خدماتنا المتكاملة';
    titleEl.innerHTML = '';

    let i = 0;
    function type() {
      if (i < text.length) {
        titleEl.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, 120);
      }
    }

    setTimeout(type, 600);
  }

  /**
   * GSAP scroll animations
   */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Subtitle fade in up
    gsap.from('.fade-in-up', {
      y: 30,
      opacity: 0,
      duration: 1.2,
      delay: 0.8,
      ease: 'power3.out'
    });

    // Service rows staggered animation
    const rows = gsap.utils.toArray('.service-row');
    rows.forEach((row, i) => {
      gsap.from(row, {
        scrollTrigger: {
          trigger: row,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 70,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.2)',
        delay: i % 2 === 0 ? 0 : 0.15
      });
    });

    // Floating icons
    document.querySelectorAll('.icon-showcase i').forEach(icon => {
      gsap.to(icon, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random()
      });
    });

    // Scroll indicator pulse
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
      gsap.to(indicator, {
        y: 15,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      gsap.to(indicator, {
        scrollTrigger: {
          trigger: '.services-hero',
          start: 'top top',
          end: 'bottom center',
          scrub: true
        },
        opacity: 0
      });
    }
  }

  return { init };
})();
