// ponytail: Simple CRUD to edit site-wide static pages, layout content and metadata with the live SEO analyzer.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import SEOAnalyzer from '../../components/admin/SEOAnalyzer';

const PAGE_TEMPLATES = [
  { name: 'home', label: 'الصفحة الرئيسية', slug: '/' },
  { name: 'services', label: 'صفحة الخدمات العامة', slug: '/services' },
  { name: 'blog', label: 'صفحة المدونة والمقالات', slug: '/blog' },
  { name: 'privacy-policy', label: 'سياسة الخصوصية', slug: '/privacy-policy' },
  { name: 'terms-and-conditions', label: 'الشروط والأحكام', slug: '/terms-and-conditions' }
];

export default function PagesSection() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [saving, setSaving] = useState(false);

  // SEO configuration state
  const [seo, setSeo] = useState({
    meta_title: '', meta_description: '', canonical_url: '', keywords: '',
    focus_keyword: '', og_title: '', og_description: '', og_image: '',
    robots_index: true, robots_follow: true, robots_archive: true, robots_snippet: true,
    json_ld: ''
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pages').select('*');
      if (!error && data) {
        setPages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    const s = page.seo_settings || {};
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
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let parsedJsonLd = null;
      if (seo.json_ld.trim()) {
        try {
          parsedJsonLd = JSON.parse(seo.json_ld);
        } catch (err) {
          alert('خطأ في تنسيق JSON-LD! يرجى إدخال كود JSON صحيح.');
          setSaving(false);
          return;
        }
      }

      const seo_settings = {
        meta_title: seo.meta_title,
        meta_description: seo.meta_description,
        canonical_url: seo.canonical_url,
        keywords: seo.keywords,
        focus_keyword: seo.focus_keyword,
        og_title: seo.og_title,
        og_description: seo.og_description,
        og_image: seo.og_image,
        robots_index: seo.robots_index,
        robots_follow: seo.robots_follow,
        robots_archive: seo.robots_archive,
        robots_snippet: seo.robots_snippet,
        ...(parsedJsonLd && { json_ld: parsedJsonLd })
      };

      const { error } = await supabase
        .from('pages')
        .update({
          seo_settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPage.id);

      if (error) throw error;
      alert('تم حفظ إعدادات الصفحة والـ SEO بنجاح!');
      setEditingPage(null);
      fetchPages();
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper to initialize missing pages
  const handleSetupPages = async () => {
    if (!window.confirm('هل تود تهيئة الصفحات الافتراضية في قاعدة البيانات؟')) return;
    setLoading(true);
    try {
      for (const t of PAGE_TEMPLATES) {
        const exists = pages.find(p => p.name === t.name);
        if (!exists) {
          await supabase.from('pages').insert([{
            name: t.name,
            slug: t.slug,
            content: `محتوى صفحة ${t.label}`,
            seo_settings: {
              meta_title: t.label,
              meta_description: `هذه صفحة ${t.label} لوكالة الابتكار.`,
              robots_index: true,
              robots_follow: true
            }
          }]);
        }
      }
      alert('تم تهيئة كافة الصفحات الافتراضية!');
      fetchPages();
    } catch (err) {
      alert('خطأ أثناء التهيئة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-browser"></i>
          <h1>إدارة محتوى و SEO الصفحات</h1>
          <button onClick={fetchPages} className="btn-refresh ml-auto mr-0">
            <i className="ph ph-arrows-clockwise"></i>
          </button>
        </div>

        <div className="dash-card-body">
          {editingPage ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  تعديل صفحة: {PAGE_TEMPLATES.find(t => t.name === editingPage.name)?.label || editingPage.name}
                </h2>
                <button onClick={() => setEditingPage(null)} style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>العودة للقائمة</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                <form onSubmit={handleSave}>
                  <div className="field-group">
                    <label>الكلمة الرئيسية المستهدفة (Focus Keyword)</label>
                    <input 
                      type="text" 
                      value={seo.focus_keyword} 
                      onChange={(e) => setSeo(prev => ({ ...prev, focus_keyword: e.target.value }))} 
                      placeholder="مثال: تسويق الكتروني" 
                    />
                  </div>

                  <div className="field-group">
                    <label>عنوان ميتا (Meta Title)</label>
                    <input 
                      type="text" 
                      value={seo.meta_title} 
                      onChange={(e) => setSeo(prev => ({ ...prev, meta_title: e.target.value }))} 
                      placeholder="أدخل عنواناً جذاباً يظهر في محركات البحث" 
                      required 
                    />
                  </div>

                  <div className="field-group">
                    <label>وصف ميتا (Meta Description)</label>
                    <textarea 
                      value={seo.meta_description} 
                      onChange={(e) => setSeo(prev => ({ ...prev, meta_description: e.target.value }))} 
                      placeholder="أدخل وصفاً تعريفياً موجزاً يظهر تحت العنوان" 
                      maxLength="160" 
                      required 
                    />
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>{seo.meta_description.length} / 160 حرف</span>
                  </div>

                  <div className="form-row">
                    <div className="field-group">
                      <label>الرابط الكنسي (Canonical URL)</label>
                      <input 
                        type="url" 
                        value={seo.canonical_url} 
                        onChange={(e) => setSeo(prev => ({ ...prev, canonical_url: e.target.value }))} 
                        placeholder="https://example.com/canonical" 
                        className="ltr-field"
                      />
                    </div>
                    <div className="field-group">
                      <label>الكلمات الدلالية (Keywords)</label>
                      <input 
                        type="text" 
                        value={seo.keywords} 
                        onChange={(e) => setSeo(prev => ({ ...prev, keywords: e.target.value }))} 
                        placeholder="كلمة1, كلمة2, كلمة3" 
                      />
                    </div>
                  </div>

                  <hr className="form-divider" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 1rem' }}>إعدادات الأرشفة والزواحف (Robots Directives)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="checkbox-group">
                      <input type="checkbox" id="idx" checked={seo.robots_index} onChange={(e) => setSeo(prev => ({ ...prev, robots_index: e.target.checked }))} />
                      <label htmlFor="idx">Index (السماح بالأرشفة)</label>
                    </div>
                    <div className="checkbox-group">
                      <input type="checkbox" id="flw" checked={seo.robots_follow} onChange={(e) => setSeo(prev => ({ ...prev, robots_follow: e.target.checked }))} />
                      <label htmlFor="flw">Follow (تتبع الروابط)</label>
                    </div>
                    <div className="checkbox-group">
                      <input type="checkbox" id="arc" checked={seo.robots_archive} onChange={(e) => setSeo(prev => ({ ...prev, robots_archive: e.target.checked }))} />
                      <label htmlFor="arc">Archive (تخزين نسخة مخبأة)</label>
                    </div>
                    <div className="checkbox-group">
                      <input type="checkbox" id="snp" checked={seo.robots_snippet} onChange={(e) => setSeo(prev => ({ ...prev, robots_snippet: e.target.checked }))} />
                      <label htmlFor="snp">Snippet (عرض مقتطف الميتا)</label>
                    </div>
                  </div>

                  <hr className="form-divider" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 1rem' }}>البيانات المهيكلة JSON-LD (Schema Markup)</h3>
                  <div className="field-group">
                    <label>JSON-LD Code</label>
                    <textarea 
                      value={seo.json_ld} 
                      onChange={(e) => setSeo(prev => ({ ...prev, json_ld: e.target.value }))} 
                      placeholder='{ "@context": "https://schema.org", "@type": "WebPage" ... }' 
                      className="ltr-field"
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem', height: '140px' }}
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={saving}>
                    <i className="ph ph-floppy-disk"></i>
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات الصفحة'}</span>
                  </button>
                </form>

                {/* Live Analyzer Sidebar */}
                <SEOAnalyzer 
                  title={seo.meta_title}
                  description={seo.meta_description}
                  content={editingPage.content || ''}
                  slug={editingPage.slug}
                  focusKeyword={seo.focus_keyword}
                />
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <p>جاري التحميل...</p>
              ) : pages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>لا توجد صفحات مهيأة حالياً في قاعدة البيانات.</p>
                  <button onClick={handleSetupPages} className="submit-btn" style={{ maxWidth: '240px', margin: '1rem auto' }}>
                    <i className="ph ph-magic-wand"></i>
                    تهيئة الصفحات الافتراضية
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>اسم الصفحة في الموقع</th>
                        <th>الرابط (Slug)</th>
                        <th>تاريخ التعديل</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((p) => {
                        const template = PAGE_TEMPLATES.find(t => t.name === p.name);
                        return (
                          <tr key={p.id}>
                            <td>
                              <strong>{template?.label || p.name}</strong>
                              <br />
                              <small>{p.name}</small>
                            </td>
                            <td dir="ltr">{p.slug}</td>
                            <td>{new Date(p.updated_at).toLocaleDateString('ar-EG')}</td>
                            <td>
                              <button onClick={() => handleEdit(p)} className="btn-edit" title="تعديل الإعدادات والـ SEO">
                                <i className="ph ph-pencil-simple"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
