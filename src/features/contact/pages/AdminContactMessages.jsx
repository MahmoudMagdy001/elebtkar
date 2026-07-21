// ponytail: Contact Messages reader showing client inquiries and details view modal.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';
import { motion, AnimatePresence } from '../../../shared/utils/lazyFramer';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingMsg, setViewingMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchMessages(); 
  }, []);

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">الرسائل الواردة (Contact)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">قراءة ومتابعة استفسارات وطلبات خدمات زوار موقع وكالة ابتكار</p>
        </div>
        <Button variant="outline" className="p-2.5 h-10 w-10 min-w-0" onClick={fetchMessages}>
          <i className="ph ph-arrows-clockwise text-lg" />
        </Button>
      </div>

      <Card>
        <CardHeader className="justify-between">
          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الجوال أو الموضوع..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pr-10 pl-4 py-2 border border-primary-100/80 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
            />
            <i className="ph ph-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          </div>
          <span className="text-xs font-bold text-gray-400">إجمالي الرسائل: {filteredMessages.length}</span>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner className="w-10 h-10 border-t-accent" /></div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold">لا توجد رسائل حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-primary-50/40 border-b border-primary-100/50">
                    <th className="p-4 font-extrabold text-primary">التاريخ</th>
                    <th className="p-4 font-extrabold text-primary">المرسل</th>
                    <th className="p-4 font-extrabold text-primary">رقم الجوال</th>
                    <th className="p-4 font-extrabold text-primary">الخدمة المطلوبة</th>
                    <th className="p-4 font-extrabold text-primary">الموضوع</th>
                    <th className="p-4 font-extrabold text-primary text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {filteredMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-primary-50/20 transition-colors">
                      <td className="p-4 text-gray-500 font-bold">
                        {new Date(msg.created_at).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-4">
                        <strong className="text-gray-900">{msg.name}</strong>
                        <p className="text-xs text-gray-400 font-mono mt-0.5" dir="ltr">{msg.email || '-'}</p>
                      </td>
                      <td className="p-4 font-mono text-gray-500" dir="ltr">{msg.phone}</td>
                      <td className="p-4">
                        <span className="inline-block bg-accent/10 text-accent-dark px-2.5 py-1 rounded-full font-bold text-xs border border-accent/20">
                          {msg.services || msg.service_type || '-'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900 max-w-xs truncate">{msg.subject || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <Button 
                            onClick={() => setViewingMsg(msg)}
                            variant="primary"
                            className="py-1.5 px-3.5 text-xs bg-primary hover:bg-primary-dark"
                          >
                            <i className="ph-duotone ph-eye text-sm" />
                            <span>عرض وتفاصيل</span>
                          </Button>
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

      {/* Message detail view modal using AnimatePresence */}
      <AnimatePresence>
        {viewingMsg && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-primary-100"
            >
              <div className="bg-primary-50/50 border-b border-primary-100 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ph-duotone ph-envelope-open text-primary text-xl" />
                  <h3 className="font-extrabold text-primary text-base">تفاصيل الرسالة الواردة</h3>
                </div>
                <button 
                  onClick={() => setViewingMsg(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-4 text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 block">الاسم</span>
                    <span className="text-sm font-bold text-gray-900">{viewingMsg.name}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 block">رقم الجوال</span>
                    <span className="text-sm font-mono text-gray-900 block" dir="ltr">{viewingMsg.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 block">البريد الإلكتروني</span>
                    <span className="text-sm font-mono text-gray-900 block" dir="ltr">{viewingMsg.email || '-'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 block">الخدمات المهتم بها</span>
                    <span className="text-sm font-bold text-primary">{viewingMsg.services || '-'}</span>
                  </div>
                </div>

                <div className="border-t border-gray-50 pt-3 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 block">الموضوع</span>
                  <span className="text-sm font-extrabold text-gray-900">{viewingMsg.subject || '-'}</span>
                </div>

                <div className="border-t border-gray-50 pt-3 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 block">محتوى الرسالة</span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-gray-800 leading-relaxed white-space-pre-wrap">
                    {viewingMsg.message || '-'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
                <Button onClick={() => setViewingMsg(null)} variant="outline">
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
