(async () => {
  // ── 1. Parse slug from URL ──────────────────
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    showError();
    return;
  }

  // ── 2. Fetch post from Supabase ─────────────
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch (err) {
    console.error(err);
    showError();
    return;
  }

  if (!post) { showError(); return; }

  // ── 3. Update ALL meta/OG tags BEFORE rendering ─
  const pageUrl = window.location.href;

  // <title>
  document.title = `${post.title} | الابتكار`;

  // Standard meta
  setMeta('name', 'description', post.meta_description);

  // Open Graph
  setMeta('property', 'og:title',       post.title);
  setMeta('property', 'og:description', post.meta_description);
  setMeta('property', 'og:image',       post.featured_image_url);
  setMeta('property', 'og:url',         pageUrl);

  // Twitter Card
  setMeta('name', 'twitter:title',       post.title);
  setMeta('name', 'twitter:description', post.meta_description);
  setMeta('name', 'twitter:image',       post.featured_image_url);

  // Canonical
  document.getElementById('canonicalTag').setAttribute('href', pageUrl);

  // Structured data (Article schema)
  const ld = {
    "@context": "https://schema.org",
    "@type":    "Article",
    "headline": post.title,
    "description": post.meta_description,
    "image": post.featured_image_url
      ? { "@type": "ImageObject", "url": post.featured_image_url, "width": 1200, "height": 630 }
      : undefined,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "inLanguage": "ar-SA",
    "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
    "author": {
      "@type": "Organization",
      "name":  "الابتكار",
      "url":   "https://elebtikar-sa.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://elebtikar-sa.com/assets/images/logo.png"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name":  "الابتكار",
      "url":   "https://elebtikar-sa.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://elebtikar-sa.com/assets/images/logo.png",
        "width": 200,
        "height": 60
      }
    }
  };
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(ld);
  document.head.appendChild(ldScript);

  // Structured data (BreadcrumbList schema)
  const bld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "الرئيسية",
      "item": "https://elebtikar-sa.com/"
    },{
      "@type": "ListItem",
      "position": 2,
      "name": "المدونة",
      "item": "https://elebtikar-sa.com/blog"
    },{
      "@type": "ListItem",
      "position": 3,
      "name": post.title,
      "item": pageUrl
    }]
  };
  const bldScript = document.createElement('script');
  bldScript.type = 'application/ld+json';
  bldScript.textContent = JSON.stringify(bld);
  document.head.appendChild(bldScript);

  // Inject keywords meta if post has tags/category
  if (post.tags || post.category) {
    const kw = [post.category, ...(post.tags || [])].filter(Boolean).join('، ');
    setMeta('name', 'keywords', kw + '، الابتكار، تسويق رقمي، السعودية');
  }


  // ── 4. Render article HTML ──────────────────
  if (window.BlogRenderer) {
    window.BlogRenderer.render(post, document.getElementById('postContent'));
  } else {
    console.error('BlogRenderer not found! Ensure render.js is loaded.');
  }

  // ── 5. Show content, hide skeleton ──────────
  document.getElementById('skeletonState').style.display = 'none';
  document.getElementById('postContent').style.display   = 'block';

})();

// ── Helpers ──────────────────────────────────

function showError() {
  document.getElementById('skeletonState').style.display = 'none';
  document.getElementById('errorState').style.display    = 'block';
  document.title = 'مقالة غير موجودة | الابتكار';
}

function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content || '');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('✅ تم نسخ رابط المقالة!');
  }).catch(() => {
    prompt('انسخ الرابط يدوياً:', window.location.href);
  });
}
