/**
 * home-animations.js — Home Page Animations
 * Stagger animations and intersection observer setup.
 */

window.HomeAnimations = (() => {
  'use strict';

  const core = window.SiteCore;

  /**
   * Initialize all home page animations
   */
  function init() {
    initStaggerAnimations();
    core.initFadeObserver(true);
  }

  /**
   * Initialize stagger animations for service cards
   */
  function initStaggerAnimations() {
    core.staggerElements('.service-card', 0.07);
  }

  return { init };
})();
