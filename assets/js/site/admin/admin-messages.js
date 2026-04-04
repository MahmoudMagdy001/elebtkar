/**
 * admin-messages.js — Contact Messages, Payments & Discount Codes Management
 * Read-only tables for viewing user interactions.
 */

window.AdminMessages = (() => {
  'use strict';

  const api = window.AdminAPI;
  const core = window.AdminCore;
  const forms = window.AdminForms;
  const i18n = window.AdminI18n;

  /**
   * Initialize messages module
   */
  function init() {
    setupRefreshButtons();
  }

  /**
   * Setup refresh buttons
   */
  function setupRefreshButtons() {
    document.getElementById('refreshContactMessages')?.addEventListener('click', loadContactMessages);
    document.getElementById('refreshPayments')?.addEventListener('click', loadPayments);
    document.getElementById('refreshCodes')?.addEventListener('click', loadDiscountCodes);

    // Expose message viewer globally
    window.viewMessage = viewMessage;
  }

  /**
   * Load contact messages table
   */
  async function loadContactMessages() {
    await forms.loadTableData({
      tableBodyId: 'contactMessagesTableBody',
      refreshBtnId: 'refreshContactMessages',
      fetchFn: api.ContactMessages.fetchAll,
      renderFn: renderMessageRow,
      emptyMessage: i18n.t('noMessages'),
      colspan: 5
    });
  }

  /**
   * Render contact message row
   */
  function renderMessageRow(item) {
    return `
      <tr>
        <td>${core.formatDate(item.created_at, true)}</td>
        <td>
            <strong>${escapeHtml(item.name)}</strong><br>
            <small>${escapeHtml(item.email)}</small>
        </td>
        <td dir="ltr">${escapeHtml(item.phone)}</td>
        <td><span class="code-pill">${escapeHtml(item.services || '-')}</span></td>
        <td>
            <button class="btn-read-message" onclick="viewMessage('${escapeJs(item.subject)}', '${escapeJs(item.message)}')" title="عرض التفاصيل">
               <i class="ph-duotone ph-eye"></i> قراءة
            </button>
        </td>
      </tr>
    `;
  }

  /**
   * View message details in alert
   */
  function viewMessage(subject, message) {
    alert(`الموضوع:\n${subject}\n\nالرسالة:\n${message}`);
  }

  /**
   * Load payments table
   */
  async function loadPayments() {
    const tableBody = document.getElementById('paymentsTableBody');
    const refreshBtn = document.getElementById('refreshPayments');

    if (!tableBody) return;
    refreshBtn?.classList.add('ph-spin');

    try {
      const { data: purchases, error } = await api.Payments.fetchAll();
      if (error) throw error;

      if (!purchases || purchases.length === 0) {
        tableBody.innerHTML = core.createEmptyRow(6, i18n.t('noPayments'));
        return;
      }

      tableBody.innerHTML = purchases.map(p => renderPaymentRow(p)).join('');
    } catch (err) {
      console.error('Error fetching payments:', err);
      tableBody.innerHTML = core.createErrorRow(6, `فشل تحميل البيانات: ${err.message}`);
    } finally {
      refreshBtn?.classList.remove('ph-spin');
    }
  }

  /**
   * Render payment row
   */
  function renderPaymentRow(p) {
    const planName = p.pricing_plans?.title || p.metadata?.plan_name || 'باقة';
    return `
      <tr>
        <td>${new Date(p.created_at).toLocaleString(i18n.date.locale)}</td>
        <td>
            <strong>${escapeHtml(p.user_name || 'عميل')}</strong><br>
            <small>${escapeHtml(p.user_email || '-')}</small><br>
            <small dir="ltr">${escapeHtml(p.user_phone || '-')}</small>
        </td>
        <td><span class="code-pill">${escapeHtml(planName)}</span></td>
        <td><strong>${p.amount} ${p.currency || 'SAR'}</strong></td>
        <td><span class="status-badge ${p.status === 'paid' ? 'success' : 'failed'}">${p.status === 'paid' ? 'مدفوع' : p.status}</span></td>
        <td dir="ltr" style="font-family: monospace; font-size: 0.7rem;">${escapeHtml(p.moyasar_payment_id)}</td>
      </tr>
    `;
  }

  /**
   * Load discount codes table
   */
  async function loadDiscountCodes() {
    await forms.loadTableData({
      tableBodyId: 'discountCodesTableBody',
      refreshBtnId: 'refreshCodes',
      fetchFn: api.DiscountCodes.fetchAll,
      renderFn: renderDiscountCodeRow,
      emptyMessage: i18n.t('noDiscountCodes'),
      colspan: 4
    });
  }

  /**
   * Render discount code row
   */
  function renderDiscountCodeRow(item) {
    return `
      <tr>
        <td>${core.formatDate(item.created_at, true)}</td>
        <td>${escapeHtml(item.user_name)}</td>
        <td dir="ltr">${escapeHtml(item.user_phone)}</td>
        <td><span class="code-pill">${escapeHtml(item.discount_code)}</span></td>
      </tr>
    `;
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

  /**
   * Escape JS string for use in attributes
   */
  function escapeJs(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  // Public API
  return {
    init,
    loadContactMessages,
    loadPayments,
    loadDiscountCodes
  };
})();
