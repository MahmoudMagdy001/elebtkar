import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

export const PaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('purchases')
      .select('*, pricing_plans(title)')
      .order('created_at', { ascending: false });
    if (!error && data) setPayments(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-credit-card"></i>
          <h1>عمليات الدفع (Moyasar)</h1>
          <button onClick={fetchPayments} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : payments.length === 0 ? (<p>لا توجد عمليات دفع حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>التاريخ</th><th>العميل</th><th>باقة الاشتراك</th><th>المبلغ</th><th>الحالة</th><th>رقم العملية</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td>{new Date(p.created_at).toLocaleString('ar-EG')}</td>
                      <td>
                        <strong>{p.user_name || 'عميل'}</strong><br />
                        <small>{p.user_email || '-'}</small><br />
                        <small dir="ltr">{p.user_phone || '-'}</small>
                      </td>
                      <td><span className="code-pill">{p.pricing_plans?.title || p.metadata?.plan_name || 'باقة'}</span></td>
                      <td><strong>{p.amount} {p.currency || 'SAR'}</strong></td>
                      <td><span className={`status-badge ${p.status === 'paid' ? 'success' : 'failed'}`}>{p.status === 'paid' ? 'مدفوع' : p.status}</span></td>
                      <td dir="ltr" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{p.moyasar_payment_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
