// Subtle mouse parallax effect for 404 page
document.addEventListener('mousemove', (e) => {
  const shapes = document.querySelectorAll('.shape');
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 20;
    const moveX = (x * speed) - (speed / 2);
    const moveY = (y * speed) - (speed / 2);
    shape.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  const content = document.querySelector('.error-content');
  if (content) {
    const moveX = (x * 10) - 5;
    const moveY = (y * 10) - 5;
    content.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }
});
