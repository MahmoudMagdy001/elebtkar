// ponytail: General site singleton settings editor including marketing scripts injection and robots.txt.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { uploadImage } from '../../utils/uploadImage';

export default function SettingsSection() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>جاري تحميل الإعدادات...</div>;

  return (
    <div className="admin-section active" style={{ maxWidth: '900px' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-gear"></i>
          <h1>إعدادات الموقع العامة والـ SEO</h1>
          <button onClick={fetchSettings} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>

        <div className="dash-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Core Branding */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>إعدادات الهوية والبنية</h3>
              <div className="form-row">
                <div className="field-group">
                  <label>اسم الموقع (Site Name) *</label>
                  <input type="text" name="site_name" value={formData.site_name} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label>وصف الموقع الأساسي (Fallback Description)</label>
                  <input type="text" name="site_description" value={formData.site_description} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="field-group">
                  <label>شعار الموقع (Logo)</label>
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                  {formData.logo_url && <img src={formData.logo_url} alt="شعار" style={{ maxHeight: '40px', objectFit: 'contain', marginTop: '0.5rem' }} />}
                </div>

                <div className="field-group">
                  <label>أيقونة المتصفح (Favicon)</label>
                  <input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files[0])} />
                  {formData.favicon_url && <img src={formData.favicon_url} alt="أيقونة" style={{ maxHeight: '32px', objectFit: 'contain', marginTop: '0.5rem' }} />}
                </div>

                <div className="field-group">
                  <label>الصورة الافتراضية للـ OpenGraph</label>
                  <input type="file" accept="image/*" onChange={(e) => setOgImageFile(e.target.files[0])} />
                  {formData.default_og_image && <img src={formData.default_og_image} alt="صورة OG" style={{ maxHeight: '40px', objectFit: 'contain', marginTop: '0.5rem' }} />}
                </div>
              </div>
            </div>

            {/* Default SEO settings */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>الكلمات الدلالية الافتراضية</h3>
              <div className="field-group">
                <label>الكلمات الدلالية الافتراضية للموقع</label>
                <input type="text" name="default_keywords" value={formData.default_keywords} onChange={handleChange} placeholder="مثال: تسويق، تصميم، برمجة" />
              </div>
            </div>

            {/* Webmaster verification codes */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>أكواد التحقق من محركات البحث (Search Engine Verification)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="field-group">
                  <label>جوجل (Google Search Console Code)</label>
                  <input type="text" name="google_verify" value={formData.google_verify} onChange={handleChange} placeholder="أكواد التحقق الميتا من جوجل" className="ltr-field" />
                </div>
                <div className="field-group">
                  <label>بينج (Bing Webmaster Code)</label>
                  <input type="text" name="bing_verify" value={formData.bing_verify} onChange={handleChange} placeholder="أكواد التحقق الميتا من بينج" className="ltr-field" />
                </div>
                <div className="field-group">
                  <label>ياندكس (Yandex Code)</label>
                  <input type="text" name="yandex_verify" value={formData.yandex_verify} onChange={handleChange} placeholder="أكواد التحقق الميتا من ياندكس" className="ltr-field" />
                </div>
              </div>
            </div>

            {/* Robots.txt */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>محرر ملف Robots.txt</h3>
              <div className="field-group">
                <label>قواعد ملف Robots.txt</label>
                <textarea 
                  name="robots_txt" 
                  value={formData.robots_txt} 
                  onChange={handleChange} 
                  placeholder="User-agent: *&#10;Disallow: /admin/" 
                  className="ltr-field"
                  style={{ fontFamily: 'monospace', height: '120px' }}
                />
              </div>
            </div>

            {/* Script Manager Injection */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>حقن وسكربتات التتبع (Script Manager)</h3>
              
              <div className="field-group">
                <label>أكواد داخل الهيد (Head Scripts - Google Analytics / pixels)</label>
                <textarea 
                  name="head_scripts" 
                  value={formData.head_scripts} 
                  onChange={handleChange} 
                  placeholder="<!-- Google Tag Manager --> ..." 
                  className="ltr-field"
                  style={{ fontFamily: 'monospace', height: '100px' }}
                />
              </div>

              <div className="field-group">
                <label>بداية البودي (Body Start Scripts)</label>
                <textarea 
                  name="body_start_scripts" 
                  value={formData.body_start_scripts} 
                  onChange={handleChange} 
                  placeholder="<noscript> ... </noscript>" 
                  className="ltr-field"
                  style={{ fontFamily: 'monospace', height: '100px' }}
                />
              </div>

              <div className="field-group">
                <label>نهاية البودي (Body End Scripts)</label>
                <textarea 
                  name="body_end_scripts" 
                  value={formData.body_end_scripts} 
                  onChange={handleChange} 
                  placeholder="<!-- Custom chat widget ... -->" 
                  className="ltr-field"
                  style={{ fontFamily: 'monospace', height: '100px' }}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={saving} style={{ marginTop: '1rem' }}>
              <i className="ph ph-floppy-disk"></i>
              <span>{saving ? 'جاري حفظ الإعدادات...' : 'حفظ الإعدادات بالكامل'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
