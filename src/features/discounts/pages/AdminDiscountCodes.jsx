// ponytail: Discount tracker dashboard view listing codes created by site users.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';

export default function AdminDiscountCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setCodes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCodes(); 
  }, []);

  const filteredCodes = codes.filter(code => 
    code.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.discount_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">أكواد الخصم (Discount Codes)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">تتبع أكواد الخصم والعروض الترويجية المستخرجة من قبل زوار الموقع</p>
        </div>
        <Button variant="outline" className="p-2.5 h-10 w-10 min-w-0" onClick={fetchCodes}>
          <i className="ph ph-arrows-clockwise text-lg" />
        </Button>
      </div>

      <Card>
        <CardHeader className="justify-between">
          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو الكود..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pr-10 pl-4 py-2 border border-primary-100/80 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
            />
            <i className="ph ph-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          </div>
          <span className="text-xs font-bold text-gray-400">إجمالي الأكواد: {filteredCodes.length}</span>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner className="w-10 h-10 border-t-accent" /></div>
          ) : filteredCodes.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold">لا توجد أكواد حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-primary-50/40 border-b border-primary-100/50">
                    <th className="p-4 font-extrabold text-primary">التاريخ</th>
                    <th className="p-4 font-extrabold text-primary">اسم المستخدم</th>
                    <th className="p-4 font-extrabold text-primary">رقم الجوال</th>
                    <th className="p-4 font-extrabold text-primary">كود الخصم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-primary-50/20 transition-colors">
                      <td className="p-4 text-gray-500 font-bold">
                        {new Date(code.created_at).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-4 font-bold text-gray-900">{code.user_name}</td>
                      <td className="p-4 font-mono text-gray-500" dir="ltr">{code.user_phone}</td>
                      <td className="p-4">
                        <span className="inline-block bg-accent/10 text-accent-dark px-3 py-1 rounded-full font-extrabold font-mono text-sm border border-accent/20">
                          {code.discount_code}
                        </span>
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
