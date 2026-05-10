import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { uploadImage } from '../../utils/uploadImage';
import { slugify, slugifyLive } from '../../utils/slugify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
  const [formData, setFormData] = useState({
    title: '', slug: '', meta_description: '', content: '', alt_text: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (editingId) {
      (async () => {
        const { data, error } = await supabase.from('posts').select('*').eq('id', editingId).single();
        if (!error && data) {
          setFormData({
            title: data.title || '', slug: data.slug || '',
            meta_description: data.meta_description || '',
            content: data.content || '', alt_text: data.alt_text || ''
          });
          setImagePreview(data.featured_image_url || '');
        }
      })();
    } else {
      setFormData({ title: '', slug: '', meta_description: '', content: '', alt_text: '' });
      setImageFile(null);
      setImagePreview('');
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile && !editingId) {
      alert('يرجى اختيار الصورة المميزة');
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن لا يتعدى 5 ميغا');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const postData = {
        title: formData.title,
        slug: slugify(formData.slug),
        meta_description: formData.meta_description,
        content: formData.content,
        alt_text: formData.alt_text,
        ...(imageUrl && { featured_image_url: imageUrl })
      };

      let error;
      if (editingId) {
        ({ error } = await supabase.from('posts').update(postData).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('posts').insert([postData]));
      }

      if (error) throw error;
      alert(editingId ? 'تم تحديث المقال بنجاح!' : 'تم نشر المقال بنجاح!');
      setFormData({ title: '', slug: '', meta_description: '', content: '', alt_text: '' });
      setImageFile(null);
      setImagePreview('');
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
          <i className="ph-duotone ph-plus-circle"></i>
          <h1>{editingId ? 'تعديل مدونة' : 'إضافة مدونة جديدة'}</h1>
        </div>
        <div className="dash-card-body">
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>عنوان المدونة (بالعربية) <span className="required">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="مثال: كيف تحسّن ترتيب موقعك في جوجل" required />
            </div>

            <hr className="form-divider" />
            <div className="field-group">
              <label>رابط (Slug) المدونة <span className="required">*</span></label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="how-to-improve-your-google-ranking" required autoComplete="off" className="ltr-field" />
              <p className="field-hint">رابط المدونة: <strong>{formData.slug || '…'}</strong></p>
            </div>

            <div className="field-group">
              <label>وصف ميتا (Meta Description) <span className="required">*</span></label>
              <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} placeholder="وصف مختصر يظهر في نتائج البحث" maxLength="155" required />
              <div className="meta-counter ok">{formData.meta_description.length} / 155 حرف</div>
            </div>

            <div className="field-group">
              <label>محتوى المدونة <span className="required">*</span></label>
              <div className="ql-wrapper">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                  modules={quillModules}
                  placeholder="اكتب محتوى المدونة هنا..."
                />
              </div>
            </div>

            <div className="field-group">
              <label>الصورة المميزة {!editingId && <span className="required">*</span>}</label>
              <div className="upload-zone" style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', position: 'relative', background: '#fafafa' }}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                <div style={{ pointerEvents: 'none' }}>
                  <i className="ph-duotone ph-image" style={{ fontSize: '2rem', color: '#999' }}></i>
                  <p style={{ color: '#888', margin: '0.5rem 0 0' }}>اسحب الصورة هنا أو اضغط للاختيار</p>
                </div>
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="معاينة الصورة" style={{ display: 'block', maxHeight: '200px', marginTop: '1rem', borderRadius: '8px', objectFit: 'cover' }} />
              )}
            </div>

            <div className="field-group">
              <label>النص البديل للصورة (Alt Text) <span className="required">*</span></label>
              <input type="text" name="alt_text" value={formData.alt_text} onChange={handleChange} placeholder="وصف الصورة لمحركات البحث" required />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <div className="spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
              <i className="ph-duotone ph-cloud-arrow-up"></i>
              <span>{loading ? 'جاري النشر...' : (editingId ? 'تحديث المدونة' : 'نشر المدونة')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
