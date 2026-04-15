/**
 * post-renderer.js — Single Post Page Renderer
 * Fetches post by slug and renders with SEO/structured data.
 */

window.PostRenderer = (() => {
  'use strict';

  const core = window.SiteCore;
  const i18n = window.SiteI18n;

  /**
   * Initialize and load single post
   */
  async function init() {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('slug');
    const pathSlug = getSlugFromPath();
    const slug = querySlug || pathSlug;

    if (!slug) {
      showError();
      return;
    }

    try {
      const post = await getPostBySlug(slug);

      if (!post) {
        showError();
        return;
      }

      updateSEO(post);
      updateStructuredData(post);
      renderPost(post);
      showContent();
    } catch (err) {
      console.error('Error loading post:', err);
      showError();
    }
  }

  /**
   * Update all SEO meta tags
   */
  function updateSEO(post) {
    const pageUrl = getCanonicalPostUrl(post.slug);

    // Title
    core.setTitle(`${post.title} | ${i18n.seo.siteName}`);

    // Meta description
    core.setMeta('name', 'description', post.meta_description);

    // Open Graph
    core.setMeta('property', 'og:title', post.title);
    core.setMeta('property', 'og:description', post.meta_description);
    core.setMeta('property', 'og:image', post.featured_image_url);
    core.setMeta('property', 'og:url', pageUrl);

    // Twitter Card
    core.setMeta('name', 'twitter:title', post.title);
    core.setMeta('name', 'twitter:description', post.meta_description);
    core.setMeta('name', 'twitter:image', post.featured_image_url);

    // Canonical
    core.setCanonical(pageUrl);

    // Keywords if available
    if (post.tags || post.category) {
      const keywords = [post.category, ...(post.tags || [])].filter(Boolean).join('، ');
      core.setMeta('name', 'keywords', `${keywords}، ${i18n.seo.keywords}`);
    }
  }

  /**
   * Inject structured data (Article + Breadcrumb)
   */
  function updateStructuredData(post) {
    const pageUrl = getCanonicalPostUrl(post.slug);
    const siteUrl = i18n.seo.siteUrl;

    // Article schema
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.meta_description,
      image: post.featured_image_url
        ? { '@type': 'ImageObject', url: post.featured_image_url, width: 1200, height: 630 }
        : undefined,
      datePublished: post.created_at,
      dateModified: post.updated_at || post.created_at,
      inLanguage: 'ar-SA',
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      author: {
        '@type': 'Organization',
        name: i18n.seo.siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/assets/images/logo.png`
        }
      },
      publisher: {
        '@type': 'Organization',
        name: i18n.seo.siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/assets/images/logo.png`,
          width: 200,
          height: 60
        }
      }
    };

    core.injectStructuredData(articleSchema);

    // Breadcrumb schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'الرئيسية',
          item: siteUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'المدونة',
          item: `${siteUrl}/blog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: pageUrl
        }
      ]
    };

    core.injectStructuredData(breadcrumbSchema);
  }

  /**
   * Render post content
   */
  function renderPost(post) {
    const container = document.getElementById('postContent');
    if (!container) return;

    if (window.BlogRenderer) {
      window.BlogRenderer.render(post, container);
    } else {
      container.innerHTML = post.content;
    }
  }

  /**
   * Show content, hide skeleton
   */
  function showContent() {
    const skeleton = document.getElementById('skeletonState');
    const content = document.getElementById('postContent');

    if (skeleton) skeleton.style.display = 'none';
    if (content) content.style.display = 'block';
  }

  /**
   * Show error state
   */
  function showError() {
    const skeleton = document.getElementById('skeletonState');
    const error = document.getElementById('errorState');

    if (skeleton) skeleton.style.display = 'none';
    if (error) error.style.display = 'block';

    core.setTitle(`${i18n.t('notFound')} | ${i18n.seo.siteName}`);
  }

  /**
   * Copy post link to clipboard
   */
  async function copyLink() {
    const postSlug = new URLSearchParams(window.location.search).get('slug') || getSlugFromPath();
    const canonicalUrl = getCanonicalPostUrl(postSlug);
    const result = await core.copyToClipboard(canonicalUrl, 'تم نسخ رابط المقالة!');
    alert(result.success ? result.message : 'انسخ الرابط يدوياً: ' + canonicalUrl);
  }

  function getSlugFromPath() {
    const match = window.location.pathname.match(/^\/blog\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function getCanonicalPostUrl(slug) {
    const base = window.location.origin;
    const safeSlug = encodeURIComponent(slug || '');
    return `${base}/blog/${safeSlug}`;
  }

  // Expose copyLink globally for onclick
  window.copyPostLink = copyLink;

  return { init };
})();
