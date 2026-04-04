/**
 * admin-loader.js — Admin Page Component Loader
 * ─────────────────────────────────────────────────
 * Fetches admin section components and injects them into placeholders.
 * Extends the pattern from component-loader.js for admin-specific needs.
 */

/**
 * Fetches an HTML component file and injects its content into a container.
 * @param {string} url — path to the .html component file
 * @param {string} placeholderId — id of the element to inject into
 * @returns {Promise<void>}
 */
const loadAdminComponent = async (url, placeholderId, append = false) => {
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
    console.error('[admin-loader]', err);
  }
};

// ─── Load all admin components on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load layout components
  await Promise.all([
    loadAdminComponent('/pages/admin/components/login.html', 'login-placeholder'),
    loadAdminComponent('/pages/admin/components/header.html', 'header-placeholder'),
    loadAdminComponent('/pages/admin/components/sidebar.html', 'sidebar-placeholder')
  ]);

  // Load all section components into main content (append mode)
  await Promise.all([
    loadAdminComponent('/pages/admin/components/section-contact-messages.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-discount-codes.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-add-post.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-manage-posts.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-add-service.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-manage-services.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-add-pricing.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-manage-pricing.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-add-partner.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-manage-partners.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-manage-payments.html', 'admin-sections-placeholder', true),
    loadAdminComponent('/pages/admin/components/section-manage-stats.html', 'admin-sections-placeholder', true)
  ]);

  // Dispatch event to signal all components are loaded
  // This allows admin-init.js to know when to initialize
  window.adminComponentsLoaded = true;
  document.dispatchEvent(new CustomEvent('adminComponentsLoaded'));
});
