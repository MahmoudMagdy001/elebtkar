/**
 * service-detail.js — Single Service Detail Page
 */

// Initialize Supabase
document.addEventListener('DOMContentLoaded', () => {
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const core = window.SiteCore;
  const i18n = window.SiteI18n;

  const container = document.getElementById('service-detail-container');
  const titleEl = document.getElementById('service-title');
  const subtitleEl = document.getElementById('service-subtitle');

  // Wait for Supabase to be ready
  if (!window.sb) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (!window.sb) {
    container.innerHTML = `<p class="text-center py-5">خطأ في الاتصال بقاعدة البيانات</p>`;
    return;
  }

  // Get slug from URL
  const params = new URLSearchParams(window.location.search);
  let slug = params.get('slug');

  if (!slug) {
    // Try from pathname
    const pathMatch = window.location.pathname.match(/\/services\/([^\/]+)/);
    if (pathMatch) slug = pathMatch[1];
  }

  if (!slug) {
    container.innerHTML = `<p class="text-center py-5">لم يتم تحديد خدمة</p>`;
    return;
  }

  try {
    const { data: service, error } = await window.sb
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !service) {
      container.innerHTML = `<p class="text-center py-5">الخدمة غير موجودة</p>`;
      return;
    }

    // Update hero with typewriter effect
    const typewriterEl = document.getElementById('service-typewriter');
    const subtitleEl = document.getElementById('service-subtitle');
    
    if (typewriterEl && service.title) {
      typeWriter(service.title, typewriterEl, 100);
    }
    
    if (subtitleEl) {
      subtitleEl.textContent = service.subtitle || '';
      // Add animation class after small delay
      setTimeout(() => {
        subtitleEl.classList.add('animate-fade-in');
      }, 100);
    }

    // Update SEO
    core.setTitle(`${service.title} | ${i18n.seo.siteName}`);
    core.setMeta('name', 'description', service.meta_description || service.subtitle || '');

    // Render detail
    renderServiceDetail(service, container);

    // Initialize animations
    if (typeof window.ServicesAnimations !== 'undefined') {
      window.ServicesAnimations.init();
    }

  } catch (err) {
    console.error('Error loading service:', err);
    container.innerHTML = `<p class="text-center py-5">حدث خطأ أثناء التحميل</p>`;
  }
});

function renderServiceDetail(service, container) {
  const featuresHtml = service.features
    ? service.features.map(feat => `<li><i class="ph ph-fill ph-check-circle"></i> ${feat}</li>`).join('')
    : '';

  const bgIconHtml = service.bg_icon?.startsWith('http') || service.bg_icon?.startsWith('/')
    ? `<img src="${service.bg_icon}" class="srv-detail-img" alt="${service.title}" loading="lazy">`
    : `<i class="${service.bg_icon || 'ph ph-duotone ph-circles-three'}"></i>`;

  container.innerHTML = `
    <div class="service-detail-row">
      <div class="srv-detail-image">
        ${bgIconHtml}
      </div>
      <div class="srv-detail-content">
        <h2>${service.title}</h2>
        <p class="srv-detail-subtitle">${service.subtitle || ''}</p>
        <ul class="srv-detail-features">${featuresHtml}</ul>
        <a href="/#contact" class="btn-primary srv-detail-btn">اطلب الخدمة <i class="ph-bold ph-arrow-left"></i></a>
      </div>
    </div>
    <div class="srv-detail-description">
      <h3>وصف الخدمة</h3>
      <div class="description-content">${service.description || 'لا يوجد وصف متاح'}</div>
    </div>
  `;

  // Animate with ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Service detail row animation on scroll
    gsap.from('.service-detail-row', {
      scrollTrigger: {
        trigger: '.service-detail-row',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 70,
      opacity: 0,
      duration: 1,
      ease: 'back.out(1.2)'
    });

    // Description section animation
    gsap.from('.srv-detail-description', {
      scrollTrigger: {
        trigger: '.srv-detail-description',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    // Floating icon animation
    document.querySelectorAll('.srv-detail-image i').forEach(icon => {
      gsap.to(icon, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random()
      });
    });

    // Scroll indicator pulse
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
      gsap.to(indicator, {
        y: 15,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      gsap.to(indicator, {
        scrollTrigger: {
          trigger: '.services-hero',
          start: 'top top',
          end: 'bottom center',
          scrub: true
        },
        opacity: 0
      });
    }
  }
}

/**
 * Typewriter effect for hero title
 */
function typeWriter(text, element, speed = 100) {
  element.innerHTML = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  setTimeout(type, 300);
}
