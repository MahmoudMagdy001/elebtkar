/**
 * admin-services.js — Service Management
 */

window.AdminServices = (() => {
  'use strict';

  const api = window.AdminAPI;
  const core = window.AdminCore;
  const forms = window.AdminForms;
  const i18n = window.AdminI18n;

  let editingServiceId = null;
  let serviceEditor = null;

  /**
   * Initialize services module
   */
  function init() {
    initEditor();
    setupSeoHelpers();
    setupForm();
    setupRefreshButton();

    // Expose handlers globally for onclick
    window.handleDeleteService = handleDelete;
    window.handleEditService = handleEdit;
  }

  /**
   * Initialize Quill editor for service descriptions
   */
  function initEditor() {
    if (!document.getElementById('srvDescriptionEditor') || !window.Quill) return;

    serviceEditor = new Quill('#srvDescriptionEditor', {
      theme: 'snow',
      placeholder: 'اكتب وصف الخدمة بشكل احترافي...',
      modules: {
        toolbar: [
          [{ 'size': ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          [{ 'script': 'sub' }, { 'script': 'super' }],
          ['clean']
        ],
        history: { delay: 1000, maxStack: 200, userOnly: true }
      }
    });

    // Sync editor content to hidden input on text change
    serviceEditor.on('text-change', () => {
      const hiddenInput = document.getElementById('srvDescription');
      if (hiddenInput) {
        hiddenInput.value = serviceEditor.root.innerHTML;
      }
    });
  }

  /**
   * Setup SEO helpers
   */
  function setupSeoHelpers() {
    forms.setupSeoHelpers({
      slugInputId: 'srvSlug',
      slugPreviewId: 'srvSlugPreview',
      metaInputId: 'srvMetaDescription',
      metaCounterId: 'srvMetaCounter',
      titleInputId: 'srvTitle',
      regenBtnId: 'regenSrvSlug'
    });
  }

  /**
   * Setup service form submission
   */
  function setupForm() {
    const form = document.getElementById('serviceForm');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
  }

  /**
   * Load services table
   */
  async function loadServices() {
    await forms.loadTableData({
      tableBodyId: 'servicesTableBody',
      refreshBtnId: 'refreshServices',
      fetchFn: api.Services.fetchAll,
      renderFn: renderServiceRow,
      emptyMessage: i18n.t('noServices'),
      colspan: 3
    });
  }

  /**
   * Render service table row
   */
  function renderServiceRow(item) {
    return `
      <tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${item.order_num}</td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditService(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeleteService(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `;
  }

  /**
   * Handle delete service
   */
  async function handleDelete(id) {
    await forms.handleDelete({
      id,
      entityName: i18n.messages.entities.service,
      entityKey: 'service',
      deleteFn: api.Services.delete,
      onSuccess: loadServices
    });
  }

  /**
   * Handle edit service
   */
  async function handleEdit(srvSummary) {
    try {
      const { data: srv, error } = await api.Services.fetchById(srvSummary.id);
      if (error) throw error;

      editingServiceId = srv.id;

      // Populate form
      document.getElementById('srvTitle').value = srv.title || '';
      document.getElementById('srvSlug').value = srv.slug || '';
      document.getElementById('srvMetaDescription').value = srv.meta_description || '';
      document.getElementById('srvSubtitle').value = srv.subtitle || '';
      document.getElementById('srvFeatures').value = (srv.features || []).join('\n');
      document.getElementById('srvOrder').value = srv.order_num;
      document.getElementById('srvReverse').checked = srv.is_reverse;
      document.getElementById('srvBgIcon').value = '';

      // Update slug preview
      const slugPreview = document.getElementById('srvSlugPreview');
      if (slugPreview) slugPreview.textContent = srv.slug || '…';

      // Update meta counter
      const metaCounter = document.getElementById('srvMetaCounter');
      if (metaCounter && srv.meta_description) {
        const len = srv.meta_description.length;
        metaCounter.textContent = i18n.seo.counterTemplate(len, i18n.seo.idealMaxLength);
      }

      // Set editor content
      if (serviceEditor) {
        const description = srv.description || '';
        serviceEditor.root.innerHTML = typeof DOMPurify !== 'undefined'
          ? DOMPurify.sanitize(description)
          : description;
        const hiddenInput = document.getElementById('srvDescription');
        if (hiddenInput) hiddenInput.value = serviceEditor.root.innerHTML;
      }

      // Switch to edit view
      forms.switchToEditMode({
        editSectionId: 'addServiceSection',
        manageSectionId: 'manageServicesSection',
        navItemSelector: '[data-section="addService"]',
        submitLabelId: 'srvSubmitLabel',
        labelText: i18n.t('updateService')
      });
    } catch (err) {
      core.showToast(i18n.t('loadError', i18n.messages.entities.service), 'error');
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('srvTitle').value.trim();
    const slug = document.getElementById('srvSlug').value.trim();
    const meta_description = document.getElementById('srvMetaDescription').value.trim();
    const subtitle = document.getElementById('srvSubtitle').value.trim();
    const description = serviceEditor
      ? (typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(serviceEditor.root.innerHTML) : serviceEditor.root.innerHTML)
      : document.getElementById('srvDescription')?.value.trim();
    const featuresStr = document.getElementById('srvFeatures').value.trim();
    const order_num = parseInt(document.getElementById('srvOrder').value, 10) || 0;
    const is_reverse = document.getElementById('srvReverse').checked;
    const bgIconFile = document.getElementById('srvBgIcon').files[0];

    // Validation
    const validation = forms.validateFields([
      { value: title, required: true, name: 'العنوان' },
      { value: slug, required: true, name: 'الرابط' }
    ]);

    if (!validation.valid) {
      core.showToast(validation.message, 'error');
      return;
    }

    core.setBtnLoading('srvSubmitBtn', 'srvSubmitSpinner', 'srvSubmitIcon', 'srvSubmitLabel', true, i18n.t('publishing'));

    try {
      // Upload background icon if provided
      let bg_icon = null;
      if (bgIconFile && typeof uploadFeaturedImage === 'function') {
        bg_icon = await uploadFeaturedImage(bgIconFile);
      }

      const srvData = {
        title,
        slug,
        meta_description,
        subtitle,
        description,
        features: forms.parseFeatures(featuresStr),
        order_num,
        is_reverse,
        ...(bg_icon && { bg_icon })
      };

      if (editingServiceId) {
        const { error } = await api.Services.update(editingServiceId, srvData);
        if (error) throw error;
        core.showToast(i18n.t('serviceUpdated'), 'success');
      } else {
        const { error } = await api.Services.create(srvData);
        if (error) throw error;
        core.showToast(i18n.t('serviceCreated'), 'success');
      }

      resetForm();
      loadServices();
    } catch (err) {
      core.showToast(i18n.t('saveError', i18n.messages.entities.service) + ': ' + err.message, 'error');
    } finally {
      core.setBtnLoading('srvSubmitBtn', 'srvSubmitSpinner', 'srvSubmitIcon', 'srvSubmitLabel', false, null, editingServiceId ? i18n.t('updateService') : i18n.t('createService'));
    }
  }

  /**
   * Reset form
   */
  function resetForm() {
    forms.resetToManageView({
      formId: 'serviceForm',
      editor: serviceEditor,
      editSectionId: 'addServiceSection',
      manageSectionId: 'manageServicesSection',
      navItemSelector: '[data-section="manageServices"]',
      submitLabelId: 'srvSubmitLabel',
      createLabel: i18n.t('createService')
    });
    editingServiceId = null;
  }

  /**
   * Setup refresh button
   */
  function setupRefreshButton() {
    document.getElementById('refreshServices')?.addEventListener('click', loadServices);
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
    loadServices,
    handleDelete,
    handleEdit
  };
})();
