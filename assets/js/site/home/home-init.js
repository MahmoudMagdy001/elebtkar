/**
 * home-init.js — Home Page Bootstrap
 * Initializes all home page modules.
 */

(function() {
  'use strict';

  function init() {
    // Initialize core site functionality
    if (window.SiteCore) {
      window.SiteCore.init();
    }

    // Initialize home page specific modules
    if (window.HomeAnimations) {
      window.HomeAnimations.init();
    }

    if (window.HomeServices) {
      window.HomeServices.init();
    }

    if (window.HomeDiscount) {
      window.HomeDiscount.init();
    }

    if (window.HomeContact) {
      window.HomeContact.init();
    }

    if (window.HomeStats) {
      window.HomeStats.init();
    }

    // Handle hash scrolling for anchors like #contact, #who, #why
    if (window.handleHashScroll) {
      window.handleHashScroll();
    }

    console.log('Home page initialized');
  }

  // Handle clicking internal anchors while already on the home page
  window.addEventListener('hashchange', () => {
    if (window.handleHashScroll) {
      window.handleHashScroll();
    }
  });

  // Initialize when home components are loaded (or immediately if already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.homeComponentsLoaded) {
        init();
      } else {
        document.addEventListener('homeComponentsLoaded', init, { once: true });
      }
    });
  } else {
    if (window.homeComponentsLoaded) {
      init();
    } else {
      document.addEventListener('homeComponentsLoaded', init, { once: true });
    }
  }
})();
