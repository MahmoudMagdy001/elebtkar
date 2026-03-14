
// ─── Intersection Observer & Stagger ───
// Use shared fade observer with counters enabled
document.addEventListener('DOMContentLoaded', () => {
    // This will be called again after services are loaded
    initHomeAnimations();
});

function initHomeAnimations() {
    const observer = typeof initFadeObserver === 'function' ? initFadeObserver(true) : null;
    
    // Stagger service cards
    document.querySelectorAll('.service-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 0.07) + 's';
        card.classList.add('fade-in');
        if (observer) observer.observe(card);
    });
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

// ─── Supabase Logic (Discount & Dynamic Services) ───
document.addEventListener('DOMContentLoaded', async () => {
    // ── Supabase client ──────────────────────────────────────────────────
    const { createClient } = supabase;
    const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // 1. Dynamic Services Fetching for Home Page
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        try {
            const { data: services, error } = await sb
                .from('services')
                .select('*')
                .order('order_num', { ascending: true });

            if (error) throw error;

            if (services && services.length > 0) {
                servicesGrid.innerHTML = '';
                services.forEach(srv => {
                    const card = document.createElement('div');
                    card.className = `service-card ${srv.is_featured ? 'service-card-accent' : ''}`;
                    
                    const iconHtml = srv.icon && srv.icon.startsWith('http') 
                        ? `<img src="${srv.icon}" class="srv-icon-img" alt="${srv.title}" loading="lazy">` 
                        : `<i class="${srv.icon || 'ph ph-duotone ph-gear'}"></i>`;

                    card.innerHTML = `
                        <div class="service-icon">${iconHtml}</div>
                        <h3>${srv.title}</h3>
                        <p>${srv.description || srv.subtitle || ''}</p>
                    `;
                    servicesGrid.appendChild(card);
                });
                // Re-run animations for new elements
                initHomeAnimations();
            }
        } catch (err) {
            console.error('Error fetching services for home:', err);
        }
    }

    // 2. Discount Code Generation
    const discountForm = document.getElementById('discountForm');
    const codeResult = document.getElementById('codeResult');
    const generatedCode = document.getElementById('generatedCode');
    const copyCodeBtn = document.getElementById('copyCodeBtn');

    if (discountForm) {
        discountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = discountForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            const companyField = document.getElementById('companyName');
            const phoneField = document.getElementById('userPhone');
            const companyName = companyField.value.trim();
            const phone = phoneField.value.trim();
            
            if (!companyName) {
                alert('يرجى إدخال اسم الشركة');
                return;
            }

            const normalizedPart = companyName.replace(/\s+/g, '').slice(0, 8).toUpperCase();
            const lastFour = phone.slice(-4).padStart(4, '0');
            const code = (normalizedPart + lastFour);
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'جاري التوليد...';

                const { error } = await sb
                    .from('discount_codes')
                    .insert([
                        { company_name: companyName, user_phone: phone, discount_code: code }
                    ]);

                if (error) throw error;

                generatedCode.textContent = code;
                codeResult.style.display = 'block';
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

// ─── Contact Form: Submit handler ──────────
async function submitContactForm(e) {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  const selectedServices = Array.from(
    document.querySelectorAll('input[name="service"]:checked')
  ).map(cb => cb.value);

  const servicesText = selectedServices.length > 0
    ? selectedServices.join('، ')
    : 'لم يتم تحديد خدمة';

  // حفظ البيانات في قاعدة البيانات (سوبابيز)
  try {
    const { createClient } = supabase;
    const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // Disable button to prevent double submission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الإرسال...';

    const { error } = await sb.from('contact_messages').insert([{
      name: name,
      email: email,
      phone: phone,
      subject: subject,
      services: servicesText,
      message: message
    }]);

    if (error) {
      console.error('Error saving message to Supabase:', error);
      alert('حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً.');
    } else {
      alert('تم إرسال رسالتك بنجاح. سنتواصل معك في أقرب وقت!');
      e.target.reset(); // clear the form
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;

  } catch (err) {
    console.error('Exception saving message to Supabase:', err);
    alert('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.');
  }
}

// ─── Payment Modal Close logic ────────────────
document.addEventListener('DOMContentLoaded', () => {
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
});
