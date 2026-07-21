// ponytail: Pricing solution details form with interactive checks and input controls.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pricingService } from '../services/pricingService';
import { slugify, slugifyLive } from '../../../shared/utils/slugify';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';

export default function AdminPricingPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', slug: '', subtitle: '', price: '', currency: '﷼',
    billing_cycle: 'شهرياً', features: '', order_num: 1, is_popular: false, is_active: true
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      pricingService.getPlanById(id)
        .then(data => {
          let featuresArray = [];
          try { 
            featuresArray = typeof data.features === 'string' ? JSON.parse(data.features) : data.features; 
          } catch (e) { 
            featuresArray = data.features || [];
          }
          setFormData({
            title: data.title || '', 
            slug: data.slug || '', 
            subtitle: data.subtitle || '',
            price: data.price || '', 
            currency: data.currency || '﷼',
            billing_cycle: data.billing_cycle || 'شهرياً',
            features: (featuresArray || []).join('\n'),
            order_num: data.order_num || 1, 
            is_popular: data.is_popular || false, 
            is_active: data.is_active !== false
          });
        })
        .catch(err => alert('خطأ في تحميل باقة الأسعار: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slugifyLive(value)
      }));
    } else if (name === 'slug') {
      setFormData(prev => ({ ...prev, slug: slugifyLive(value) }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        title: formData.title, 
        slug: slugify(formData.slug), 
        subtitle: formData.subtitle,
        price: parseFloat(formData.price), 
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        features: formData.features ? formData.features.split('\n').map(f => f.trim()).filter(Boolean) : [],
        order_num: parseInt(formData.order_num) || 1, 
        is_popular: formData.is_popular, 
        is_active: formData.is_active
      };

      if (id) {
        await pricingService.updatePlan(id, planData);
      } else {
        await pricingService.createPlan(planData);
      }

      alert(id ? 'تم تحديث الباقة بنجاح!' : 'تم إضافة الباقة بنجاح!');
      navigate('/admin/pricing');
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">{id ? 'تعديل باقة الأسعار' : 'إضافة باقة جديدة'}</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">تحديد الميزات والتسعير للحلول التقنية لوكالة ابتكار</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/pricing')}>
          <i className="ph ph-arrow-right text-lg" />
          <span>الرجوع للباقات</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <i className="ph-duotone ph-currency-circle-dollar text-primary text-xl" />
          <h2 className="font-extrabold text-primary text-base">تفاصيل باقة الأسعار</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">اسم الباقة *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="مثال: الحل الاساسي" 
                  required 
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">الرابط البديل (Slug) *</label>
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  placeholder="basic-plan" 
                  required 
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left" 
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">العنوان الفرعي</label>
              <input 
                type="text" 
                name="subtitle" 
                value={formData.subtitle} 
                onChange={handleChange} 
                placeholder="مثال: مثالية للحصول على ميزة تسويقية واحدة" 
                className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">السعر *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="مثال: 2000" 
                  min="0" 
                  required 
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">العملة</label>
                <input 
                  type="text" 
                  name="currency" 
                  value={formData.currency} 
                  onChange={handleChange} 
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">دورة الدفع</label>
                <input 
                  type="text" 
                  name="billing_cycle" 
                  value={formData.billing_cycle} 
                  onChange={handleChange} 
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">الخدمات المشمولة (ميزة في كل سطر) *</label>
              <textarea 
                name="features" 
                value={formData.features} 
                onChange={handleChange} 
                rows={5} 
                placeholder={"ميزة 1\nميزة 2"} 
                required
                className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai resize-y h-36"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">رقم الترتيب</label>
                <input 
                  type="number" 
                  name="order_num" 
                  value={formData.order_num} 
                  onChange={handleChange} 
                  min="1" 
                  required 
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                />
              </div>
              <div className="flex items-center gap-6 h-full pt-6">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="planPopular" 
                    name="is_popular" 
                    checked={formData.is_popular} 
                    onChange={handleChange} 
                    className="rounded border-gray-300 text-primary focus:ring-primary" 
                  />
                  <label htmlFor="planPopular" className="text-sm font-bold text-gray-700">باقة مميزة (الأكثر طلباً)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="planActive" 
                    name="is_active" 
                    checked={formData.is_active} 
                    onChange={handleChange} 
                    className="rounded border-gray-300 text-primary focus:ring-primary" 
                  />
                  <label htmlFor="planActive" className="text-sm font-bold text-gray-700">تفعيل الباقة (تظهر في الموقع)</label>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading} 
              className="w-full py-4 bg-[#023B65]"
            >
              <i className="ph ph-floppy-disk text-lg" />
              <span>{loading ? 'جاري الحفظ...' : (id ? 'تحديث الباقة' : 'حفظ الباقة')}</span>
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
