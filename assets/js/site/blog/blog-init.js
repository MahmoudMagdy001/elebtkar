/**
 * blog-init.js — Blog Page Bootstrap
 */

(function() {
  'use strict';

  function init() {
    if (window.SiteCore) {
      window.SiteCore.init();
    }

    if (window.BlogPosts) {
      window.BlogPosts.init();
    }
  }

  // Initialize when blog components are loaded (or immediately if already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.blogComponentsLoaded) {
        init();
      } else {
        document.addEventListener('blogComponentsLoaded', init, { once: true });
      }
    });
  } else {
    if (window.blogComponentsLoaded) {
      init();
    } else {
      document.addEventListener('blogComponentsLoaded', init, { once: true });
    }
  }
})();
