import React, { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '../../utils/supabase';
import { uploadImage } from '../../utils/uploadImage';
import { slugify, slugifyLive } from '../../utils/slugify';
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
  const [formData, setFormData] = useState({
    title: '', slug: '', meta_description: '', subtitle: '',
    description: '', features: '', order_num: 1, is_reverse: false
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
            is_reverse: data.is_reverse || false
          });
        }
      })();
    } else {
      setFormData({ title: '', slug: '', meta_description: '', subtitle: '', description: '', features: '', order_num: 1, is_reverse: false });
      setBgIconFile(null);
    }
  }, [editingId]);

  // Load Quill editor CSS only on client when this admin component mounts
  useEffect(() => {
    import('react-quill-new/dist/quill.snow.css').catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'title') {
      // Auto-generate slug from title
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slugifyLive(value)
      }));
    } else if (name === 'slug') {
      // Sanitize manually typed slug
      setFormData(prev => ({ ...prev, slug: slugifyLive(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bg_icon = null;
      if (bgIconFile) {
        bg_icon = await uploadImage(bgIconFile);
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
        ...(bg_icon && { bg_icon })
      };

      let error;
      if (editingId) {
        ({ error } = await supabase.from('services').update(srvData).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('services').insert([srvData]));
      }

      if (error) throw error;
      alert(editingId ? 'تم تحديث الخدمة بنجاح!' : 'تم إضافة الخدمة بنجاح!');
      setFormData({ title: '', slug: '', meta_description: '', subtitle: '', description: '', features: '', order_num: 1, is_reverse: false });
      setBgIconFile(null);
      onDone && onDone();
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-briefcase"></i>
          <h1>{editingId ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}</h1>
        </div>
        <div className="dash-card-body">
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>اسم الخدمة (بالعربية) <span className="required">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="مثال: تحسين محركات البحث SEO" required />
            </div>

            <hr className="form-divider" />
            <div className="field-group">
              <label>رابط (Slug) الخدمة <span className="required">*</span></label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="seo-optimization" required autoComplete="off" className="ltr-field" />
              <p className="field-hint">رابط الخدمة: <strong>{formData.slug || '…'}</strong></p>
            </div>

            <div className="field-group">
              <label>وصف ميتا (Meta Description) <span className="required">*</span></label>
              <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} placeholder="وصف مختصر يظهر في نتائج البحث" maxLength="155" required />
              <div className="meta-counter ok">{formData.meta_description.length} / 155 حرف</div>
            </div>

            <div className="field-group">
              <label>العنوان الفرعي</label>
              <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="مثال: نهيّئ موقعك ليتصدر نتائج البحث" />
            </div>

            <div className="field-group">
              <label>الوصف <span className="required">*</span></label>
              <div className="ql-wrapper">
                <Suspense fallback={<div>تحميل المحرر…</div>}>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                    modules={quillModules}
                    placeholder="اكتب وصف الخدمة بشكل احترافي..."
                  />
                </Suspense>
              </div>
            </div>

            <div className="field-group">
              <label>المميزات (ميزة في كل سطر) <span className="required">*</span></label>
              <textarea name="features" value={formData.features} onChange={handleChange} placeholder={"ميزة 1\nميزة 2\nميزة 3"} required></textarea>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label>أيقونة الخلفية (صورة)</label>
                <input type="file" accept="image/*" onChange={(e) => setBgIconFile(e.target.files[0])} />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label>رقم الترتيب</label>
                <input type="number" name="order_num" value={formData.order_num} onChange={handleChange} min="1" required />
              </div>
            </div>

            <div className="form-row" style={{ gap: '2rem', marginTop: '1rem' }}>
              <div className="checkbox-group">
                <input type="checkbox" id="is_reverse" name="is_reverse" checked={formData.is_reverse} onChange={handleChange} />
                <label htmlFor="is_reverse">عكس اتجاه التصميم (Reverse)</label>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <i className="ph-duotone ph-cloud-arrow-up"></i>
              <span>{loading ? 'جاري الحفظ...' : (editingId ? 'تحديث الخدمة' : 'حفظ الخدمة')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
