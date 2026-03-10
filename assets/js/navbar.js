// assets/js/navbar.js
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    // Initial check
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      const backTop = document.getElementById('backTop');
      if (backTop) backTop.classList.toggle('show', window.scrollY > 400);
    });
  }
});

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}
