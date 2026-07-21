// ponytail: Premium blog list view showing posts with status badges, publication dates, and action triggers.
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { ConfirmModal } from '../../../shared/admin/ConfirmModal';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Loading';

export default function AdminPosts() {
  const navigate = useNavigate();
  const { posts, loading, error, refetch, deletePost } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    type: 'confirm', 
    title: '', 
    message: '', 
    id: null,
    itemTitle: ''
  });

  const handleDeleteRequest = (id, title) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف المقال: "${title}"؟`,
      id,
      itemTitle: title
    });
  };

  const handleConfirmDelete = async () => {
    const { id, itemTitle } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    
    const success = await deletePost(id);
    if (success) {
      setModalConfig({ 
        isOpen: true, 
        type: 'alert', 
        title: 'تم الحذف', 
        message: `تم حذف المقال "${itemTitle}" بنجاح!` 
      });
    } else {
      setModalConfig({ 
        isOpen: true, 
        type: 'alert', 
        title: 'خطأ أثناء الحذف', 
        message: 'فشل حذف المقال، يرجى المحاولة لاحقاً.' 
      });
    }
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">المدونة (Posts)</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">إدارة ونشر مقالات وكالة ابتكار والـ SEO</p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button variant="secondary" onClick={() => navigate('/admin/posts/new')}>
            <i className="ph ph-plus-circle text-lg" />
            <span>إضافة تدوينة جديدة</span>
          </Button>
          <Button variant="outline" className="p-2.5 h-10 w-10 min-w-0" onClick={refetch}>
            <i className="ph ph-arrows-clockwise text-lg" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="justify-between">
          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="ابحث عن مقال..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pr-10 pl-4 py-2 border border-primary-100/80 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 transition-all font-almarai"
            />
            <i className="ph ph-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          </div>
          <span className="text-xs font-bold text-gray-400">إجمالي المقالات: {filteredPosts.length}</span>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner className="w-10 h-10 border-t-accent" /></div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 font-bold">{error}</div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold">لا توجد مقالات مطابقة للبحث.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-primary-50/40 border-b border-primary-100/50">
                    <th className="p-4 font-extrabold text-primary">عنوان المقال</th>
                    <th className="p-4 font-extrabold text-primary">الرابط (Slug)</th>
                    <th className="p-4 font-extrabold text-primary">الحالة</th>
                    <th className="p-4 font-extrabold text-primary">تاريخ النشر</th>
                    <th className="p-4 font-extrabold text-primary text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-primary-50/20 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{post.title}</td>
                      <td className="p-4 font-mono text-xs text-gray-500" dir="ltr">{post.slug}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          post.status === 'published' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : post.status === 'scheduled' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {post.status === 'published' ? 'منشور' : post.status === 'scheduled' ? 'مجدول' : 'مسودة'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 font-bold">
                        {new Date(post.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            title="تعديل"
                          >
                            <i className="ph ph-pencil-simple text-base" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(post.id, post.title)}
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

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        isAlert={modalConfig.type === 'alert'}
        onConfirm={modalConfig.type === 'confirm' ? handleConfirmDelete : closeModal}
        onCancel={closeModal}
      />
    </div>
  );
}
