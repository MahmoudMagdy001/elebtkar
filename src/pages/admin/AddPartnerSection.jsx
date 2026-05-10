import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { uploadImage } from '../../utils/uploadImage';

export const AddPartnerSection = ({ editingId, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ website_url: '', order_num: 1 });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    if (editingId) {
      (async () => {
        const { data, error } = await supabase.from('partners').select('*').eq('id', editingId).single();
        if (!error && data) {
          setFormData({
            website_url: data.website_url || '',
            order_num: data.order_num || 1,
          });
          setLogoPreview(data.logo_url || '');
        }
      })();
    } else {
      setFormData({ website_url: '', order_num: 1 });
      setLogoFile(null);
      setLogoPreview('');
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoFile && !editingId) {
      alert('يرجى اختيار شعار الشريك');
      return;
    }

    setLoading(true);
    try {
      let logo_url = null;
      if (logoFile) {
        logo_url = await uploadImage(logoFile);
      }

      const ptnData = {
        website_url: formData.website_url,
        order_num: parseInt(formData.order_num),
        ...(logo_url && { logo_url })
      };

      let error;
      if (editingId) {
        ({ error } = await supabase.from('partners').update(ptnData).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('partners').insert([ptnData]));
      }

      if (error) throw error;
      alert(editingId ? 'تم تحديث الشريك بنجاح!' : 'تم إضافة الشريك بنجاح!');
      setFormData({ website_url: '', order_num: 1 });
      setLogoFile(null);
      setLogoPreview('');
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
          <i className="ph-duotone ph-handshake"></i>
          <h1>{editingId ? 'تعديل بيانات الشريك' : 'إضافة شريك نجاح جديد'}</h1>
        </div>
        <div className="dash-card-body">
          <form onSubmit={handleSubmit}>
            {/* Logo Preview */}
            {logoPreview && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <img src={logoPreview} alt="معاينة الشعار" style={{ maxHeight: '100px', objectFit: 'contain', borderRadius: '50%', background: '#eee', padding: '12px', width: '100px', height: '100px' }} />
              </div>
            )}

            {/* Logo Upload */}
            <div className="field-group">
              <label>شعار الشريك (صورة) {!editingId && <span className="required">*</span>}</label>
              <div className="upload-zone" style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', position: 'relative', background: '#fafafa' }}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                <div style={{ pointerEvents: 'none' }}>
                  <i className="ph-duotone ph-image" style={{ fontSize: '2rem', color: '#999' }}></i>
                  <p style={{ color: '#888', margin: '0.5rem 0 0' }}>اسحب شعار الشريك هنا أو اضغط للاختيار</p>
                </div>
              </div>
            </div>

            <div className="field-group">
              <label>رابط موقع الشريك (اختياري)</label>
              <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} className="ltr-field" placeholder="https://..." />
            </div>

            <div className="form-row">
              <div className="field-group">
                <label>رقم الترتيب</label>
                <input type="number" name="order_num" value={formData.order_num} onChange={handleChange} min="1" required />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <div className="spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
              <i className="ph-duotone ph-cloud-arrow-up"></i>
              <span>{loading ? 'جاري الحفظ...' : (editingId ? 'تحديث الشريك' : 'حفظ الشريك')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
