/**
 * services-loader.js — Services Page Component Loader
 * ─────────────────────────────────────────────────
 * Fetches services section components and injects them into placeholders.
 */

/**
 * Fetches an HTML component file and injects its content into a container.
 * @param {string} url — path to the .html component file
 * @param {string} placeholderId — id of the element to inject into
 * @param {boolean} append — whether to append or replace content
 * @returns {Promise<void>}
 */
const loadServicesComponent = async (url, placeholderId, append = false) => {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    const html = await response.text();
    
    if (append) {
      placeholder.insertAdjacentHTML('beforeend', html);
    } else {
      placeholder.innerHTML = html;
    }
  } catch (err) {
    console.error('[services-loader]', err);
  }
};

// ─── Load all services components on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load layout components (replace mode)
  await Promise.all([
    loadServicesComponent('/pages/services/components/hero.html', 'services-hero-placeholder'),
    loadServicesComponent('/pages/services/components/payment-modal.html', 'payment-modal-placeholder')
  ]);

  // Load main content components (append mode)
  await Promise.all([
    loadServicesComponent('/pages/services/components/services-list.html', 'services-content-placeholder', true),
    loadServicesComponent('/pages/services/components/pricing.html', 'services-content-placeholder', true),
    loadServicesComponent('/pages/services/components/cta.html', 'services-content-placeholder', true)
  ]);

  // Dispatch event to signal all components are loaded
  window.servicesComponentsLoaded = true;
  document.dispatchEvent(new CustomEvent('servicesComponentsLoaded'));
});
