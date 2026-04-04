/**
 * site-core.js — Shared Site Utilities
 * Common functionality used across all pages: SEO helpers, animations, modals.
 */

window.SiteCore = (() => {
  'use strict';

  /**
   * Update or create a meta tag
   */
  function setMeta(attr, name, content) {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content || '');
  }

  /**
   * Update page title
   */
  function setTitle(title) {
    document.title = title;
  }

  /**
   * Set canonical URL
   */
  function setCanonical(url) {
    const canonical = document.getElementById('canonical-link') || document.getElementById('canonicalTag');
    if (canonical) {
      canonical.setAttribute('href', url);
    }
  }

  /**
   * Inject JSON-LD structured data
   */
  function injectStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return script;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date for Arabic locale
   */
  function formatDate(date, options = { dateStyle: 'medium' }) {
    if (!date) return '';
    return new Intl.DateTimeFormat('ar-SA', options).format(new Date(date));
  }

  /**
   * Initialize fade-in animations with IntersectionObserver
   */
  function initFadeObserver(enableCounters = false) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    if (enableCounters && typeof window.initCounters === 'function') {
      window.initCounters();
    }

    return observer;
  }

  /**
   * Stagger animations for multiple elements
   */
  function staggerElements(selector, baseDelay = 0.07) {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.transitionDelay = (i * baseDelay) + 's';
      el.classList.add('fade-in');
    });
  }

  /**
   * Initialize payment modal close logic
   */
  function initPaymentModal() {
    const closeBtn = document.getElementById('closePaymentModal');
    const modal = document.getElementById('paymentModal');

    if (!closeBtn || !modal) return;

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  /**
   * Create skeleton loader HTML
   */
  function createSkeleton(count = 3) {
    return Array(count).fill(`
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    `).join('');
  }

  /**
   * Remove skeleton loaders by ID
   */
  function clearSkeletons(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  /**
   * Copy text to clipboard
   */
  async function copyToClipboard(text, successMsg = 'تم النسخ!') {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, message: successMsg };
    } catch (err) {
      // Fallback
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return { success: true, message: successMsg };
      } catch (fallbackErr) {
        return { success: false, message: 'فشل النسخ' };
      }
    }
  }

  /**
   * Show error state for content loading
   */
  function showErrorState(errorId, skeletonId = null) {
    if (skeletonId) {
      const skeleton = document.getElementById(skeletonId);
      if (skeleton) skeleton.style.display = 'none';
    }
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.style.display = 'block';
  }

  /**
   * Hide error state and show content
   */
  function showContent(contentId, skeletonId = null) {
    if (skeletonId) {
      const skeleton = document.getElementById(skeletonId);
      if (skeleton) skeleton.style.display = 'none';
    }
    const content = document.getElementById(contentId);
    if (content) content.style.display = 'block';
  }

  // Initialize common functionality on DOM ready
  function init() {
    initPaymentModal();
    initFadeObserver();
  }

  // Public API
  return {
    init,
    setMeta,
    setTitle,
    setCanonical,
    injectStructuredData,
    escapeHtml,
    formatDate,
    initFadeObserver,
    staggerElements,
    initPaymentModal,
    createSkeleton,
    clearSkeletons,
    copyToClipboard,
    showErrorState,
    showContent
  };
})();

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SiteCore.init());
} else {
  SiteCore.init();
}
