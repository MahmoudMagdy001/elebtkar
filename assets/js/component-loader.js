/**
 * component-loader.js — Dynamic Component Injection
 * ───────────────────────────────────────────────────
 * Fetches shared HTML components (navbar, contact-widget) and injects
 * them into their placeholder elements on every page.
 *
 * Usage in any HTML page:
 *   <div id="navbar-placeholder"></div>
 *   ...
 *   <div id="contact-widget-placeholder"></div>
 *   <script src="/assets/js/helpers.js"></script>
 *   <script src="/assets/js/component-loader.js"></script>
 */

/**
 * Fetches an HTML component file and injects its content into a container.
 * @param {string} url        — path to the .html component file
 * @param {string} placeholderId — id of the element to inject into
 * @returns {Promise<void>}
 */
const loadComponent = async (url, placeholderId) => {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    placeholder.innerHTML = await response.text();
  } catch (err) {
    console.error('[component-loader]', err);
  }
};

/**
 * Loads "Our Services" links in footer from Supabase.
 * Deferred to avoid competing with first paint.
 */
// Fallback services data if Supabase fails
const FALLBACK_SERVICES = [
  { title: 'تحسين محركات البحث (SEO)', slug: 'seo' },
  { title: 'تطوير المواقع والمتاجر', slug: 'web-development' },
  { title: 'إدارة التواصل الاجتماعي', slug: 'social-media' },
  { title: 'صناعة المحتوى', slug: 'content-creation' },
  { title: 'إعلانات ممولة', slug: 'paid-ads' },
  { title: 'الذكاء الاصطناعي', slug: 'ai-solutions' }
];

const populateFooterServices = async () => {
  const servicesList = document.getElementById('footer-services-list');
  if (!servicesList) return;

  const renderServices = (services) => {
    const frag = document.createDocumentFragment();
    services.forEach((srv) => {
      const link = document.createElement('a');
      link.href = `/services/${srv.slug}`;
      link.textContent = srv.title;
      frag.appendChild(link);
    });
    servicesList.replaceChildren(frag);
  };

  // Wait for Supabase client to be ready
  let retries = 0;
  while (!window.sb && retries < 30) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }

  if (!window.sb) {
    console.warn('[Footer] Supabase not available, using fallback services');
    renderServices(FALLBACK_SERVICES);
    return;
  }

  try {
    const { data: services, error } = await window.sb
      .from('services')
      .select('title, slug')
      .order('order_num', { ascending: true });

    if (error || !services || services.length === 0) {
      console.warn('[Footer] No services data from Supabase, using fallback:', error);
      renderServices(FALLBACK_SERVICES);
      return;
    }

    renderServices(services);
  } catch (err) {
    console.error('[Footer] Error fetching services, using fallback:', err);
    renderServices(FALLBACK_SERVICES);
  }
};

const deferFooterServicesPopulation = () => {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  console.log('[Footer] deferFooterServicesPopulation called, placeholder:', footerPlaceholder);
  if (!footerPlaceholder) {
    console.warn('[Footer] No footer placeholder found');
    return;
  }

  if ('IntersectionObserver' in window) {
    console.log('[Footer] Using IntersectionObserver');
    const observer = new IntersectionObserver((entries) => {
      console.log('[Footer] IntersectionObserver callback, entries:', entries);
      if (!entries.some((entry) => entry.isIntersecting)) {
        console.log('[Footer] Footer not intersecting yet');
        return;
      }
      console.log('[Footer] Footer intersecting, calling populateFooterServices');
      observer.disconnect();
      populateFooterServices();
    }, { rootMargin: '300px 0px' });
    observer.observe(footerPlaceholder);
    return;
  }

  console.log('[Footer] Falling back to requestIdleCallback/setTimeout');
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => populateFooterServices(), { timeout: 1500 });
  } else {
    setTimeout(() => populateFooterServices(), 800);
  }
};

/**
 * Marks the correct nav link as active based on the current URL.
 * Looks inside #navbar ul.nav-links and #mobileMenu.
 */
const markActiveNavLink = () => {
  const path = window.location.pathname;

  // Determine the active href
  let activeHref = null;
  if (path === '/' || path === '/index.html') {
    activeHref = '/';
  } else if (path.startsWith('/services')) {
    activeHref = '/services';
  } else if (path.startsWith('/blog') || path.startsWith('/post')) {
    activeHref = '/blog';
  }

  if (!activeHref) return;

  // Mark in desktop nav
  document.querySelectorAll('#navbar .nav-links a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === activeHref);
  });

  // Mark in mobile menu
  document.querySelectorAll('#mobileMenu a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === activeHref);
  });
};

/**
 * On homepage, clicking "الرئيسية" should scroll to top
 * instead of forcing a full page reload.
 */
const bindHomeNavScrollTop = () => {
  const path = window.location.pathname;
  const isHome = path === '/' || path === '/index.html';
  if (!isHome) return;

  const homeLinks = document.querySelectorAll('#navbar a[href="/"], #mobileMenu a[href="/"]');
  homeLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.location.hash) {
        const cleanUrl = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, '', cleanUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
};

// ─── Auto-run on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadComponent('/components/navbar.html', 'navbar-placeholder'),
    loadComponent('/components/contact-widget.html', 'contact-widget-placeholder'),
    loadComponent('/components/footer.html', 'footer-placeholder')
  ]);

  markActiveNavLink();
  bindHomeNavScrollTop();
  initNavScrolled(); // from helpers.js

  initBackTop(); // from helpers.js
  deferFooterServicesPopulation();
});
