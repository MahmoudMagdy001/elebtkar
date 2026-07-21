// ponytail: WordPress-like media library modal with search, direct WebP optimization and ALT text management.
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { optimizeImage } from '../utils/imageOptimizer';

export default function MediaLibraryModal({ isOpen, onClose, onSelect, inline = false }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({ alt_text: '', title: '', caption: '' });
  const [savingMeta, setSavingMeta] = useState(false);

  useEffect(() => {
    if (isOpen || inline) {
      fetchMedia();
    }
  }, [isOpen, inline]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMediaList(data);
      }
    } catch (e) {
      console.error('Failed to load media:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    setUploading(true);
    try {
      // 1. Optimize image (resizes & converts to WebP)
      const file = await optimizeImage(rawFile, 1920, 0.8);

      // 2. Upload to Supabase Storage
      const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(path, file, {
          cacheControl: '31536000',
          upsert: false,
          contentType: 'image/webp',
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: urlData } = supabase.storage.from('article-images').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // 4. Save metadata inside database table
      const newMedia = {
        url: publicUrl,
        filename: file.name,
        size_bytes: file.size,
        mime_type: 'image/webp',
        alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, ' '),
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, ' '),
        caption: ''
      };

      const { data: insertData, error: dbError } = await supabase
        .from('media_library')
        .insert([newMedia])
        .select();

      if (dbError) throw dbError;

      alert('تم رفع الصورة وتحسينها بنجاح!');
      fetchMedia();

      // Auto-select uploaded item
      if (insertData && insertData[0]) {
        handleSelectItem(insertData[0]);
      }
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setEditForm({
      alt_text: item.alt_text || '',
      title: item.title || '',
      caption: item.caption || ''
    });
  };

  const handleSaveMeta = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSavingMeta(true);
    try {
      const { error } = await supabase
        .from('media_library')
        .update({
          alt_text: editForm.alt_text,
          title: editForm.title,
          caption: editForm.caption
        })
        .eq('id', selectedItem.id);

      if (error) throw error;
      
      // Update item in local list state
      setMediaList(prev => prev.map(m => m.id === selectedItem.id ? { ...m, ...editForm } : m));
      setSelectedItem(prev => ({ ...prev, ...editForm }));
      alert('تم حفظ البيانات بنجاح!');
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem || !window.confirm('هل أنت متأكد من حذف هذه الصورة نهائياً؟')) return;

    try {
      // 1. Extract storage path from url
      // E.g., http://.../storage/v1/object/public/article-images/media/123.webp
      const storagePrefix = '/article-images/';
      const index = selectedItem.url.indexOf(storagePrefix);
      if (index !== -1) {
        const path = selectedItem.url.substring(index + storagePrefix.length);
        // Delete from storage
        await supabase.storage.from('article-images').remove([path]);
      }

      // 2. Delete from database
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      setMediaList(prev => prev.filter(m => m.id !== selectedItem.id));
      setSelectedItem(null);
      alert('تم حذف الصورة بنجاح.');
    } catch (err) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  const filteredMedia = mediaList.filter(item => 
    item.filename.toLowerCase().includes(search.toLowerCase()) ||
    (item.alt_text || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.title || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen && !inline) return null;

  const renderContent = () => (
    <div style={{ background: '#fff', borderRadius: inline ? '0' : '16px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: inline ? 'none' : '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
      
      {/* Header - Only render if not inline */}
      {!inline && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>
            <i className="ph-duotone ph-image" style={{ marginLeft: '0.5rem' }}></i>
            مكتبة الوسائط المنظمة
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#718096' }}>&times;</button>
        </div>
      )}

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
        
        {/* Main Gallery Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0', background: '#f8fafc' }}>
          
          {/* Search and Action Bar */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو النص البديل..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <i className="ph ph-magnifying-glass" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            </div>

            <div style={{ position: 'relative' }}>
              <button className="submit-btn" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', margin: 0 }} disabled={uploading}>
                {uploading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  <i className="ph ph-upload-simple"></i>
                )}
                <span>رفع صورة جديدة (WebP)</span>
              </button>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUpload} 
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                disabled={uploading} 
              />
            </div>
          </div>

          {/* Grid display */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>جاري التحميل...</div>
            ) : filteredMedia.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>لا توجد صور متوفرة.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {filteredMedia.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleSelectItem(item)}
                    style={{ 
                      aspectRatio: '1', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      border: selectedItem?.id === item.id ? '3px solid var(--accent)' : '1px solid #cbd5e1',
                      cursor: 'pointer',
                      background: '#fff',
                      position: 'relative',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <img src={item.url} alt={item.alt_text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar - Metadata details */}
        <div style={{ width: window.innerWidth < 768 ? '100%' : '320px', padding: '1.25rem', overflowY: 'auto', borderTop: window.innerWidth < 768 ? '1px solid #e2e8f0' : 'none' }}>
          {selectedItem ? (
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>تفاصيل الملف</h4>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <img src={selectedItem.url} alt="" style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', wordBreak: 'break-all' }}>{selectedItem.filename}</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>{(selectedItem.size_bytes / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <form onSubmit={handleSaveMeta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="field-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>عنوان الصورة (Title)</label>
                  <input 
                    type="text" 
                    value={editForm.title} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="field-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>النص البديل (ALT Text) *</label>
                  <input 
                    type="text" 
                    value={editForm.alt_text} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="وصف الصورة لمحركات البحث"
                    required
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="field-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>شرح الصورة (Caption)</label>
                  <textarea 
                    value={editForm.caption} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, caption: e.target.value }))}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', height: '60px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="submit-btn" style={{ flex: 1, padding: '0.4rem', margin: 0, fontSize: '0.85rem' }} disabled={savingMeta}>
                    {savingMeta ? 'جاري الحفظ...' : 'تحديث التفاصيل'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleDeleteItem} 
                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    <i className="ph ph-trash"></i>
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>رابط الصورة العام</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedItem.url} 
                    onClick={(e) => e.target.select()}
                    style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', textDirection: 'ltr' }}
                  />
                  <button 
                    onClick={() => { navigator.clipboard.writeText(selectedItem.url); alert('تم نسخ الرابط!'); }} 
                    style={{ padding: '0.35rem 0.5rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <i className="ph ph-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
              اختر صورة من المكتبة لعرض تفاصيلها وتعديلها.
            </div>
          )}
        </div>

      </div>

      {/* Footer actions - Only render if not inline */}
      {!inline && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button 
            onClick={onClose} 
            style={{ padding: '0.5rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#fff', color: '#475569', fontWeight: 600 }}
          >
            إلغاء
          </button>
          <button 
            disabled={!selectedItem} 
            onClick={() => onSelect(selectedItem)}
            style={{ 
              padding: '0.5rem 1.75rem', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: selectedItem ? 'pointer' : 'not-allowed', 
              background: selectedItem ? 'var(--primary)' : '#94a3b8', 
              color: '#fff', 
              fontWeight: 800 
            }}
          >
            تحديد واختيار الصورة
          </button>
        </div>
      )}

    </div>
  );

  if (inline) {
    return renderContent();
  }

  return (
    <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '95%', maxWidth: '1100px', height: '85vh' }}>
        {renderContent()}
      </div>
    </div>
  );
}
