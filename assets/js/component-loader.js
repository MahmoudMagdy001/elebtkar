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
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    placeholder.innerHTML = await response.text();
  } catch (err) {
    console.error('[component-loader]', err);
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

// ─── Auto-run on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('/components/navbar.html', 'navbar-placeholder');
  markActiveNavLink();
  initNavScrolled(); // from helpers.js

  await loadComponent('/components/contact-widget.html', 'contact-widget-placeholder');
  initBackTop(); // from helpers.js

  await loadComponent('/components/footer.html', 'footer-placeholder');

  // Populate dynamic services in the footer
  const servicesLinks = document.getElementById('footer-services-links');
  if (servicesLinks && window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      const { createClient } = window.supabase;
      const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      
      try {
          const { data: services, error } = await sb
              .from('services')
              .select('title, slug')
              .order('order_num', { ascending: true });
              
          if (!error && services) {
              services.forEach(srv => {
                  const link = document.createElement('a');
                  link.href = `/services/${srv.slug}`;
                  link.textContent = srv.title;
                  servicesLinks.appendChild(link);
              });
          }
      } catch (err) {
          console.error('Error fetching services for footer:', err);
      }
  }
});
