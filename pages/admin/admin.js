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

// ── Service SEO Helpers ──────────────────
const srvTitleEnInput = document.getElementById('srvTitleEn');
const srvSlugInput    = document.getElementById('srvSlug');
const srvSlugPreview  = document.getElementById('srvSlugPreview');
const regenSrvBtn     = document.getElementById('regenSrvSlug');

function updateSrvSlugFromTitle() {
  const s = typeof generateSlug === 'function' ? generateSlug(srvTitleEnInput.value) : srvTitleEnInput.value.toLowerCase().replace(/\s+/g, '-');
  srvSlugInput.value = s;
  srvSlugPreview.textContent = s || '…';
}

if (srvTitleEnInput) {
  srvTitleEnInput.addEventListener('input', updateSrvSlugFromTitle);
  srvSlugInput.addEventListener('input', () => {
    srvSlugPreview.textContent = srvSlugInput.value || '…';
  });
  regenSrvBtn.addEventListener('click', updateSrvSlugFromTitle);
}

const srvMetaInput   = document.getElementById('srvMetaDescription');
const srvMetaCounter = document.getElementById('srvMetaCounter');

if (srvMetaInput) {
  srvMetaInput.addEventListener('input', () => {
    const len = srvMetaInput.value.length;
    srvMetaCounter.textContent = `${len} / ${IDEAL_MAX} حرف`;
    srvMetaCounter.className = 'meta-counter ' +
      (len <= IDEAL_MAX ? (len >= 100 ? 'ok' : 'warn') : 'over');
  });
}

// ── Pricing Plan SEO Helpers ──────────────────
const planTitleInput = document.getElementById('planTitle');
const planSlugInput    = document.getElementById('planSlug');
const planSlugPreview  = document.getElementById('planSlugPreview');
const regenPlanBtn     = document.getElementById('regenPlanSlug');

function updatePlanSlugFromTitle() {
  const s = typeof generateSlug === 'function' ? generateSlug(planTitleInput.value) : planTitleInput.value.toLowerCase().replace(/\s+/g, '-');
  planSlugInput.value = s;
  planSlugPreview.textContent = s || '…';
}

if (planTitleInput) {
  planTitleInput.addEventListener('input', updatePlanSlugFromTitle);
  planSlugInput.addEventListener('input', () => {
    planSlugPreview.textContent = planSlugInput.value || '…';
  });
  if (regenPlanBtn) regenPlanBtn.addEventListener('click', updatePlanSlugFromTitle);
}

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
    if(typeof loadContactMessages === 'function') loadContactMessages();
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
    if(typeof loadContactMessages === 'function') loadContactMessages();
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
    } else if (targetSection === 'contactMessages') {
      loadContactMessages();
    } else if (targetSection === 'managePosts') {
      loadArticles();
    } else if (targetSection === 'manageServices') {
      loadServices();
    } else if (targetSection === 'managePricingPlans') {
      loadPricingPlans();
    } else if (targetSection === 'managePayments') {
      loadPayments();
    }
  });
});

// ── Variables for Editing ────────────────────
let editingPostId = null;
let editingServiceId = null;
let editingPricingPlanId = null;

