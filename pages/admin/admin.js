// ── Slug generation ──────────────────────────
const titleEnInput = document.getElementById('titleEn');
const slugInput    = document.getElementById('slug');
const slugPreview  = document.getElementById('slugPreview');
const regenBtn     = document.getElementById('regenSlug');

function updateSlugFromTitle() {
  const s = generateSlug(titleEnInput.value);
  slugInput.value = s;
  slugPreview.textContent = s || '…';
}

titleEnInput.addEventListener('input', updateSlugFromTitle);
slugInput.addEventListener('input', () => {
  slugPreview.textContent = slugInput.value || '…';
});
regenBtn.addEventListener('click', updateSlugFromTitle);

// ── Meta description counter ──────────────────
const metaInput   = document.getElementById('metaDescription');
const metaCounter = document.getElementById('metaCounter');
const IDEAL_MAX   = 155;

metaInput.addEventListener('input', () => {
  const len = metaInput.value.length;
  metaCounter.textContent = `${len} / ${IDEAL_MAX} حرف`;
  metaCounter.className = 'meta-counter ' +
    (len <= IDEAL_MAX ? (len >= 100 ? 'ok' : 'warn') : 'over');
});

// ── Image preview ─────────────────────────────
const fileInput    = document.getElementById('featuredImage');
const imagePreview = document.getElementById('imagePreview');
const uploadZone   = document.getElementById('uploadZone');

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = 'block';
});

// Drag-over highlight
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', () => uploadZone.classList.remove('drag-over'));

// ── Toast helper ──────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="ph ph-${type === 'success' ? 'check-circle' : 'warning-circle'}"></i> ${msg}`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 4000);
}

// ── Auth Handling ─────────────────────────────
const loginContainer = document.getElementById('loginContainer');
const dashHeader     = document.getElementById('dashHeader');
const dashWrapper    = document.getElementById('dashWrapper');

const loginForm      = document.getElementById('loginForm');
const loginEmail     = document.getElementById('loginEmail');
const loginPassword  = document.getElementById('loginPassword');
const loginBtn       = document.getElementById('loginBtn');
const loginSpinner   = document.getElementById('loginSpinner');
const loginIcon      = document.getElementById('loginIcon');
const loginLabel     = document.getElementById('loginLabel');
const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');

// Listen to auth state changes
sb.auth.onAuthStateChange((event, session) => {
  if (session) {
    loginContainer.style.display = 'none';
    dashHeader.style.display = 'flex';
    dashWrapper.style.display = 'flex';
    loadDiscountCodes(); // Load codes when admin logs in
  } else {
    loginContainer.style.display = 'block';
    dashHeader.style.display = 'none';
    dashWrapper.style.display = 'none';
  }
});

// Check initial session
sb.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    loginContainer.style.display = 'none';
    dashHeader.style.display = 'flex';
    dashWrapper.style.display = 'flex';
    loadDiscountCodes();
  } else {
    loginContainer.style.display = 'block';
    dashHeader.style.display = 'none';
    dashWrapper.style.display = 'none';
  }
});

// Sidebar Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.admin-section');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetSection = item.getAttribute('data-section');
    
    // Update active nav
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Update active section
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(`${targetSection}Section`).classList.add('active');

    // If switching to discount codes, refresh them
    if (targetSection === 'discountCodes') {
      loadDiscountCodes();
    }
  });
});

// ── Discount Codes Handling ──────────────────
async function loadDiscountCodes() {
  const tableBody = document.getElementById('discountCodesTableBody');
  const refreshBtn = document.getElementById('refreshCodes');
  
  if (refreshBtn) refreshBtn.classList.add('ph-spin');

  try {
    const { data, error } = await sb
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">لا توجد أكواد خصم حالياً</td></tr>';
      return;
    }

    tableBody.innerHTML = data.map(item => `
      <tr>
        <td>${new Date(item.created_at).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td>${item.user_name}</td>
        <td dir="ltr">${item.user_phone}</td>
        <td><span class="code-pill">${item.discount_code}</span></td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error fetching discount codes:', err);
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #e53935;">فشل تحميل البيانات: ${err.message}</td></tr>`;
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('ph-spin');
  }
}

document.getElementById('refreshCodes')?.addEventListener('click', loadDiscountCodes);

// Login Form Submit
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    if (!email || !password) return;
    
    loginBtn.disabled = true;
    loginSpinner.style.display = 'block';
    loginIcon.style.display = 'none';
    loginLabel.textContent = 'جاري تسجيل الدخول…';
    
    const { error } = await sb.auth.signInWithPassword({ email, password });
    
    loginBtn.disabled = false;
    loginSpinner.style.display = 'none';
    loginIcon.style.display = 'inline-block';
    loginLabel.textContent = 'دخول';
    
    if (error) {
      showToast('خطأ في البريد الإلكتروني أو كلمة المرور', 'error');
    } else {
      showToast('تم تسجيل الدخول بنجاح!', 'success');
      loginForm.reset();
    }
  });
}

// Logout Button
logoutBtnSidebar?.addEventListener('click', async () => {
  const { error } = await sb.auth.signOut();
  if (error) {
    showToast(`فشل تسجيل الخروج: ${error.message}`, 'error');
  } else {
    showToast('تم تسجيل الخروج', 'success');
  }
});

// ── Form submission ───────────────────────────
const form       = document.getElementById('postForm');
const submitBtn  = document.getElementById('submitBtn');
const spinner    = document.getElementById('submitSpinner');
const submitIcon = document.getElementById('submitIcon');
const submitLbl  = document.getElementById('submitLabel');

function setLoading(on) {
  submitBtn.disabled = on;
  spinner.style.display    = on ? 'block' : 'none';
  submitIcon.style.display = on ? 'none'  : 'inline-block';
  submitLbl.textContent    = on ? 'جاري النشر…' : 'نشر المقالة';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const titleVal   = document.getElementById('title').value.trim();
  const slugVal    = slugInput.value.trim().toLowerCase();
  const metaVal    = metaInput.value.trim();
  const contentVal = document.getElementById('content').value.trim();
  const altVal     = document.getElementById('altText').value.trim();
  const file       = fileInput.files[0];

  // Basic client-side validation
  if (!titleVal || !slugVal || !metaVal || !contentVal || !altVal || !file) {
    showToast('يرجى ملء جميع الحقول المطلوبة واختيار صورة.', 'error');
    return;
  }
  if (!/^[a-z0-9-]+$/.test(slugVal)) {
    showToast('الرابط (Slug) يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('حجم الصورة يتجاوز 5 MB. يرجى اختيار صورة أصغر.', 'error');
    return;
  }

  setLoading(true);
  try {
    // 1. Upload image → get public URL
    const imageUrl = await uploadFeaturedImage(file);

    // 2. Insert post row
    await createPost({
      title: titleVal,
      slug: slugVal,
      meta_description: metaVal,
      content: contentVal,
      featured_image_url: imageUrl,
      alt_text: altVal,
      published: true,
    });

    showToast('✅ تم نشر المقالة بنجاح!', 'success');
    form.reset();
    imagePreview.style.display = 'none';
    slugPreview.textContent = '…';
    metaCounter.textContent = `0 / ${IDEAL_MAX} حرف`;
    metaCounter.className = 'meta-counter ok';
  } catch (err) {
    console.error(err);
    showToast(`حدث خطأ: ${err.message}`, 'error');
  } finally {
    setLoading(false);
  }
});
