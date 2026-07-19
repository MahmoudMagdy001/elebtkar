// ponytail: Simple CRUD to manage blog and services categories and their custom SEO params.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { slugify, slugifyLive } from '../../utils/slugify';

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', slug: '', description: '',
    meta_title: '', meta_description: '', canonical_url: '', keywords: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    const s = cat.seo_settings || {};
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      meta_title: s.meta_title || '',
      meta_description: s.meta_description || '',
      canonical_url: s.canonical_url || '',
      keywords: s.keywords || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '', slug: '', description: '',
      meta_title: '', meta_description: '', canonical_url: '', keywords: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name' && !editingId) {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: slugifyLive(value)
      }));
    } else if (name === 'slug') {
      setFormData(prev => ({ ...prev, slug: slugifyLive(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const seo_settings = {
        meta_title: formData.meta_title || formData.name,
        meta_description: formData.meta_description || formData.description,
        canonical_url: formData.canonical_url,
        keywords: formData.keywords
      };

      const payload = {
        name: formData.name,
        slug: slugify(formData.slug),
        description: formData.description,
        seo_settings
      };

      let error;
      if (editingId) {
        ({ error } = await supabase.from('categories').update(payload).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('categories').insert([payload]));
      }

      if (error) throw error;

      alert(editingId ? 'تم تحديث التصنيف بنجاح!' : 'تم إضافة التصنيف بنجاح!');
      handleCancel();
      fetchCategories();
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف التصنيف "${name}"؟ قد يؤثر ذلك على المقالات المرتبطة به.`)) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      alert('تم حذف التصنيف بنجاح.');
      fetchCategories();
    } catch (err) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  return (
    <div className="admin-section active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Categories Table List */}
        <div className="dash-card">
          <div className="dash-card-header">
            <i className="ph-duotone ph-tag"></i>
            <h1>التصنيفات الحالية</h1>
            <button onClick={fetchCategories} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
          </div>
          <div className="dash-card-body">
            {loading ? (
              <p>جاري التحميل...</p>
            ) : categories.length === 0 ? (
              <p>لا توجد تصنيفات حالياً.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>الرابط (Slug)</th>
                      <th>الوصف</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td><strong>{cat.name}</strong></td>
                        <td dir="ltr">{cat.slug}</td>
                        <td>{cat.description || '-'}</td>
                        <td>
                          <div className="actions">
                            <button onClick={() => handleEdit(cat)} className="btn-edit" title="تعديل"><i className="ph ph-pencil-simple"></i></button>
                            <button onClick={() => handleDelete(cat.id, cat.name)} className="btn-delete" title="حذف"><i className="ph ph-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Category Form */}
        <div className="dash-card">
          <div className="dash-card-header">
            <i className="ph-duotone ph-plus-circle"></i>
            <h1>{editingId ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h1>
          </div>
          <div className="dash-card-body">
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label>اسم التصنيف *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="مثال: تطوير تطبيقات" 
                  required 
                />
              </div>

              <div className="field-group">
                <label>رابط التصنيف (Slug) *</label>
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  placeholder="app-development" 
                  required 
                  className="ltr-field"
                />
              </div>

              <div className="field-group">
                <label>الوصف</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="اكتب وصفاً موجزاً للتصنيف..." 
                  style={{ height: '80px' }}
                />
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--primary)' }}>تهيئة الـ SEO للتصنيف</h3>
                
                <div className="field-group">
                  <label>عنوان ميتا (SEO Title)</label>
                  <input 
                    type="text" 
                    name="meta_title" 
                    value={formData.meta_title} 
                    onChange={handleChange} 
                    placeholder="العنوان الافتراضي هو اسم التصنيف" 
                  />
                </div>

                <div className="field-group">
                  <label>وصف ميتا (SEO Description)</label>
                  <textarea 
                    name="meta_description" 
                    value={formData.meta_description} 
                    onChange={handleChange} 
                    placeholder="الوصف الافتراضي هو وصف التصنيف أعلاه" 
                    style={{ height: '80px' }}
                  />
                </div>

                <div className="field-group">
                  <label>الرابط الكنسي (Canonical URL)</label>
                  <input 
                    type="url" 
                    name="canonical_url" 
                    value={formData.canonical_url} 
                    onChange={handleChange} 
                    placeholder="https://example.com" 
                    className="ltr-field"
                  />
                </div>

                <div className="field-group">
                  <label>الكلمات الدلالية</label>
                  <input 
                    type="text" 
                    name="keywords" 
                    value={formData.keywords} 
                    onChange={handleChange} 
                    placeholder="مثال: تطبيقات, جوال, برمجة" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="submit-btn" style={{ flex: 1, margin: 0 }} disabled={saving}>
                  <i className="ph ph-floppy-disk"></i>
                  <span>{saving ? 'جاري الحفظ...' : (editingId ? 'تحديث التصنيف' : 'إضافة تصنيف')}</span>
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    style={{ background: '#f1f5f9', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
