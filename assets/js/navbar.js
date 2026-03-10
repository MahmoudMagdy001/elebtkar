/**
 * navbar.js — Navbar Scroll Handler
 * ────────────────────────────────────
 * This file now only initialises the navbar scroll effect and
 * back-to-top button if component-loader.js is NOT used on the page.
 * All other shared logic lives in helpers.js.
 */
document.addEventListener('DOMContentLoaded', () => {
  // initNavScrolled and initBackTop are defined in helpers.js
  // component-loader.js calls them automatically after injecting components.
  // This guard ensures they still work on pages that inline the nav directly.
  if (typeof initNavScrolled === 'function') initNavScrolled();
  if (typeof initBackTop === 'function') initBackTop();
});
