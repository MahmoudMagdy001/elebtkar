/**
 * home-services.js — Home Page Services & Partners
 * Fetches and renders dynamic services and partners from Supabase.
 */

window.HomeServices = (() => {
  'use strict';

  const core = window.SiteCore;

  /**
   * Initialize services and partners fetching
   */
  async function init() {
    await Promise.all([
      fetchAndRenderServices(),
      fetchAndRenderPartners()
    ]);

    // Re-run animations after content is added
    if (core.initFadeObserver) {
      core.initFadeObserver(true);
    }
  }

  /**
   * Fetch and render services from Supabase
   */
  async function fetchAndRenderServices() {
    const grid = document.querySelector('.services-grid');
    const section = document.getElementById('services');

    if (!grid || !section) return;

    // Wait for Supabase client to be ready
    let retries = 0;
    while (!window.sb && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    if (!window.sb) {
      section.style.display = 'none';
      return;
    }

    try {
      const { data: services, error } = await window.sb
        .from('services')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) throw error;

      if (!services?.length) {
        section.style.display = 'none';
        return;
      }

      grid.innerHTML = '';
      services.forEach(srv => {
        const card = createServiceCard(srv);
        grid.appendChild(card);
      });

      // Stagger animations
      core.staggerElements('.service-card');
    } catch (err) {
      console.error('Error fetching services:', err);
      section.style.display = 'none';
    }
  }

  /**
   * Create a service card element
   */
  function createServiceCard(srv) {
    const card = document.createElement('a');
    card.href = `/services/${encodeURIComponent(srv.slug)}`;
    card.className = `service-card ${srv.is_featured ? 'service-card-accent' : ''}`;

    const iconHtml = srv.bg_icon?.startsWith('http') || srv.bg_icon?.startsWith('/')
      ? `<img src="${srv.bg_icon}" class="srv-icon-img" alt="${core.escapeHtml(srv.title)}" loading="lazy">`
      : `<i class="${srv.bg_icon || 'ph ph-duotone ph-circles-three'}"></i>`;

    card.innerHTML = `
      <div class="service-icon">${iconHtml}</div>
      <h3>${core.escapeHtml(srv.title)}</h3>
      <p>${core.escapeHtml(srv.subtitle || '')}</p>
    `;

    return card;
  }

  /**
   * Fetch and render partners from Supabase
   */
  async function fetchAndRenderPartners() {
    const grid = document.getElementById('partnersGrid');
    if (!grid) return;

    try {
      const { data: partners, error } = await window.sb
        .from('partners')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) throw error;

      if (!partners?.length) return;

      grid.innerHTML = '';
      partners.forEach(ptn => {
        const card = createPartnerCard(ptn);
        grid.appendChild(card);
      });

      core.staggerElements('.client-card');
    } catch (err) {
      console.error('Error fetching partners:', err);
    }
  }

  /**
   * Create a partner card element
   */
  function createPartnerCard(ptn) {
    const card = document.createElement('div');
    card.className = 'client-card fade-in';

    const imgHtml = `<img src="${core.escapeHtml(ptn.logo_url)}" alt="شريك نجاح" loading="lazy">`;

    card.innerHTML = ptn.website_url
      ? `<a href="${core.escapeHtml(ptn.website_url)}" target="_blank" rel="noopener noreferrer">${imgHtml}</a>`
      : imgHtml;

    return card;
  }

  return { init };
})();
