
// ─── Intersection Observer & Stagger ───
// Use shared fade observer with counters enabled
document.addEventListener('DOMContentLoaded', () => {
  const observer = initFadeObserver(true);
  
  // Stagger service cards
  document.querySelectorAll('.service-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.07) + 's';
    card.classList.add('fade-in');
    observer.observe(card);
  });
});

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
    // ── Supabase client ──────────────────────────────────────────────────
    // Uses credentials from /js/config.js loaded in the HTML <head>
    const { createClient } = supabase;
    const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

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
            
            // Validation: Allow Arabic, English and spaces
            if (!companyName) {
                alert('يرجى إدخال اسم الشركة');
                return;
            }

            // Normalize name for code generation: 
            // - Remove spaces
            // - Take first 4-8 chars if possible
            // - If Arabic, it will still work as a string
            const normalizedPart = companyName.replace(/\s+/g, '').slice(0, 8).toUpperCase();

            // Get last 4 digits of phone
            const lastFour = phone.slice(-4).padStart(4, '0');
            
            // Generate code: Normalized Company Name + Last4
            const code = (normalizedPart + lastFour);
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'جاري التوليد...';

                // Save to Supabase (using company_name)
                const { error } = await sb
                    .from('discount_codes')
                    .insert([
                        { company_name: companyName, user_phone: phone, discount_code: code }
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

// ─── Contact Form: Send via WhatsApp ──────────
function sendWhatsApp(e) {
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

  const text =
    `🌟 *طلب تواصل جديد من موقع الابتكار*\n\n` +
    `👤 *الاسم:* ${name}\n` +
    `📧 *البريد الإلكتروني:* ${email}\n` +
    `📱 *رقم الجوال:* ${phone}\n` +
    `📌 *الموضوع:* ${subject}\n` +
    `🛠️ *الخدمات المطلوبة:* ${servicesText}\n\n` +
    `💬 *الرسالة:*\n${message}`;

  const waNumber = '966579644123';
  const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  window.open(waURL, '_blank');
}

