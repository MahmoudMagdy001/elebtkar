/**
 * blog-posts.js — Blog Page Posts Loader
 * Fetches and renders blog posts from Supabase.
 */

window.BlogPosts = (() => {
  'use strict';

  const core = window.SiteCore;

  /**
   * Initialize and load posts
   */
  async function init() {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;

    try {
      const posts = await getAllPosts();

      // Clear skeletons
      clearSkeletons();

      if (!posts?.length) {
        showEmptyState();
        return;
      }

      // Render posts
      posts.forEach(post => {
        const card = createPostCard(post);
        grid.appendChild(card);

        // Trigger fade-in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => card.classList.add('visible'));
        });
      });
    } catch (err) {
      console.error('Error loading posts:', err);
      clearSkeletons();
      showErrorState();
    }
  }

  /**
   * Create a post card element
   */
  function createPostCard(post) {
    const date = core.formatDate(post.created_at);

    const card = document.createElement('a');
    card.className = 'post-card fade-in';
    card.href = `/blog/${encodeURIComponent(post.slug)}`;

    const imageHtml = post.featured_image_url
      ? `<img class="post-card-img" src="${post.featured_image_url}" alt="${core.escapeHtml(post.alt_text)}" loading="lazy" />`
      : `<div class="post-card-img no-img"><i class="ph-duotone ph-article"></i></div>`;

    card.innerHTML = `
      ${imageHtml}
      <div class="post-card-body">
        ${date ? `<div class="post-card-date"><i class="ph ph-calendar-blank"></i> ${date}</div>` : ''}
        <div class="post-card-title">${core.escapeHtml(post.title)}</div>
        <div class="post-card-desc">${core.escapeHtml(post.meta_description || '')}</div>
        <div class="post-card-footer">
          اقرأ المقالة <i class="ph ph-arrow-left"></i>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Clear skeleton loaders
   */
  function clearSkeletons() {
    ['sk1', 'sk2', 'sk3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  /**
   * Show empty state
   */
  function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = 'block';
  }

  /**
   * Show error state
   */
  function showErrorState() {
    const errorState = document.getElementById('errorState');
    if (errorState) errorState.style.display = 'block';
  }

  return { init };
})();
