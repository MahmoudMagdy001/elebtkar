/**
 * admin-i18n.js — Internationalization & Constants
 * Centralized strings and configuration for the admin panel.
 */

window.AdminI18n = {
  // Toast Messages
  messages: {
    // Success
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    logoutSuccess: 'تم تسجيل الخروج',
    postCreated: '✅ تم نشر المقالة بنجاح!',
    postUpdated: '✅ تم تحديث المقالة بنجاح!',
    postDeleted: 'تم حذف المقالة بنجاح',
    serviceCreated: '✅ تم إضافة الخدمة بنجاح!',
    serviceUpdated: '✅ تم تحديث الخدمة بنجاح!',
    serviceDeleted: 'تم حذف الخدمة بنجاح',
    planCreated: '✅ تم إضافة الباقة بنجاح!',
    planUpdated: '✅ تم تحديث الباقة بنجاح!',
    planDeleted: 'تم حذف الباقة بنجاح',
    partnerCreated: '✅ تم إضافة الشريك بنجاح!',
    partnerUpdated: '✅ تم تحديث الشريك بنجاح!',
    partnerDeleted: 'تم حذف الشريك بنجاح',

    // Errors
    loginError: 'خطأ في البريد الإلكتروني أو كلمة المرور',
    loadError: (entity) => `فشل تحميل بيانات ${entity}`,
    saveError: (entity) => `فشل حفظ ${entity}`,
    deleteError: (msg) => `فشل الحذف: ${msg}`,
    imageSizeError: 'حجم الصورة يتجاوز 5 MB. يرجى اختيار صورة أصغر.',
    requiredFieldsError: 'يرجى ملء جميع الحقول المطلوبة.',

    // Empty States
    noArticles: 'لا توجد مقالات حالياً',
    noServices: 'لا توجد خدمات حالياً',
    noPlans: 'لا توجد باقات حالياً',
    noPartners: 'لا يوجد شركاء حالياً',
    noPayments: 'لا توجد عمليات دفع حالياً',
    noMessages: 'لا توجد رسائل حالياً',
    noDiscountCodes: 'لا توجد أكواد خصم حالياً',

    // Confirmations
    confirmDelete: (entity) => `هل أنت متأكد من حذف ${entity}؟`,

    // Loading States
    loginLoading: 'جاري تسجيل الدخول…',
    publishing: 'جاري النشر…',

    // UI Labels
    loginBtn: 'دخول',
    publishPost: 'نشر المقالة',
    updatePost: 'تحديث المقالة',
    createService: 'إضافة الخدمة',
    updateService: 'تحديث الخدمة',
    createPlan: 'إضافة الباقة',
    updatePlan: 'تحديث الباقة',
    createPartner: 'إضافة الشريك',
    updatePartner: 'تحديث الشريك',

    // Entity names for messages
    entities: {
      article: 'المقالة',
      service: 'الخدمة',
      plan: 'الباقة',
      partner: 'الشريك',
      payment: 'عملية الدفع',
      message: 'الرسالة'
    }
  },

  // Meta description settings
  seo: {
    idealMaxLength: 155,
    counterTemplate: (len, max) => `${len} / ${max} حرف`,
    counterClasses: {
      warn: 'warn',
      ok: 'ok',
      over: 'over'
    }
  },

  // File upload limits
  upload: {
    maxSizeMB: 5,
    allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    acceptedExtensions: ['png', 'jpg', 'jpeg', 'webp']
  },

  // Date formatting
  date: {
    locale: 'ar-EG',
    dateOptions: { day: '2-digit', month: '2-digit', year: 'numeric' },
    datetimeOptions: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  },

  // Helper to get nested message
  t(key, ...args) {
    const msg = this.messages[key];
    if (typeof msg === 'function') return msg(...args);
    return msg || key;
  }
};
