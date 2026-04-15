/**
 * admin-posts.js — Blog Post Management
 */

window.AdminPosts = (() => {
  'use strict';

  const api = window.AdminAPI;
  const core = window.AdminCore;
  const forms = window.AdminForms;
  const i18n = window.AdminI18n;

  let editingPostId = null;

  /**
   * Initialize posts module
   */
  function init() {
    setupSeoHelpers();
    setupImagePreview();
    setupForm();
    setupRefreshButton();

    // Expose handlers globally for onclick
    window.handleDeleteArticle = handleDelete;
    window.handleEditArticle = handleEdit;
  }

  /**
   * Setup SEO helpers
   */
  function setupSeoHelpers() {
    forms.setupSeoHelpers({
      slugInputId: 'slug',
      slugPreviewId: 'slugPreview',
      metaInputId: 'metaDescription',
      metaCounterId: 'metaCounter'
    });
  }

  /**
   * Setup image preview
   */
  function setupImagePreview() {
    forms.setupImagePreview({
      fileInputId: 'featuredImage',
      previewId: 'imagePreview',
      zoneId: 'uploadZone'
    });
  }

  /**
   * Setup post form submission
   */
  function setupForm() {
    const form = document.getElementById('postForm');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
  }

  /**
   * Load articles table
   */
  async function loadArticles() {
    await forms.loadTableData({
      tableBodyId: 'postsTableBody',
      refreshBtnId: 'refreshPosts',
      fetchFn: api.Posts.fetchAll,
      renderFn: renderArticleRow,
      emptyMessage: i18n.t('noArticles'),
      colspan: 4
    });
  }

  /**
   * Render article table row
   */
  function renderArticleRow(item) {
    return `
      <tr>
        <td>${escapeHtml(item.title)}</td>
        <td dir="ltr">${escapeHtml(item.slug)}</td>
        <td>${core.formatDate(item.created_at)}</td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditArticle(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeleteArticle(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `;
  }

  /**
   * Handle delete article
   */
  async function handleDelete(id) {
    await forms.handleDelete({
      id,
      entityName: i18n.messages.entities.article,
      entityKey: 'post',
      deleteFn: api.Posts.delete,
      onSuccess: loadArticles
    });
  }

  /**
   * Handle edit article
   */
  async function handleEdit(post) {
    try {
      const { data: fullPost, error } = await api.Posts.fetchById(post.id);
      if (error) throw error;

      editingPostId = fullPost.id;

      // Populate form
      document.getElementById('title').value = fullPost.title || '';
      document.getElementById('slug').value = fullPost.slug || '';
      document.getElementById('metaDescription').value = fullPost.meta_description || '';
      document.getElementById('altText').value = fullPost.alt_text || '';

      // Update meta counter
      const metaCounter = document.getElementById('metaCounter');
      if (metaCounter && fullPost.meta_description) {
        const len = fullPost.meta_description.length;
        metaCounter.textContent = i18n.seo.counterTemplate(len, i18n.seo.idealMaxLength);
      }

      // Set editor content
      if (window.BlogEditor) {
        window.BlogEditor.setHTML(fullPost.content || '');
      } else {
        const contentInput = document.getElementById('content');
        if (contentInput) contentInput.value = fullPost.content || '';
      }

      // Set image preview
      const imagePreview = document.getElementById('imagePreview');
      if (imagePreview && fullPost.featured_image_url) {
        imagePreview.src = fullPost.featured_image_url;
        imagePreview.style.display = 'block';
      }

      // Update slug preview
      const slugPreview = document.getElementById('slugPreview');
      if (slugPreview) slugPreview.textContent = fullPost.slug || '…';

      // Switch to edit view
      forms.switchToEditMode({
        editSectionId: 'addPostSection',
        manageSectionId: 'managePostsSection',
        navItemSelector: '[data-section="addPost"]',
        submitLabelId: 'submitLabel',
        labelText: i18n.t('updatePost')
      });
    } catch (err) {
      core.showToast(i18n.t('loadError', i18n.messages.entities.article), 'error');
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const titleVal = document.getElementById('title').value.trim();
    const slugInput = document.getElementById('slug');
    const slugVal = forms.normalizeSlug(slugInput?.value || '');
    const metaVal = document.getElementById('metaDescription').value.trim();
    const contentVal = window.BlogEditor ? window.BlogEditor.getHTML() : document.getElementById('content')?.value.trim();
    const altVal = document.getElementById('altText').value.trim();
    const fileInput = document.getElementById('featuredImage');
    const file = fileInput?.files[0];

    // Update hidden content field
    const contentField = document.getElementById('content');
    if (contentField) contentField.value = contentVal;

    // Validation
    const validation = forms.validateFields([
      { value: titleVal, required: true, name: 'العنوان' },
      { value: slugVal, required: true, name: 'الرابط' },
      { value: metaVal, required: true, name: 'الوصف' },
      { value: contentVal, required: true, name: 'المحتوى' },
      { value: altVal, required: true, name: 'نص الصورة' },
      { value: file || editingPostId, required: true, name: 'الصورة', validator: (v) => v }
    ]);

    if (!validation.valid) {
      core.showToast(validation.message, 'error');
      return;
    }

    if (slugInput) {
      slugInput.value = slugVal;
      const slugPreview = document.getElementById('slugPreview');
      if (slugPreview) slugPreview.textContent = slugVal || '…';
    }

    // Image size check
    if (file && file.size > i18n.upload.maxSizeMB * 1024 * 1024) {
      core.showToast(i18n.t('imageSizeError'), 'error');
      return;
    }

    // Set loading state
    core.setBtnLoading('submitBtn', 'submitSpinner', 'submitIcon', 'submitLabel', true, i18n.t('publishing'));

    try {
      let imageUrl = null;
      if (file && typeof uploadFeaturedImage === 'function') {
        imageUrl = await uploadFeaturedImage(file);
      }

      const postData = {
        title: titleVal,
        slug: slugVal,
        meta_description: metaVal,
        content: contentVal,
        alt_text: altVal,
        ...(imageUrl && { featured_image_url: imageUrl })
      };

      if (editingPostId) {
        const { error } = await api.Posts.update(editingPostId, postData);
        if (error) throw error;
        core.showToast(i18n.t('postUpdated'), 'success');
      } else {
        const { error } = await api.Posts.create(postData);
        if (error) throw error;
        core.showToast(i18n.t('postCreated'), 'success');
      }

      // Reset and refresh
      resetForm();
      loadArticles();
    } catch (err) {
      core.showToast(i18n.t('saveError', i18n.messages.entities.article) + ': ' + err.message, 'error');
    } finally {
      core.setBtnLoading('submitBtn', 'submitSpinner', 'submitIcon', 'submitLabel', false, null, editingPostId ? i18n.t('updatePost') : i18n.t('publishPost'));
    }
  }

  /**
   * Reset form
   */
  function resetForm() {
    forms.resetToManageView({
      formId: 'postForm',
      editor: window.BlogEditor,
      editSectionId: 'addPostSection',
      manageSectionId: 'managePostsSection',
      navItemSelector: '[data-section="managePosts"]',
      submitLabelId: 'submitLabel',
      createLabel: i18n.t('publishPost')
    });
    editingPostId = null;
  }

  /**
   * Setup refresh button
   */
  function setupRefreshButton() {
    document.getElementById('refreshPosts')?.addEventListener('click', loadArticles);
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
    loadArticles,
    handleDelete,
    handleEdit
  };
})();
