/**
 * home-contact.js — Contact Form Handler
 * Handles contact form submission to Supabase.
 */

window.HomeContact = (() => {
  'use strict';

  const i18n = window.SiteI18n;

  /**
   * Initialize contact form
   */
  function init() {
    const form = document.getElementById('contactForm');
    form?.addEventListener('submit', handleSubmit);

    // Setup "Select All" checkbox
    setupSelectAll();
  }

  /**
   * Setup "Select All" checkbox for services
   */
  function setupSelectAll() {
    const selectAll = document.getElementById('selectAllServices');
    const checkboxes = document.querySelectorAll('input[name="service"]');

    if (!selectAll || !checkboxes.length) return;

    selectAll.addEventListener('change', () => {
      checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });

    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        selectAll.checked = Array.from(checkboxes).every(c => c.checked);
      });
    });
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const subject = document.getElementById('subject')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    const selectedServices = Array.from(
      document.querySelectorAll('input[name="service"]:checked')
    ).map(cb => cb.value);

    const servicesText = selectedServices.length
      ? selectedServices.join('، ')
      : 'لم يتم تحديد خدمة';

    if (!name || !email || !phone) {
      alert(i18n.validation.required);
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || 'إرسال';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';
      }

      const { error } = await window.sb.from('contact_messages').insert([{
        name,
        email,
        phone,
        subject,
        services: servicesText,
        message
      }]);

      if (error) throw error;

      alert(i18n.messages.sendSuccess);
      e.target.reset();
    } catch (err) {
      console.error('Error sending message:', err);
      alert(i18n.messages.errorSending + ' ' + i18n.messages.tryAgainLater);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  return { init };
})();
