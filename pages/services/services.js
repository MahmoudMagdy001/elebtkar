// services.js

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize Supabase Client
    const { createClient } = supabase;
    const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // 1. Hover Effect / Ripple on buttons (Event Delegation for dynamic items)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.srv-btn, .btn-primary, .btn-secondary');
        if (btn) {
            const x = e.clientX - btn.getBoundingClientRect().left;
            const y = e.clientY - btn.getBoundingClientRect().top;
      
            const ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.classList.add('ripple');
            btn.appendChild(ripples);
      
            setTimeout(() => {
              ripples.remove();
            }, 600);
        }
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
      setTimeout(typeWriter, 600);
    }

    // --- Dynamic Services Fetching ---
    const servicesContainer = document.getElementById('services-list-container');
    
    async function fetchAndRenderServices() {
        try {
            const { data: services, error } = await sb
                .from('services')
                .select('*')
                .order('order_num', { ascending: true });

            if (error) throw error;

            if (servicesContainer) {
                // Clear loader
                servicesContainer.innerHTML = '';

                services.forEach((srv) => {
                    const row = document.createElement('section');
                    // Removed extra backgrounds - all services look consistent now
                    row.className = `service-row ${srv.is_reverse ? 'reverse' : ''}`;
                    row.id = `service-${srv.id}`;

                    const featuresHtml = srv.features ? srv.features.map(feat => `
                        <li class="included"><i class="ph ph-fill ph-check-circle"></i> ${feat}</li>
                    `).join('') : '';

                    // Use image tags for icons
                    const iconHtml = srv.icon && (srv.icon.startsWith('http') || srv.icon.startsWith('/')) ? `<img src="${srv.icon}" class="srv-icon-img" alt="${srv.title}">` : `<i class="${srv.icon || 'ph ph-duotone ph-gear'}"></i>`;
                    const bgIconHtml = srv.bg_icon && (srv.bg_icon.startsWith('http') || srv.bg_icon.startsWith('/')) ? `<img src="${srv.bg_icon}" class="srv-bg-img" alt="">` : `<i class="${srv.bg_icon || 'ph ph-duotone ph-circles-three'}"></i>`;

                    row.innerHTML = `
                        <div class="srv-content">
                            <div class="srv-icon">${iconHtml}</div>
                            <h2 class="srv-title">${srv.title}</h2>
                            <p class="srv-short">"${srv.subtitle || ''}"</p>
                            <ul class="srv-list">
                                ${featuresHtml}
                            </ul>
                            <a href="/#contact" class="btn-primary srv-btn">اطلب الخدمة <i class="ph-bold ph-arrow-left"></i></a>
                        </div>
                        <div class="srv-image icon-showcase">
                            ${bgIconHtml}
                        </div>
                    `;
                    servicesContainer.appendChild(row);
                });

                // Re-initialize GSAP animations after content is added
                initGSAP();
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            if (servicesContainer) {
                servicesContainer.innerHTML = '<p class="text-center py-5" style="color:var(--white);">حدث خطأ أثناء تحميل الخدمات. يرجى المحاولة لاحقاً.</p>';
            }
        }
    }

    function initGSAP() {
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

            // Staggered Service Cards Fade-in
            const serviceRows = gsap.utils.toArray(".service-row");
            serviceRows.forEach((row, i) => {
                gsap.from(row, {
                    scrollTrigger: {
                        trigger: row,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                    y: 70,
                    opacity: 0,
                    duration: 1,
                    ease: "back.out(1.2)",
                    delay: i % 2 === 0 ? 0 : 0.15
                });
            });

            // Floating effect for icons
            const icons = document.querySelectorAll(".srv-icon i");
            icons.forEach(icon => {
                gsap.to(icon, {
                    y: -8,
                    duration: 1.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: Math.random()
                });
            });

            // Scroll Down Indicator pulse
            const indicator = document.querySelector(".scroll-indicator");
            if (indicator) {
                gsap.to(indicator, {
                    y: 15,
                    duration: 1,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut"
                });
                
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
    }

    // 9. Payment Modal Close logic
    const closeBtn = document.getElementById('closePaymentModal');
    const paymentModal = document.getElementById('paymentModal');
    if (closeBtn && paymentModal) {
        closeBtn.addEventListener('click', () => {
            paymentModal.classList.remove('active');
        });
        
        // Close on outside click
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                paymentModal.classList.remove('active');
            }
        });
    }

    // Call fetch on load
    await fetchAndRenderServices();
    
    // 8. Initialise generic fade-in observer for utility classes
    if (typeof window.initFadeObserver === 'function') {
      window.initFadeObserver();
    }
});
