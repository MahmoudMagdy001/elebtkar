// ponytail: Full blog post editor integrated with WordPress-like media library and RankMath-like SEO Analyzer.
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

export const AddPostSection = ({ editingId, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'seo'
  const [categories, setCategories] = useState([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // Core content fields
  const [formData, setFormData] = useState({
    title: '', slug: '', meta_description: '', content: '', alt_text: '',
    category_id: '', tags: '', author: 'الابتكار', status: 'published',
    scheduled_at: '', image_title: '', image_caption: '', featured_image_url: ''
  });

  // SEO configuration state
  const [seo, setSeo] = useState({
    meta_title: '', meta_description: '', canonical_url: '', keywords: '',
    focus_keyword: '', og_title: '', og_description: '', og_image: '',
    robots_index: true, robots_follow: true, robots_archive: true, robots_snippet: true,
    json_ld: ''
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    // Load categories
    supabase.from('categories').select('id, name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    if (editingId) {
      (async () => {
        const { data, error } = await supabase.from('posts').select('*').eq('id', editingId).single();
        if (!error && data) {
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
        }
      })();
    } else {
      setFormData({
        title: '', slug: '', meta_description: '', content: '', alt_text: '',
        category_id: '', tags: '', author: 'الابتكار', status: 'published',
        scheduled_at: '', image_title: '', image_caption: '', featured_image_url: ''
      });
      setSeo({
        meta_title: '', meta_description: '', canonical_url: '', keywords: '',
        focus_keyword: '', og_title: '', og_description: '', og_image: '',
        robots_index: true, robots_follow: true, robots_archive: true, robots_snippet: true,
        json_ld: ''
      });
      setImageFile(null);
    }
  }, [editingId]);

  // Load Quill editor CSS only on client
  useEffect(() => {
    import('react-quill-new/dist/quill.snow.css').catch(() => {});
  }, []);

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

    if (!formData.featured_image_url && !editingId) {
      alert('يرجى اختيار الصورة المميزة للتدوينة');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.featured_image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Calculate Word Count and Reading Time (approx. 200 words per minute)
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

      // Handle Automatic Redirect creation if editing slug
      if (editingId) {
        const { data: originalPost } = await supabase.from('posts').select('slug').eq('id', editingId).single();
        if (originalPost && originalPost.slug !== slugify(formData.slug)) {
          const oldUrl = `/blog/${originalPost.slug}`;
          const newUrl = `/blog/${slugify(formData.slug)}`;
          // Insert 301 redirect rule
          await supabase.from('redirects').insert([{
            source_url: oldUrl,
            target_url: newUrl,
            status_code: 301
          }]);
        }
      }

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

      let error;
      if (editingId) {
        ({ error } = await supabase.from('posts').update(postData).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('posts').insert([postData]));
      }

      if (error) throw error;
      alert(editingId ? 'تم تحديث التدوينة بنجاح!' : 'تم نشر التدوينة بنجاح!');
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
          <i className="ph-duotone ph-plus-circle"></i>
          <h1>{editingId ? 'تعديل التدوينة والـ SEO' : 'إضافة تدوينة جديدة'}</h1>
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
            محتوى التدوينة الأساسي
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
                  <label>عنوان التدوينة (بالعربية) *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>رابط التدوينة (Slug) *</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="ltr-field" />
                  </div>
                  <div className="field-group">
                    <label>التصنيف</label>
                    <select name="category_id" value={formData.category_id} onChange={handleChange}>
                      <option value="">اختر تصنيف...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>الحالة *</label>
                    <select name="status" value={formData.status} onChange={handleChange} required>
                      <option value="published">منشورة</option>
                      <option value="draft">مسودة</option>
                      <option value="scheduled">مجدولة</option>
                      <option value="archived">مؤرشفة</option>
                    </select>
                  </div>
                  {formData.status === 'scheduled' && (
                    <div className="field-group">
                      <label>تاريخ ووقت النشر المجدول *</label>
                      <input 
                        type="datetime-local" 
                        name="scheduled_at" 
                        value={formData.scheduled_at} 
                        onChange={handleChange} 
                        required 
                        className="ltr-field"
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>الكاتب</label>
                    <input type="text" name="author" value={formData.author} onChange={handleChange} />
                  </div>
                  <div className="field-group">
                    <label>الوسوم (مفصولة بفاصلة)</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="سيو, برمجة, تسويق" />
                  </div>
                </div>

                <div className="field-group">
                  <label>مقتطف / وصف مختصر (Meta Description) *</label>
                  <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} maxLength="155" required />
                  <div className="meta-counter ok">{formData.meta_description.length} / 155 حرف</div>
                </div>

                <div className="field-group">
                  <label>محتوى المقال *</label>
                  <div className="ql-wrapper">
                    <Suspense fallback={<div>تحميل المحرر…</div>}>
                      <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                        modules={quillModules}
                        placeholder="اكتب المحتوى الغني هنا..."
                      />
                    </Suspense>
                  </div>
                </div>

                {/* Featured Image Management */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem' }}>الصورة المميزة للمقال</label>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => setMediaModalOpen(true)}
                      style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      <i className="ph ph-image-square" style={{ marginLeft: '0.35rem' }}></i>
                      اختيار من مكتبة الوسائط
                    </button>

                    <div style={{ position: 'relative' }}>
                      <button type="button" style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <i className="ph ph-upload-simple" style={{ marginLeft: '0.35rem' }}></i>
                        رفع ملف محلي
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                      />
                    </div>
                  </div>

                  {formData.featured_image_url && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', alignItems: 'start', flexWrap: 'wrap' }}>
                      <img src={formData.featured_image_url} alt="معاينة" style={{ width: '140px', height: '90px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="field-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.8rem' }}>النص البديل للصورة (Alt Text) *</label>
                          <input type="text" name="alt_text" value={formData.alt_text} onChange={handleChange} required style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }} />
                        </div>
                        <div className="form-row" style={{ gap: '0.5rem' }}>
                          <div className="field-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.8rem' }}>عنوان الصورة (Title)</label>
                            <input type="text" name="image_title" value={formData.image_title} onChange={handleChange} style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }} />
                          </div>
                          <div className="field-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.8rem' }}>شرح الصورة (Caption)</label>
                            <input type="text" name="image_caption" value={formData.image_caption} onChange={handleChange} style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                <div>
                  <div className="field-group">
                    <label>الكلمة الرئيسية المستهدفة (Focus Keyword)</label>
                    <input type="text" name="focus_keyword" value={seo.focus_keyword} onChange={handleSEOChange} placeholder="الكلمة التي تود فحص المقال بناءً عليها..." />
                  </div>

                  <div className="field-group">
                    <label>عنوان ميتا المخصص (Meta Title)</label>
                    <input type="text" name="meta_title" value={seo.meta_title} onChange={handleSEOChange} placeholder="العنوان الافتراضي هو عنوان المقال الأساسي" />
                  </div>

                  <div className="field-group">
                    <label>وصف ميتا المخصص (Meta Description)</label>
                    <textarea name="meta_description" value={seo.meta_description} onChange={handleSEOChange} placeholder="الوصف الافتراضي هو الوصف المختصر للمقال" style={{ height: '80px' }} />
                  </div>

                  <div className="form-row">
                    <div className="field-group">
                      <label>الرابط الكنسي (Canonical URL)</label>
                      <input type="url" name="canonical_url" value={seo.canonical_url} onChange={handleSEOChange} placeholder="اتركه فارغاً للتوليد التلقائي" className="ltr-field" />
                    </div>
                    <div className="field-group">
                      <label>الكلمات الدلالية المخصصة (Keywords)</label>
                      <input type="text" name="keywords" value={seo.keywords} onChange={handleSEOChange} placeholder="سيو, مقالات, تسويق" />
                    </div>
                  </div>

                  <hr className="form-divider" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 1rem' }}>الوسائط الاجتماعية (Social Meta)</h3>
                  
                  <div className="field-group">
                    <label>عنوان فيسبوك وتويتر المخصص (Social Title)</label>
                    <input type="text" name="og_title" value={seo.og_title} onChange={handleSEOChange} />
                  </div>

                  <div className="field-group">
                    <label>وصف فيسبوك وتويتر المخصص (Social Description)</label>
                    <textarea name="og_description" value={seo.og_description} onChange={handleSEOChange} style={{ height: '70px' }} />
                  </div>

                  <div className="field-group">
                    <label>رابط صورة المشاركة المخصصة (Social Image URL)</label>
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
                    <label>كود JSON-LD المخصص</label>
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
                  content={formData.content}
                  slug={formData.slug}
                  focusKeyword={seo.focus_keyword}
                  altText={formData.alt_text}
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '1.5rem' }}>
              <i className="ph ph-floppy-disk"></i>
              <span>{loading ? 'جاري الحفظ...' : (editingId ? 'تحديث التدوينة بالكامل' : 'نشر التدوينة بالكامل')}</span>
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
