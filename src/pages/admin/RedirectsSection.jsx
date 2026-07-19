// ponytail: Simple CSV parser and redirects manager for 301/302 mappings to handle bulk import/export.
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

export default function RedirectsSection() {
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
      // Validate source format
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

        // Parse CSV lines (simple parser)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by comma outside of quotes (simple split)
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
    <div className="admin-section active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Main List Table */}
        <div className="dash-card">
          <div className="dash-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <i className="ph-duotone ph-arrows-merge"></i>
            <h1>إدارة التحويلات (301 / 302 Redirects)</h1>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto', marginLeft: 0 }}>
              {/* Import Action */}
              <div style={{ position: 'relative' }}>
                <button type="button" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <i className="ph ph-file-arrow-up"></i> استيراد CSV
                </button>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleImportCSV} 
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>

              {/* Export Action */}
              <button 
                onClick={handleExportCSV}
                type="button" 
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}
              >
                <i className="ph ph-file-arrow-down"></i> تصدير CSV
              </button>
              
              <button onClick={fetchRedirects} className="btn-refresh" style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}><i className="ph ph-arrows-clockwise"></i></button>
            </div>
          </div>

          <div className="dash-card-body">
            {/* Search Box */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <input 
                type="text" 
                placeholder="ابحث عن مسار المصدر أو الهدف..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <i className="ph ph-magnifying-glass" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            </div>

            {loading ? (
              <p>جاري التحميل...</p>
            ) : filteredRedirects.length === 0 ? (
              <p>لا توجد تحويلات مطابقة للبحث.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>رابط المصدر (Source)</th>
                      <th>رابط الهدف (Target)</th>
                      <th>نوع التحويل</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRedirects.map((r) => (
                      <tr key={r.id}>
                        <td dir="ltr" style={{ fontWeight: 600, color: '#dc2626' }}>{r.source_url}</td>
                        <td dir="ltr" style={{ fontWeight: 600, color: '#16a34a' }}>{r.target_url}</td>
                        <td>
                          <span className={`status-badge ${r.status_code === 301 ? 'success' : 'failed'}`}>
                            {r.status_code === 301 ? '301 دائـم' : '302 مؤقـت'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button onClick={() => handleEdit(r)} className="btn-edit" title="تعديل"><i className="ph ph-pencil-simple"></i></button>
                            <button onClick={() => handleDelete(r.id)} className="btn-delete" title="حذف"><i className="ph ph-trash"></i></button>
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

        {/* Add/Edit Form Panel */}
        <div className="dash-card">
          <div className="dash-card-header">
            <i className="ph-duotone ph-plus-circle"></i>
            <h1>{editingId ? 'تعديل قاعدة تحويل' : 'إضافة قاعدة تحويل جديدة'}</h1>
          </div>
          <div className="dash-card-body">
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label>رابط المصدر المفقود (Source URL) *</label>
                <input 
                  type="text" 
                  name="source_url" 
                  value={formData.source_url} 
                  onChange={handleChange} 
                  placeholder="مثال: /blog/old-name" 
                  required 
                  className="ltr-field"
                />
                <p className="field-hint">المسار الذي يأتي منه الزائر (يبدأ دائماً بـ /)</p>
              </div>

              <div className="field-group">
                <label>رابط الهدف الجديد (Target URL) *</label>
                <input 
                  type="text" 
                  name="target_url" 
                  value={formData.target_url} 
                  onChange={handleChange} 
                  placeholder="مثال: /blog/new-name أو رابط خارجي كامل" 
                  required 
                  className="ltr-field"
                />
                <p className="field-hint">المسار أو الصفحة الجديدة التي تود نقل الزائر إليها</p>
              </div>

              <div className="field-group">
                <label>نوع كود الحالة (HTTP Code) *</label>
                <select name="status_code" value={formData.status_code} onChange={handleChange} required>
                  <option value={301}>301 تحويل دائم (ينصح به للـ SEO)</option>
                  <option value={302}>302 تحويل مؤقت</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="submit-btn" style={{ flex: 1, margin: 0 }} disabled={saving}>
                  <i className="ph ph-floppy-disk"></i>
                  <span>{saving ? 'جاري الحفظ...' : (editingId ? 'تحديث القاعدة' : 'حفظ القاعدة')}</span>
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    style={{ background: '#f1f5f9', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
