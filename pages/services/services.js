// services.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Hover Effect / Ripple on buttons
    const buttons = document.querySelectorAll('.srv-btn, .btn-primary, .btn-secondary');
    buttons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        // Create ripple span
        const x = e.clientX - e.target.getBoundingClientRect().left;
        const y = e.clientY - e.target.getBoundingClientRect().top;
  
        const ripples = document.createElement('span');
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        ripples.classList.add('ripple');
        this.appendChild(ripples);
  
        setTimeout(() => {
          ripples.remove();
        }, 600);
      });
    });
  
    // 2. Reading Progress Bar
    const progressBar = document.getElementById("progress-bar");
    window.addEventListener("scroll", () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      const maxScroll = scrollHeight - clientHeight;
      let progress = 0;
      if (maxScroll > 0) {
        progress = (scrollTop / maxScroll) * 100;
      }
      
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    });
  
    // 3. Typewriter Effect
    const titleText = "خدماتنا المتكاملة";
    const titleEl = document.getElementById("typewriter");
    if (titleEl) {
      let i = 0;
      titleEl.innerHTML = "";
      function typeWriter() {
        if (i < titleText.length) {
          titleEl.innerHTML += titleText.charAt(i);
          i++;
          setTimeout(typeWriter, 120);
        }
      }
      // Start slightly delayed
      setTimeout(typeWriter, 600);
    }
  
    // Check if ScrollTrigger is available
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
  
      // Subtitle fade in up
      gsap.from(".fade-in-up", {
        y: 30,
        opacity: 0,
        duration: 1.2,
        delay: 0.8,
        ease: "power3.out"
      });
  
      // 4. Staggered Service Cards Fade-in
      const serviceRows = gsap.utils.toArray(".service-row");
      
      serviceRows.forEach((row, i) => {
        // Fade in row from bottom
        gsap.from(row, {
          scrollTrigger: {
            trigger: row,
            start: "top 85%", // when top of row hits 85% of viewport
            toggleActions: "play none none reverse",
          },
          y: 70,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.2)",
          delay: i % 2 === 0 ? 0 : 0.15 // stagger for alternating rows
        });
  
        // 5. Parallax Effect for Images
        const img = row.querySelector(".srv-image img");
        if (img) {
          gsap.to(img, {
            scrollTrigger: {
              trigger: row,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5 // Link to scroll progress
            },
            y: 50, // Parallax movement
            scale: 1.15, // ensure scale keeps it covered during parallax
            ease: "none"
          });
        }
      });
  
      // 6. Floating effect for icons
      const icons = document.querySelectorAll(".srv-icon i");
      icons.forEach(icon => {
        gsap.to(icon, {
          y: -8,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() // stagger floating effect
        });
      });
  
      // 7. Scroll Down Indicator pulse
      const indicator = document.querySelector(".scroll-indicator");
      if (indicator) {
        gsap.to(indicator, {
          y: 15,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });
        
        // hide on scroll down
        gsap.to(indicator, {
          scrollTrigger: {
            trigger: ".services-hero",
            start: "top top",
            end: "bottom center",
            scrub: true
          },
          opacity: 0
        });
      }
    }
    
    // 8. Initialise generic fade-in observer for utility classes (e.g. pricing section)
    if (typeof window.initFadeObserver === 'function') {
      window.initFadeObserver();
    }
  });
