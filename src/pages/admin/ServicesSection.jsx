import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const ServicesSection = ({ onEdit }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', id: null });

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('id, title, order_num')
      .order('order_num', { ascending: true });
    if (!error && data) setServices(data);
    setLoading(false);
  };

  const requestDelete = (id, title) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف الخدمة: ${title}؟`,
      id,
      itemTitle: title
    });
  };

  const handleConfirmDelete = async () => {
    const { id, itemTitle } = modalConfig;
    setModalConfig({ ...modalConfig, isOpen: false });
    
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error(error);
      setModalConfig({ isOpen: true, type: 'alert', title: 'خطأ أثناء الحذف', message: error.message });
    } else {
      setModalConfig({ isOpen: true, type: 'success', title: 'تم الحذف', message: `تم حذف الخدمة "${itemTitle}" بنجاح!` });
      fetchServices();
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  useEffect(() => { fetchServices(); }, []);

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-squares-four"></i>
          <h1>إدارة الخدمات</h1>
          <button onClick={fetchServices} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : services.length === 0 ? (<p>لا توجد خدمات حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>اسم الخدمة</th><th>الترتيب</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id}>
                      <td>{service.title}</td>
                      <td>{service.order_num}</td>
                      <td>
                        <div className="actions">
                          <button onClick={() => onEdit && onEdit(service.id)} className="btn-edit" title="تعديل"><i className="ph ph-pencil-simple"></i></button>
                          <button onClick={() => requestDelete(service.id, service.title)} className="btn-delete" title="حذف"><i className="ph ph-trash"></i></button>
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
