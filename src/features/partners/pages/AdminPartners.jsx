// ponytail: Partners log dashboard manager with full CRUD and order sorting.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import { uploadImage } from '../../../shared/utils/uploadImage';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';
import { ConfirmModal } from '../../../shared/admin/ConfirmModal';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ website_url: '', order_num: 1 });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    type: 'confirm', 
    title: '', 
    message: '', 
    id: null 
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('order_num', { ascending: true });
      if (!error && data) setPartners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPartners(); 
  }, []);

  const handleEdit = (partner) => {
    setEditingId(partner.id);
    setFormData({
      website_url: partner.website_url || '',
      order_num: partner.order_num || 1,
    });
    setLogoPreview(partner.logo_url || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ website_url: '', order_num: 1 });
    setLogoFile(null);
    setLogoPreview('');
  };

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

    setSaving(true);
    try {
      let logo_url = null;
      if (logoFile) {
        logo_url = await uploadImage(logoFile);
      }

      const ptnData = {
        website_url: formData.website_url,
        order_num: parseInt(formData.order_num) || 1,
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
      handleCancel();
      fetchPartners();
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف شريك النجاح هذا؟ قد يؤدي هذا لإزالته من الموقع.',
      id
    });
  };

  const handleConfirmDelete = async () => {
    const { id } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));

    try {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
      setModalConfig({ 
        isOpen: true, 
        type: 'alert', 
        title: 'تم الحذف', 
        message: 'تم حذف الشريك بنجاح.' 
      });
      fetchPartners();
    } catch (err) {
      setModalConfig({ 
        isOpen: true, 
        type: 'alert', 
        title: 'خطأ أثناء الحذف', 
        message: err.message 
      });
    }
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">شركاء النجاح (Partners)</h1>
        <p className="text-sm text-gray-500 font-bold mt-1">إدارة ونشر لوجوهات شركاء نجاح وكالة ابتكار على الصفحة الرئيسية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Partners list */}
        <Card>
          <CardHeader className="justify-between">
            <div className="flex items-center gap-2">
              <i className="ph-duotone ph-handshake text-primary text-xl" />
              <h2 className="font-extrabold text-primary text-base">شركاء النجاح الحاليين</h2>
            </div>
            <Button variant="outline" className="p-2 h-9 w-9 min-w-0" onClick={fetchPartners}>
              <i className="ph ph-arrows-clockwise" />
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : partners.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold">لا يوجد شركاء حالياً.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary-50/50 border-b border-primary-100">
                      <th className="p-4 font-extrabold text-primary">الشعار</th>
                      <th className="p-4 font-extrabold text-primary">رابط الموقع</th>
                      <th className="p-4 font-extrabold text-primary">الترتيب</th>
                      <th className="p-4 font-extrabold text-primary text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50">
                    {partners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="p-4">
                          <img 
                            src={partner.logo_url} 
                            alt="شريك" 
                            className="w-12 h-12 rounded-xl object-contain bg-slate-100 border border-slate-200 p-1" 
                          />
                        </td>
                        <td className="p-4 font-mono text-xs text-primary hover:text-accent font-bold" dir="ltr">
                          {partner.website_url ? (
                            <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="underline">
                              {partner.website_url}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-500">{partner.order_num || '-'}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(partner)} 
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                              title="تعديل"
                            >
                              <i className="ph ph-pencil-simple text-base" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRequest(partner.id)} 
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              title="حذف"
                            >
                              <i className="ph ph-trash text-base" />
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

        {/* Add/Edit Form */}
        <Card>
          <CardHeader>
            <i className="ph-duotone ph-plus-circle text-primary text-xl" />
            <h2 className="font-extrabold text-primary text-base">
              {editingId ? 'تعديل شريك النجاح' : 'إضافة شريك نجاح جديد'}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {logoPreview && (
                <div className="text-center py-2 relative w-fit mx-auto group">
                  <img 
                    src={logoPreview} 
                    alt="معاينة" 
                    className="max-h-24 mx-auto object-contain bg-slate-100 border border-slate-200 p-2 rounded-xl" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview('');
                    }}
                    className="absolute -top-1.5 -left-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition cursor-pointer"
                    title="حذف الصورة"
                  >
                    <i className="ph ph-x text-[10px] font-bold" />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">شعار الشريك *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                  />
                  <div className="space-y-1">
                    <i className="ph-duotone ph-image text-gray-400 text-3xl" />
                    <p className="text-xs text-gray-500 font-bold">اسحب شعار الشريك هنا أو اضغط للاختيار</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">رابط موقع الشريك (اختياري)</label>
                <input 
                  type="url" 
                  name="website_url" 
                  value={formData.website_url} 
                  onChange={handleChange} 
                  placeholder="https://..." 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">رقم الترتيب</label>
                <input 
                  type="number" 
                  name="order_num" 
                  value={formData.order_num} 
                  onChange={handleChange} 
                  min="1" 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 bg-[#023B65]">
                  <i className="ph ph-floppy-disk text-base" />
                  <span>{saving ? 'جاري الحفظ...' : (editingId ? 'تحديث الشريك' : 'حفظ الشريك')}</span>
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

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        isAlert={modalConfig.type === 'alert'}
        onConfirm={modalConfig.type === 'confirm' ? handleConfirmDelete : closeModal}
        onCancel={closeModal}
      />
    </div>
  );
}
