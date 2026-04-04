/**
 * post-loader.js — Post Page Component Loader
 * ────────────────────────────────────────────
 * Fetches post section components and injects them into placeholders.
 */

/**
 * Fetches an HTML component file and injects its content into a container.
 * @param {string} url — path to the .html component file
 * @param {string} placeholderId — id of the element to inject into
 * @returns {Promise<void>}
 */
const loadPostComponent = async (url, placeholderId) => {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    placeholder.innerHTML = await response.text();
  } catch (err) {
    console.error('[post-loader]', err);
  }
};

// ─── Load all post components on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadPostComponent('/pages/post/components/post-skeleton.html', 'post-states-placeholder'),
    loadPostComponent('/pages/post/components/post-error.html', 'post-states-placeholder')
  ]);

  // Dispatch event to signal all components are loaded
  window.postComponentsLoaded = true;
  document.dispatchEvent(new CustomEvent('postComponentsLoaded'));
});
