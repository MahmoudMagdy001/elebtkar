// ponytail: Premium blog post editor with full media library selection and RankMath-like SEO score auditing.
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { uploadImage } from '../../../shared/utils/uploadImage';
import { slugify, slugifyLive } from '../../../shared/utils/slugify';
import SEOAnalyzer from '../../../shared/admin/SEOAnalyzer';
import MediaLibraryModal from '../../../shared/admin/MediaLibraryModal';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';

import TipTapEditor from '../../../shared/admin/TipTapEditor';

export default function AdminPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [categories, setCategories] = useState([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', meta_description: '', content: '', alt_text: '',
    category_id: '', tags: '', author: 'الابتكار', status: 'published',
    scheduled_at: '', image_title: '', image_caption: '', featured_image_url: ''
  });

  const [seo, setSeo] = useState({
    meta_title: '', meta_description: '', canonical_url: '', keywords: '',
    focus_keyword: '', og_title: '', og_description: '', og_image: '',
    robots_index: true, robots_follow: true, robots_archive: true, robots_snippet: true,
    json_ld: ''
  });

  useEffect(() => {
    // Load categories
    postService.getCategories().then(setCategories).catch(console.error);
    
    // Load Quill stylesheet
    import('react-quill-new/dist/quill.snow.css').catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      postService.getPostById(id)
        .then(data => {
          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            meta_description: data.meta_description || '',
            content: data.content || '',
            alt_text: data.alt_text || '',
            category_id: data.category_id || '',
            tags: (data.tags || []).join(', '),
            author: data.author || 'الابتكار',
            status: data.status || 'published',
            scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '',
            image_title: data.image_title || '',
            image_caption: data.image_caption || '',
            featured_image_url: data.featured_image_url || ''
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
        .catch(err => alert('خطأ في تحميل المقال: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slugifyLive(value)
      }));
    } else if (name === 'slug') {
      setFormData(prev => ({ ...prev, slug: slugifyLive(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSEOChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeo(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMediaSelect = (item) => {
    setFormData(prev => ({
      ...prev,
      featured_image_url: item.url,
      alt_text: item.alt_text || prev.alt_text,
      image_title: item.title || prev.image_title,
      image_caption: item.caption || prev.image_caption
    }));
    setMediaModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setFormData(prev => ({ ...prev, featured_image_url: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.featured_image_url && !id) {
      alert('يرجى اختيار الصورة المميزة للتدوينة');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.featured_image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

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
        og_image: seo.og_image || imageUrl,
        robots_index: seo.robots_index,
        robots_follow: seo.robots_follow,
        robots_archive: seo.robots_archive,
        robots_snippet: seo.robots_snippet,
        ...(parsedJsonLd && { json_ld: parsedJsonLd })
      };

      const postData = {
        title: formData.title,
        slug: slugify(formData.slug),
        meta_description: formData.meta_description,
        content: formData.content,
        alt_text: formData.alt_text,
        category_id: formData.category_id || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        author: formData.author,
        status: formData.status,
        scheduled_at: formData.status === 'scheduled' && formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
        word_count: wordCount,
        reading_time: readingTime,
        image_title: formData.image_title,
        image_caption: formData.image_caption,
        featured_image_url: imageUrl,
        seo_settings
      };

      if (id) {
        await postService.updatePost(id, postData);
      } else {
        await postService.createPost(postData);
      }

      alert(id ? 'تم تحديث التدوينة بنجاح!' : 'تم نشر التدوينة بنجاح!');
      navigate('/admin/posts');
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
          <h1 className="text-2xl font-extrabold text-primary">{id ? 'تعديل التدوينة والـ SEO' : 'إضافة تدوينة جديدة'}</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">أنشئ محتوى متميزاً وحسن ظهوره على محركات البحث</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/posts')}>
          <i className="ph ph-arrow-right text-lg" />
          <span>الرجوع للمقالات</span>
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
            محتوى التدوينة الأساسي
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
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">عنوان التدوينة (بالعربية) *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">رابط التدوينة (Slug) *</label>
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
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">التصنيف</label>
                    <select 
                      name="category_id" 
                      value={formData.category_id} 
                      onChange={handleChange}
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    >
                      <option value="">اختر تصنيف...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الحالة *</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange} 
                      required
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    >
                      <option value="published">منشورة</option>
                      <option value="draft">مسودة</option>
                      <option value="scheduled">مجدولة</option>
                      <option value="archived">مؤرشفة</option>
                    </select>
                  </div>
                  {formData.status === 'scheduled' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">تاريخ ووقت النشر المجدول *</label>
                      <input 
                        type="datetime-local" 
                        name="scheduled_at" 
                        value={formData.scheduled_at} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الكاتب</label>
                    <input 
                      type="text" 
                      name="author" 
                      value={formData.author} 
                      onChange={handleChange}
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الوسوم (مفصولة بفاصلة)</label>
                    <input 
                      type="text" 
                      name="tags" 
                      value={formData.tags} 
                      onChange={handleChange} 
                      placeholder="سيو, برمجة, تسويق"
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">مقتطف / وصف مختصر (Meta Description) *</label>
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
                  <label className="block text-sm font-bold text-gray-700">محتوى المقال *</label>
                  <TipTapEditor
                    value={formData.content}
                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                    placeholder="اكتب المحتوى الغني هنا..."
                  />
                </div>

                {/* Featured Image Management */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-primary-100 space-y-4">
                  <label className="block text-sm font-extrabold text-primary">الصورة المميزة للمقال</label>
                  
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

                  {formData.featured_image_url && (
                    <div className="flex flex-col sm:flex-row gap-6 mt-4 items-start">
                      <div className="relative w-full sm:w-48 h-32 group shrink-0">
                        <img 
                          src={formData.featured_image_url} 
                          alt="معاينة" 
                          className="w-full h-full rounded-xl object-cover border border-primary-100 shadow-sm" 
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, featured_image_url: '', alt_text: '', image_title: '', image_caption: '' }))}
                          className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md hover:scale-110 transition cursor-pointer"
                          title="حذف الصورة"
                        >
                          <i className="ph ph-x text-xs font-bold" />
                        </button>
                      </div>
                      <div className="flex-grow w-full space-y-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-700">النص البديل للصورة (Alt Text) *</label>
                          <input 
                            type="text" 
                            name="alt_text" 
                            value={formData.alt_text} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all font-almarai"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700">عنوان الصورة (Title)</label>
                            <input 
                              type="text" 
                              name="image_title" 
                              value={formData.image_title} 
                              onChange={handleChange} 
                              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all font-almarai"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700">شرح الصورة (Caption)</label>
                            <input 
                              type="text" 
                              name="image_caption" 
                              value={formData.image_caption} 
                              onChange={handleChange} 
                              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all font-almarai"
                            />
                          </div>
                        </div>
                      </div>
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
                      placeholder="الكلمة التي تود فحص المقال بناءً عليها..."
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
                      placeholder="العنوان الافتراضي هو عنوان المقال الأساسي"
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">وصف ميتا المخصص (Meta Description)</label>
                    <textarea 
                      name="meta_description" 
                      value={seo.meta_description} 
                      onChange={handleSEOChange} 
                      placeholder="الوصف الافتراضي هو الوصف المختصر للمقال" 
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
                        placeholder="سيو, مقالات, تسويق"
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-base font-extrabold text-primary">الوسائط الاجتماعية (Social Meta)</h3>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">عنوان فيسبوك وتويتر المخصص (Social Title)</label>
                      <input 
                        type="text" 
                        name="og_title" 
                        value={seo.og_title} 
                        onChange={handleSEOChange}
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">وصف فيسبوك وتويتر المخصص (Social Description)</label>
                      <textarea 
                        name="og_description" 
                        value={seo.og_description} 
                        onChange={handleSEOChange} 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai h-20 resize-y"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">رابط صورة المشاركة المخصصة (Social Image URL)</label>
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
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="arc" name="robots_archive" checked={seo.robots_archive} onChange={handleSEOChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="arc" className="text-sm font-bold text-gray-700">Archive (تخزين نسخة مخبأة)</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="snp" name="robots_snippet" checked={seo.robots_snippet} onChange={handleSEOChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="snp" className="text-sm font-bold text-gray-700">Snippet (عرض مقتطف الميتا)</label>
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
                  content={formData.content}
                  slug={formData.slug}
                  focusKeyword={seo.focus_keyword}
                  altText={formData.alt_text}
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
              <span>{loading ? 'جاري الحفظ...' : (id ? 'تحديث التدوينة بالكامل' : 'نشر التدوينة بالكامل')}</span>
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