// ── Articles Management ──────────────────────
async function loadArticles() {
  const tableBody = document.getElementById('postsTableBody');
  const refreshBtn = document.getElementById('refreshPosts');
  if (refreshBtn) refreshBtn.classList.add('ph-spin');

  try {
    const { data, error } = await sb
      .from('posts')
      .select('id, title, slug, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">لا توجد مقالات حالياً</td></tr>';
      return;
    }

    tableBody.innerHTML = data.map(item => `
      <tr>
        <td>${item.title}</td>
        <td dir="ltr">${item.slug}</td>
        <td>${new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditArticle(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeleteArticle(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error fetching articles:', err);
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #e53935;">فشل تحميل البيانات</td></tr>`;
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('ph-spin');
  }
}

async function handleDeleteArticle(id) {
  if (!confirm('هل أنت متأكد من حذف هذه المقالة؟')) return;
  try {
    await deletePost(id);
    showToast('تم حذف المقالة بنجاح', 'success');
    loadArticles();
  } catch (err) {
    showToast(`فشل الحذف: ${err.message}`, 'error');
  }
}

async function handleEditArticle(post) {
  try {
    const { data: fullPost, error } = await sb.from('posts').select('*').eq('id', post.id).single();
    if (error) throw error;

    editingPostId = fullPost.id;
    document.getElementById('title').value = fullPost.title;
    document.getElementById('titleEn').value = ''; // We don't necessarily have global titleEn
    document.getElementById('slug').value = fullPost.slug;
    document.getElementById('metaDescription').value = fullPost.meta_description;
    document.getElementById('content').value = fullPost.content;
    document.getElementById('altText').value = fullPost.alt_text;
    
    imagePreview.src = fullPost.featured_image_url;
    imagePreview.style.display = 'block';
    
    document.getElementById('submitLabel').textContent = 'تحديث المقالة';
    document.getElementById('addPostSection').classList.add('active');
    document.getElementById('managePostsSection').classList.remove('active');
    
    // Update active nav
    navItems.forEach(i => i.classList.remove('active'));
    document.querySelector('[data-section="addPost"]').classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showToast('فشل تحميل بيانات المقالة للتعديل', 'error');
  }
}

document.getElementById('refreshPosts')?.addEventListener('click', loadArticles);

// ── Services Management ──────────────────────
async function loadServices() {
  const tableBody = document.getElementById('servicesTableBody');
  const refreshBtn = document.getElementById('refreshServices');
  if (refreshBtn) refreshBtn.classList.add('ph-spin');

  try {
    const { data, error } = await sb
      .from('services')
      .select('id, title, order_num')
      .order('order_num', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">لا توجد خدمات حالياً</td></tr>';
      return;
    }

    tableBody.innerHTML = data.map(item => `
      <tr>
        <td>${item.title}</td>
        <td>${item.order_num}</td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditService(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeleteService(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error fetching services:', err);
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 2rem; color: #e53935;">فشل تحميل البيانات</td></tr>`;
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('ph-spin');
  }
}

async function handleDeleteService(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
  try {
    await deleteService(id);
    showToast('تم حذف الخدمة بنجاح', 'success');
    loadServices();
  } catch (err) {
    showToast(`فشل الحذف: ${err.message}`, 'error');
  }
}

async function handleEditService(srvSummary) {
  try {
    const { data: srv, error } = await sb.from('services').select('*').eq('id', srvSummary.id).single();
    if (error) throw error;

    editingServiceId = srv.id;
    document.getElementById('srvTitle').value = srv.title;
    document.getElementById('srvTitleEn').value = ''; // Not stored, used for generation
    document.getElementById('srvSlug').value = srv.slug || '';
    document.getElementById('srvSlugPreview').textContent = srv.slug || '…';
    document.getElementById('srvMetaDescription').value = srv.meta_description || '';
    if (srvMetaCounter) {
        const len = (srv.meta_description || '').length;
        srvMetaCounter.textContent = `${len} / ${IDEAL_MAX} حرف`;
        srvMetaCounter.className = 'meta-counter ' + (len <= IDEAL_MAX ? (len >= 100 ? 'ok' : 'warn') : 'over');
    }
    document.getElementById('srvSubtitle').value = srv.subtitle || '';
    document.getElementById('srvDescription').value = srv.description;
    document.getElementById('srvFeatures').value = (srv.features || []).join('\n');
    document.getElementById('srvOrder').value = srv.order_num;
    document.getElementById('srvReverse').checked = srv.is_reverse;
    // Note: Primary icon is handled by DB, bg_icon is a file upload (reset on edit)
    document.getElementById('srvBgIcon').value = ''; 

    
    document.getElementById('srvSubmitLabel').textContent = 'تحديث الخدمة';
    document.getElementById('addServiceSection').classList.add('active');
    document.getElementById('manageServicesSection').classList.remove('active');
    
    // Update active nav
    navItems.forEach(i => i.classList.remove('active'));
    document.querySelector('[data-section="addService"]').classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showToast('فشل تحميل بيانات الخدمة للتعديل', 'error');
  }
}

document.getElementById('refreshServices')?.addEventListener('click', loadServices);

// Expose handlers to window for onclick
window.handleDeleteArticle = handleDeleteArticle;
window.handleEditArticle = handleEditArticle;
window.handleDeleteService = handleDeleteService;
window.handleEditService = handleEditService;
window.handleDeletePricingPlan = handleDeletePricingPlan;
window.handleEditPricingPlan = handleEditPricingPlan;

// ── Pricing Plans Management ─────────────────
async function loadPricingPlans() {
  const tableBody = document.getElementById('pricingPlansTableBody');
  const refreshBtn = document.getElementById('refreshPricingPlans');
  if (refreshBtn) refreshBtn.classList.add('ph-spin');

  try {
    const { data, error } = await sb
      .from('pricing_plans')
      .select('id, title, price, order_num, is_popular, is_active')
      .order('order_num', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">لا توجد باقات حالياً</td></tr>';
      return;
    }

    tableBody.innerHTML = data.map(item => `
      <tr>
        <td>${item.title}</td>
        <td>${item.price.toLocaleString()}</td>
        <td>${item.order_num}</td>
        <td>${item.is_popular ? '<span class="code-pill">نعم</span>' : 'لا'}</td>
        <td><span class="status-badge ${item.is_active ? 'success' : 'failed'}">${item.is_active ? 'نشط' : 'معطل'}</span></td>
        <td class="actions">
          <button class="btn-edit" onclick="handleEditPricingPlan(${item.id})" title="تعديل"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn-delete" onclick="handleDeletePricingPlan(${item.id})" title="حذف"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error fetching pricing plans:', err);
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #e53935;">فشل تحميل البيانات</td></tr>`;
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('ph-spin');
  }
}

async function handleDeletePricingPlan(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
  try {
    const { error } = await sb.from('pricing_plans').delete().eq('id', id);
    if (error) throw error;
    showToast('تم حذف الباقة بنجاح', 'success');
    loadPricingPlans();
  } catch (err) {
    showToast(`فشل الحذف: ${err.message}`, 'error');
  }
}

async function handleEditPricingPlan(id) {
  try {
    const { data: plan, error } = await sb.from('pricing_plans').select('*').eq('id', id).single();
    if (error) throw error;

    editingPricingPlanId = plan.id;
    document.getElementById('planTitle').value = plan.title;
    document.getElementById('planSlug').value = plan.slug || '';
    document.getElementById('planSlugPreview').textContent = plan.slug || '…';
    document.getElementById('planSubtitle').value = plan.subtitle || '';
    document.getElementById('planPrice').value = plan.price;
    document.getElementById('planCurrency').value = plan.currency || '﷼';
    document.getElementById('planCycle').value = plan.billing_cycle || 'شهرياً';
    document.getElementById('planOrder').value = plan.order_num || 1;
    document.getElementById('planPopular').checked = plan.is_popular;
    document.getElementById('planActive').checked = plan.is_active;
    
    let featuresArray = [];
    try {
      featuresArray = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
    } catch(e) {}
    document.getElementById('planFeatures').value = (featuresArray || []).join('\n');
    
    document.getElementById('planSubmitLabel').textContent = 'تحديث الباقة';
    document.getElementById('addPricingPlanSection').classList.add('active');
    document.getElementById('managePricingPlansSection').classList.remove('active');
    
    // Update active nav
    navItems.forEach(i => i.classList.remove('active'));
    document.querySelector('[data-section="addPricingPlan"]').classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showToast('فشل تحميل بيانات الباقة للتعديل', 'error');
  }
}

document.getElementById('refreshPricingPlans')?.addEventListener('click', loadPricingPlans);
window.handleDeletePricingPlan = handleDeletePricingPlan;
window.handleEditPricingPlan = handleEditPricingPlan;

// ── Payments Management ──────────────────────
async function loadPayments() {
  const tableBody = document.getElementById('paymentsTableBody');
  const refreshBtn = document.getElementById('refreshPayments');
  
  if (refreshBtn) refreshBtn.classList.add('ph-spin');

  try {
    const { data: purchases, error } = await sb
      .from('purchases')
      .select(`
        *,
        pricing_plans ( title )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!purchases || purchases.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">لا توجد عمليات دفع حالياً</td></tr>';
      return;
    }

    tableBody.innerHTML = purchases.map(p => `
      <tr>
        <td>${new Date(p.created_at).toLocaleString('ar-EG')}</td>
        <td>
            <strong>${p.user_name || 'عميل'}</strong><br>
            <small>${p.user_email || '-'}</small><br>
            <small dir="ltr">${p.user_phone || '-'}</small>
        </td>
        <td><span class="code-pill">${p.pricing_plans?.title || p.metadata?.plan_name || 'باقة'}</span></td>
        <td><strong>${p.amount} ${p.currency || 'SAR'}</strong></td>
        <td><span class="status-badge ${p.status === 'paid' ? 'success' : 'failed'}">${p.status === 'paid' ? 'مدفوع' : p.status}</span></td>
        <td dir="ltr" style="font-family: monospace; font-size: 0.7rem;">${p.moyasar_payment_id}</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error fetching payments:', err);
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #e53935;">فشل تحميل البيانات: ${err.message}</td></tr>`;
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('ph-spin');
  }
}

document.getElementById('refreshPayments')?.addEventListener('click', loadPayments);

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

// ── Contact Messages Handling ──────────────────
async function loadContactMessages() {
  const tableBody = document.getElementById('contactMessagesTableBody');
  const refreshBtn = document.getElementById('refreshContactMessages');
  
  if (refreshBtn) refreshBtn.classList.add('ph-spin');

  try {
    const { data, error } = await sb
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">لا توجد رسائل حالياً</td></tr>';
      return;
    }

    tableBody.innerHTML = data.map(item => `
      <tr>
        <td>${new Date(item.created_at).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td>
            <strong>${item.name}</strong><br>
            <small>${item.email}</small>
        </td>
        <td dir="ltr">${item.phone}</td>
        <td><span class="code-pill">${item.services || '-'}</span></td>
        <td>
            <button class="btn-read-message" onclick="alert('الموضوع:\\n${item.subject}\\n\\nالرسالة:\\n${item.message}')" title="عرض التفاصيل">
               <i class="ph-duotone ph-eye"></i> قراءة
            </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error fetching contact messages:', err);
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #e53935;">فشل تحميل البيانات: ${err.message}</td></tr>`;
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('ph-spin');
  }
}

document.getElementById('refreshContactMessages')?.addEventListener('click', loadContactMessages);

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
  submitLbl.textContent    = on ? 'جاري النشر…' : (editingPostId ? 'تحديث المقالة' : 'نشر المقالة');
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
  if (!titleVal || !slugVal || !metaVal || !contentVal || !altVal || (!file && !editingPostId)) {
    showToast('يرجى ملء جميع الحقول المطلوبة.', 'error');
    return;
  }
  if (!/^[a-z0-9-]+$/.test(slugVal)) {
    showToast('الرابط (Slug) يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.', 'error');
    return;
  }
  if (file && file.size > 5 * 1024 * 1024) {
    showToast('حجم الصورة يتجاوز 5 MB. يرجى اختيار صورة أصغر.', 'error');
    return;
  }

  setLoading(true);
  try {
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadFeaturedImage(file);
    }

    const postData = {
      title: titleVal,
      slug: slugVal,
      meta_description: metaVal,
      content: contentVal,
      alt_text: altVal,
      published: true,
    };
    if (imageUrl) postData.featured_image_url = imageUrl;

    if (editingPostId) {
      const { data, error } = await sb.from('posts').update(postData).eq('id', editingPostId).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('لم يتم تحديث المقالة. تأكد من صلاحيات الجداول (RLS) في Supabase.');
      }
      showToast('✅ تم تحديث المقالة بنجاح!', 'success');
    } else {
      const { data, error } = await sb.from('posts').insert([{ ...postData, featured_image_url: imageUrl }]).select();
      if (error) throw error;
      showToast('✅ تم نشر المقالة بنجاح!', 'success');
    }
    
    // Refresh table and switch back to manage section
    if (typeof loadArticles === 'function') loadArticles();
    document.getElementById('managePostsSection').classList.add('active');
    document.getElementById('addPostSection').classList.remove('active');
    navItems.forEach(i => {
        i.classList.remove('active');
        if(i.getAttribute('data-section') === 'managePosts') i.classList.add('active');
    });

    form.reset();
    editingPostId = null;
    submitLbl.textContent = 'نشر المقالة';
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
// ── Form submission helpers ──────────────────
function setBtnLoading(btnId, spinnerId, iconId, labelId, isLoading, loadingText, originalText) {
  const btn = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);
  const icon = document.getElementById(iconId);
  const label = document.getElementById(labelId);
  if (!btn) return;
  btn.disabled = isLoading;
  if (spinner) spinner.style.display = isLoading ? 'block' : 'none';
  if (icon) icon.style.display = isLoading ? 'none' : 'inline-block';
  if (label) label.textContent = isLoading ? loadingText : originalText;
}

// ── Service Form Submission ───────────────────
const srvForm = document.getElementById('serviceForm');
if (srvForm) {
  srvForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Extract values
    const title = document.getElementById('srvTitle').value.trim();
    const slug = document.getElementById('srvSlug').value.trim().toLowerCase();
    const meta_description = document.getElementById('srvMetaDescription').value.trim();
    const subtitle = document.getElementById('srvSubtitle').value.trim();
    const description = document.getElementById('srvDescription').value.trim();
    const featuresStr = document.getElementById('srvFeatures').value.trim();
    const bgIconFile = document.getElementById('srvBgIcon').files[0];
    const order_num = parseInt(document.getElementById('srvOrder').value) || 1;
    const is_reverse = document.getElementById('srvReverse').checked;

    if (!title || !slug || !meta_description || !description || !featuresStr) {
      showToast('يرجى ملء كافة الحقول الأساسية.', 'error');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      showToast('الرابط (Slug) يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.', 'error');
      return;
    }

    // Convert features text to array (split by lines and filter empty)
    const features = featuresStr.split('\n').map(f => f.trim()).filter(f => f);

    setBtnLoading('srvSubmitBtn', 'srvSubmitSpinner', 'srvSubmitIcon', 'srvSubmitLabel', true, 'جاري الحفظ…', 'حفظ الخدمة');
    
    try {
      // 1. Upload background icon if provided
      let bg_icon = null;
      if (bgIconFile) {
        bg_icon = await uploadFeaturedImage(bgIconFile);
      }

      // 2. Insert or Update Supabase
      const srvData = {
        title,
        slug,
        meta_description,
        subtitle,
        description,
        features,
        order_num,
        is_reverse
      };
      if (bg_icon) srvData.bg_icon = bg_icon;

      let result;
      if (editingServiceId) {
        result = await sb.from('services').update(srvData).eq('id', editingServiceId).select();
      } else {
        result = await sb.from('services').insert([srvData]).select();
      }

      const { data, error } = result;
      if (error) throw error;
      if (editingServiceId && (!data || data.length === 0)) {
        throw new Error('لم يتم تحديث أي بيانات. تأكد من صلاحيات الجداول (RLS) في Supabase.');
      }

      showToast(`✅ تم ${editingServiceId ? 'تحديث' : 'إضافة'} الخدمة بنجاح!`, 'success');
      
      // Refresh table and switch back to manage section
      if (typeof loadServices === 'function') loadServices();
      document.getElementById('manageServicesSection').classList.add('active');
      document.getElementById('addServiceSection').classList.remove('active');
      navItems.forEach(i => {
          i.classList.remove('active');
          if(i.getAttribute('data-section') === 'manageServices') i.classList.add('active');
      });

      srvForm.reset();
      editingServiceId = null;
      document.getElementById('srvSubmitLabel').textContent = 'حفظ الخدمة';
      document.getElementById('srvSlugPreview').textContent = '…';
      if (srvMetaCounter) {
        srvMetaCounter.textContent = `0 / ${IDEAL_MAX} حرف`;
        srvMetaCounter.className = 'meta-counter ok';
      }
    } catch (err) {
      console.error('Error creating service:', err);
      showToast(`حدث خطأ: ${err.message}`, 'error');
    } finally {
      setBtnLoading('srvSubmitBtn', 'srvSubmitSpinner', 'srvSubmitIcon', 'srvSubmitLabel', false, 'جاري الحفظ…', 'حفظ الخدمة');
    }
  });
}

