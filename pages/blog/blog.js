(async () => {
  const grid = document.getElementById('postsGrid');

  let posts;
  try {
    posts = await getAllPosts();
  } catch (err) {
    console.error(err);
    clearSkeletons();
    document.getElementById('errorState').style.display = 'block';
    return;
  }

  clearSkeletons();

  if (!posts.length) {
    document.getElementById('emptyState').style.display = 'block';
    return;
  }

  posts.forEach(post => {
    const date = post.created_at
      ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(post.created_at))
      : '';

    const card = document.createElement('a');
    card.className = 'post-card fade-in';
    card.href = `/post?slug=${encodeURIComponent(post.slug)}`;

    card.innerHTML = `
      ${post.featured_image_url
        ? `<img class="post-card-img" src="${esc(post.featured_image_url)}" alt="${esc(post.alt_text)}" loading="lazy" />`
        : `<div class="post-card-img no-img"><i class="ph-duotone ph-article"></i></div>`
      }
      <div class="post-card-body">
        ${date ? `<div class="post-card-date"><i class="ph ph-calendar-blank"></i> ${date}</div>` : ''}
        <div class="post-card-title">${esc(post.title)}</div>
        <div class="post-card-desc">${esc(post.meta_description || '')}</div>
        <div class="post-card-footer">
          اقرأ المقالة <i class="ph ph-arrow-left"></i>
        </div>
      </div>
    `;

    grid.appendChild(card);

    // Trigger fade-in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => card.classList.add('visible'));
    });
  });
})();

function clearSkeletons() {
  ['sk1','sk2','sk3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toggleContactMenu() {
  document.getElementById('contactMenu').classList.toggle('active');
}

window.addEventListener('scroll', () => {
  const btn = document.getElementById('backTop');
  if (btn) btn.classList.toggle('show', window.scrollY > 300);
});
