// ponytail: Premium static pages editor and SEO configurator with live analysis.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import SEOAnalyzer from '../../../shared/admin/SEOAnalyzer';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';

const PAGE_TEMPLATES = [
  { name: 'home', label: 'الصفحة الرئيسية', slug: '/' },
  { name: 'services', label: 'صفحة الخدمات العامة', slug: '/services' },
  { name: 'blog', label: 'صفحة المدونة والمقالات', slug: '/blog' },
  { name: 'privacy-policy', label: 'سياسة الخصوصية', slug: '/privacy-policy' },
  { name: 'terms-and-conditions', label: 'الشروط والأحكام', slug: '/terms-and-conditions' }
];

export default function AdminPages() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">تهيئة الصفحات والـ SEO (Pages)</h1>
        <p className="text-sm text-gray-500 font-bold mt-1">تعديل وضبط الكلمات الافتتاحية والميتا وعلامات السيو لصفحات موقع ابتكار</p>
      </div>

      <Card>
        <CardHeader className="justify-between">
          <div className="flex items-center gap-2">
            <i className="ph-duotone ph-browser text-primary text-xl" />
            <h2 className="font-extrabold text-primary text-base">
              {editingPage 
                ? `تعديل صفحة: ${PAGE_TEMPLATES.find(t => t.name === editingPage.name)?.label || editingPage.name}` 
                : 'الصفحات الثابتة'}
            </h2>
          </div>
          {editingPage ? (
            <Button variant="outline" onClick={() => setEditingPage(null)}>
              الرجوع للقائمة
            </Button>
          ) : (
            <Button variant="outline" className="p-2 h-9 w-9 min-w-0" onClick={fetchPages}>
              <i className="ph ph-arrows-clockwise" />
            </Button>
          )}
        </CardHeader>
        <CardBody>
          {editingPage ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">الكلمة الرئيسية المستهدفة (Focus Keyword)</label>
                  <input 
                    type="text" 
                    value={seo.focus_keyword} 
                    onChange={(e) => setSeo(prev => ({ ...prev, focus_keyword: e.target.value }))} 
                    placeholder="مثال: تسويق الكتروني" 
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">عنوان ميتا (Meta Title) *</label>
                  <input 
                    type="text" 
                    value={seo.meta_title} 
                    onChange={(e) => setSeo(prev => ({ ...prev, meta_title: e.target.value }))} 
                    placeholder="أدخل عنواناً جذاباً يظهر في محركات البحث" 
                    required 
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">وصف ميتا (Meta Description) *</label>
                  <textarea 
                    value={seo.meta_description} 
                    onChange={(e) => setSeo(prev => ({ ...prev, meta_description: e.target.value }))} 
                    placeholder="أدخل وصفاً تعريفياً موجزاً يظهر تحت العنوان" 
                    maxLength="160" 
                    required 
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai h-24 resize-y"
                  />
                  <span className="text-xs font-bold text-green-700 mt-1 block">{seo.meta_description.length} / 160 حرف</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الرابط الكنسي (Canonical URL)</label>
                    <input 
                      type="url" 
                      value={seo.canonical_url} 
                      onChange={(e) => setSeo(prev => ({ ...prev, canonical_url: e.target.value }))} 
                      placeholder="https://example.com/canonical" 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left"
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">الكلمات الدلالية (Keywords)</label>
                    <input 
                      type="text" 
                      value={seo.keywords} 
                      onChange={(e) => setSeo(prev => ({ ...prev, keywords: e.target.value }))} 
                      placeholder="كلمة1, كلمة2, كلمة3" 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-base font-extrabold text-primary">إعدادات الأرشفة والزواحف (Robots Directives)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="idx" checked={seo.robots_index} onChange={(e) => setSeo(prev => ({ ...prev, robots_index: e.target.checked }))} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <label htmlFor="idx" className="text-sm font-bold text-gray-700">Index (السماح بالأرشفة)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="flw" checked={seo.robots_follow} onChange={(e) => setSeo(prev => ({ ...prev, robots_follow: e.target.checked }))} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <label htmlFor="flw" className="text-sm font-bold text-gray-700">Follow (تتبع الروابط)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="arc" checked={seo.robots_archive} onChange={(e) => setSeo(prev => ({ ...prev, robots_archive: e.target.checked }))} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <label htmlFor="arc" className="text-sm font-bold text-gray-700">Archive (تخزين نسخة مخبأة)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="snp" checked={seo.robots_snippet} onChange={(e) => setSeo(prev => ({ ...prev, robots_snippet: e.target.checked }))} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <label htmlFor="snp" className="text-sm font-bold text-gray-700">Snippet (عرض مقتطف الميتا)</label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-base font-extrabold text-primary">البيانات المهيكلة JSON-LD (Schema Markup)</h3>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">JSON-LD Code</label>
                    <textarea 
                      value={seo.json_ld} 
                      onChange={(e) => setSeo(prev => ({ ...prev, json_ld: e.target.value }))} 
                      placeholder='{ "@context": "https://schema.org", "@type": "WebPage" ... }' 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left h-36 resize-y"
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full py-4 bg-[#023B65]">
                  <i className="ph ph-floppy-disk text-lg" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات الصفحة'}</span>
                </Button>
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
          ) : (
            <div>
              {loading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
              ) : pages.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-gray-400 font-bold">لا توجد صفحات مهيأة حالياً في قاعدة البيانات.</p>
                  <Button onClick={handleSetupPages} className="mx-auto bg-[#023B65]">
                    <i className="ph ph-magic-wand text-lg" />
                    <span>تهيئة الصفحات الافتراضية</span>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-sm">
                    <thead>
                      <tr className="bg-primary-50/50 border-b border-primary-100">
                        <th className="p-4 font-extrabold text-primary">اسم الصفحة في الموقع</th>
                        <th className="p-4 font-extrabold text-primary">الرابط (Slug)</th>
                        <th className="p-4 font-extrabold text-primary">تاريخ التعديل</th>
                        <th className="p-4 font-extrabold text-primary text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-50">
                      {pages.map((p) => {
                        const template = PAGE_TEMPLATES.find(t => t.name === p.name);
                        return (
                          <tr key={p.id} className="hover:bg-primary-50/20 transition-colors">
                            <td className="p-4">
                              <strong className="text-gray-900">{template?.label || p.name}</strong>
                              <p className="text-xs text-gray-400 mt-0.5">{p.name}</p>
                            </td>
                            <td className="p-4 font-mono text-xs text-gray-500" dir="ltr">{p.slug}</td>
                            <td className="p-4 text-gray-500 font-bold">
                              {new Date(p.updated_at || p.created_at).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center">
                                <button 
                                  onClick={() => handleEdit(p)} 
                                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                  title="تعديل الإعدادات والـ SEO"
                                >
                                  <i className="ph ph-pencil-simple text-base" />
                                </button>
                              </div>
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
        </CardBody>
      </Card>
    </div>
  );
}
