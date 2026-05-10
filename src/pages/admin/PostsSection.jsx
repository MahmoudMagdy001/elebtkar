import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const PostsSection = ({ onEdit }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', id: null });

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  const requestDelete = (id, title) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف المقال: ${title}؟`,
      id,
      itemTitle: title
    });
  };

  const handleConfirmDelete = async () => {
    const { id, itemTitle } = modalConfig;
    setModalConfig({ ...modalConfig, isOpen: false });
    
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      console.error(error);
      setModalConfig({ isOpen: true, type: 'alert', title: 'خطأ أثناء الحذف', message: error.message });
    } else {
      setModalConfig({ isOpen: true, type: 'success', title: 'تم الحذف', message: `تم حذف المقال "${itemTitle}" بنجاح!` });
      fetchPosts();
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  useEffect(() => { fetchPosts(); }, []);

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-article-ny-times"></i>
          <h1>إدارة المقالات</h1>
          <button onClick={fetchPosts} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : posts.length === 0 ? (<p>لا توجد مقالات حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>عنوان المقال</th><th>الرابط (Slug)</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>{post.title}</td>
                      <td dir="ltr">{post.slug}</td>
                      <td>{new Date(post.created_at).toLocaleDateString('ar-EG')}</td>
                      <td>
                        <div className="actions">
                          <button onClick={() => onEdit && onEdit(post.id)} className="btn-edit" title="تعديل"><i className="ph ph-pencil-simple"></i></button>
                          <button onClick={() => requestDelete(post.id, post.title)} className="btn-delete" title="حذف"><i className="ph ph-trash"></i></button>
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
