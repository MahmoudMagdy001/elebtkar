/**
 * admin-stats.js — Statistics Management (Edit/Delete/Toggle only)
 */

window.AdminStats = (() => {
  'use strict';

  const api = window.AdminAPI;
  const core = window.AdminCore;
  const forms = window.AdminForms;
  const i18n = window.AdminI18n;

  let editingStatId = null;
  let editModal = null;

  /**
   * Initialize stats module
   */
  function init() {
    setupModal();
    setupRefreshButton();

    // Expose handlers globally for onclick
    window.handleDeleteStat = handleDelete;
    window.handleEditStat = handleEdit;
    window.handleToggleStat = handleToggle;
    window.handleSaveStat = handleSave;
    window.handleCancelEdit = closeModal;
  }

  /**
   * Setup edit modal
   */
  function setupModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('statEditModal')) {
      const modal = document.createElement('div');
      modal.id = 'statEditModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>تعديل إحصائية</h3>
            <button class="btn-close" onclick="handleCancelEdit()">&times;</button>
          </div>
          <form id="statEditForm" onsubmit="handleSaveStat(event)">
            <div class="modal-body">
              <div class="field-group">
                <label>النص (Label) *</label>
                <input type="text" id="editStatLabel" required />
              </div>
              <div class="form-row">
                <div class="field-group">
                  <label>القيمة *</label>
                  <input type="number" id="editStatValue" required />
                </div>
                <div class="field-group">
                  <label>المقدمة</label>
                  <input type="text" id="editStatPrefix" maxlength="10" />
                </div>
                <div class="field-group">
                  <label>اللاحقة</label>
                  <input type="text" id="editStatSuffix" maxlength="10" />
                </div>
              </div>
              <div class="form-row">
                <div class="field-group">
                  <label>القسم *</label>
                  <select id="editStatSection" required>
                    <option value="who">قسم من نحن</option>
                    <option value="stats">قسم الإحصائيات</option>
                  </select>
                </div>
                <div class="field-group">
                  <label>الترتيب</label>
                  <input type="number" id="editStatOrder" min="0" />
                </div>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="editStatActive" />
                <label for="editStatActive">نشط (يظهر في الموقع)</label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn-primary" id="editStatSubmitBtn">
                <div class="spinner" id="editStatSpinner"></div>
                <span id="editStatLabel">حفظ التغييرات</span>
              </button>
              <button type="button" class="btn-secondary" onclick="handleCancelEdit()">إلغاء</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      editModal = modal;

      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      // Add modal styles if not present
      if (!document.getElementById('statModalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'statModalStyles';
        styles.textContent = `
          .modal {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
          }
          .modal.active { display: flex; }
          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #eee;
          }
          .modal-header h3 { margin: 0; }
          .btn-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
          }
          .modal-body {
            padding: 1.5rem;
          }
          .modal-footer {
            display: flex;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            border-top: 1px solid #eee;
            justify-content: flex-end;
          }
          .modal .field-group {
            margin-bottom: 1rem;
          }
          .modal .field-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          .modal input, .modal select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
          }
          .modal input.readonly {
            background: #f5f5f5;
            cursor: not-allowed;
          }
          .modal .form-row {
            display: flex;
            gap: 1rem;
          }
          .modal .form-row .field-group {
            flex: 1;
          }
          .modal .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .modal .btn-primary, .modal .btn-secondary {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
          }
          .modal .btn-primary {
            background: #0066ff;
            color: white;
          }
          .modal .btn-secondary {
            background: #f0f0f0;
            color: #333;
          }
          .modal .spinner {
            display: none;
            width: 16px;
            height: 16px;
            border: 2px solid #fff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(styles);
      }
    } else {
      editModal = document.getElementById('statEditModal');
    }
  }

  /**
   * Open modal with stat data
   */
  function openModal(stat) {
    editingStatId = stat.id;
    document.getElementById('editStatLabel').value = stat.label || '';
    document.getElementById('editStatValue').value = stat.value || '';
    document.getElementById('editStatPrefix').value = stat.prefix || '';
    document.getElementById('editStatSuffix').value = stat.suffix || '';
    document.getElementById('editStatSection').value = stat.section || 'who';
    document.getElementById('editStatOrder').value = stat.sort_order || 0;
    document.getElementById('editStatActive').checked = stat.is_active !== false;

    editModal.classList.add('active');
  }

  /**
   * Close modal
   */
  function closeModal() {
    editModal?.classList.remove('active');
    editingStatId = null;
    document.getElementById('editStatForm')?.reset();
  }

  /**
   * Load stats table
   */
  async function loadStats() {
    const tableBody = document.getElementById('statsTableBody');
    const refreshBtn = document.getElementById('refreshStats');

    if (!tableBody) return;

    refreshBtn?.classList.add('ph-spin');

    try {
      const { data, error } = await api.Statistics.fetchAll();
      if (error) throw error;

      if (!data || data.length === 0) {
        tableBody.innerHTML = core.createEmptyRow(5, 'لا توجد إحصائيات');
        return;
      }

      // Group by section
      const grouped = data.reduce((acc, stat) => {
        acc[stat.section] = acc[stat.section] || [];
        acc[stat.section].push(stat);
        return acc;
      }, {});

      const sectionLabels = {
        'who': 'قسم من نحن',
        'stats': 'قسم الإحصائيات'
      };

      // Render sections in specific order
      const sectionOrder = ['who', 'stats'];
      let html = '';

      sectionOrder.forEach(section => {
        if (grouped[section] && grouped[section].length > 0) {
          // Section header
          html += `
            <tr class="section-header-row">
              <td colspan="5" style="background: #f8fafc; font-weight: 600; padding: 0.75rem 1rem; color: #1a56db;">
                ${sectionLabels[section] || section}
              </td>
            </tr>
          `;
          // Section rows
          html += grouped[section].map(stat => renderStatRow(stat)).join('');
        }
      });

      tableBody.innerHTML = html;
    } catch (err) {
      console.error('Error loading stats:', err);
      tableBody.innerHTML = core.createErrorRow(5, i18n.t('loadError', ''));
    } finally {
      refreshBtn?.classList.remove('ph-spin');
    }
  }

  /**
   * Render stat table row
   */
  function renderStatRow(item) {
    const displayValue = `${item.prefix || ''}${item.value}${item.suffix || ''}`;
    const statusBadge = item.is_active
      ? '<span class="badge badge-success">نشط</span>'
      : '<span class="badge badge-inactive">مخفي</span>';

    return `
      <tr class="${item.is_active ? '' : 'inactive-row'}">
        <td dir="ltr">${escapeHtml(displayValue)}</td>
        <td>${escapeHtml(item.label)}</td>
        <td>${item.sort_order || 0}</td>
        <td>${statusBadge}</td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditStat(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeleteStat(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `;
  }

  /**
   * Handle delete stat
   */
  async function handleDelete(id) {
    await forms.handleDelete({
      id,
      entityName: 'الإحصائية',
      entityKey: 'stat',
      deleteFn: api.Statistics.delete,
      onSuccess: loadStats
    });
  }

  /**
   * Handle toggle stat active state
   */
  async function handleToggle(id, newState) {
    try {
      const { error } = await api.Statistics.update(id, { is_active: newState });
      if (error) throw error;

      core.showToast(newState ? 'تم الإظهار بنجاح' : 'تم الإخفاء بنجاح', 'success');
      loadStats();
    } catch (err) {
      console.error('Error toggling stat:', err);
      core.showToast('حدث خطأ أثناء تحديث الحالة', 'error');
    }
  }

  /**
   * Handle edit stat - open modal
   */
  async function handleEdit(stat) {
    openModal(stat);
  }

  /**
   * Handle save stat from modal
   */
  async function handleSave(e) {
    e.preventDefault();

    const data = {
      value: parseInt(document.getElementById('editStatValue').value, 10),
      prefix: document.getElementById('editStatPrefix').value.trim(),
      suffix: document.getElementById('editStatSuffix').value.trim(),
      label: document.getElementById('editStatLabel').value.trim(),
      section: document.getElementById('editStatSection').value,
      sort_order: parseInt(document.getElementById('editStatOrder').value, 10) || 0,
      is_active: document.getElementById('editStatActive').checked
    };

    const btn = document.getElementById('editStatSubmitBtn');
    const spinner = document.getElementById('editStatSpinner');
    const label = document.getElementById('editStatLabel');

    btn.disabled = true;
    spinner.style.display = 'inline-block';
    label.textContent = 'جاري الحفظ...';

    try {
      const { error } = await api.Statistics.update(editingStatId, data);
      if (error) throw error;

      core.showToast('تم تحديث الإحصائية بنجاح', 'success');
      closeModal();
      loadStats();
    } catch (err) {
      console.error('Error saving stat:', err);
      core.showToast('حدث خطأ أثناء الحفظ: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
      label.textContent = 'حفظ التغييرات';
    }
  }

  /**
   * Setup refresh button
   */
  function setupRefreshButton() {
    document.getElementById('refreshStats')?.addEventListener('click', loadStats);
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
    loadStats,
    handleDelete,
    handleEdit
  };
})();
