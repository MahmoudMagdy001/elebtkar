// ponytail: Premium blog categories manager with full CRUD and custom SEO controls.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import { slugify, slugifyLive } from '../../../shared/utils/slugify';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';

export default function AdminCategories() {
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
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">تصنيفات المقالات (Categories)</h1>
        <p className="text-sm text-gray-500 font-bold mt-1">أضف تصنيفات لتنظيم تدوينات موقع ابتكار وتعديل الـ SEO الخاص بها</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        
        {/* Categories Table List */}
        <Card>
          <CardHeader className="justify-between">
            <div className="flex items-center gap-2">
              <i className="ph-duotone ph-tag text-primary text-xl" />
              <h2 className="font-extrabold text-primary text-base">التصنيفات الحالية</h2>
            </div>
            <Button variant="outline" className="p-2 h-9 w-9 min-w-0" onClick={fetchCategories}>
              <i className="ph ph-arrows-clockwise" />
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold">لا توجد تصنيفات حالياً.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary-50/50 border-b border-primary-100">
                      <th className="p-4 font-extrabold text-primary">الاسم</th>
                      <th className="p-4 font-extrabold text-primary">الرابط (Slug)</th>
                      <th className="p-4 font-extrabold text-primary">الوصف</th>
                      <th className="p-4 font-extrabold text-primary text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{cat.name}</td>
                        <td className="p-4 font-mono text-xs text-gray-500" dir="ltr">{cat.slug}</td>
                        <td className="p-4 text-gray-500 font-bold max-w-xs truncate">{cat.description || '-'}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(cat)} 
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                              title="تعديل"
                            >
                              <i className="ph ph-pencil-simple" />
                            </button>
                            <button 
                              onClick={() => handleDelete(cat.id, cat.name)} 
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              title="حذف"
                            >
                              <i className="ph ph-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add/Edit Category Form */}
        <Card>
          <CardHeader>
            <i className="ph-duotone ph-plus-circle text-primary text-xl" />
            <h2 className="font-extrabold text-primary text-base">{editingId ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">اسم التصنيف *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="مثال: تطوير تطبيقات" 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">رابط التصنيف (Slug) *</label>
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  placeholder="app-development" 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">الوصف</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="اكتب وصفاً موجزاً للتصنيف..." 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai h-20 resize-y"
                />
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h3 className="text-sm font-extrabold text-primary">تهيئة الـ SEO للتصنيف</h3>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">عنوان ميتا (SEO Title)</label>
                  <input 
                    type="text" 
                    name="meta_title" 
                    value={formData.meta_title} 
                    onChange={handleChange} 
                    placeholder="العنوان الافتراضي هو اسم التصنيف" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">وصف ميتا (SEO Description)</label>
                  <textarea 
                    name="meta_description" 
                    value={formData.meta_description} 
                    onChange={handleChange} 
                    placeholder="الوصف الافتراضي هو وصف التصنيف أعلاه" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai h-16 resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">الرابط الكنسي (Canonical URL)</label>
                  <input 
                    type="url" 
                    name="canonical_url" 
                    value={formData.canonical_url} 
                    onChange={handleChange} 
                    placeholder="https://example.com" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left"
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">الكلمات الدلالية</label>
                  <input 
                    type="text" 
                    name="keywords" 
                    value={formData.keywords} 
                    onChange={handleChange} 
                    placeholder="مثال: تطبيقات, جوال, برمجة" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 bg-[#023B65]">
                  <i className="ph ph-floppy-disk text-base" />
                  <span>{saving ? 'جاري الحفظ...' : (editingId ? 'تحديث' : 'إضافة')}</span>
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <span>إلغاء</span>
                  </Button>
                )}
              </div>
            </form>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
