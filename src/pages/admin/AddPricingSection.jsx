import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { slugify, slugifyLive } from '../../utils/slugify';

export const AddPricingSection = ({ editingId, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', slug: '', subtitle: '', price: '', currency: '﷼',
    billing_cycle: 'شهرياً', features: '', order_num: 1, is_popular: false, is_active: true
  });

  useEffect(() => {
    if (editingId) {
      (async () => {
        const { data, error } = await supabase.from('pricing_plans').select('*').eq('id', editingId).single();
        if (!error && data) {
          let featuresArray = [];
          try { featuresArray = typeof data.features === 'string' ? JSON.parse(data.features) : data.features; } catch (e) { /* ignore */ }
          setFormData({
            title: data.title || '', slug: data.slug || '', subtitle: data.subtitle || '',
            price: data.price || '', currency: data.currency || '﷼',
            billing_cycle: data.billing_cycle || 'شهرياً',
            features: (featuresArray || []).join('\n'),
            order_num: data.order_num || 1, is_popular: data.is_popular || false, is_active: data.is_active !== false
          });
        }
      })();
    } else {
      setFormData({ title: '', slug: '', subtitle: '', price: '', currency: '﷼', billing_cycle: 'شهرياً', features: '', order_num: 1, is_popular: false, is_active: true });
    }
  }, [editingId]);

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
    const planData = {
      title: formData.title, slug: slugify(formData.slug), subtitle: formData.subtitle,
      price: parseFloat(formData.price), currency: formData.currency,
      billing_cycle: formData.billing_cycle,
      features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
      order_num: parseInt(formData.order_num), is_popular: formData.is_popular, is_active: formData.is_active
    };
    let error;
    if (editingId) {
      ({ error } = await supabase.from('pricing_plans').update(planData).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('pricing_plans').insert([planData]));
    }
    if (error) alert('حدث خطأ: ' + error.message);
    else {
      alert(editingId ? 'تم تحديث الباقة بنجاح!' : 'تم إضافة الباقة بنجاح!');
      setFormData({ title: '', slug: '', subtitle: '', price: '', currency: '﷼', billing_cycle: 'شهرياً', features: '', order_num: 1, is_popular: false, is_active: true });
      onDone && onDone();
    }
    setLoading(false);
  };

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-currency-circle-dollar"></i>
          <h1>{editingId ? 'تعديل حل ابتكار (باقة)' : 'إضافة حل ابتكار (باقة)'}</h1>
        </div>
        <div className="dash-card-body">
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="planTitle">اسم الباقة <span className="required">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="مثال: الحل الاساسي" required />
            </div>
            <div className="field-group">
              <label htmlFor="planSlug">رابط (Slug) الباقة <span className="required">*</span></label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="basic-plan" required autoComplete="off" className="ltr-field" />
              <p className="field-hint">رابط الباقة: <strong>{formData.slug || '…'}</strong></p>
            </div>
            <div className="field-group">
              <label>العنوان الفرعي</label>
              <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="مثال: مثالية للحصول علي ابتكار واحد" />
            </div>
            <div className="form-row">
              <div className="field-group">
                <label>السعر <span className="required">*</span></label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="مثال: 2000" min="0" required />
              </div>
              <div className="field-group">
                <label>العملة</label>
                <input type="text" name="currency" value={formData.currency} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label>دورة الدفع</label>
                <input type="text" name="billing_cycle" value={formData.billing_cycle} onChange={handleChange} />
              </div>
            </div>
            <div className="field-group">
              <label>الخدمات المشمولة (ميزة في كل سطر) <span className="required">*</span></label>
              <textarea name="features" value={formData.features} onChange={handleChange} rows={5} placeholder={"ميزة 1\nميزة 2"} required></textarea>
            </div>
            <div className="form-row">
              <div className="field-group">
                <label>رقم الترتيب</label>
                <input type="number" name="order_num" value={formData.order_num} onChange={handleChange} min="1" required />
              </div>
            </div>
            <div className="form-row" style={{ gap: '2rem', marginTop: '1rem' }}>
              <div className="checkbox-group">
                <input type="checkbox" id="planPopular" name="is_popular" checked={formData.is_popular} onChange={handleChange} />
                <label htmlFor="planPopular">باقة مميزة (الأكثر طلباً)</label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="planActive" name="is_active" checked={formData.is_active} onChange={handleChange} />
                <label htmlFor="planActive">تفعيل الباقة (تظهر في الموقع)</label>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              <i className="ph-duotone ph-cloud-arrow-up"></i>
              <span>{loading ? 'جاري الحفظ...' : (editingId ? 'تحديث الباقة' : 'حفظ الباقة')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
