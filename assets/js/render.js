/**
 * render.js — Blog Post Renderer
 * Handles rich HTML content rendering, reading-time badges,
 * table-of-contents generation, and post-render enhancements.
 * Loaded on the post page alongside post.js
 */

window.BlogRenderer = (() => {

  /* ── Reading time ────────────────────────────── */
  function calcReadTime(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.innerText || div.textContent || '';
    const words = text.trim().match(/\S+/g)?.length ?? 0;
    return Math.max(1, Math.ceil(words / 200));
  }

  /* ── Slug helper for headings ─────────────────── */
  function slugify(text) {
    return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-\u0600-\u06FF]/g, '');
  }

  /* ── Table of Contents ───────────────────────── */
  function buildTOC(articleEl) {
    const headings = articleEl.querySelectorAll('h2, h3');
    if (headings.length < 3) return null;

    const toc = document.createElement('nav');
    toc.className = 'article-toc';
    toc.setAttribute('aria-label', 'جدول المحتويات');
    toc.innerHTML = '<h4 class="toc-title"><i class="ph ph-list-bullets"></i> جدول المحتويات</h4>';
    const ul = document.createElement('ul');
    toc.appendChild(ul);

    headings.forEach((heading, i) => {
      const id = slugify(heading.textContent) || `heading-${i}`;
      heading.id = id;
      const li = document.createElement('li');
      li.className = heading.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
      li.innerHTML = `<a href="#${id}">${heading.textContent}</a>`;
      ul.appendChild(li);
    });

    return toc;
  }

  /* ── Code block syntax enhancement ──────────── */
  function enhanceCodeBlocks(articleEl) {
    articleEl.querySelectorAll('pre').forEach(pre => {
      pre.classList.add('article-code-block');
      // Add copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.innerHTML = '<i class="ph ph-copy"></i>';
      copyBtn.title = 'نسخ الكود';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(pre.textContent || '').then(() => {
          copyBtn.innerHTML = '<i class="ph ph-check"></i>';
          setTimeout(() => { copyBtn.innerHTML = '<i class="ph ph-copy"></i>'; }, 2000);
        });
      };
      pre.style.position = 'relative';
      pre.appendChild(copyBtn);
    });
  }

  /* ── Image enhancements ──────────────────────── */
  function enhanceImages(articleEl) {
    articleEl.querySelectorAll('img').forEach(img => {
      img.classList.add('article-img');
      img.loading = 'lazy';
      img.decoding = 'async';
      if (!img.alt) img.alt = 'صورة في المقال';
      // Wrap in figure if not already
      if (img.parentElement.tagName !== 'FIGURE') {
        const figure = document.createElement('figure');
        figure.className = 'article-figure';
        img.parentNode.insertBefore(figure, img);
        figure.appendChild(img);
        if (img.alt && img.alt !== 'صورة في المقال') {
          const caption = document.createElement('figcaption');
          caption.textContent = img.alt;
          figure.appendChild(caption);
        }
      }
    });
  }

  /* ── External link safety ────────────────────── */
  function enhanceLinks(articleEl) {
    articleEl.querySelectorAll('a').forEach(a => {
      if (a.hostname && a.hostname !== window.location.hostname) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.classList.add('article-link');
    });
  }

  /* ── Blockquote icons ────────────────────────── */
  function enhanceBlockquotes(articleEl) {
    articleEl.querySelectorAll('blockquote').forEach(bq => {
      bq.classList.add('article-blockquote');
      if (!bq.querySelector('.bq-icon')) {
        const icon = document.createElement('i');
        icon.className = 'ph-fill ph-quotes bq-icon';
        bq.prepend(icon);
      }
    });
  }

  /* ── YouTube iframe responsive wrappers ─────── */
  function enhanceIframes(articleEl) {
    articleEl.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
      if (iframe.parentElement.classList.contains('ql-yt-embed')) {
        iframe.parentElement.classList.add('article-yt-embed');
        return;
      }
      const wrap = document.createElement('div');
      wrap.className = 'article-yt-embed';
      iframe.parentNode.insertBefore(wrap, iframe);
      wrap.appendChild(iframe);
    });
  }

  /* ── Scroll progress bar ─────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'readProgressBar';
    bar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg,var(--primary),var(--accent));z-index:9999;transition:width .1s linear;border-radius:0 2px 2px 0;';
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = Math.min(100, pct) + '%';
    }, { passive: true });
  }

  /* ── Main render function ────────────────────── */
  function render(post, containerEl) {
    const readTime = calcReadTime(post.content || '');
    const publishDate = post.created_at
      ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'long' }).format(new Date(post.created_at))
      : '';

    const pageUrl      = window.location.href;
    const encodedUrl   = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(post.title);

    containerEl.innerHTML = `
      <!-- Featured Image -->
      <div class="post-featured-img-wrap">
        <img
          src="${escHtml(post.featured_image_url)}"
          alt="${escHtml(post.alt_text || post.title)}"
          loading="eager" fetchpriority="high"
        />
      </div>

      <!-- Article -->
      <article itemscope itemtype="https://schema.org/Article">

        <!-- Meta Row -->
        <div class="article-meta">
          <span class="article-tag"><i class="ph-fill ph-pencil-line"></i> مدونة الابتكار</span>
          ${publishDate ? `<span class="article-date"><i class="ph ph-calendar-blank"></i> ${publishDate}</span>` : ''}
          <span class="article-read-time"><i class="ph ph-clock"></i> ${readTime} دقيقة للقراءة</span>
        </div>

        <!-- H1 Title -->
        <h1 itemprop="headline">${escHtml(post.title)}</h1>

        <!-- Meta description -->
        ${post.meta_description ? `<p class="article-lead">${escHtml(post.meta_description)}</p>` : ''}

        <hr class="article-divider" />

        <!-- Rich Body Content (rendered as HTML) -->
        <div class="article-body" itemprop="articleBody" id="articleBodyRich">
          ${post.content || ''}
        </div>

        <!-- Share Row -->
        <div class="article-footer-row" style="justify-content: flex-start;">
          <div class="share-row">
            <span class="share-label">شارك:</span>
            <a class="share-btn twitter"
               href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}"
               target="_blank" rel="noopener noreferrer" aria-label="مشاركة على تويتر">
              <i class="ph-fill ph-x-logo"></i> تويتر
            </a>
            <a class="share-btn whatsapp"
               href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}"
               target="_blank" rel="noopener noreferrer" aria-label="مشاركة على واتساب">
              <i class="ph-fill ph-whatsapp-logo"></i> واتساب
            </a>
            <button class="share-btn copy" onclick="copyLink()" aria-label="نسخ الرابط">
              <i class="ph ph-link"></i> نسخ
            </button>
          </div>
        </div>
      </article>

      <!-- CTA Banner -->
      <div class="post-cta">
        <h2>هل تريد نتائج مثل هذه لنشاطك التجاري؟</h2>
        <p>فريق الابتكار جاهز لمساعدتك في بناء حضور رقمي قوي</p>
        <a href="https://wa.me/966579644123" target="_blank" class="btn-primary">تواصل معنا الآن ←</a>
      </div>
    `;

    // Post-render enhancements
    const articleEl = containerEl.querySelector('article');
    const bodyEl    = containerEl.querySelector('#articleBodyRich');

    if (bodyEl) {
      enhanceImages(bodyEl);
      enhanceLinks(bodyEl);
      enhanceCodeBlocks(bodyEl);
      enhanceBlockquotes(bodyEl);
      enhanceIframes(bodyEl);

      // Insert TOC after article meta
      const toc = buildTOC(bodyEl);
      if (toc) bodyEl.insertBefore(toc, bodyEl.firstChild);
    }

    initScrollProgress();
  }

  return { render, calcReadTime };
})();
