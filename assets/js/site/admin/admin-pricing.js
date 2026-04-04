/**
 * admin-pricing.js — Pricing Plan Management
 */

window.AdminPricing = (() => {
  'use strict';

  const api = window.AdminAPI;
  const core = window.AdminCore;
  const forms = window.AdminForms;
  const i18n = window.AdminI18n;

  let editingPricingPlanId = null;

  /**
   * Initialize pricing module
   */
  function init() {
    setupSeoHelpers();
    setupForm();
    setupRefreshButton();

    // Expose handlers globally for onclick
    window.handleDeletePricingPlan = handleDelete;
    window.handleEditPricingPlan = handleEdit;
  }

  /**
   * Setup SEO helpers
   */
  function setupSeoHelpers() {
    forms.setupSeoHelpers({
      slugInputId: 'planSlug',
      slugPreviewId: 'planSlugPreview',
      titleInputId: 'planTitle',
      regenBtnId: 'regenPlanSlug'
    });
  }

  /**
   * Setup pricing plan form submission
   */
  function setupForm() {
    const form = document.getElementById('pricingPlanForm');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
  }

  /**
   * Load pricing plans table
   */
  async function loadPricingPlans() {
    await forms.loadTableData({
      tableBodyId: 'pricingPlansTableBody',
      refreshBtnId: 'refreshPricingPlans',
      fetchFn: api.PricingPlans.fetchAll,
      renderFn: renderPlanRow,
      emptyMessage: i18n.t('noPlans'),
      colspan: 6
    });
  }

  /**
   * Render pricing plan table row
   */
  function renderPlanRow(item) {
    return `
      <tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${item.price.toLocaleString()}</td>
        <td>${item.order_num}</td>
        <td>${item.is_popular ? '<span class="code-pill">نعم</span>' : 'لا'}</td>
        <td><span class="status-badge ${item.is_active ? 'success' : 'failed'}">${item.is_active ? 'نشط' : 'معطل'}</span></td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditPricingPlan(${item.id})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeletePricingPlan(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `;
  }

  /**
   * Handle delete pricing plan
   */
  async function handleDelete(id) {
    await forms.handleDelete({
      id,
      entityName: i18n.messages.entities.plan,
      entityKey: 'plan',
      deleteFn: api.PricingPlans.delete,
      onSuccess: loadPricingPlans
    });
  }

  /**
   * Handle edit pricing plan
   */
  async function handleEdit(id) {
    try {
      const { data: plan, error } = await api.PricingPlans.fetchById(id);
      if (error) throw error;

      editingPricingPlanId = plan.id;

      // Populate form
      document.getElementById('planTitle').value = plan.title || '';
      document.getElementById('planSlug').value = plan.slug || '';
      document.getElementById('planSubtitle').value = plan.subtitle || '';
      document.getElementById('planPrice').value = plan.price;
      document.getElementById('planCurrency').value = plan.currency || '﷼';
      document.getElementById('planCycle').value = plan.billing_cycle || 'شهرياً';
      document.getElementById('planOrder').value = plan.order_num || 1;
      document.getElementById('planPopular').checked = plan.is_popular;
      document.getElementById('planActive').checked = plan.is_active;

      // Update slug preview
      const slugPreview = document.getElementById('planSlugPreview');
      if (slugPreview) slugPreview.textContent = plan.slug || '…';

      // Parse and set features
      let featuresArray = [];
      try {
        featuresArray = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
      } catch (e) {}
      document.getElementById('planFeatures').value = (featuresArray || []).join('\n');

      // Switch to edit view
      forms.switchToEditMode({
        editSectionId: 'addPricingPlanSection',
        manageSectionId: 'managePricingPlansSection',
        navItemSelector: '[data-section="addPricingPlan"]',
        submitLabelId: 'planSubmitLabel',
        labelText: i18n.t('updatePlan')
      });
    } catch (err) {
      core.showToast(i18n.t('loadError', i18n.messages.entities.plan), 'error');
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('planTitle').value.trim();
    const slug = document.getElementById('planSlug').value.trim();
    const subtitle = document.getElementById('planSubtitle').value.trim();
    const price = parseFloat(document.getElementById('planPrice').value);
    const currency = document.getElementById('planCurrency').value;
    const billing_cycle = document.getElementById('planCycle').value;
    const order_num = parseInt(document.getElementById('planOrder').value, 10) || 1;
    const is_popular = document.getElementById('planPopular').checked;
    const is_active = document.getElementById('planActive').checked;
    const featuresStr = document.getElementById('planFeatures').value.trim();

    // Validation
    const validation = forms.validateFields([
      { value: title, required: true, name: 'العنوان' },
      { value: slug, required: true, name: 'الرابط' },
      { value: price, required: true, name: 'السعر', validator: (v) => !isNaN(v) && v >= 0 }
    ]);

    if (!validation.valid) {
      core.showToast(validation.message, 'error');
      return;
    }

    core.setBtnLoading('planSubmitBtn', 'planSubmitSpinner', 'planSubmitIcon', 'planSubmitLabel', true, i18n.t('publishing'));

    try {
      const planData = {
        title,
        slug,
        subtitle,
        price,
        currency,
        billing_cycle,
        order_num,
        is_popular,
        is_active,
        features: forms.parseFeatures(featuresStr)
      };

      if (editingPricingPlanId) {
        const { error } = await api.PricingPlans.update(editingPricingPlanId, planData);
        if (error) throw error;
        core.showToast(i18n.t('planUpdated'), 'success');
      } else {
        const { error } = await api.PricingPlans.create(planData);
        if (error) throw error;
        core.showToast(i18n.t('planCreated'), 'success');
      }

      resetForm();
      loadPricingPlans();
    } catch (err) {
      core.showToast(i18n.t('saveError', i18n.messages.entities.plan) + ': ' + err.message, 'error');
    } finally {
      core.setBtnLoading('planSubmitBtn', 'planSubmitSpinner', 'planSubmitIcon', 'planSubmitLabel', false, null, editingPricingPlanId ? i18n.t('updatePlan') : i18n.t('createPlan'));
    }
  }

  /**
   * Reset form
   */
  function resetForm() {
    forms.resetToManageView({
      formId: 'pricingPlanForm',
      editSectionId: 'addPricingPlanSection',
      manageSectionId: 'managePricingPlansSection',
      navItemSelector: '[data-section="managePricingPlans"]',
      submitLabelId: 'planSubmitLabel',
      createLabel: i18n.t('createPlan')
    });
    editingPricingPlanId = null;
  }

  /**
   * Setup refresh button
   */
  function setupRefreshButton() {
    document.getElementById('refreshPricingPlans')?.addEventListener('click', loadPricingPlans);
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
    loadPricingPlans,
    handleDelete,
    handleEdit
  };
})();
