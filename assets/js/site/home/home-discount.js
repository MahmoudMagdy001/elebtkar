/**
 * home-discount.js — Discount Code Generator
 * Generates discount codes based on company name and phone number.
 */

window.HomeDiscount = (() => {
  'use strict';

  const i18n = window.SiteI18n;

  /**
   * Initialize discount code form
   */
  function init() {
    const form = document.getElementById('discountForm');
    const copyBtn = document.getElementById('copyCodeBtn');

    form?.addEventListener('submit', handleSubmit);
    copyBtn?.addEventListener('click', copyCode);
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || 'توليد الكود';

    const companyField = document.getElementById('companyName');
    const phoneField = document.getElementById('userPhone');

    const companyName = companyField?.value.trim();
    const phone = phoneField?.value.trim() || '';

    if (!companyName) {
      alert(i18n.validation.required);
      return;
    }

    // Generate code
    const normalizedPart = companyName.replace(/\s+/g, '').slice(0, 8).toUpperCase();
    const lastFour = phone.slice(-4).padStart(4, '0');
    const code = normalizedPart + lastFour;

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري التوليد...';
      }

      const { error } = await window.sb
        .from('discount_codes')
        .insert([{ company_name: companyName, user_phone: phone, discount_code: code }]);

      if (error) throw error;

      showResult(code);
    } catch (err) {
      console.error('Error saving discount code:', err);
      alert(i18n.messages.errorSaving);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  /**
   * Show generated code result
   */
  function showResult(code) {
    const resultEl = document.getElementById('codeResult');
    const codeEl = document.getElementById('generatedCode');

    if (codeEl) codeEl.textContent = code;
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Copy code to clipboard
   */
  async function copyCode() {
    const codeEl = document.getElementById('generatedCode');
    if (!codeEl) return;

    const code = codeEl.textContent;
    const result = await window.SiteCore.copyToClipboard(code, i18n.messages.copySuccess);

    const copyBtn = document.getElementById('copyCodeBtn');
    if (result.success && copyBtn) {
      copyBtn.classList.add('copied');
      const icon = copyBtn.querySelector('i');
      if (icon) icon.className = 'ph-fill ph-check-circle';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (icon) icon.className = 'ph-fill ph-copy';
      }, 2000);
    }
  }

  return { init };
})();
