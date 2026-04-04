/**
 * home-stats.js — Dynamic Statistics Fetcher
 * Fetches statistics from Supabase and renders them on the home page.
 */

window.HomeStats = (() => {
  'use strict';

  /**
   * Initialize and load statistics
   */
  async function init() {
    try {
      const { data: stats, error } = await window.sb
        .from('statistics')
        .select('*')
        .eq('is_active', true)
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (stats?.length) {
        renderStats(stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Keep default static values if fetch fails
    }
  }

  /**
   * Render statistics in their respective sections
   */
  function renderStats(stats) {
    // Group by section
    const grouped = stats.reduce((acc, stat) => {
      acc[stat.section] = acc[stat.section] || [];
      acc[stat.section].push(stat);
      return acc;
    }, {});

    // Render "who" section stats
    if (grouped.who) {
      renderWhoStats(grouped.who);
    }

    // Render "stats" section stats
    if (grouped.stats) {
      renderStatsRow(grouped.stats);
    }

    // Initialize counter animations after rendering
    initCounterAnimations();
  }

  /**
   * Render "who" section statistics
   */
  function renderWhoStats(stats) {
    const container = document.querySelector('.who-visual');
    if (!container) return;

    // Clear existing stat cards
    const existingCards = container.querySelectorAll('.who-stat-card');
    existingCards.forEach(card => card.remove());

    // Create new stat cards
    stats.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'who-stat-card';
      card.innerHTML = `
        <div class="who-stat-num" data-count="${stat.value}" data-prefix="${stat.prefix}" data-suffix="${stat.suffix}">0</div>
        <div class="who-stat-label">${stat.label}</div>
      `;
      container.appendChild(card);
    });
  }

  /**
   * Render "stats" row statistics
   */
  function renderStatsRow(stats) {
    const container = document.querySelector('.stats-row');
    if (!container) return;

    // Clear existing items (except dividers)
    const existingItems = container.querySelectorAll('.stat-item, .stat-divider');
    existingItems.forEach(item => item.remove());

    // Create new stat items
    stats.forEach((stat, index) => {
      // Add divider before each item except the first
      if (index > 0) {
        const divider = document.createElement('div');
        divider.className = 'stat-divider';
        container.appendChild(divider);
      }

      const item = document.createElement('div');
      item.className = 'stat-item';
      item.innerHTML = `
        <div class="stat-num" data-count="${stat.value}" data-prefix="${stat.prefix}" data-suffix="${stat.suffix}">0</div>
        <div class="stat-label">${stat.label}</div>
      `;
      container.appendChild(item);
    });
  }

  /**
   * Initialize counter animations
   */
  function initCounterAnimations() {
    // Use IntersectionObserver to start animation when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    // Observe all stat numbers
    document.querySelectorAll('.who-stat-num, .stat-num').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Animate a single counter
   */
  function animateCounter(element) {
    const target = parseInt(element.dataset.count) || 0;
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);

      element.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  return { init };
})();
