<<<<<<< C:/Users/longl/Desktop/elebtkar/assets/js/component-loader.js
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
  { title: 'SEO & GEO', slug: 'seo-geo' },
  { title: 'المتاجر والمواقع الإلكترونية', slug: 'web-stores' },
  { title: 'تطوير المحتوى', slug: 'content-development' },
  { title: 'إدارة منصات التواصل الاجتماعي', slug: 'social-media' },
  { title: 'إدارة الإعلانات', slug: 'ads-management' },
  { title: 'تطبيقات الهواتف الذكية', slug: 'mobile-apps' },
  { title: 'الذكاء الاصطناعي المؤسسي', slug: 'enterprise-ai' }
];

const populateFooterServices = async () => {
  console.log('[Footer] populateFooterServices started');
  
  // Small delay to ensure footer DOM is fully rendered
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const servicesList = document.getElementById('footer-services-list');
  console.log('[Footer] servicesList element:', servicesList);
  if (!servicesList) {
    console.warn('[Footer] footer-services-list element not found in DOM');
    return;
  }

  const renderServices = (services) => {
    console.log('[Footer] renderServices called with:', services.length, 'services');
    try {
      const frag = document.createDocumentFragment();
      services.forEach((srv) => {
        const link = document.createElement('a');
        link.href = `/services/${srv.slug}`;
        link.textContent = srv.title;
        frag.appendChild(link);
      });
      servicesList.replaceChildren(frag);
      console.log('[Footer] Services rendered successfully with', services.length, 'items');
    } catch (err) {
      console.error('[Footer] Error rendering services:', err);
      // Fallback: render using HTML directly
      servicesList.innerHTML = services.map(srv => 
        `<a href="/services/${srv.slug}">${escHtml(srv.title)}</a>`
      ).join('');
    }
  };

  // Try to fetch from Supabase, but have aggressive fallback
  try {
    // Wait for Supabase client to be ready (max 5 seconds)
    let retries = 0;
    const maxRetries = 50;
    
    while (!window.sb && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    console.log('[Footer] After waiting:', { hasSupabase: !!window.sb, retries });

    if (window.sb) {
      try {
        console.log('[Footer] Fetching services from Supabase...');
        const { data: services, error } = await Promise.race([
          window.sb
            .from('services')
            .select('title, slug')
            .order('order_num', { ascending: true }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timeout')), 3000))
        ]);

        if (!error && services && services.length > 0) {
          console.log('[Footer] Successfully fetched', services.length, 'services from Supabase');
          renderServices(services);
          return;
        } else {
          console.warn('[Footer] Supabase query returned no data or error:', error);
        }
      } catch (err) {
        console.warn('[Footer] Supabase fetch failed:', err.message);
      }
    } else {
      console.warn('[Footer] Supabase client not available');
    }
  } catch (err) {
    console.error('[Footer] Unexpected error:', err);
  }

  // Always fallback to hardcoded services
  console.log('[Footer] Using fallback services');
  renderServices(FALLBACK_SERVICES);
};

const deferFooterServicesPopulation = () => {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  console.log('[Footer] deferFooterServicesPopulation called, placeholder:', !!footerPlaceholder);
  if (!footerPlaceholder) {
    console.warn('[Footer] No footer placeholder found');
    return;
  }

  // Ensure Supabase client is ready before observing
  const startObserver = () => {
    // IMPORTANT: Check if footer content is actually loaded (footer-services-list exists)
    const servicesList = document.getElementById('footer-services-list');
    if (!servicesList) {
      console.log('[Footer] Footer content not loaded yet, retrying in 200ms...');
      setTimeout(startObserver, 200);
      return;
    }

    // Now check if footer is visible
    const rect = footerPlaceholder.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isAlreadyVisible) {
      console.log('[Footer] Footer visible and content loaded, calling populateFooterServices');
      populateFooterServices().catch(err => console.error('[Footer] Error in populateFooterServices:', err));
      return;
    }

    if ('IntersectionObserver' in window) {
      console.log('[Footer] Using IntersectionObserver');
      const observer = new IntersectionObserver((entries) => {
        console.log('[Footer] IntersectionObserver callback, entries count:', entries.length);
        if (!entries.some((entry) => entry.isIntersecting)) {
          console.log('[Footer] Footer not intersecting yet');
          return;
        }
        console.log('[Footer] Footer intersecting, calling populateFooterServices');
        observer.disconnect();
        populateFooterServices().catch(err => console.error('[Footer] Error in populateFooterServices:', err));
      }, { rootMargin: '300px 0px' });
      observer.observe(footerPlaceholder);
      return;
    }

    console.log('[Footer] Falling back to setTimeout');
    setTimeout(() => populateFooterServices().catch(err => console.error('[Footer] Error in populateFooterServices:', err)), 800);
  };

  // Start checking immediately
  startObserver();
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
=======
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
  { title: 'SEO & GEO', slug: 'seo-geo' },
  { title: 'المتاجر والمواقع الإلكترونية', slug: 'web-stores' },
  { title: 'تطوير المحتوى', slug: 'content-development' },
  { title: 'إدارة منصات التواصل الاجتماعي', slug: 'social-media' },
  { title: 'إدارة الإعلانات', slug: 'ads-management' },
  { title: 'تطبيقات الهواتف الذكية', slug: 'mobile-apps' },
  { title: 'الذكاء الاصطناعي المؤسسي', slug: 'enterprise-ai' }
];

const populateFooterServices = async () => {
  const servicesList = document.getElementById('footer-services-list');
  if (!servicesList) {
    console.warn('[Footer] footer-services-list element not found in DOM');
    return;
  }

  const renderServices = (services) => {
    try {
      const frag = document.createDocumentFragment();
      services.forEach((srv) => {
        const link = document.createElement('a');
        link.href = `/services/${srv.slug}`;
        link.textContent = srv.title;
        frag.appendChild(link);
      });
      servicesList.replaceChildren(frag);
    } catch (err) {
      console.error('[Footer] Error rendering services:', err);
      // Fallback: render using HTML directly
      servicesList.innerHTML = services.map(srv =>
        `<a href="/services/${srv.slug}">${escHtml(srv.title)}</a>`
      ).join('');
    }
  };

  // Render fallback IMMEDIATELY - don't wait for Supabase
  renderServices(FALLBACK_SERVICES);

  // Try to fetch from Supabase in background (non-blocking)
  try {
    // Wait for Supabase client (up to 3 seconds)
    let retries = 0;
    const maxRetries = 30;

    while (!window.sb && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    if (window.sb) {
      const { data: services, error } = await Promise.race([
        window.sb
          .from('services')
          .select('title, slug')
          .order('order_num', { ascending: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      if (!error && services && services.length > 0) {
        // Update with live data from Supabase
        renderServices(services);
      }
    }
  } catch (err) {
    // Keep fallback visible, already rendered
    console.log('[Footer] Using fallback services (Supabase unavailable)');
  }
};

const deferFooterServicesPopulation = () => {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;

  // Check if footer content is loaded
  const servicesList = document.getElementById('footer-services-list');
  if (servicesList) {
    // Footer already loaded, populate immediately
    populateFooterServices();
    return;
  }

  // Wait for footer to be loaded with a simple retry
  let retries = 0;
  const maxRetries = 20;

  const checkAndPopulate = () => {
    const list = document.getElementById('footer-services-list');
    if (list) {
      populateFooterServices();
    } else if (retries < maxRetries) {
      retries++;
      setTimeout(checkAndPopulate, 100);
    }
  };

  checkAndPopulate();
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
>>>>>>> C:/Users/longl/.windsurf/worktrees/elebtkar/elebtkar-b49c70e7/assets/js/component-loader.js
