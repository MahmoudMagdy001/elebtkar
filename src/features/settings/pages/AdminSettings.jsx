// ponytail: Premium configuration manager with tabs for identity, SEO, verification codes, scripts injection and robots.txt.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import { uploadImage } from '../../../shared/utils/uploadImage';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'seo' | 'robots' | 'scripts'
  
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    logo_url: '',
    favicon_url: '',
    robots_txt: '',
    head_scripts: '',
    body_start_scripts: '',
    body_end_scripts: '',
    google_verify: '',
    bing_verify: '',
    yandex_verify: '',
    default_keywords: '',
    default_og_image: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        setFormData({
          site_name: data.site_name || '',
          site_description: data.site_description || '',
          logo_url: data.logo_url || '',
          favicon_url: data.favicon_url || '',
          robots_txt: data.robots_txt || '',
          head_scripts: data.scripts?.head || '',
          body_start_scripts: data.scripts?.body_start || '',
          body_end_scripts: data.scripts?.body_end || '',
          google_verify: data.verification_codes?.google || '',
          bing_verify: data.verification_codes?.bing || '',
          yandex_verify: data.verification_codes?.yandex || '',
          default_keywords: data.default_seo?.keywords || '',
          default_og_image: data.default_seo?.og_image || ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let logo_url = formData.logo_url;
      let favicon_url = formData.favicon_url;
      let default_og_image = formData.default_og_image;

      if (logoFile) {
        logo_url = await uploadImage(logoFile);
      }
      if (faviconFile) {
        favicon_url = await uploadImage(faviconFile);
      }
      if (ogImageFile) {
        default_og_image = await uploadImage(ogImageFile);
      }

      const payload = {
        site_name: formData.site_name,
        site_description: formData.site_description,
        logo_url,
        favicon_url,
        robots_txt: formData.robots_txt,
        scripts: {
          head: formData.head_scripts,
          body_start: formData.body_start_scripts,
          body_end: formData.body_end_scripts
        },
        verification_codes: {
          google: formData.google_verify,
          bing: formData.bing_verify,
          yandex: formData.yandex_verify
        },
        default_seo: {
          keywords: formData.default_keywords,
          og_image: default_og_image
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', 1);

      if (error) throw error;
      alert('تم حفظ إعدادات الموقع العامة بنجاح!');
      fetchSettings();
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Spinner className="w-10 h-10 border-t-accent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">إعدادات الموقع والـ SEO (Settings)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">تكوين وتعديل ثوابت المنصة، وسكربتات المتابعة والتحقق من محركات البحث</p>
        </div>
        <Button variant="outline" className="p-2.5 h-10 w-10 min-w-0" onClick={fetchSettings}>
          <i className="ph ph-arrows-clockwise text-lg" />
        </Button>
      </div>

      <Card>
        {/* Tab Selection */}
        <div className="flex border-b border-primary-100 bg-slate-50 overflow-x-auto">
          <button 
            type="button" 
            onClick={() => setActiveTab('general')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general' 
                ? 'border-primary text-primary bg-white' 
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            إعدادات الهوية والبنية
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('seo')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seo' 
                ? 'border-primary text-primary bg-white' 
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            سيو والتحقق (Webmaster)
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('robots')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'robots' 
                ? 'border-primary text-primary bg-white' 
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            محرر Robots.txt
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('scripts')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scripts' 
                ? 'border-primary text-primary bg-white' 
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            حقن وسكربتات التتبع
          </button>
        </div>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">اسم الموقع (Site Name) *</label>
                    <input 
                      type="text" 
                      name="site_name" 
                      value={formData.site_name} 
                      onChange={handleChange} 
                      required 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">وصف الموقع الافتراضي (Fallback Description)</label>
                    <input 
                      type="text" 
                      name="site_description" 
                      value={formData.site_description} 
                      onChange={handleChange} 
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">شعار الموقع (Logo)</label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setLogoFile(e.target.files[0])} 
                        className="text-xs text-gray-500 w-full"
                      />
                      {formData.logo_url && (
                        <div className="relative bg-slate-900 p-3 rounded-xl inline-block max-w-[150px] group w-fit">
                          <img src={formData.logo_url} alt="شعار" className="max-h-8 object-contain" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                            className="absolute -top-1.5 -left-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition cursor-pointer"
                            title="حذف الشعار"
                          >
                            <i className="ph ph-x text-[10px] font-bold" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 border-r max-md:border-r-0 border-gray-100 ps-0 md:ps-6">
                    <label className="block text-sm font-bold text-gray-700">أيقونة المتصفح (Favicon)</label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setFaviconFile(e.target.files[0])} 
                        className="text-xs text-gray-500 w-full"
                      />
                      {formData.favicon_url && (
                        <div className="relative bg-white border border-gray-200 p-2.5 rounded-xl inline-block w-fit group">
                          <img src={formData.favicon_url} alt="أيقونة" className="h-8 w-8 object-contain" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, favicon_url: '' }))}
                            className="absolute -top-1.5 -left-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition cursor-pointer"
                            title="حذف الأيقونة"
                          >
                            <i className="ph ph-x text-[10px] font-bold" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 border-r max-md:border-r-0 border-gray-100 ps-0 md:ps-6">
                    <label className="block text-sm font-bold text-gray-700">الصورة الافتراضية للـ OpenGraph</label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setOgImageFile(e.target.files[0])} 
                        className="text-xs text-gray-500 w-full"
                      />
                      {formData.default_og_image && (
                        <div className="relative inline-block group w-fit">
                          <img 
                            src={formData.default_og_image} 
                            alt="صورة OG" 
                            className="max-h-16 w-32 rounded-xl object-cover border border-gray-200" 
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, default_og_image: '' }))}
                            className="absolute -top-1.5 -left-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition cursor-pointer"
                            title="حذف الصورة"
                          >
                            <i className="ph ph-x text-[10px] font-bold" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">الكلمات الدلالية الافتراضية للموقع</label>
                  <input 
                    type="text" 
                    name="default_keywords" 
                    value={formData.default_keywords} 
                    onChange={handleChange} 
                    placeholder="مثال: تسويق، تصميم، برمجة، سيو" 
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h3 className="text-base font-extrabold text-primary">أكواد التحقق من محركات البحث (Search Engine Verification)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">جوجل (Google Search Console Code)</label>
                      <input 
                        type="text" 
                        name="google_verify" 
                        value={formData.google_verify} 
                        onChange={handleChange} 
                        placeholder="أكواد التحقق الميتا من جوجل" 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">بينج (Bing Webmaster Code)</label>
                      <input 
                        type="text" 
                        name="bing_verify" 
                        value={formData.bing_verify} 
                        onChange={handleChange} 
                        placeholder="أكواد التحقق الميتا من بينج" 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">ياندكس (Yandex Code)</label>
                      <input 
                        type="text" 
                        name="yandex_verify" 
                        value={formData.yandex_verify} 
                        onChange={handleChange} 
                        placeholder="أكواد التحقق الميتا من ياندكس" 
                        className="w-full p-3.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'robots' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">قواعد ملف Robots.txt</label>
                  <textarea 
                    name="robots_txt" 
                    value={formData.robots_txt} 
                    onChange={handleChange} 
                    placeholder="User-agent: *&#10;Disallow: /admin/" 
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left h-48 resize-y"
                    style={{ direction: 'ltr' }}
                  />
                  <p className="text-xs text-gray-400 font-bold">يقوم هذا بتعريف زواحف محركات البحث بالمسارات المحظورة أو المسموحة في الموقع.</p>
                </div>
              </div>
            )}

            {activeTab === 'scripts' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">أكواد داخل الهيد (Head Scripts - Google Analytics / pixel)</label>
                  <textarea 
                    name="head_scripts" 
                    value={formData.head_scripts} 
                    onChange={handleChange} 
                    placeholder="<!-- Google Tag Manager --> ..." 
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left h-28 resize-y"
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">بداية البودي (Body Start Scripts)</label>
                  <textarea 
                    name="body_start_scripts" 
                    value={formData.body_start_scripts} 
                    onChange={handleChange} 
                    placeholder="<noscript> ... </noscript>" 
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left h-28 resize-y"
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">نهاية البودي (Body End Scripts)</label>
                  <textarea 
                    name="body_end_scripts" 
                    value={formData.body_end_scripts} 
                    onChange={handleChange} 
                    placeholder="<!-- Custom chat widget ... -->" 
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left h-28 resize-y"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              disabled={saving} 
              className="w-full py-4 bg-[#023B65]"
            >
              <i className="ph ph-floppy-disk text-lg" />
              <span>{saving ? 'جاري حفظ الإعدادات...' : 'حفظ الإعدادات بالكامل'}</span>
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
