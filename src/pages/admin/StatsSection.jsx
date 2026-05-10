import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

export const StatsSection = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null); // stat being edited

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setStats(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الإحصائية؟')) return;
    const { error } = await supabase.from('statistics').delete().eq('id', id);
    if (error) alert('خطأ أثناء الحذف');
    else fetchStats();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('statistics').update({
      label: editModal.label,
      value: parseInt(editModal.value),
      prefix: editModal.prefix,
      suffix: editModal.suffix,
      section: editModal.section,
      sort_order: parseInt(editModal.sort_order),
      is_active: editModal.is_active
    }).eq('id', editModal.id);
    if (error) alert('حدث خطأ: ' + error.message);
    else {
      setEditModal(null);
      fetchStats();
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Group stats by section
  const sectionLabels = { who: 'قسم من نحن', stats: 'قسم الإحصائيات' };
  const grouped = stats.reduce((acc, stat) => {
    acc[stat.section] = acc[stat.section] || [];
    acc[stat.section].push(stat);
    return acc;
  }, {});

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-chart-line-up"></i>
          <h1>إدارة الإحصائيات</h1>
          <button onClick={fetchStats} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : stats.length === 0 ? (<p>لا توجد إحصائيات حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>القيمة</th><th>النص</th><th>الترتيب</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {['who', 'stats'].map(section => (
                    grouped[section] && grouped[section].length > 0 && (
                      <>{/* Use fragment with key on the section header */}
                        <tr key={`header-${section}`} className="section-header-row">
                          <td colSpan="5" style={{ background: '#f8fafc', fontWeight: 600, padding: '0.75rem 1rem', color: '#1a56db' }}>
                            {sectionLabels[section] || section}
                          </td>
                        </tr>
                        {grouped[section].map(stat => (
                          <tr key={stat.id} className={stat.is_active ? '' : 'inactive-row'} style={!stat.is_active ? { opacity: 0.5 } : {}}>
                            <td dir="ltr">{stat.prefix || ''}{stat.value}{stat.suffix || ''}</td>
                            <td>{stat.label}</td>
                            <td>{stat.sort_order || 0}</td>
                            <td>
                              <span className={`status-badge ${stat.is_active ? 'success' : 'failed'}`}>
                                {stat.is_active ? 'نشط' : 'مخفي'}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <button onClick={() => setEditModal({ ...stat })} className="btn-edit" title="تعديل"><i className="ph ph-pencil-simple"></i></button>
                                <button onClick={() => handleDelete(stat.id)} className="btn-delete" title="حذف"><i className="ph ph-trash"></i></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="modal active" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0 }}>تعديل إحصائية</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ padding: '1.5rem' }}>
                <div className="field-group">
                  <label>النص (Label) *</label>
                  <input type="text" value={editModal.label} onChange={(e) => setEditModal(prev => ({ ...prev, label: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label>القيمة *</label>
                    <input type="number" value={editModal.value} onChange={(e) => setEditModal(prev => ({ ...prev, value: e.target.value }))} required />
                  </div>
                  <div className="field-group">
                    <label>المقدمة</label>
                    <input type="text" value={editModal.prefix || ''} onChange={(e) => setEditModal(prev => ({ ...prev, prefix: e.target.value }))} maxLength="10" />
                  </div>
                  <div className="field-group">
                    <label>اللاحقة</label>
                    <input type="text" value={editModal.suffix || ''} onChange={(e) => setEditModal(prev => ({ ...prev, suffix: e.target.value }))} maxLength="10" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label>القسم *</label>
                    <select value={editModal.section} onChange={(e) => setEditModal(prev => ({ ...prev, section: e.target.value }))} required>
                      <option value="who">قسم من نحن</option>
                      <option value="stats">قسم الإحصائيات</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>الترتيب</label>
                    <input type="number" value={editModal.sort_order || 0} onChange={(e) => setEditModal(prev => ({ ...prev, sort_order: e.target.value }))} min="0" />
                  </div>
                </div>
                <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="editStatActive" checked={editModal.is_active !== false} onChange={(e) => setEditModal(prev => ({ ...prev, is_active: e.target.checked }))} />
                  <label htmlFor="editStatActive">نشط (يظهر في الموقع)</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid #eee', justifyContent: 'flex-end' }}>
                <button type="submit" className="submit-btn" style={{ padding: '0.5rem 1rem' }}>حفظ التغييرات</button>
                <button type="button" onClick={() => setEditModal(null)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#f0f0f0', color: '#333' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