// ── Pricing Plan Form Submission ──────────────
const planForm = document.getElementById('pricingPlanForm');
if (planForm) {
  planForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Extract values
    const title = document.getElementById('planTitle').value.trim();
    const slug = document.getElementById('planSlug').value.trim().toLowerCase();
    const subtitle = document.getElementById('planSubtitle').value.trim();
    const price = parseFloat(document.getElementById('planPrice').value);
    const currency = document.getElementById('planCurrency').value.trim() || '﷼';
    const billing_cycle = document.getElementById('planCycle').value.trim() || 'شهرياً';
    const featuresStr = document.getElementById('planFeatures').value.trim();
    const order_num = parseInt(document.getElementById('planOrder').value) || 1;
    const is_popular = document.getElementById('planPopular').checked;
    const is_active = document.getElementById('planActive').checked;

    if (!title || !slug || isNaN(price) || !featuresStr) {
      showToast('يرجى ملء كافة الحقول الأساسية (الاسم، الرابط، السعر، المميزات).', 'error');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      showToast('الرابط (Slug) يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.', 'error');
      return;
    }

    // Convert features text to array (split by lines and filter empty)
    const features = featuresStr.split('\n').map(f => f.trim()).filter(f => f);

    setBtnLoading('planSubmitBtn', 'planSubmitSpinner', 'planSubmitIcon', 'planSubmitLabel', true, 'جاري الحفظ…', 'حفظ الباقة');
    
    try {
      const planData = {
        title,
        slug,
        subtitle,
        price,
        currency,
        billing_cycle,
        features,
        order_num,
        is_popular,
        is_active
      };

      let result;
      if (editingPricingPlanId) {
        result = await sb.from('pricing_plans').update(planData).eq('id', editingPricingPlanId).select();
      } else {
        result = await sb.from('pricing_plans').insert([planData]).select();
      }

      const { data, error } = result;
      if (error) throw error;
      if (editingPricingPlanId && (!data || data.length === 0)) {
        throw new Error('لم يتم تحديث الباقة. تأكد من تفعيل صلاحيات التعديل (UPDATE) في Supabase.');
      }

      showToast(`✅ تم ${editingPricingPlanId ? 'تحديث' : 'إضافة'} الباقة بنجاح!`, 'success');
      
      // Refresh table and switch back to manage section
      if (typeof loadPricingPlans === 'function') loadPricingPlans();
      document.getElementById('managePricingPlansSection').classList.add('active');
      document.getElementById('addPricingPlanSection').classList.remove('active');
      navItems.forEach(i => {
          i.classList.remove('active');
          if(i.getAttribute('data-section') === 'managePricingPlans') i.classList.add('active');
      });

      planForm.reset();
      editingPricingPlanId = null;
      document.getElementById('planSubmitLabel').textContent = 'حفظ الباقة';
      document.getElementById('planSlugPreview').textContent = '…';
    } catch (err) {
      console.error('Error saving pricing plan:', err);
      showToast(`حدث خطأ: ${err.message}`, 'error');
    } finally {
      setBtnLoading('planSubmitBtn', 'planSubmitSpinner', 'planSubmitIcon', 'planSubmitLabel', false, 'جاري الحفظ…', 'حفظ الباقة');
    }
  });
}
