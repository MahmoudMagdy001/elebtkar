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
      services.forEach(srv => {
        const row = createServiceRow(srv);
        container.appendChild(row);
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
   * Create service row element
   */
  function createServiceRow(srv) {
    const row = document.createElement('section');
    row.className = `service-row ${srv.is_reverse ? 'reverse' : ''}`;
    row.id = `service-${srv.id}`;

    const featuresHtml = srv.features
      ? srv.features.map(feat => `<li class="included"><i class="ph ph-fill ph-check-circle"></i> ${feat}</li>`).join('')
      : '';

    const bgIconHtml = srv.bg_icon?.startsWith('http') || srv.bg_icon?.startsWith('/')
      ? `<img src="${srv.bg_icon}" class="srv-bg-img" alt="" loading="lazy">`
      : `<i class="${srv.bg_icon || 'ph ph-duotone ph-circles-three'}"></i>`;

    row.innerHTML = `
      <div class="srv-content">
        <h2 class="srv-title">${core.escapeHtml(srv.title)}</h2>
        <p class="srv-short">"${core.escapeHtml(srv.subtitle || '')}"</p>
        <ul class="srv-list">${featuresHtml}</ul>
        <a href="/#contact" class="btn-primary srv-btn">اطلب الخدمة <i class="ph-bold ph-arrow-left"></i></a>
      </div>
      <div class="srv-image icon-showcase">${bgIconHtml}</div>
      <div class="srv-desc-full">
        <h3>وصف الخدمة</h3>
        <p>${srv.description || ''}</p>
      </div>
    `;

    return row;
  }

  return { init };
})();
