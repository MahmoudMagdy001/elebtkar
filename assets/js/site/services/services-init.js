/**
 * services-init.js — Services Page Bootstrap
 */

(function() {
  'use strict';

  function init() {
    if (window.SiteCore) {
      window.SiteCore.init();
    }

    if (window.ServicesList) {
      window.ServicesList.init();
    }
  }

  // Initialize when services components are loaded (or immediately if already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.servicesComponentsLoaded) {
        init();
      } else {
        document.addEventListener('servicesComponentsLoaded', init, { once: true });
      }
    });
  } else {
    if (window.servicesComponentsLoaded) {
      init();
    } else {
      document.addEventListener('servicesComponentsLoaded', init, { once: true });
    }
  }
})();
