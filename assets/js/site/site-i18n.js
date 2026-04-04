/**
 * site-i18n.js — Site-wide Internationalization
 * Shared strings used across multiple pages.
 */

window.SiteI18n = {
  // General messages
  messages: {
    errorLoading: 'حدث خطأ أثناء تحميل البيانات',
    errorSaving: 'حدث خطأ أثناء الحفظ',
    errorSending: 'حدث خطأ أثناء الإرسال',
    tryAgainLater: 'يرجى المحاولة لاحقاً',
    sendSuccess: 'تم إرسال رسالتك بنجاح. سنتواصل معك في أقرب وقت!',
    copySuccess: 'تم النسخ!',
    copyFail: 'فشل النسخ',
    notFound: 'غير موجود',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
  },

  // Form validation
  validation: {
    required: 'هذا الحقل مطلوب',
    invalidEmail: 'البريد الإلكتروني غير صالح',
    invalidPhone: 'رقم الهاتف غير صالح',
    minLength: (min) => `يجب أن يكون ${min} أحرف على الأقل`,
    selectService: 'يرجى اختيار خدمة واحدة على الأقل',
  },

  // SEO defaults
  seo: {
    siteName: 'الابتكار',
    siteUrl: 'https://elebtikar-sa.com',
    defaultTitle: 'الابتكار - حلول تسويقية مبتكرة',
    defaultDescription: 'نقدم حلولاً تسويقية متكاملة ومبتكرة',
    keywords: 'الابتكار، تسويق رقمي، السعودية',
  },

  // Date formatting
  date: {
    locale: 'ar-SA',
    dateStyle: { dateStyle: 'medium' },
    datetimeStyle: { dateStyle: 'medium', timeStyle: 'short' },
  },

  // Helper function
  t(key, ...args) {
    const msg = this.messages[key];
    if (typeof msg === 'function') return msg(...args);
    return msg || key;
  }
};
