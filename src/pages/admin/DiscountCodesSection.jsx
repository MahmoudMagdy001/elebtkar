import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

export const DiscountCodesSection = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCodes(data);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-ticket"></i>
          <h1>أكواد الخصم المولدة</h1>
          <button onClick={fetchCodes} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : codes.length === 0 ? (<p>لا توجد أكواد خصم حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>التاريخ</th><th>الاسم</th><th>رقم الجوال</th><th>كود الخصم</th></tr></thead>
                <tbody>
                  {codes.map(code => (
                    <tr key={code.id}>
                      <td>{new Date(code.created_at).toLocaleString('ar-EG')}</td>
                      <td>{code.user_name}</td>
                      <td dir="ltr">{code.user_phone}</td>
                      <td><span className="code-pill">{code.discount_code}</span></td>
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
