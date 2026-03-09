// ─── Navbar scroll effect ───────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('backTop').classList.toggle('show', window.scrollY > 400);
});

// ─── Mobile menu ────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ─── Intersection Observer: fade-in + counter trigger ───
let countersStarted = false;
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (!countersStarted && (entry.target.closest('#who') || entry.target.closest('#why'))) {
        countersStarted = true;
        animateCounters();
      }
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ─── Counter animation ───────────────────────
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ─── Stagger service cards ──────────────────
document.querySelectorAll('.service-card').forEach((card, i) => {
  card.style.transitionDelay = (i * 0.07) + 's';
  card.classList.add('fade-in');
  observer.observe(card);
});

// ─── Toggle contact menu ────────────────────
function toggleContactMenu() {
  document.getElementById('contactMenu').classList.toggle('active');
  const toggleIcon = document.querySelector('.contact-toggle .toggle-icon');
  if (document.getElementById('contactMenu').classList.contains('active')) {
    toggleIcon.textContent = '✕';
  } else {
    toggleIcon.textContent = '💬';
  }
}
