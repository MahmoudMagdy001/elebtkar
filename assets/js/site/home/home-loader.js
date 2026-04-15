/**
 * home-loader.js — Home Page Component Loader
 * ────────────────────────────────────────────
 * Fetches home section components and injects them into placeholders.
 */

/**
 * Fetches an HTML component file and injects its content into a container.
 * @param {string} url — path to the .html component file
 * @param {string} placeholderId — id of the element to inject into
 * @param {boolean} append — whether to append or replace content
 * @returns {Promise<void>}
 */
const loadHomeComponent = async (url, placeholderId, append = false) => {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  try {
    // Avoid stale home sections after content edits.
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    const html = await response.text();
    
    if (append) {
      placeholder.insertAdjacentHTML('beforeend', html);
    } else {
      placeholder.innerHTML = html;
    }
  } catch (err) {
    console.error('[home-loader]', err);
  }
};

// ─── Load all home components on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load main content components (append mode)
  await Promise.all([
    loadHomeComponent('/pages/home/components/hero.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/who-we-are.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/discount-code.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/services.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/pricing.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/why-different.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/why-choose-us.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/process.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/results-cta.html', 'home-content-placeholder', true),
    loadHomeComponent('/pages/home/components/contact.html', 'home-content-placeholder', true)
  ]);

  // Load payment modal (replace mode - separate placeholder)
  await loadHomeComponent('/pages/home/components/payment-modal.html', 'payment-modal-placeholder');

  // Dispatch event to signal all components are loaded
  window.homeComponentsLoaded = true;
  document.dispatchEvent(new CustomEvent('homeComponentsLoaded'));
});
