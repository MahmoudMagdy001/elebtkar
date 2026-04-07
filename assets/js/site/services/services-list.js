/**
 * services-list.js — Services Page Dynamic Loader
 * Fetches and renders services from Supabase with SEO updates.
 */

window.ServicesList = (() => {
  'use strict';

  const core = window.SiteCore;
  const i18n = window.SiteI18n;

  /**
   * Initialize services loading
   */
  async function init() {
    const container = document.getElementById('services-list-container');
    if (!container) return;

    // Get slug from URL (via .htaccess rewrite or query param)
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('slug');

    if (slug?.startsWith('slug=')) {
      slug = slug.replace('slug=', '');
    }

    // Fallback: parse from pathname
    if (!slug && window.location.pathname.includes('slug=')) {
      const parts = window.location.pathname.split('slug=');
      if (parts.length > 1) {
        slug = decodeURIComponent(parts[1].split('/')[0]);
      }
    }

    try {
      const services = await fetchServices(slug);

      if (!services?.length) {
        container.innerHTML = `<p class="text-center py-5">${i18n.messages.noData}</p>`;
        return;
      }

      // Update SEO for single service view
      if (slug && services[0]) {
        updateServiceSEO(services[0]);
      }

      // Render services
      container.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'services-grid';
      container.appendChild(grid);
      
      services.forEach(srv => {
        const card = createServiceCard(srv);
        grid.appendChild(card);
      });

      // Initialize GSAP animations
      if (typeof window.ServicesAnimations !== 'undefined') {
        window.ServicesAnimations.init();
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      container.innerHTML = `<p class="text-center py-5" style="color:var(--white);">${i18n.messages.errorLoading}</p>`;
    }
  }

  /**
   * Fetch services from Supabase
   */
  async function fetchServices(slug) {
    let query = window.sb.from('services').select('*');

    if (slug) {
      query = query.eq('slug', slug).single();
    } else {
      query = query.order('order_num', { ascending: true });
    }

    const { data, error } = await query;

    if (error) throw error;
    if (slug && !data) {
      window.location.href = '/services';
      return null;
    }

    return slug ? [data] : data;
  }

  /**
   * Update SEO for single service view
   */
  function updateServiceSEO(service) {
    const serviceUrl = `${i18n.seo.siteUrl}/services/slug=${service.slug}`;
    const description = service.meta_description || service.subtitle || '';

    core.setTitle(`${service.title} | ${i18n.seo.siteName}`);
    core.setMeta('name', 'description', description);
    core.setMeta('property', 'og:title', service.title);
    core.setMeta('property', 'og:description', description);
    core.setMeta('property', 'og:url', serviceUrl);
    if (service.bg_icon) {
      core.setMeta('property', 'og:image', service.bg_icon);
    }
    core.setCanonical(serviceUrl);

    // Service structured data
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: description,
      provider: {
        '@type': 'Organization',
        name: i18n.seo.siteName,
        url: i18n.seo.siteUrl
      },
      url: serviceUrl,
      areaServed: 'SA',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'حلول رقمية',
        itemListElement: (service.features || []).map(feat => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: feat
          }
        }))
      }
    };

    core.injectStructuredData(serviceSchema);
  }

  /**
   * Create service card element (grid layout)
   */
  function createServiceCard(srv) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.id = `service-${srv.id}`;

    const bgIconHtml = srv.bg_icon?.startsWith('http') || srv.bg_icon?.startsWith('/')
      ? `<img src="${srv.bg_icon}" class="srv-card-img" alt="${core.escapeHtml(srv.title)}" loading="lazy">`
      : `<i class="${srv.bg_icon || 'ph ph-duotone ph-circles-three'}"></i>`;

    card.innerHTML = `
      <div class="srv-card-image">
        ${bgIconHtml}
      </div>
      <div class="srv-card-content">
        <h3 class="srv-card-title">${core.escapeHtml(srv.title)}</h3>
        <a href="/pages/services/service-detail.html?slug=${srv.slug}" class="srv-card-btn">
          اكتشف المزيد <i class="ph-bold ph-arrow-left"></i>
        </a>
      </div>
    `;

    return card;
  }

  return { init };
})();
