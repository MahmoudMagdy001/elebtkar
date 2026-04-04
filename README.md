<div align="center">
  <img src="./assets/images/logo.png" alt="الابتكار Logo" width="180"/>
  <h1>الابتكار | Elebtikar</h1>
  <p><strong>🚀 شريكك في حلول التسويق الرقمي والتقنية المتكاملة في المملكة العربية السعودية</strong></p>
  <p><em>Your Partner in Integrated Digital Marketing & Tech Solutions in Saudi Arabia</em></p>

  [![Website](https://img.shields.io/badge/Website-elebtkar.sa-C9A227?style=flat-square&logo=google-chrome)](https://elebtkar.sa)
  [![WhatsApp](https://img.shields.io/badge/WhatsApp-+966%2057%20964%204123-25D366?style=flat-square&logo=whatsapp)](https://wa.me/966579644123)
  [![Email](https://img.shields.io/badge/Email-Info@elebtikar--sa.com-EA4335?style=flat-square&logo=gmail)](mailto:Info@elebtikar-sa.com)
</div>

---

## 🇸🇦 رؤية 2030 | Vision 2030

نحن في **الابتكار** ملتزمون بتمكين الشركات والنشاطات التجارية في المملكة العربية السعودية من خلال تقديم حلول تقنية وتسويقية ذكية تتماشى مع طموحات **رؤية المملكة 2030**.

> At **Elebtikar**, we empower KSA businesses with smart tech & marketing solutions aligned with Saudi Vision 2030.

---

## ✨ المميزات الرئيسية | Key Features

### 🌐 الموقع العام | Public Website
- **تصميم متجاوب** — يعمل على جميع الأجهزة (Responsive Design)
- **SEO متقدم** — Schema.org markup, Open Graph, Twitter Cards
- **أداء عالي** — Preconnect, Preload, Lazy Loading
- **دعم كامل للغة العربية** — RTL support with Almarai font
- **مدونة متكاملة** — نظام إدارة محتوى كامل
- **نظام دفع إلكتروني** — Moyasar Payment Gateway
- **تواصل مباشر** — واتساب، بريد، نموذج تواصل

### 🛠️ لوحة الإدارة | Admin Dashboard
- **🔐 نظام تسجيل دخول** — مصادقة آمنة عبر Supabase
- **📝 إدارة المقالات** — إضافة، تعديل، حذف منشورات المدونة
- **💼 إدارة الخدمات** — إدارة قائمة الخدمات والأسعار
- **🏷️ إدارة التسعيرة** — تحديد الأسعار والباقات
- **🤝 إدارة الشركاء** — إضافة وحذف شركاء النجاح
- **📊 إدارة الإحصائيات** — تحديث أرقام الإنجازات
- **💬 رسائل التواصل** — عرض وإدارة استفسارات العملاء
- **🎟️ أكواد الخصم** — إنشاء وإدارة أكواد الخصم
- **💳 إدارة المدفوعات** — متابعة عمليات الدفع

---

## 🛠 التقنيات المستخدمة | Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **Payment** | Moyasar Payment Gateway |
| **Icons** | Phosphor Icons |
| **Fonts** | Google Fonts (Almarai) |
| **Hosting** | Vercel / Hostinger (PHP compatible) |

---

## 📂 هيكلة المشروع | Project Structure

```
elebtkar/
├── 📁 assets/
│   ├── 📁 css/           # ملفات الأنماط المشتركة
│   ├── 📁 js/            # سكربتات JavaScript
│   │   ├── 📁 site/      # سكربتات الموقع العام
│   │   ├── blog-logic.js # منطق المدونة
│   │   ├── payment-logic.js # منطق الدفع
│   │   ├── editor.js     # محرر المحتوى
│   │   └── config.js     # إعدادات Supabase & Moyasar
│   ├── 📁 images/        # الصور والأيقونات
│   └── 📁 docs/          # المستندات
├── 📁 components/        # مكونات HTML قابلة لإعادة الاستخدام
├── 📁 pages/
│   ├── 📁 home/          # صفحة اله الرئيسية
│   ├── 📁 blog/          # صفحة المدونة
│   ├── 📁 post/          # صفحة المقال الواحد
│   ├── 📁 services/      # صفحة الخدمات والدفع
│   ├── 📁 admin/         # لوحة الإدارة
│   ├── 📁 legal/         # الصفحات القانونية
│   └── 📁 404/           # صفحة الخطأ
├── 📄 index.html         # الصفحة الرئيسية
├── 📄 vercel.json        # إعدادات Vercel
├── 📄 .htaccess          # إعدادات Apache/Hostinger
├── 📄 sitemap.xml        # خريطة الموقع
└── 📄 robots.txt         # إرشادات محركات البحث
```

---

## � البدء بالعمل | Getting Started

### المتطلبات | Prerequisites
- متصفح ويب حديث (Chrome, Firefox, Safari, Edge)
- مفتاح Supabase (موجود في `assets/js/config.js`)
- مفتاح Moyasar للدفع (للاختبار أو الإنتاج)

### التشغيل المحلي | Local Development

```bash
# 1. استنساخ المستودع
git clone <repository-url>
cd elebtkar

# 2. فتح الملف مباشرة أو استخدام Live Server
# VS Code: افتح index.html واضغط Go Live
# أو استخدم Python:
python -m http.server 8000
```

### ⚙️ الإعدادات | Configuration

تحرير `assets/js/config.js`:

```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
window.MOYASAR_PUBLISHABLE_KEY = 'pk_test_...';
```

---

## 📱 صفحات الموقع | Site Pages

| Page | URL | Description |
|------|-----|-------------|
| 🏠 **الرئيسية** | `/` | الصفحة الرئيسية مع جميع الأقسام |
| 📝 **المدونة** | `/pages/blog/blog.html` | قائمة المقالات |
| 📄 **المقال** | `/pages/post/post.html?id=X` | صفحة المقال الفردي |
| 💼 **الخدمات** | `/pages/services/services.html` | الخدمات والدفع |
| 🔐 **الإدارة** | `/pages/admin/admin.html` | لوحة التحكم |

---

## 🔒 الأمان | Security

- ✅ **Supabase Auth** — مصادقة آمنة للوحة الإدارة
- ✅ **Row Level Security (RLS)** — حماية البيانات
- ✅ **Anon Key فقط** — لا يتم استخدام Service Role في الواجهة
- ✅ **HTTPS** — تشفير الاتصال

---

## 🌐 التواصل | Contact Us

<div align="center">

| 📱 **واتساب** | 📧 **البريد** | 🌐 **الموقع** |
|:-------------:|:------------:|:-------------:|
| [+966 57 964 4123](https://wa.me/966579644123) | [Info@elebtikar-sa.com](mailto:Info@elebtikar-sa.com) | [elebtkar.sa](https://elebtkar.sa) |

</div>

**📍 الموقع:** نجران، المملكة العربية السعودية

**🕒 أوقات العمل:** السبت — الخميس | 9:00 ص — 6:00 م

---

## 📝 الترخيص | License

© 2026 **الابتكار للتطوير الرقمي**. جميع الحقوق محفوظة.

---

<div align="center">
  <p>
    <a href="https://x.com/Elebtkarsa">𝕏 Twitter</a> •
    <a href="https://www.instagram.com/elebtkar.sa/">📸 Instagram</a> •
    <a href="https://www.linkedin.com/company/elebtkar">💼 LinkedIn</a> •
    <a href="https://www.tiktok.com/@elebtkar.sa">🎵 TikTok</a>
  </p>
  <p><sub>بُنيت بـ ❤️ في المملكة العربية السعودية</sub></p>
</div>
