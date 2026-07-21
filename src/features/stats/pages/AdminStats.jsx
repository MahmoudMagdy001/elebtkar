// ponytail: Homepage counters and statistics dashboard CRUD manager.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';
import { motion, AnimatePresence } from '../../../shared/utils/lazyFramer';
import { ConfirmModal } from '../../../shared/admin/ConfirmModal';

const sectionLabels = { who: 'قسم من نحن', stats: 'قسم الإحصائيات' };

export default function AdminStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null); // Stat object being created/edited
  
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    type: 'confirm', 
    title: '', 
    message: '', 
    id: null 
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStats(); 
  }, []);

  const handleEdit = (stat) => {
    setEditModal({ ...stat });
  };

  const handleCreateNew = () => {
    setEditModal({
      label: '',
      value: 0,
      prefix: '',
      suffix: '',
      section: 'stats',
      sort_order: 1,
      is_active: true
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        label: editModal.label,
        value: parseInt(editModal.value) || 0,
        prefix: editModal.prefix || '',
        suffix: editModal.suffix || '',
        section: editModal.section,
        sort_order: parseInt(editModal.sort_order) || 1,
        is_active: editModal.is_active
      };

      let error;
      if (editModal.id) {
        ({ error } = await supabase.from('statistics').update(payload).eq('id', editModal.id));
      } else {
        ({ error } = await supabase.from('statistics').insert([payload]));
      }

      if (error) throw error;
      alert(editModal.id ? 'تم تحديث الإحصائية بنجاح!' : 'تم إضافة الإحصائية بنجاح!');
      setEditModal(null);
      fetchStats();
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذه الإحصائية؟ سيؤدي ذلك لإزالتها من صفحة الموقع الرئيسية.',
      id
    });
  };

  const handleConfirmDelete = async () => {
    const { id } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));

    try {
      const { error } = await supabase.from('statistics').delete().eq('id', id);
      if (error) throw error;
      setModalConfig({ 
        isOpen: true, 
        type: 'alert', 
        title: 'تم الحذف', 
        message: 'تم حذف الإحصائية بنجاح.' 
      });
      fetchStats();
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

  // Group stats by section
  const grouped = stats.reduce((acc, stat) => {
    acc[stat.section] = acc[stat.section] || [];
    acc[stat.section].push(stat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">إحصائيات الموقع (Statistics)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">تعديل العدادات الرقمية ومؤشرات نجاح ابتكار المعروضة للعملاء</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleCreateNew}>
            <i className="ph ph-plus-circle text-lg" />
            <span>إضافة إحصائية جديدة</span>
          </Button>
          <Button variant="outline" className="p-2.5 h-10 w-10 min-w-0" onClick={fetchStats}>
            <i className="ph ph-arrows-clockwise text-lg" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <i className="ph-duotone ph-chart-line-up text-primary text-xl" />
          <h2 className="font-extrabold text-primary text-base">عدادات الأرقام الحالية</h2>
        </CardHeader>
        <CardBody className="p-0">
          {loading && stats.length === 0 ? (
            <div className="py-12 flex justify-center"><Spinner /></div>
          ) : stats.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold">لا توجد إحصائيات حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-primary-50/50 border-b border-primary-100">
                    <th className="p-4 font-extrabold text-primary">المعلمة الرقمية</th>
                    <th className="p-4 font-extrabold text-primary">النص (Label)</th>
                    <th className="p-4 font-extrabold text-primary">الترتيب</th>
                    <th className="p-4 font-extrabold text-primary">الحالة</th>
                    <th className="p-4 font-extrabold text-primary text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {['who', 'stats'].map(section => (
                    grouped[section] && grouped[section].length > 0 && (
                      <React.Fragment key={section}>
                        <tr className="bg-slate-50">
                          <td colSpan="5" className="p-3 font-extrabold text-primary text-xs border-y border-primary-100">
                            {sectionLabels[section] || section}
                          </td>
                        </tr>
                        {grouped[section].map(stat => (
                          <tr key={stat.id} className={`hover:bg-primary-50/20 transition-colors ${!stat.is_active ? 'opacity-50' : ''}`}>
                            <td className="p-4 font-mono font-bold text-gray-900" dir="ltr">
                              {stat.prefix || ''}{stat.value}{stat.suffix || ''}
                            </td>
                            <td className="p-4 font-bold text-gray-700">{stat.label}</td>
                            <td className="p-4 font-mono text-gray-500">{stat.sort_order || 0}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                stat.is_active 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}>
                                {stat.is_active ? 'نشط' : 'مخفي'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEdit(stat)} 
                                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                  title="تعديل"
                                >
                                  <i className="ph ph-pencil-simple text-base" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRequest(stat.id)} 
                                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                  title="حذف"
                                >
                                  <i className="ph ph-trash text-base" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-primary-100"
            >
              <div className="bg-primary-50/50 border-b border-primary-100 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ph-duotone ph-chart-line-up text-primary text-xl" />
                  <h3 className="font-extrabold text-primary text-base">
                    {editModal.id ? 'تعديل الإحصائية' : 'إضافة إحصائية جديدة'}
                  </h3>
                </div>
                <button 
                  onClick={() => setEditModal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="p-6 space-y-4 text-right">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">النص (Label) *</label>
                    <input 
                      type="text" 
                      value={editModal.label} 
                      onChange={(e) => setEditModal(prev => ({ ...prev, label: e.target.value }))} 
                      required 
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">المقدمة</label>
                      <input 
                        type="text" 
                        value={editModal.prefix || ''} 
                        onChange={(e) => setEditModal(prev => ({ ...prev, prefix: e.target.value }))} 
                        maxLength="10" 
                        placeholder="+"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">القيمة *</label>
                      <input 
                        type="number" 
                        value={editModal.value} 
                        onChange={(e) => setEditModal(prev => ({ ...prev, value: e.target.value }))} 
                        required 
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">اللاحقة</label>
                      <input 
                        type="text" 
                        value={editModal.suffix || ''} 
                        onChange={(e) => setEditModal(prev => ({ ...prev, suffix: e.target.value }))} 
                        maxLength="10" 
                        placeholder="%"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">القسم *</label>
                      <select 
                        value={editModal.section} 
                        onChange={(e) => setEditModal(prev => ({ ...prev, section: e.target.value }))} 
                        required
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                      >
                        <option value="who">قسم من نحن</option>
                        <option value="stats">قسم الإحصائيات</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">الترتيب</label>
                      <input 
                        type="number" 
                        value={editModal.sort_order || 1} 
                        onChange={(e) => setEditModal(prev => ({ ...prev, sort_order: e.target.value }))} 
                        min="1" 
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="editStatActive" 
                      checked={editModal.is_active !== false} 
                      onChange={(e) => setEditModal(prev => ({ ...prev, is_active: e.target.checked }))} 
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="editStatActive" className="text-sm font-bold text-gray-700">نشط (يظهر في الموقع)</label>
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-2">
                  <Button type="submit" className="bg-[#023B65]">
                    <span>حفظ</span>
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditModal(null)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
