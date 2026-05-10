import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const PartnersSection = ({ onEdit }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', id: null });

  const fetchPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('order_num', { ascending: true });
    if (!error && data) setPartners(data);
    setLoading(false);
  };

  const requestDelete = (id) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف هذا الشريك؟`,
      id
    });
  };

  const handleConfirmDelete = async () => {
    const { id } = modalConfig;
    setModalConfig({ ...modalConfig, isOpen: false });
    
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) {
      console.error(error);
      setModalConfig({ isOpen: true, type: 'alert', title: 'خطأ أثناء الحذف', message: error.message });
    } else {
      setModalConfig({ isOpen: true, type: 'success', title: 'تم الحذف', message: `تم حذف الشريك بنجاح!` });
      fetchPartners();
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  useEffect(() => { fetchPartners(); }, []);

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-handshake"></i>
          <h1>إدارة الشركاء</h1>
          <button onClick={fetchPartners} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : partners.length === 0 ? (<p>لا يوجد شركاء حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>الشعار</th><th>رابط الموقع</th><th>الترتيب</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {partners.map(partner => (
                    <tr key={partner.id}>
                      <td><img src={partner.logo_url} alt="شريك" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'contain', background: '#eee' }} /></td>
                      <td dir="ltr" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{partner.website_url || '-'}</td>
                      <td>{partner.order_num}</td>
                      <td>
                        <div className="actions">
                          <button onClick={() => onEdit && onEdit(partner.id)} className="btn-edit" title="تعديل"><i className="ph ph-pencil-simple"></i></button>
                          <button onClick={() => requestDelete(partner.id)} className="btn-delete" title="حذف"><i className="ph ph-trash"></i></button>
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
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        isAlert={modalConfig.type === 'alert' || modalConfig.type === 'success'}
        onConfirm={modalConfig.type === 'confirm' ? handleConfirmDelete : closeModal}
        onCancel={closeModal}
      />
    </div>
  );
};
