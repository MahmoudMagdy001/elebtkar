/**
 * admin-partners.js — Partner Management
 */

window.AdminPartners = (() => {
  'use strict';

  const api = window.AdminAPI;
  const core = window.AdminCore;
  const forms = window.AdminForms;
  const i18n = window.AdminI18n;

  let editingPartnerId = null;

  /**
   * Initialize partners module
   */
  function init() {
    setupImagePreview();
    setupForm();
    setupRefreshButton();

    // Expose handlers globally for onclick
    window.handleDeletePartner = handleDelete;
    window.handleEditPartner = handleEdit;
  }

  /**
   * Setup image preview
   */
  function setupImagePreview() {
    forms.setupImagePreview({
      fileInputId: 'partnerLogo',
      previewId: 'partnerImagePreview',
      zoneId: 'partnerUploadZone'
    });
  }

  /**
   * Setup partner form submission
   */
  function setupForm() {
    const form = document.getElementById('partnerForm');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
  }

  /**
   * Load partners table
   */
  async function loadPartners() {
    await forms.loadTableData({
      tableBodyId: 'partnersTableBody',
      refreshBtnId: 'refreshPartners',
      fetchFn: api.Partners.fetchAll,
      renderFn: renderPartnerRow,
      emptyMessage: i18n.t('noPartners'),
      colspan: 4
    });
  }

  /**
   * Render partner table row
   */
  function renderPartnerRow(item) {
    return `
      <tr>
        <td><img src="${escapeHtml(item.logo_url)}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: contain; background: #eee;"></td>
        <td dir="ltr" style="font-size: 0.8rem; color: var(--primary);">${escapeHtml(item.website_url || '-')}</td>
        <td>${item.order_num}</td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditPartner(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeletePartner(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `;
  }

  /**
   * Handle delete partner
   */
  async function handleDelete(id) {
    await forms.handleDelete({
      id,
      entityName: i18n.messages.entities.partner,
      entityKey: 'partner',
      deleteFn: api.Partners.delete,
      onSuccess: loadPartners
    });
  }

  /**
   * Handle edit partner
   */
  async function handleEdit(ptn) {
    editingPartnerId = ptn.id;

    // Populate form
    document.getElementById('partnerWebsite').value = ptn.website_url || '';
    document.getElementById('partnerOrder').value = ptn.order_num || 0;

    // Set image preview
    const partnerImagePreview = document.getElementById('partnerImagePreview');
    if (partnerImagePreview) {
      partnerImagePreview.src = ptn.logo_url;
      partnerImagePreview.style.display = 'block';
    }

    // Update form title
    const formTitle = document.getElementById('partnerFormTitle');
    if (formTitle) formTitle.textContent = 'تعديل بيانات الشريك';

    // Switch to edit view
    forms.switchToEditMode({
      editSectionId: 'addPartnerSection',
      manageSectionId: 'managePartnersSection',
      navItemSelector: '[data-section="addPartner"]',
      submitLabelId: 'partnerSubmitLabel',
      labelText: i18n.t('updatePartner')
    });
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const website_url = document.getElementById('partnerWebsite').value.trim();
    const order_num = parseInt(document.getElementById('partnerOrder').value, 10) || 0;
    const logoFile = document.getElementById('partnerLogo').files[0];

    // Validation - require logo for new partners
    if (!logoFile && !editingPartnerId) {
      core.showToast('يرجى اختيار شعار الشريك', 'error');
      return;
    }

    core.setBtnLoading('partnerSubmitBtn', 'partnerSubmitSpinner', 'partnerSubmitIcon', 'partnerSubmitLabel', true, i18n.t('publishing'));

    try {
      // Upload logo if provided
      let logo_url = null;
      if (logoFile && typeof uploadFeaturedImage === 'function') {
        logo_url = await uploadFeaturedImage(logoFile);
      }

      const ptnData = {
        website_url,
        order_num,
        ...(logo_url && { logo_url })
      };

      if (editingPartnerId) {
        const { error } = await api.Partners.update(editingPartnerId, ptnData);
        if (error) throw error;
        core.showToast(i18n.t('partnerUpdated'), 'success');
      } else {
        const { error } = await api.Partners.create(ptnData);
        if (error) throw error;
        core.showToast(i18n.t('partnerCreated'), 'success');
      }

      resetForm();
      loadPartners();
    } catch (err) {
      core.showToast(i18n.t('saveError', i18n.messages.entities.partner) + ': ' + err.message, 'error');
    } finally {
      core.setBtnLoading('partnerSubmitBtn', 'partnerSubmitSpinner', 'partnerSubmitIcon', 'partnerSubmitLabel', false, null, editingPartnerId ? i18n.t('updatePartner') : i18n.t('createPartner'));
    }
  }

  /**
   * Reset form
   */
  function resetForm() {
    forms.resetToManageView({
      formId: 'partnerForm',
      editSectionId: 'addPartnerSection',
      manageSectionId: 'managePartnersSection',
      navItemSelector: '[data-section="managePartners"]',
      submitLabelId: 'partnerSubmitLabel',
      createLabel: i18n.t('createPartner')
    });
    editingPartnerId = null;

    // Reset form title
    const formTitle = document.getElementById('partnerFormTitle');
    if (formTitle) formTitle.textContent = 'إضافة شريك جديد';
  }

  /**
   * Setup refresh button
   */
  function setupRefreshButton() {
    document.getElementById('refreshPartners')?.addEventListener('click', loadPartners);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API
  return {
    init,
    loadPartners,
    handleDelete,
    handleEdit
  };
})();
