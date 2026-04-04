/**
 * admin-forms.js — Shared Form Utilities
 * Common form handling patterns for all admin entities.
 */

window.AdminForms = (() => {
  'use strict';

  const i18n = window.AdminI18n;
  const core = window.AdminCore;

  /**
   * Generic table loader with refresh button animation
   */
  async function loadTableData(options) {
    const { tableBodyId, refreshBtnId, fetchFn, renderFn, emptyMessage, colspan } = options;

    const tableBody = document.getElementById(tableBodyId);
    const refreshBtn = refreshBtnId ? document.getElementById(refreshBtnId) : null;

    if (!tableBody) return;

    // Show loading state
    refreshBtn?.classList.add('ph-spin');

    try {
      const { data, error } = await fetchFn();
      if (error) throw error;

      if (!data || data.length === 0) {
        tableBody.innerHTML = core.createEmptyRow(colspan, emptyMessage);
        return;
      }

      tableBody.innerHTML = data.map(renderFn).join('');
    } catch (err) {
      console.error(`Error loading ${tableBodyId}:`, err);
      tableBody.innerHTML = core.createErrorRow(colspan, i18n.t('loadError', ''));
    } finally {
      refreshBtn?.classList.remove('ph-spin');
    }
  }

  /**
   * Generic delete handler with confirmation
   */
  async function handleDelete(options) {
    const { id, entityName, entityKey, deleteFn, onSuccess } = options;

    if (!confirm(i18n.t('confirmDelete', entityName))) return;

    try {
      const { error } = await deleteFn(id);
      if (error) throw error;

      core.showToast(i18n.messages[`${entityKey}Deleted`] || i18n.t('deleteSuccess'), 'success');
      onSuccess?.();
    } catch (err) {
      core.showToast(i18n.t('deleteError', err.message), 'error');
    }
  }

  /**
   * Setup SEO helpers (slug preview, meta counter)
   */
  function setupSeoHelpers(config) {
    const { slugInputId, slugPreviewId, metaInputId, metaCounterId, titleInputId, regenBtnId } = config;

    // Slug preview
    const slugInput = document.getElementById(slugInputId);
    const slugPreview = document.getElementById(slugPreviewId);

    if (slugInput && slugPreview) {
      slugInput.addEventListener('input', () => {
        slugPreview.textContent = slugInput.value || '…';
      });
    }

    // Meta counter
    const metaInput = document.getElementById(metaInputId);
    const metaCounter = document.getElementById(metaCounterId);

    if (metaInput && metaCounter) {
      metaInput.addEventListener('input', () => {
        const len = metaInput.value.length;
        const max = i18n.seo.idealMaxLength;
        metaCounter.textContent = i18n.seo.counterTemplate(len, max);

        let className = 'meta-counter ';
        if (len > max) className += i18n.seo.counterClasses.over;
        else if (len >= 100) className += i18n.seo.counterClasses.ok;
        else className += i18n.seo.counterClasses.warn;
        metaCounter.className = className;
      });
    }

    // Auto-generate slug from title
    if (titleInputId && slugInput && regenBtnId) {
      const titleInput = document.getElementById(titleInputId);
      const regenBtn = document.getElementById(regenBtnId);

      const generateSlug = (text) => {
        if (typeof window.generateSlug === 'function') {
          return window.generateSlug(text);
        }
        return text.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
      };

      const updateSlug = () => {
        const slug = generateSlug(titleInput.value);
        slugInput.value = slug;
        if (slugPreview) slugPreview.textContent = slug || '…';
      };

      titleInput?.addEventListener('input', updateSlug);
      regenBtn?.addEventListener('click', updateSlug);
    }
  }

  /**
   * Setup image preview for file inputs
   */
  function setupImagePreview(config) {
    const { fileInputId, previewId, zoneId } = config;

    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    const zone = zoneId ? document.getElementById(zoneId) : null;

    if (!fileInput || !preview) return;

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    });

    if (zone) {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', () => zone.classList.remove('drag-over'));
    }
  }

  /**
   * Validate form fields
   */
  function validateFields(fields) {
    for (const { value, required, validator, name } of fields) {
      if (required && !value) {
        return { valid: false, message: i18n.t('requiredFieldsError') };
      }
      if (validator && !validator(value)) {
        return { valid: false, message: `${name} غير صالح` };
      }
    }
    return { valid: true };
  }

  /**
   * Parse features text to array
   */
  function parseFeatures(featuresStr) {
    if (!featuresStr) return [];
    if (Array.isArray(featuresStr)) return featuresStr;
    return featuresStr.split('\n').map(f => f.trim()).filter(f => f);
  }

  /**
   * Switch to edit mode UI
   */
  function switchToEditMode(config) {
    const { editSectionId, manageSectionId, navItemSelector, submitLabelId, labelText } = config;

    document.getElementById(editSectionId)?.classList.add('active');
    document.getElementById(manageSectionId)?.classList.remove('active');

    // Update nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(navItemSelector)?.classList.add('active');

    // Update submit label
    const submitLabel = document.getElementById(submitLabelId);
    if (submitLabel && labelText) submitLabel.textContent = labelText;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Reset form and return to manage view
   */
  function resetToManageView(config) {
    const { formId, editor, editSectionId, manageSectionId, navItemSelector, submitLabelId, createLabel, resetEditingId } = config;

    const form = document.getElementById(formId);
    if (form) form.reset();

    if (editor && typeof editor.reset === 'function') {
      editor.reset();
    } else if (editor && editor.root) {
      editor.root.innerHTML = '';
    }

    document.getElementById(editSectionId)?.classList.remove('active');
    document.getElementById(manageSectionId)?.classList.add('active');

    // Reset nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(navItemSelector)?.classList.add('active');

    // Reset submit label
    const submitLabel = document.getElementById(submitLabelId);
    if (submitLabel && createLabel) submitLabel.textContent = createLabel;

    // Reset editing ID
    if (resetEditingId) {
      window[resetEditingId] = null;
    }
  }

  // Public API
  return {
    loadTableData,
    handleDelete,
    setupSeoHelpers,
    setupImagePreview,
    validateFields,
    parseFeatures,
    switchToEditMode,
    resetToManageView
  };
})();
