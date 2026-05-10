import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const PricingSection = ({ onEdit }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', id: null });

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('id, title, price, order_num, is_popular, is_active')
      .order('order_num', { ascending: true });
    if (!error && data) setPlans(data);
    setLoading(false);
  };

  const requestDelete = (id, title) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف الباقة: ${title}؟`,
      id,
      itemTitle: title
    });
  };

  const handleConfirmDelete = async () => {
    const { id, itemTitle } = modalConfig;
    setModalConfig({ ...modalConfig, isOpen: false });
    
    const { error } = await supabase.from('pricing_plans').delete().eq('id', id);
    if (error) {
      console.error(error);
      setModalConfig({ isOpen: true, type: 'alert', title: 'خطأ أثناء الحذف', message: error.message });
    } else {
      setModalConfig({ isOpen: true, type: 'success', title: 'تم الحذف', message: `تم حذف الباقة "${itemTitle}" بنجاح!` });
      fetchPlans();
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  useEffect(() => { fetchPlans(); }, []);

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-wallet"></i>
          <h1>إدارة حلول الابتكار (باقات الأسعار)</h1>
          <button onClick={fetchPlans} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : plans.length === 0 ? (<p>لا توجد باقات حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>اسم الباقة</th><th>السعر</th><th>الترتيب</th><th>شائعة؟</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan.id}>
                      <td>{plan.title}</td>
                      <td>{plan.price?.toLocaleString()}</td>
                      <td>{plan.order_num}</td>
                      <td>{plan.is_popular ? <span className="code-pill">نعم</span> : 'لا'}</td>
                      <td><span className={`status-badge ${plan.is_active ? 'success' : 'failed'}`}>{plan.is_active ? 'نشط' : 'معطل'}</span></td>
                      <td>
                        <div className="actions">
                          <button onClick={() => onEdit && onEdit(plan.id)} className="btn-edit" title="تعديل"><i className="ph ph-pencil-simple"></i></button>
                          <button onClick={() => requestDelete(plan.id, plan.title)} className="btn-delete" title="حذف"><i className="ph ph-trash"></i></button>
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
