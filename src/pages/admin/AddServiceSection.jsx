// ponytail: Service editor integrated with custom background image uploads, SEO Analyzer, and advanced metadata controls.
import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../utils/supabase';
import { uploadImage } from '../../utils/uploadImage';
import { slugify, slugifyLive } from '../../utils/slugify';
import SEOAnalyzer from '../../components/admin/SEOAnalyzer';
import MediaLibraryModal from '../../components/admin/MediaLibraryModal';

const ReactQuill = React.lazy(() => import('react-quill-new'));

const quillModules = {
  toolbar: [
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    [{ script: 'sub' }, { script: 'super' }],
    ['clean']
  ],
};

export const AddServiceSection = ({ editingId, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'seo'
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // Core Service fields
  const [formData, setFormData] = useState({
    title: '', slug: '', meta_description: '', subtitle: '',
    description: '', features: '', order_num: 1, is_reverse: false,
    bg_icon: ''
  });

  // SEO configuration state
  const [seo, setSeo] = useState({
    meta_title: '', meta_description: '', canonical_url: '', keywords: '',
    focus_keyword: '', og_title: '', og_description: '', og_image: '',
    robots_index: true, robots_follow: true, robots_archive: true, robots_snippet: true,
    json_ld: ''
  });

  const [bgIconFile, setBgIconFile] = useState(null);

  useEffect(() => {
    if (editingId) {
      (async () => {
        const { data, error } = await supabase.from('services').select('*').eq('id', editingId).single();
        if (!error && data) {
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
        }
      })();
    } else {
      setFormData({
        title: '', slug: '', meta_description: '', subtitle: '',
        description: '', features: '', order_num: 1, is_reverse: false,
        bg_icon: ''
      });
      setSeo({
        meta_title: '', meta_description: '', canonical_url: '', keywords: '',
        focus_keyword: '', og_title: '', og_description: '', og_image: '',
        robots_index: true, robots_follow: true, robots_archive: true, robots_snippet: true,
        json_ld: ''
      });
      setBgIconFile(null);
    }
  }, [editingId]);

  // Load Quill CSS client-side
  useEffect(() => {
    import('react-quill-new/dist/quill.snow.css').catch(() => {});
  }, []);

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
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSEOChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeo(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMediaSelect = (item) => {
    setFormData(prev => ({
      ...prev,
      bg_icon: item.url
    }));
    setMediaModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bg_icon = formData.bg_icon;
      if (bgIconFile) {
        bg_icon = await uploadImage(bgIconFile);
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
        og_image: seo.og_image || bg_icon,
        robots_index: seo.robots_index,
        robots_follow: seo.robots_follow,
        robots_archive: seo.robots_archive,
        robots_snippet: seo.robots_snippet,
        ...(parsedJsonLd && { json_ld: parsedJsonLd })
      };

      // Handle automatic redirect rule creation
      if (editingId) {
        const { data: originalSrv } = await supabase.from('services').select('slug').eq('id', editingId).single();
        if (originalSrv && originalSrv.slug !== slugify(formData.slug)) {
          const oldUrl = `/services/${originalSrv.slug}`;
          const newUrl = `/services/${slugify(formData.slug)}`;
          await supabase.from('redirects').insert([{
            source_url: oldUrl,
            target_url: newUrl,
            status_code: 301
          }]);
        }
      }

      const srvData = {
        title: formData.title,
        slug: slugify(formData.slug),
        meta_description: formData.meta_description,
        subtitle: formData.subtitle,
        description: formData.description,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
        order_num: parseInt(formData.order_num),
        is_reverse: formData.is_reverse,
        bg_icon,
        seo_settings
      };

      let error;
      if (editingId) {
        ({ error } = await supabase.from('services').update(srvData).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('services').insert([srvData]));
      }

      if (error) throw error;
      alert(editingId ? 'تم تحديث الخدمة بنجاح!' : 'تم إضافة الخدمة بنجاح!');
      onDone && onDone();
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-briefcase"></i>
          <h1>{editingId ? 'تعديل الخدمة والـ SEO' : 'إضافة خدمة جديدة'}</h1>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button 
            type="button" 
            onClick={() => setActiveTab('content')}
            style={{ 
              padding: '1rem 1.5rem', 
              fontWeight: 800, 
              border: 'none', 
              background: activeTab === 'content' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'content' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'content' ? 'var(--primary)' : '#475569',
              cursor: 'pointer'
            }}
          >
            محتوى الخدمة الأساسي
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('seo')}
            style={{ 
              padding: '1rem 1.5rem', 
              fontWeight: 800, 
              border: 'none', 
              background: activeTab === 'seo' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'seo' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'seo' ? 'var(--primary)' : '#475569',
              cursor: 'pointer'
            }}
          >
            إعدادات الـ SEO والـ Schemas
          </button>
        </div>

        <div className="dash-card-body">
          <form onSubmit={handleSubmit}>
            
            {activeTab === 'content' && (
              <div>
                <div className="field-group">
                  <label>اسم الخدمة (بالعربية) *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>رابط الخدمة (Slug) *</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="ltr-field" />
                  </div>
                  <div className="field-group">
                    <label>العنوان الفرعي</label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} />
                  </div>
                </div>

                <div className="field-group">
                  <label>وصف ميتا (Meta Description) *</label>
                  <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} maxLength="155" required />
                  <div className="meta-counter ok">{formData.meta_description.length} / 155 حرف</div>
                </div>

                <div className="field-group">
                  <label>الوصف التفصيلي للخدمة *</label>
                  <div className="ql-wrapper">
                    <Suspense fallback={<div>تحميل المحرر…</div>}>
                      <ReactQuill
                        theme="snow"
                        value={formData.description}
                        onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                        modules={quillModules}
                        placeholder="اكتب تفاصيل الخدمة بشكل احترافي..."
                      />
                    </Suspense>
                  </div>
                </div>

                <div className="field-group">
                  <label>المميزات (ميزة واحدة في كل سطر) *</label>
                  <textarea name="features" value={formData.features} onChange={handleChange} placeholder={"ميزة 1\nميزة 2\nميزة 3"} required style={{ height: '100px' }}></textarea>
                </div>

                {/* Background Image / Icon selection */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem' }}>أيقونة خلفية الخدمة أو الصورة التوضيحية</label>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => setMediaModalOpen(true)}
                      style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      <i className="ph ph-image-square" style={{ marginLeft: '0.35rem' }}></i>
                      مكتبة الوسائط
                    </button>

                    <div style={{ position: 'relative' }}>
                      <button type="button" style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <i className="ph ph-upload-simple" style={{ marginLeft: '0.35rem' }}></i>
                        رفع ملف جديد
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setBgIconFile(e.target.files[0])} 
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                      />
                    </div>
                  </div>

                  {formData.bg_icon && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <img src={formData.bg_icon} alt="معاينة" style={{ maxHeight: '100px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #cbd5e1' }} />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>الترتيب التنازلي (Sort Order)</label>
                    <input type="number" name="order_num" value={formData.order_num} onChange={handleChange} min="1" required />
                  </div>
                  <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center', marginTop: '1rem' }}>
                    <input type="checkbox" id="is_reverse" name="is_reverse" checked={formData.is_reverse} onChange={handleChange} />
                    <label htmlFor="is_reverse">عكس اتجاه التصميم (Reverse Layout)</label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                <div>
                  <div className="field-group">
                    <label>الكلمة الرئيسية المستهدفة (Focus Keyword)</label>
                    <input type="text" name="focus_keyword" value={seo.focus_keyword} onChange={handleSEOChange} placeholder="مثال: تحسين محركات البحث" />
                  </div>

                  <div className="field-group">
                    <label>عنوان ميتا مخصص (Meta Title)</label>
                    <input type="text" name="meta_title" value={seo.meta_title} onChange={handleSEOChange} placeholder="الافتراضي هو اسم الخدمة" />
                  </div>

                  <div className="field-group">
                    <label>وصف ميتا مخصص (Meta Description)</label>
                    <textarea name="meta_description" value={seo.meta_description} onChange={handleSEOChange} placeholder="الافتراضي هو الوصف المختصر أعلاه" style={{ height: '80px' }} />
                  </div>

                  <div className="form-row">
                    <div className="field-group">
                      <label>الرابط الكنسي (Canonical URL)</label>
                      <input type="url" name="canonical_url" value={seo.canonical_url} onChange={handleSEOChange} className="ltr-field" />
                    </div>
                    <div className="field-group">
                      <label>الكلمات الدلالية</label>
                      <input type="text" name="keywords" value={seo.keywords} onChange={handleSEOChange} />
                    </div>
                  </div>

                  <hr className="form-divider" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 1rem' }}>الوسائط الاجتماعية (Social Meta)</h3>
                  
                  <div className="field-group">
                    <label>عنوان المشاركة المخصص (Social Title)</label>
                    <input type="text" name="og_title" value={seo.og_title} onChange={handleSEOChange} />
                  </div>

                  <div className="field-group">
                    <label>وصف المشاركة المخصص (Social Description)</label>
                    <textarea name="og_description" value={seo.og_description} onChange={handleSEOChange} style={{ height: '70px' }} />
                  </div>

                  <div className="field-group">
                    <label>رابط صورة المشاركة (Social Image URL)</label>
                    <input type="text" name="og_image" value={seo.og_image} onChange={handleSEOChange} className="ltr-field" />
                  </div>

                  <hr className="form-divider" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 1rem' }}>الأرشفة والزواحف (Robots Directives)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="checkbox-group">
                      <input type="checkbox" id="idx" name="robots_index" checked={seo.robots_index} onChange={handleSEOChange} />
                      <label htmlFor="idx">Index (السماح بالأرشفة)</label>
                    </div>
                    <div className="checkbox-group">
                      <input type="checkbox" id="flw" name="robots_follow" checked={seo.robots_follow} onChange={handleSEOChange} />
                      <label htmlFor="flw">Follow (تتبع الروابط)</label>
                    </div>
                    <div className="checkbox-group">
                      <input type="checkbox" id="arc" name="robots_archive" checked={seo.robots_archive} onChange={handleSEOChange} />
                      <label htmlFor="arc">Archive (تخزين نسخة مخبأة)</label>
                    </div>
                    <div className="checkbox-group">
                      <input type="checkbox" id="snp" name="robots_snippet" checked={seo.robots_snippet} onChange={handleSEOChange} />
                      <label htmlFor="snp">Snippet (عرض مقتطف الميتا)</label>
                    </div>
                  </div>

                  <hr className="form-divider" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 1rem' }}>البيانات المهيكلة JSON-LD (Schema Markup)</h3>
                  <div className="field-group">
                    <label>كود JSON-LD المخصص للخدمة</label>
                    <textarea 
                      name="json_ld" 
                      value={seo.json_ld} 
                      onChange={handleSEOChange} 
                      placeholder='{ "@context": "https://schema.org", ... }' 
                      className="ltr-field" 
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem', height: '140px' }}
                    />
                  </div>
                </div>

                {/* Real-time SEO Analyzer Sidebar */}
                <SEOAnalyzer 
                  title={seo.meta_title || formData.title}
                  description={seo.meta_description || formData.meta_description}
                  content={formData.description}
                  slug={formData.slug}
                  focusKeyword={seo.focus_keyword}
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '1.5rem' }}>
              <i className="ph ph-floppy-disk"></i>
              <span>{loading ? 'جاري الحفظ...' : (editingId ? 'تحديث الخدمة بالكامل' : 'حفظ الخدمة بالكامل')}</span>
            </button>
          </form>
        </div>
      </div>

      <MediaLibraryModal 
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};
