/**
 * blog-loader.js — Blog Page Component Loader
 * ────────────────────────────────────────────
 * Fetches blog section components and injects them into placeholders.
 */

/**
 * Fetches an HTML component file and injects its content into a container.
 * @param {string} url — path to the .html component file
 * @param {string} placeholderId — id of the element to inject into
 * @returns {Promise<void>}
 */
const loadBlogComponent = async (url, placeholderId) => {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    placeholder.innerHTML = await response.text();
  } catch (err) {
    console.error('[blog-loader]', err);
  }
};

// ─── Load all blog components on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load components sequentially to ensure correct order
  await loadBlogComponent('/pages/blog/components/hero.html', 'blog-hero-placeholder');
  await loadBlogComponent('/pages/blog/components/blog-grid.html', 'blog-grid-placeholder');

  // Dispatch event to signal all components are loaded
  window.blogComponentsLoaded = true;
  document.dispatchEvent(new CustomEvent('blogComponentsLoaded'));
});
