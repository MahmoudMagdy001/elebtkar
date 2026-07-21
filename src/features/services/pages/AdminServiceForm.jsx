// ponytail: Premium service details and settings editor with live SEO score analysis.
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import { uploadImage } from '../../../shared/utils/uploadImage';
import { slugify, slugifyLive } from '../../../shared/utils/slugify';
import SEOAnalyzer from '../../../shared/admin/SEOAnalyzer';
import MediaLibraryModal from '../../../shared/admin/MediaLibraryModal';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';

import TipTapEditor from '../../../shared/admin/TipTapEditor';

export default function AdminServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [bgIconFile, setBgIconFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', meta_description: '', subtitle: '',
    description: '', features: '', order_num: 1, is_reverse: false,
    bg_icon: ''
  });

  const [seo, setSeo] = useState({
    meta_title: '', meta_description: '', canonical_url: '', keywords: '',
    focus_keyword: '', og_title: '', og_description: '', og_image: '',
    robots_index: true, robots_follow: true, robots_archive: true, robots_snippet: true,
    json_ld: ''
  });

  useEffect(() => {
    // Load Quill stylesheet
    import('react-quill-new/dist/quill.snow.css').catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      serviceApi.getServiceById(id)
        .then(data => {
          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            meta_description: data.meta_description || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            features: (data.features || []).join('\n'),
            order_num: data.order_num || 1,
            is_reverse: data.is_reverse || false,
            bg_icon: data.bg_icon || ''
          });

          const s = data.seo_settings || {};
          setSeo({
            meta_title: s.meta_title || '',
            meta_description: s.meta_description || '',
            canonical_url: s.canonical_url || '',
            keywords: s.keywords || '',
            focus_keyword: s.focus_keyword || '',
            og_title: s.og_title || '',
            og_description: s.og_description || '',
            og_image: s.og_image || '',
            robots_index: s.robots_index !== false,
            robots_follow: s.robots_follow !== false,
            robots_archive: s.robots_archive !== false,
            robots_snippet: s.robots_snippet !== false,
            json_ld: s.json_ld ? JSON.stringify(s.json_ld, null, 2) : ''
          });
        })
        .catch(err => alert('خطأ في تحميل الخدمة: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slugifyLive(value)
      }));
    } else if (name === 'slug') {
      setFormData(prev => ({ ...prev, slug: slugifyLive(value) }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSEOChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeo(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMediaSelect = (item) => {
    setFormData(prev => ({ ...prev, bg_icon: item.url }));
    setMediaModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBgIconFile(file);
    setFormData(prev => ({ ...prev, bg_icon: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let iconUrl = formData.bg_icon;
      if (bgIconFile) {
        iconUrl = await uploadImage(bgIconFile);
      }

      let parsedJsonLd = null;
      if (seo.json_ld.trim()) {
        try {
          parsedJsonLd = JSON.parse(seo.json_ld);
        } catch (err) {
          alert('خطأ في تنسيق JSON-LD! يرجى إدخال كود JSON صحيح.');
          setLoading(false);
          return;
        }
      }

      const seo_settings = {
        meta_title: seo.meta_title || formData.title,
        meta_description: seo.meta_description || formData.meta_description,
        canonical_url: seo.canonical_url,
        keywords: seo.keywords,
        focus_keyword: seo.focus_keyword,
        og_title: seo.og_title,
        og_description: seo.og_description,
        og_image: seo.og_image || iconUrl,
        robots_index: seo.robots_index,
        robots_follow: seo.robots_follow,
        robots_archive: seo.robots_archive,
        robots_snippet: seo.robots_snippet,
        ...(parsedJsonLd && { json_ld: parsedJsonLd })
      };

      const serviceData = {
        title: formData.title,
        slug: slugify(formData.slug),
        meta_description: formData.meta_description,
        subtitle: formData.subtitle,
        description: formData.description,
        features: formData.features ? formData.features.split('\n').map(f => f.trim()).filter(Boolean) : [],
        order_num: parseInt(formData.order_num) || 1,
        is_reverse: formData.is_reverse,
        bg_icon: iconUrl,
        seo_settings
      };

      if (id) {
        await serviceApi.updateService(id, serviceData);
      } else {
        await serviceApi.createService(serviceData);
      }

      alert(id ? 'تم تحديث الخدمة بنجاح!' : 'تم نشر الخدمة بنجاح!');
      navigate('/admin/services');
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">{id ? 'تعديل الخدمة والـ SEO' : 'إضافة خدمة جديدة'}</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">تعديل تفاصيل الخدمات وتصميم هيكلية الميزات وقيم الـ SEO</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/services')}>
          <i className="ph ph-arrow-right text-lg" />
          <span>الرجوع للخدمات</span>
        </Button>
      </div>

      <Card>
        {/* Tab Selector */}
        <div className="flex border-b border-primary-100 bg-slate-50">
          <button 
            type="button" 
            onClick={() => setActiveTab('content')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'content' 
                ? 'border-primary text-primary bg-white' 
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            محتوى الخدمة الأساسي
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('seo')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'seo' 
                ? 'border-primary text-primary bg-white' 
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            إعدادات الـ SEO والـ Schemas
          </button>
        </div>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">عنوان الخدمة *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      required 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الرابط البديل (Slug) *</label>
                    <input 
                      type="text" 
                      name="slug" 
                      value={formData.slug} 
                      onChange={handleChange} 
                      required 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">العنوان الفرعي (Subtitle) *</label>
                  <input 
                    type="text" 
                    name="subtitle" 
                    value={formData.subtitle} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الترتيب الرقمي (Order Number)</label>
                    <input 
                      type="number" 
                      name="order_num" 
                      value={formData.order_num} 
                      onChange={handleChange}
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-6 h-full pt-6">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="is_featured" 
                        name="is_featured" 
                        checked={formData.is_featured} 
                        onChange={handleChange} 
                        className="rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                      <label htmlFor="is_featured" className="text-sm font-bold text-gray-700">خدمة مميزة (Featured)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="is_reverse" 
                        name="is_reverse" 
                        checked={formData.is_reverse} 
                        onChange={handleChange} 
                        className="rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                      <label htmlFor="is_reverse" className="text-sm font-bold text-gray-700">عكس الاتجاه (Reverse Design)</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">الوصف القصير (Meta Description) *</label>
                  <input 
                    type="text" 
                    name="meta_description" 
                    value={formData.meta_description} 
                    onChange={handleChange} 
                    maxLength="155" 
                    required 
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                  <div className="text-xs font-bold text-green-700 mt-1">{formData.meta_description.length} / 155 حرف</div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">الميزات والخصائص (سطر جديد لكل ميزة)</label>
                  <textarea 
                    name="features" 
                    value={formData.features} 
                    onChange={handleChange} 
                    placeholder="تحسين الكلمات المفتاحية&#10;تقارير شهرية متكاملة&#10;دراسة المنافسين"
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai h-32 resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">الوصف الكامل والموسع للخدمة *</label>
                  <TipTapEditor
                    value={formData.description}
                    onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                    placeholder="اكتب تفاصيل الخدمة الموسعة هنا..."
                  />
                </div>

                {/* Service Icon Upload */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-primary-100 space-y-4">
                  <label className="block text-sm font-extrabold text-primary">أيقونة الخدمة / صورة الخلفية</label>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={() => setMediaModalOpen(true)}>
                      <i className="ph ph-image-square text-lg" />
                      <span>اختيار من مكتبة الوسائط</span>
                    </Button>

                    <div className="relative">
                      <Button type="button" variant="outline">
                        <i className="ph ph-upload-simple text-lg" />
                        <span>رفع ملف محلي</span>
                      </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                      />
                    </div>
                  </div>

                  {formData.bg_icon && (
                    <div className="relative w-20 h-20 mt-4 group">
                      <img 
                        src={formData.bg_icon} 
                        alt="أيقونة الخدمة" 
                        className="w-full h-full rounded-xl object-cover border border-primary-100 shadow-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, bg_icon: '' }))}
                        className="absolute -top-1.5 -left-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition cursor-pointer"
                        title="حذف الصورة"
                      >
                        <i className="ph ph-x text-xs font-bold" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الكلمة الرئيسية المستهدفة (Focus Keyword)</label>
                    <input 
                      type="text" 
                      name="focus_keyword" 
                      value={seo.focus_keyword} 
                      onChange={handleSEOChange} 
                      placeholder="الكلمة المفتاحية المستهدفة لصفحة الخدمة..."
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">عنوان ميتا المخصص (Meta Title)</label>
                    <input 
                      type="text" 
                      name="meta_title" 
                      value={seo.meta_title} 
                      onChange={handleSEOChange} 
                      placeholder="العنوان الافتراضي هو عنوان الخدمة الأساسي"
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">وصف ميتا المخصص (Meta Description)</label>
                    <textarea 
                      name="meta_description" 
                      value={seo.meta_description} 
                      onChange={handleSEOChange} 
                      placeholder="الوصف الافتراضي هو الوصف القصير للخدمة" 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai h-24 resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">الرابط الكنسي (Canonical URL)</label>
                      <input 
                        type="url" 
                        name="canonical_url" 
                        value={seo.canonical_url} 
                        onChange={handleSEOChange} 
                        placeholder="اتركه فارغاً للتوليد التلقائي" 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">الكلمات الدلالية المخصصة (Keywords)</label>
                      <input 
                        type="text" 
                        name="keywords" 
                        value={seo.keywords} 
                        onChange={handleSEOChange} 
                        placeholder="سيو, خدمات, تحسين محركات البحث"
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-base font-extrabold text-primary">الوسائط الاجتماعية (Social Meta)</h3>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">عنوان فيسبوك وتويتر المخصص</label>
                      <input 
                        type="text" 
                        name="og_title" 
                        value={seo.og_title} 
                        onChange={handleSEOChange}
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">وصف فيسبوك وتويتر المخصص</label>
                      <textarea 
                        name="og_description" 
                        value={seo.og_description} 
                        onChange={handleSEOChange} 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai h-20 resize-y"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">رابط صورة المشاركة المخصصة</label>
                      <input 
                        type="text" 
                        name="og_image" 
                        value={seo.og_image} 
                        onChange={handleSEOChange} 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-base font-extrabold text-primary">الأرشفة والزواحف (Robots Directives)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="idx" name="robots_index" checked={seo.robots_index} onChange={handleSEOChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="idx" className="text-sm font-bold text-gray-700">Index (السماح بالأرشفة)</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="flw" name="robots_follow" checked={seo.robots_follow} onChange={handleSEOChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="flw" className="text-sm font-bold text-gray-700">Follow (تتبع الروابط)</label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-base font-extrabold text-primary">البيانات المهيكلة JSON-LD (Schema Markup)</h3>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">كود JSON-LD المخصص</label>
                      <textarea 
                        name="json_ld" 
                        value={seo.json_ld} 
                        onChange={handleSEOChange} 
                        placeholder='{ "@context": "https://schema.org", ... }' 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left h-36 resize-y"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time SEO Analyzer Sidebar */}
                <SEOAnalyzer 
                  title={seo.meta_title || formData.title}
                  description={seo.meta_description || formData.meta_description}
                  content={formData.description}
                  slug={formData.slug}
                  focusKeyword={seo.focus_keyword}
                  altText=""
                />
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading} 
              className="w-full py-4 bg-[#023B65]"
            >
              <i className="ph ph-floppy-disk text-lg" />
              <span>{loading ? 'جاري الحفظ...' : (id ? 'تحديث الخدمة بالكامل' : 'نشر الخدمة بالكامل')}</span>
            </Button>
          </form>
        </CardBody>
      </Card>

      <MediaLibraryModal 
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
