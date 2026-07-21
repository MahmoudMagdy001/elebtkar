// ponytail: Payment logs viewer mapping purchase records to pricing plans with status badges and invoice links.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';

export default function AdminPurchases() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, pricing_plans(title)')
        .order('created_at', { ascending: false });
      if (!error && data) setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPayments(); 
  }, []);

  const filteredPayments = payments.filter(p => 
    (p.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user_phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.moyasar_payment_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">الطلبات والمشتريات (Purchases)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">تتبع مدفوعات العملاء للحلول والاشتراكات عبر بوابة دفع ميسر (Moyasar)</p>
        </div>
        <Button variant="outline" className="p-2.5 h-10 w-10 min-w-0" onClick={fetchPayments}>
          <i className="ph ph-arrows-clockwise text-lg" />
        </Button>
      </div>

      <Card>
        <CardHeader className="justify-between">
          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الجوال، البريد أو رقم العملية..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pr-10 pl-4 py-2 border border-primary-100/80 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
            />
            <i className="ph ph-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          </div>
          <span className="text-xs font-bold text-gray-400">إجمالي العمليات: {filteredPayments.length}</span>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner className="w-10 h-10 border-t-accent" /></div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold">لا توجد عمليات دفع حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-primary-50/40 border-b border-primary-100/50">
                    <th className="p-4 font-extrabold text-primary">التاريخ</th>
                    <th className="p-4 font-extrabold text-primary">العميل</th>
                    <th className="p-4 font-extrabold text-primary">الباقة المطلوبة</th>
                    <th className="p-4 font-extrabold text-primary">المبلغ والعملة</th>
                    <th className="p-4 font-extrabold text-primary">طريقة الدفع</th>
                    <th className="p-4 font-extrabold text-primary">حالة الدفع</th>
                    <th className="p-4 font-extrabold text-primary">رقم العملية (Moyasar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-primary-50/20 transition-colors">
                      <td className="p-4 text-gray-500 font-bold">
                        {new Date(p.created_at).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-4">
                        <strong className="text-gray-900">{p.user_name || 'عميل'}</strong>
                        <p className="text-xs text-gray-400 font-mono mt-0.5" dir="ltr">{p.user_email || '-'}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5" dir="ltr">{p.user_phone || '-'}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-block bg-primary/5 text-primary px-2.5 py-1 rounded-full font-bold text-xs border border-primary/10">
                          {p.pricing_plans?.title || p.metadata?.plan_name || 'باقة'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-900">
                        {p.amount} {p.currency || 'SAR'}
                      </td>
                      <td className="p-4 font-bold text-gray-500">{p.payment_method || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                          p.status === 'paid' || p.status === 'captured'
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {p.status === 'paid' || p.status === 'captured' ? 'ناجحة (Paid)' : p.status}
                        </span>
                        {p.webhook_verified && (
                          <span className="ms-2 inline-block bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                            Webhook verified
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.moyasar_invoice_url ? (
                          <a 
                            href={p.moyasar_invoice_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-mono text-xs text-primary hover:text-accent font-bold underline"
                            dir="ltr"
                          >
                            {p.moyasar_payment_id || 'الفاتورة'}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-gray-500" dir="ltr">
                            {p.moyasar_payment_id || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
