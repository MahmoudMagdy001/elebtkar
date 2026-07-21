// ponytail: Payment logs viewer mapping purchase records to pricing plans with clean UI, search filters, and details modal.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';
import { motion, AnimatePresence } from '../../../shared/utils/lazyFramer';

export default function AdminPurchases() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, pricing_plans(title)')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching purchases:', error);
      }
      if (data) setPayments(data);
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
    (p.moyasar_payment_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.pricing_plans?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getPaymentMethodBadge = (method) => {
    const m = (method || '').toLowerCase();
    if (m === 'applepay') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-900 text-white shadow-xs">
          <i className="ph-bold ph-apple-logo text-sm" /> Apple Pay
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
        <i className="ph-bold ph-credit-card text-sm text-blue-600" /> 
        {m === 'creditcard' ? 'بطاقة ائتمان' : method || 'بطاقة'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const isSuccess = status === 'paid' || status === 'captured' || status === 'approved';
    if (isSuccess) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <i className="ph-bold ph-check-circle text-sm" />
          ناجحة (Paid)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
        <i className="ph-bold ph-warning-circle text-sm" />
        {status || 'معلقة'}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-almarai text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">الطلبات والمشتريات (Purchases)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">تتبع مدفوعات العملاء للحلول والاشتراكات عبر بوابة دفع ميسر (Moyasar)</p>
        </div>
        <Button variant="outline" className="p-2.5 h-10 w-10 min-w-0 self-end sm:self-auto cursor-pointer" onClick={fetchPayments}>
          <i className="ph ph-arrows-clockwise text-lg" />
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-b border-gray-100">
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الجوال، البريد أو رقم العملية..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
            />
            <i className="ph ph-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-primary/5 text-primary text-xs font-extrabold border border-primary/10">
              إجمالي العمليات: {filteredPayments.length}
            </span>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner className="w-10 h-10 border-t-accent" /></div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-16 text-center text-gray-400 font-bold">لا توجد عمليات دفع حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-gray-100 text-gray-700">
                    <th className="p-4 font-extrabold text-primary">التاريخ</th>
                    <th className="p-4 font-extrabold text-primary">العميل</th>
                    <th className="p-4 font-extrabold text-primary">الباقة المطلوبة</th>
                    <th className="p-4 font-extrabold text-primary">المبلغ</th>
                    <th className="p-4 font-extrabold text-primary">طريقة الدفع</th>
                    <th className="p-4 font-extrabold text-primary">حالة الدفع</th>
                    <th className="p-4 font-extrabold text-primary">رقم العملية (Moyasar)</th>
                    <th className="p-4 font-extrabold text-primary text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-primary-50/30 transition-colors">
                      <td className="p-4 text-xs font-bold text-gray-600 whitespace-nowrap">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-gray-900 text-sm">{p.user_name || 'عميل'}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5" dir="ltr">{p.user_email || '-'}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5" dir="ltr">{p.user_phone || '-'}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-lg font-extrabold text-xs border border-primary/15 whitespace-nowrap">
                          {p.pricing_plans?.title || p.metadata?.plan_title || p.metadata?.plan_name || 'باقة'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-extrabold text-slate-900 whitespace-nowrap">
                        <span className="text-base text-primary font-black me-1">{Number(p.amount).toLocaleString()}</span>
                        <span className="text-xs text-gray-500 font-bold font-almarai">{p.currency || 'SAR'}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {getPaymentMethodBadge(p.payment_method)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          {getStatusBadge(p.status)}
                          {p.webhook_verified && (
                            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-[10px] px-2 py-0.5 rounded-md font-bold">
                              <i className="ph-bold ph-shield-check" /> Webhook verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                        {p.moyasar_invoice_url ? (
                          <a 
                            href={p.moyasar_invoice_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:text-accent font-bold underline flex items-center gap-1"
                            dir="ltr"
                          >
                            <span>{p.moyasar_payment_id || 'الفاتورة'}</span>
                            <i className="ph-bold ph-arrow-square-out text-xs" />
                          </a>
                        ) : (
                          <span dir="ltr">{p.moyasar_payment_id || '-'}</span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <Button 
                          onClick={() => setSelectedPayment(p)}
                          variant="outline"
                          className="py-1.5 px-3 text-xs bg-white hover:bg-slate-50 border-gray-200 text-gray-700 cursor-pointer"
                        >
                          <i className="ph-bold ph-eye text-sm text-primary" />
                          <span>عرض</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal for viewing detailed payment details */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="bg-primary-50/60 border-b border-primary-100 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ph-duotone ph-receipt text-primary text-xl" />
                  <h3 className="font-extrabold text-primary text-base">تفاصيل عملية الدفع</h3>
                </div>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-4 text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">اسم العميل</span>
                    <span className="text-sm font-extrabold text-gray-900">{selectedPayment.user_name || 'غير محدد'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">رقم الجوال</span>
                    <span className="text-sm font-mono font-bold text-gray-900 block" dir="ltr">{selectedPayment.user_phone || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">البريد الإلكتروني</span>
                    <span className="text-sm font-mono text-gray-900 block" dir="ltr">{selectedPayment.user_email || '-'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">الباقة المطلوبة</span>
                    <span className="text-sm font-extrabold text-primary">
                      {selectedPayment.pricing_plans?.title || selectedPayment.metadata?.plan_title || 'باقة'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">المبلغ المدفوع</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      {Number(selectedPayment.amount).toLocaleString()} {selectedPayment.currency || 'SAR'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">طريقة الدفع</span>
                    <div>{getPaymentMethodBadge(selectedPayment.payment_method)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">حالة الدفع</span>
                    <div>{getStatusBadge(selectedPayment.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">تاريخ العملية</span>
                    <span className="text-xs font-bold text-gray-700 block">{formatDate(selectedPayment.created_at)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1">
                  <span className="text-xs font-bold text-gray-400 block">رقم عملية ميسر (Moyasar Payment ID)</span>
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg inline-block" dir="ltr">
                    {selectedPayment.moyasar_payment_id || '-'}
                  </span>
                </div>

                {selectedPayment.moyasar_invoice_url && (
                  <div className="border-t border-gray-100 pt-3">
                    <a 
                      href={selectedPayment.moyasar_invoice_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-xs font-extrabold text-primary hover:text-accent bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl transition-colors"
                    >
                      <i className="ph-bold ph-file-text text-base" />
                      <span>رابط الفاتورة الإلكترونية عبر ميسر</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border-t border-gray-100 p-4 flex justify-end">
                <Button onClick={() => setSelectedPayment(null)} variant="outline">
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
