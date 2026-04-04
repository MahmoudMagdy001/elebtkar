/**
 * admin-init.js — Admin Panel Bootstrap
 * Initializes all admin modules in correct order.
 */

(function() {
  'use strict';

  /**
   * Initialize all admin modules when DOM is ready
   */
  function init() {
    // Check dependencies
    if (!window.AdminI18n) {
      console.error('AdminI18n not loaded');
      return;
    }
    if (!window.sb) {
      console.error('Supabase client not available');
      return;
    }

    // Initialize core first (auth, navigation, toast)
    if (window.AdminCore) {
      window.AdminCore.init();
    }

    // Initialize entity modules
    if (window.AdminPosts) {
      window.AdminPosts.init();
    }

    if (window.AdminServices) {
      window.AdminServices.init();
    }

    if (window.AdminPricing) {
      window.AdminPricing.init();
    }

    if (window.AdminPartners) {
      window.AdminPartners.init();
    }

    if (window.AdminMessages) {
      window.AdminMessages.init();
    }

    if (window.AdminStats) {
      window.AdminStats.init();
    }

    // Initialize BlogEditor if container exists
    initBlogEditor();

    console.log('Admin panel initialized successfully');
  }

  /**
   * Initialize BlogEditor for post content
   */
  function initBlogEditor() {
    if (document.getElementById('postEditor') && window.BlogEditor) {
      window.BlogEditor.init('postEditor');
    }
  }

  // Initialize when admin components are loaded (or immediately if already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for components to be loaded by admin-loader.js
      if (window.adminComponentsLoaded) {
        init();
      } else {
        document.addEventListener('adminComponentsLoaded', init, { once: true });
      }
    });
  } else {
    // DOM already ready, wait for components
    if (window.adminComponentsLoaded) {
      init();
    } else {
      document.addEventListener('adminComponentsLoaded', init, { once: true });
    }
  }
})();
