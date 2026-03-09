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

// ─── Contact form: Service selection logic ─────
document.addEventListener('DOMContentLoaded', () => {
    const selectAllCheckbox = document.getElementById('selectAllServices');
    const serviceCheckboxes = document.querySelectorAll('input[name="service"]');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            serviceCheckboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
        });

        // Update Select All state if individual checkboxes are changed
        serviceCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(serviceCheckboxes).every(c => c.checked);
                selectAllCheckbox.checked = allChecked;
            });
        });
    }
});

// ─── Discount Code Generation ─────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Supabase Initialization (using credentials from blog-logic.js)
    const SUPABASE_URL = 'https://fdevgkvjloezhyelciqb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZXZna3ZqbG9lemh5ZWxjaXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTQ5MzgsImV4cCI6MjA4ODYzMDkzOH0.hahG-eXojQZulQPTRJ59rn3oaqGcuHWEHn6YVChAE_M';
    const { createClient } = supabase;
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const discountForm = document.getElementById('discountForm');
    const codeResult = document.getElementById('codeResult');
    const generatedCode = document.getElementById('generatedCode');
    const copyCodeBtn = document.getElementById('copyCodeBtn');

    if (discountForm) {
        discountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = discountForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            const nameField = document.getElementById('userName');
            const phoneField = document.getElementById('userPhone');
            const name = nameField.value.trim();
            const phone = phoneField.value.trim();
            
            // Basic validation for name (English only, no spaces)
            const nameRegex = /^[A-Za-z]+$/;
            if (!nameRegex.test(name)) {
                alert('يرجى إدخال الاسم بالإنجليزية فقط وبدون مسافات');
                return;
            }

            // Get last 4 digits of phone
            const lastFour = phone.slice(-4).padStart(4, '0');
            
            // Generate code: Name + Last4
            const code = (name + lastFour).toUpperCase();
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'جاري التوليد...';

                // Save to Supabase
                const { error } = await sb
                    .from('discount_codes')
                    .insert([
                        { user_name: name, user_phone: phone, discount_code: code }
                    ]);

                if (error) throw error;

                // Display result
                generatedCode.textContent = code;
                codeResult.style.display = 'block';
                
                // Scroll to result
                codeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (err) {
                console.error('Error saving discount code:', err);
                alert('حدث خطأ أثناء حفظ الكود. يرجى المحاولة مرة أخرى.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            const codeText = generatedCode.textContent;
            navigator.clipboard.writeText(codeText).then(() => {
                copyCodeBtn.classList.add('copied');
                const icon = copyCodeBtn.querySelector('i');
                icon.className = 'ph-fill ph-check-circle';
                
                setTimeout(() => {
                    copyCodeBtn.classList.remove('copied');
                    icon.className = 'ph-fill ph-copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }
});


