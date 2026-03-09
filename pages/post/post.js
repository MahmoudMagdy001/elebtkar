(async () => {
  // ── 1. Parse slug from URL ──────────────────
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');

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
  document.title = `${post.title} | الأبتكار`;

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
    "image":    post.featured_image_url,
    "datePublished": post.created_at,
    "publisher": {
      "@type": "Organization",
      "name":  "الأبتكار",
      "url":   "https://ebtkar.sa"
    }
  };
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(ld);
  document.head.appendChild(ldScript);

  // ── 4. Render article HTML ──────────────────
  const publishDate = post.created_at
    ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'long' }).format(new Date(post.created_at))
    : '';

  const encodedUrl   = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post.title);

  document.getElementById('postContent').innerHTML = `
    <!-- Featured image -->
    <div class="post-featured-img-wrap">
      <img
        src="${escHtml(post.featured_image_url)}"
        alt="${escHtml(post.alt_text)}"
        loading="eager"
        fetchpriority="high"
      />
    </div>

    <!-- Article -->
    <article itemscope itemtype="https://schema.org/Article">

      <!-- Meta row -->
      <div class="article-meta">
        <span class="article-tag">مدونة الأبتكار</span>
        ${publishDate ? `<span class="article-date"><i class="ph ph-calendar-blank"></i> ${publishDate}</span>` : ''}
      </div>

      <!-- SEO h1 title -->
      <h1 itemprop="headline">${escHtml(post.title)}</h1>

      <hr class="article-divider" />

      <!-- Body content -->
      <div class="article-body" itemprop="articleBody">
        ${escHtml(post.content)}
      </div>

      <!-- Share buttons -->
      <div class="share-row">
        <span class="share-label">شارك المقالة:</span>
        <a class="share-btn twitter"
           href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}"
           target="_blank" rel="noopener noreferrer">
          <i class="ph-fill ph-x-logo"></i> تويتر
        </a>
        <a class="share-btn whatsapp"
           href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}"
           target="_blank" rel="noopener noreferrer">
          <i class="ph-fill ph-whatsapp-logo"></i> واتساب
        </a>
        <button class="share-btn copy" onclick="copyLink()">
          <i class="ph ph-link"></i> نسخ الرابط
        </button>
      </div>
    </article>

    <!-- CTA Banner -->
    <div class="post-cta">
      <h2>هل تريد نتائج مثل هذه لنشاطك التجاري؟</h2>
      <p>فريق الأبتكار جاهز لمساعدتك في بناء حضور رقمي قوي</p>
      <a href="https://wa.me/966579644123" target="_blank" class="btn-primary">تواصل معنا الآن ←</a>
    </div>
  `;

  // ── 5. Show content, hide skeleton ──────────
  document.getElementById('skeletonState').style.display = 'none';
  document.getElementById('postContent').style.display   = 'block';

})();

// ── Helpers ──────────────────────────────────

function showError() {
  document.getElementById('skeletonState').style.display = 'none';
  document.getElementById('errorState').style.display    = 'block';
  document.title = 'مقالة غير موجودة | الأبتكار';
}

function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content || '');
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('✅ تم نسخ رابط المقالة!');
  }).catch(() => {
    prompt('انسخ الرابط يدوياً:', window.location.href);
  });
}

// Contact menu toggle
function toggleContactMenu() {
  document.getElementById('contactMenu').classList.toggle('active');
}

// Back-to-top button visibility
window.addEventListener('scroll', () => {
  const btn = document.getElementById('backTop');
  if (btn) btn.classList.toggle('show', window.scrollY > 400);
});
