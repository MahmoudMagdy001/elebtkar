/**
 * editor.js — Professional Rich Text Editor Module
 * Wraps Quill.js loaded via CDN.
 * Exposes: window.BlogEditor { init, getHTML, setHTML, getWordCount, reset }
 */

window.BlogEditor = (() => {

  let quill = null;
  let imageControls = null;
  let activeImage = null;

  /* ── Toolbar config ─────────────────────────── */
  const toolbarOptions = [
    [{ 'size': ['small', false, 'large', 'huge'] }], // خيارات حجم الخط
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    ['clean']
  ];

  /* ── Sanitise HTML output (DOMPurify) ─────────── */
  function sanitize(html) {
    if (typeof DOMPurify === 'undefined') return html;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p','br','strong','em','u','s','h1','h2','h3','h4','h5','h6',
        'ul','ol','li','blockquote','pre','code','a','img','hr',
        'span','div','sup','sub','iframe','figure','figcaption',
        'table','thead','tbody','tr','th','td'
      ],
      ALLOWED_ATTR: [
        'href','src','alt','class','style','target','rel',
        'width','height','allowfullscreen','frameborder',
        'loading','data-size','data-align'
      ],
      ALLOW_DATA_ATTR: true,
      FORCE_BODY: false
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getImageWidthPercent(img) {
    if (!img) return 100;
    const inlineWidth = img.style.width || '';
    if (inlineWidth.endsWith('%')) {
      const parsed = parseFloat(inlineWidth);
      return Number.isFinite(parsed) ? clamp(Math.round(parsed), 10, 100) : 100;
    }
    if (img.naturalWidth && img.width) {
      const parsed = (img.width / img.naturalWidth) * 100;
      return Number.isFinite(parsed) ? clamp(Math.round(parsed), 10, 100) : 100;
    }
    return 100;
  }

  /* ── Image handlers ─────────────────────────── */
  function buildImageModal() {
    if (document.getElementById('editorImageModal')) return;
    const modal = document.createElement('div');
    modal.id = 'editorImageModal';
    modal.className = 'editor-modal-overlay';
    modal.innerHTML = `
      <div class="editor-modal">
        <div class="editor-modal-header">
          <h3><i class="ph-duotone ph-image"></i> إدراج صورة</h3>
          <button class="editor-modal-close" id="imgModalClose" aria-label="إغلاق">×</button>
        </div>
        <div class="editor-modal-body">
          <div class="editor-tabs">
            <button class="editor-tab active" data-tab="upload">رفع صورة</button>
            <button class="editor-tab" data-tab="url">رابط URL</button>
          </div>
          <div class="editor-tab-panel active" id="imgTabUpload">
            <div class="img-upload-drop" id="imgDropZone">
              <input type="file" id="imgFileInput" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" />
              <i class="ph-duotone ph-image-square" style="font-size:2.5rem;color:var(--primary);"></i>
              <p>اسحب صورة هنا أو انقر للاختيار</p>
              <small>PNG، JPG، WebP — بحد أقصى 5 MB</small>
            </div>
            <img id="imgUploadPreview" src="" alt="" style="display:none;max-width:100%;margin-top:1rem;border-radius:8px;border:1px solid var(--gray-200);" />
          </div>
          <div class="editor-tab-panel" id="imgTabUrl" style="display:none;">
            <div class="editor-modal-field">
              <label>رابط الصورة (URL)</label>
              <input type="url" id="imgUrlInput" placeholder="https://example.com/image.jpg" dir="ltr" style="text-align:left;" />
            </div>
          </div>
          <div class="editor-modal-field">
            <label>النص البديل (Alt Text) — مهم لـ SEO</label>
            <input type="text" id="imgAltInput" placeholder="وصف الصورة" />
          </div>
          <div class="editor-modal-field">
            <label>حجم الصورة</label>
            <div class="img-size-btns">
              <button class="img-size-btn active" data-size="full">عرض كامل</button>
              <button class="img-size-btn" data-size="medium">متوسط</button>
              <button class="img-size-btn" data-size="small">صغير</button>
            </div>
          </div>
        </div>
        <div class="editor-modal-footer">
          <button class="editor-modal-cancel" id="imgModalCancel">إلغاء</button>
          <button class="editor-modal-submit" id="imgModalInsert">
            <i class="ph ph-check"></i> إدراج الصورة
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    let selectedSize = 'full';
    let uploadedFile = null;

    // Tabs
    modal.querySelectorAll('.editor-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        modal.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
        modal.querySelectorAll('.editor-tab-panel').forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        document.getElementById(`imgTab${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).style.display = 'block';
      });
    });

    // Size buttons
    modal.querySelectorAll('.img-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.img-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.size;
      });
    });

    // File upload preview
    const fileInput = document.getElementById('imgFileInput');
    const preview = document.getElementById('imgUploadPreview');
    const dropZone = document.getElementById('imgDropZone');
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      uploadedFile = file;
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    });
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) { uploadedFile = file; preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
    });

    const close = () => { modal.classList.remove('active'); uploadedFile = null; preview.style.display = 'none'; preview.src = ''; fileInput.value = ''; document.getElementById('imgUrlInput').value = ''; document.getElementById('imgAltInput').value = ''; };
    document.getElementById('imgModalClose').onclick = close;
    document.getElementById('imgModalCancel').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    document.getElementById('imgModalInsert').onclick = async () => {
      const alt = document.getElementById('imgAltInput').value.trim();
      const urlVal = document.getElementById('imgUrlInput').value.trim();
      const activeTab = modal.querySelector('.editor-tab.active')?.dataset.tab;
      let src = '';

      if (activeTab === 'upload' && uploadedFile) {
        try {
          document.getElementById('imgModalInsert').disabled = true;
          document.getElementById('imgModalInsert').textContent = 'جاري الرفع…';
          src = await uploadFeaturedImage(uploadedFile);
        } catch (err) {
          alert('فشل رفع الصورة: ' + err.message);
          document.getElementById('imgModalInsert').disabled = false;
          document.getElementById('imgModalInsert').innerHTML = '<i class="ph ph-check"></i> إدراج الصورة';
          return;
        }
      } else if (activeTab === 'url' && urlVal) {
        src = urlVal;
      } else {
        alert('يرجى اختيار صورة أو إدخال رابط.');
        return;
      }

      // Build styled img HTML
      const sizeStyle = selectedSize === 'full' ? 'width:100%;' : selectedSize === 'medium' ? 'width:65%;' : 'width:35%;';
      const imgHtml = `<img src="${src}" alt="${alt}" style="${sizeStyle}border-radius:10px;display:block;margin:1rem auto;" data-size="${selectedSize}" loading="lazy" />`;
      
      const range = quill.getSelection(true);
      quill.clipboard.dangerouslyPasteHTML(range.index, imgHtml);
      quill.setSelection(range.index + 1);

      document.getElementById('imgModalInsert').disabled = false;
      document.getElementById('imgModalInsert').innerHTML = '<i class="ph ph-check"></i> إدراج الصورة';
      close();
    };

    return modal;
  }

  /* ── YouTube embed modal ────────────────────── */
  function buildYoutubeModal() {
    if (document.getElementById('editorYoutubeModal')) return;
    const modal = document.createElement('div');
    modal.id = 'editorYoutubeModal';
    modal.className = 'editor-modal-overlay';
    modal.innerHTML = `
      <div class="editor-modal" style="max-width:500px;">
        <div class="editor-modal-header">
          <h3><i class="ph-duotone ph-youtube-logo" style="color:#ff0000;"></i> تضمين فيديو يوتيوب</h3>
          <button class="editor-modal-close" id="ytModalClose">×</button>
        </div>
        <div class="editor-modal-body">
          <div class="editor-modal-field">
            <label>رابط فيديو يوتيوب</label>
            <input type="url" id="ytUrlInput" placeholder="https://www.youtube.com/watch?v=..." dir="ltr" style="text-align:left;" />
          </div>
          <div class="editor-modal-field">
            <label>عنوان الفيديو (للإمكانية الوصول)</label>
            <input type="text" id="ytTitleInput" placeholder="وصف الفيديو" />
          </div>
        </div>
        <div class="editor-modal-footer">
          <button class="editor-modal-cancel" id="ytModalCancel">إلغاء</button>
          <button class="editor-modal-submit" id="ytModalInsert">
            <i class="ph ph-check"></i> تضمين الفيديو
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => { modal.classList.remove('active'); document.getElementById('ytUrlInput').value = ''; document.getElementById('ytTitleInput').value = ''; };
    document.getElementById('ytModalClose').onclick = close;
    document.getElementById('ytModalCancel').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    document.getElementById('ytModalInsert').onclick = () => {
      const url = document.getElementById('ytUrlInput').value.trim();
      const title = document.getElementById('ytTitleInput').value.trim() || 'فيديو يوتيوب';
      if (!url) { alert('يرجى إدخال رابط يوتيوب.'); return; }

      let videoId = '';
      try {
        const u = new URL(url);
        videoId = u.searchParams.get('v') || u.pathname.replace('/', '');
        if (u.hostname === 'youtu.be') videoId = u.pathname.replace('/', '');
      } catch (_) {}

      if (!videoId) { alert('رابط يوتيوب غير صالح.'); return; }

      const embedHtml = `
        <div class="ql-yt-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:1.5rem 0;">
          <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}"
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
            allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>`;

      const range = quill.getSelection(true);
      quill.clipboard.dangerouslyPasteHTML(range.index, embedHtml);
      quill.setSelection(range.index + 1);
      close();
    };

    return modal;
  }

  /* ── Link modal ───────────────────────────────── */
  function buildLinkModal() {
    if (document.getElementById('editorLinkModal')) return;
    const modal = document.createElement('div');
    modal.id = 'editorLinkModal';
    modal.className = 'editor-modal-overlay';
    modal.innerHTML = `
      <div class="editor-modal" style="max-width:480px;">
        <div class="editor-modal-header">
          <h3><i class="ph-duotone ph-link"></i> إضافة / تعديل رابط</h3>
          <button class="editor-modal-close" id="lnkModalClose">×</button>
        </div>
        <div class="editor-modal-body">
          <div class="editor-modal-field">
            <label>عنوان الرابط (URL)</label>
            <input type="url" id="lnkUrlInput" placeholder="https://example.com" dir="ltr" style="text-align:left;" />
          </div>
          <div class="editor-modal-field" style="display:flex;align-items:center;gap:.8rem;margin-top:.5rem;">
            <input type="checkbox" id="lnkNewTab" checked style="width:18px;height:18px;cursor:pointer;" />
            <label for="lnkNewTab" style="margin:0;cursor:pointer;">فتح في نافذة جديدة</label>
          </div>
        </div>
        <div class="editor-modal-footer">
          <button class="editor-modal-cancel" id="lnkRemoveBtn" style="background:#ffebee;color:#e53935;border-color:#ffcdd2;">
            <i class="ph ph-trash"></i> إزالة الرابط
          </button>
          <button class="editor-modal-cancel" id="lnkModalCancel">إلغاء</button>
          <button class="editor-modal-submit" id="lnkModalInsert">
            <i class="ph ph-check"></i> حفظ
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => { modal.classList.remove('active'); };
    document.getElementById('lnkModalClose').onclick = close;
    document.getElementById('lnkModalCancel').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    document.getElementById('lnkRemoveBtn').onclick = () => { quill.format('link', false); close(); };

    document.getElementById('lnkModalInsert').onclick = () => {
      const url = document.getElementById('lnkUrlInput').value.trim();
      if (!url) { alert('يرجى إدخال رابط.'); return; }
      const newTab = document.getElementById('lnkNewTab').checked;
      quill.format('link', url);
      // Set target="_blank" via DOM after Quill applies the link
      setTimeout(() => {
        if (newTab) {
          quill.root.querySelectorAll('a[href="' + url + '"]').forEach(a => {
            a.target = '_blank'; a.rel = 'noopener noreferrer';
          });
        }
      }, 50);
      close();
    };

    return modal;
  }

  /* ── Editor Tooltips ──────────────────────────── */
  function setupTooltips(wrapper) {
    const qlToolbar = wrapper.querySelector('.ql-toolbar');
    if (!qlToolbar) return;

    const tooltips = {
      'button.ql-bold': 'عريض',
      'button.ql-italic': 'مائل',
      'button.ql-underline': 'تسطير',
      'button.ql-strike': 'توسيط خط (شطب)',
      'button.ql-list[value="ordered"]': 'قائمة رقمية',
      'button.ql-list[value="bullet"]': 'قائمة نقطية',
      'button.ql-indent[value="-1"]': 'تقليل المسافة البادئة',
      'button.ql-indent[value="+1"]': 'زيادة المسافة البادئة',
      'button.ql-blockquote': 'اقتباس',
      'button.ql-code-block': 'كود برمجي',
      'button.ql-link': 'إدراج رابط',
      'button.ql-image': 'إدراج صورة',
      'button.ql-video': 'إدراج فيديو',
      'button.ql-script[value="sub"]': 'نص سفلي',
      'button.ql-script[value="super"]': 'نص علوي',
      'button.ql-clean': 'إزالة التنسيقات',
      '.ql-size.ql-picker': 'حجم النص',
      '.ql-color.ql-picker': 'لون النص',
      '.ql-background.ql-picker': 'لون خلفية النص',
      '.ql-align.ql-picker': 'محاذاة النص'
    };

    for (const [selector, text] of Object.entries(tooltips)) {
      const elements = qlToolbar.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.classList.contains('ql-picker')) {
          const label = el.querySelector('.ql-picker-label');
          if (label) label.setAttribute('title', text);
        } else {
          el.setAttribute('title', text);
        }
      });
    }
  }

  function createImageControls() {
    if (imageControls) return imageControls;

    const controls = document.createElement('div');
    controls.className = 'editor-image-controls';
    controls.innerHTML = `
      <div class="editor-image-controls-row">
        <span class="editor-image-controls-label">حجم الصورة</span>
        <div class="editor-image-presets">
          <button type="button" class="img-preset-btn" data-width="100">100%</button>
          <button type="button" class="img-preset-btn" data-width="75">75%</button>
          <button type="button" class="img-preset-btn" data-width="50">50%</button>
          <button type="button" class="img-preset-btn" data-width="35">35%</button>
        </div>
      </div>
      <div class="editor-image-controls-row">
        <input type="range" class="editor-image-range" min="10" max="100" step="1" value="100" />
        <div class="editor-image-number-wrap">
          <input type="number" class="editor-image-number" min="10" max="100" step="1" value="100" />
          <span>%</span>
        </div>
      </div>
    `;
    document.body.appendChild(controls);
    imageControls = controls;

    const rangeInput = controls.querySelector('.editor-image-range');
    const numberInput = controls.querySelector('.editor-image-number');
    const presetButtons = controls.querySelectorAll('.img-preset-btn');

    const applyWidth = (value) => {
      if (!activeImage) return;
      const width = clamp(parseInt(value, 10) || 100, 10, 100);
      activeImage.style.width = `${width}%`;
      activeImage.style.height = 'auto';
      activeImage.style.maxWidth = '100%';
      activeImage.style.display = 'block';
      activeImage.style.margin = '1rem auto';
      activeImage.dataset.size = width >= 90 ? 'full' : width >= 55 ? 'medium' : 'small';
      rangeInput.value = String(width);
      numberInput.value = String(width);
      presetButtons.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.width, 10) === width));
      quill?.history?.cutoff();
    };

    rangeInput.addEventListener('input', (e) => applyWidth(e.target.value));
    numberInput.addEventListener('change', (e) => applyWidth(e.target.value));

    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => applyWidth(btn.dataset.width));
    });

    return controls;
  }

  function positionImageControls(targetImg) {
    if (!imageControls || !targetImg) return;
    const rect = targetImg.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const left = rect.left + window.scrollX + (rect.width / 2);
    imageControls.style.top = `${top}px`;
    imageControls.style.left = `${left}px`;
    imageControls.classList.add('active');
  }

  function hideImageControls() {
    if (!imageControls) return;
    imageControls.classList.remove('active');
    if (activeImage) activeImage.classList.remove('editor-selected-image');
    activeImage = null;
  }

  function setupImageResizer() {
    createImageControls();
    if (!quill) return;

    quill.root.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img || !quill.root.contains(img)) {
        hideImageControls();
        return;
      }

      if (activeImage) activeImage.classList.remove('editor-selected-image');
      activeImage = img;
      activeImage.classList.add('editor-selected-image');

      const width = getImageWidthPercent(img);
      const rangeInput = imageControls.querySelector('.editor-image-range');
      const numberInput = imageControls.querySelector('.editor-image-number');
      rangeInput.value = String(width);
      numberInput.value = String(width);

      imageControls.querySelectorAll('.img-preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.width, 10) === width);
      });

      positionImageControls(img);
    });

    document.addEventListener('click', (e) => {
      if (!imageControls?.contains(e.target) && !quill.root.contains(e.target)) {
        hideImageControls();
      }
    });

    window.addEventListener('scroll', () => {
      if (activeImage && imageControls?.classList.contains('active')) positionImageControls(activeImage);
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (activeImage && imageControls?.classList.contains('active')) positionImageControls(activeImage);
    });
  }

  /* ── Public init ───────────────────────────────── */
  function init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) { console.error(`Editor container #${containerId} not found`); return; }

    // Override Quill's image handler to open custom modal instead
    const ImageFormat = Quill.import('formats/image');
    Quill.register('formats/image', ImageFormat);

    quill = new Quill('#' + containerId, {
      theme: 'snow',
      placeholder: 'ابدأ كتابة مقالتك هنا...',
      modules: {
        toolbar: {
          container: toolbarOptions,
          handlers: {
            image: () => {
              const modal = document.getElementById('editorImageModal');
              if (modal) modal.classList.add('active');
            },
            video: () => {
              const modal = document.getElementById('editorYoutubeModal');
              if (modal) modal.classList.add('active');
            },
            link: () => {
              const modal = document.getElementById('editorLinkModal');
              if (modal) {
                const range = quill.getSelection();
                if (range) {
                  const [leaf] = quill.getLeaf(range.index);
                  const existing = leaf?.parent?.domNode?.tagName === 'A' ? leaf.parent.domNode.href : '';
                  document.getElementById('lnkUrlInput').value = existing || '';
                } else {
                  document.getElementById('lnkUrlInput').value = '';
                }
                modal.classList.add('active');
              }
            }
          }
        },
        history: { delay: 1000, maxStack: 200, userOnly: true }
      }
    });

    // Make toolbar standard and sticky
    const wrapper = container.closest('.ql-wrapper') || container.parentElement;
    const qlToolbar = container.querySelector('.ql-toolbar');
    if (qlToolbar) {
      const headerWrapper = document.createElement('div');
      headerWrapper.className = 'editor-header-wrapper';
      container.insertBefore(headerWrapper, container.querySelector('.ql-container'));
      headerWrapper.appendChild(qlToolbar);
    }

    buildImageModal();
    buildYoutubeModal();
    buildLinkModal();
    setupTooltips(wrapper);
    setupImageResizer();

    // Keyboard shortcuts hint tooltip
    quill.keyboard.addBinding({ key: 'K', shortKey: true }, () => {
      document.getElementById('editorLinkModal')?.classList.add('active');
    });
  }

  /* ── Public API ──────────────────────────────── */
  function getHTML() {
    if (!quill) return '';
    const html = quill.root.innerHTML;
    if (html === '<p><br></p>' || html === '<p></p>') return '';
    return sanitize(html);
  }

  function setHTML(html) {
    if (!quill) return;
    quill.root.innerHTML = sanitize(html);
  }

  function getWordCount() {
    if (!quill) return 0;
    const text = quill.getText().trim();
    return text ? (text.match(/\S+/g)?.length ?? 0) : 0;
  }

  function reset() {
    if (!quill) return;
    quill.setContents([]);
  }

  return { init, getHTML, setHTML, getWordCount, reset };
})();
