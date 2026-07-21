// ponytail: Redirect rules manager for 301/302 mappings with bulk CSV import/export.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';

export default function AdminRedirects() {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    source_url: '',
    target_url: '',
    status_code: 301
  });

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('redirects')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setRedirects(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (red) => {
    setEditingId(red.id);
    setFormData({
      source_url: red.source_url,
      target_url: red.target_url,
      status_code: red.status_code
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ source_url: '', target_url: '', status_code: 301 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status_code' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let src = formData.source_url.trim();
      if (!src.startsWith('/')) {
        src = '/' + src;
      }

      const payload = {
        source_url: src,
        target_url: formData.target_url.trim(),
        status_code: formData.status_code
      };

      let error;
      if (editingId) {
        ({ error } = await supabase.from('redirects').update(payload).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('redirects').insert([payload]));
      }

      if (error) throw error;
      alert('تم حفظ التحويل بنجاح!');
      handleCancel();
      fetchRedirects();
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف قاعدة تحويل المسار هذه؟')) return;
    try {
      const { error } = await supabase.from('redirects').delete().eq('id', id);
      if (error) throw error;
      alert('تم الحذف بنجاح.');
      fetchRedirects();
    } catch (err) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (redirects.length === 0) {
      alert('لا توجد بيانات لتصديرها.');
      return;
    }

    let csvContent = '\ufeff'; // UTF-8 BOM for Excel Arabic support
    csvContent += 'Source URL,Target URL,Status Code\r\n';

    redirects.forEach(r => {
      csvContent += `"${r.source_url}","${r.target_url}",${r.status_code}\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `redirects-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/);
        const records = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (parts.length < 2) continue;

          const source_url = parts[0].replace(/^"|"$/g, '').trim();
          const target_url = parts[1].replace(/^"|"$/g, '').trim();
          const status_code = parts[2] ? parseInt(parts[2].trim()) : 301;

          if (source_url && target_url) {
            records.push({
              source_url: source_url.startsWith('/') ? source_url : '/' + source_url,
              target_url,
              status_code: [301, 302].includes(status_code) ? status_code : 301
            });
          }
        }

        if (records.length === 0) {
          alert('الملف فارغ أو غير منسق بشكل صحيح.');
          return;
        }

        if (window.confirm(`هل تود استيراد عدد (${records.length}) قواعد تحويل مسار؟`)) {
          setLoading(true);
          const { error } = await supabase.from('redirects').upsert(records, { onConflict: 'source_url' });
          if (error) throw error;
          alert('تم استيراد قواعد التحويل بنجاح!');
          fetchRedirects();
        }
      } catch (err) {
        alert('خطأ أثناء تحليل الملف: ' + err.message);
      } finally {
        setLoading(false);
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const filteredRedirects = redirects.filter(r => 
    r.source_url.toLowerCase().includes(search.toLowerCase()) ||
    r.target_url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">تحويل روابط الموقع (Redirects)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">إنشاء وإدارة قواعد التحويل التلقائية 301/302 لتجنب روابط الخطأ 404 وتحسين السيو</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="relative">
            <Button variant="outline" className="text-xs py-2 px-3">
              <i className="ph ph-file-arrow-up text-base" />
              <span>استيراد CSV</span>
            </Button>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <Button variant="outline" className="text-xs py-2 px-3" onClick={handleExportCSV}>
            <i className="ph ph-file-arrow-down text-base" />
            <span>تصدير CSV</span>
          </Button>
          <Button variant="outline" className="p-2 h-9 w-9 min-w-0" onClick={fetchRedirects}>
            <i className="ph ph-arrows-clockwise" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        
        {/* Main List Table */}
        <Card>
          <CardHeader className="justify-between">
            <div className="flex items-center gap-2">
              <i className="ph-duotone ph-arrows-merge text-primary text-xl" />
              <h2 className="font-extrabold text-primary text-base">القواعد الحالية</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="p-4 border-b border-primary-50/50 bg-slate-50">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="ابحث عن مسار المصدر أو الهدف..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-full pr-10 pl-4 py-2 border border-primary-100/80 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all font-almarai"
                />
                <i className="ph ph-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : filteredRedirects.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold">لا توجد تحويلات مطابقة للبحث.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary-50/40 border-b border-primary-100/50">
                      <th className="p-4 font-extrabold text-primary">المصدر (Source)</th>
                      <th className="p-4 font-extrabold text-primary">الهدف (Target)</th>
                      <th className="p-4 font-extrabold text-primary">الكود</th>
                      <th className="p-4 font-extrabold text-primary text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50">
                    {filteredRedirects.map((r) => (
                      <tr key={r.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="p-4 font-mono text-xs text-red-600 font-bold" dir="ltr">{r.source_url}</td>
                        <td className="p-4 font-mono text-xs text-green-700 font-bold" dir="ltr">{r.target_url}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            r.status_code === 301 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {r.status_code === 301 ? '301 دائم' : '302 مؤقت'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(r)} 
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                              title="تعديل"
                            >
                              <i className="ph ph-pencil-simple text-base" />
                            </button>
                            <button 
                              onClick={() => handleDelete(r.id)} 
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              title="حذف"
                            >
                              <i className="ph ph-trash text-base" />
                            </button>
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

        {/* Add/Edit Form Panel */}
        <Card>
          <CardHeader>
            <i className="ph-duotone ph-plus-circle text-primary text-xl" />
            <h2 className="font-extrabold text-primary text-base">
              {editingId ? 'تعديل قاعدة تحويل' : 'إضافة قاعدة تحويل جديدة'}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">رابط المصدر المفقود (Source URL) *</label>
                <input 
                  type="text" 
                  name="source_url" 
                  value={formData.source_url} 
                  onChange={handleChange} 
                  placeholder="مثال: /blog/old-name" 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left"
                  style={{ direction: 'ltr' }}
                />
                <p className="text-[11px] text-gray-400 font-bold">المسار الذي يأتي منه الزائر (يبدأ دائماً بـ /)</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">رابط الهدف الجديد (Target URL) *</label>
                <input 
                  type="text" 
                  name="target_url" 
                  value={formData.target_url} 
                  onChange={handleChange} 
                  placeholder="مثال: /blog/new-name أو رابط خارجي كامل" 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-mono text-left"
                  style={{ direction: 'ltr' }}
                />
                <p className="text-[11px] text-gray-400 font-bold">المسار أو الصفحة الجديدة التي تود نقل الزائر إليها</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">نوع كود الحالة (HTTP Code) *</label>
                <select 
                  name="status_code" 
                  value={formData.status_code} 
                  onChange={handleChange} 
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
                >
                  <option value={301}>301 تحويل دائم (ينصح به للـ SEO)</option>
                  <option value={302}>302 تحويل مؤقت</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 bg-[#023B65]">
                  <i className="ph ph-floppy-disk text-base" />
                  <span>{saving ? 'جاري الحفظ...' : (editingId ? 'تحديث القاعدة' : 'حفظ القاعدة')}</span>
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <span>إلغاء</span>
                  </Button>
                )}
              </div>
            </form>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
