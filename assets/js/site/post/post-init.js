/**
 * post-init.js — Single Post Page Bootstrap
 */

(function() {
  'use strict';

  function init() {
    if (window.SiteCore) {
      window.SiteCore.init();
    }

    if (window.PostRenderer) {
      window.PostRenderer.init();
    }
  }

  // Initialize when post components are loaded (or immediately if already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.postComponentsLoaded) {
        init();
      } else {
        document.addEventListener('postComponentsLoaded', init, { once: true });
      }
    });
  } else {
    if (window.postComponentsLoaded) {
      init();
    } else {
      document.addEventListener('postComponentsLoaded', init, { once: true });
    }
  }
})();
