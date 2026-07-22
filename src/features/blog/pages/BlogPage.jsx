import React, { useEffect, useState } from 'react';
import { motion } from '../../../shared/utils/lazyFramer';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { supabase } from '../../../shared/utils/supabase';
import SEO from '../../../shared/components/SEO';
import { usePageSettings } from '../../../shared/utils/usePageSettings';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings: pageSettings } = usePageSettings('blog');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, meta_description, featured_image_url, alt_text, created_at')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO 
        title="المدونة" 
        description="استكشف أحدث المقالات والنصائح في عالم التقنية، التسويق الرقمي، وتطوير الأعمال من خبراء وكالة ابتكار."
        seoSettings={pageSettings?.seo_settings}
      />
      {/* Hero */}
      <header className="relative pt-24 md:pt-44 pb-32 section-padding bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="hidden md:block absolute top-[-20%] right-[-10%] md:w-[50%] md:h-[70%] bg-accent blur-[150px] rounded-full" />
          <div className="hidden md:block absolute bottom-[-20%] left-[-10%] md:w-[50%] md:h-[70%] bg-primary blur-[150px] rounded-full" />
        </div>

        <div className="section-inner relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-right"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-accent font-bold mb-8 hover:text-white transition-colors group">
              <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
              العودة للرئيسية
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              المدونة
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-[700px] md:mr-0 md:ml-auto leading-relaxed">
              تعرف على أحدث الاستراتيجيات في عالم التسويق والتقنية
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <section className="py-24 section-padding relative z-10 -mt-16">
        <div className="section-inner">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-primary/5 text-primary/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">لا توجد مقالات حالياً</h2>
            <p className="text-gray-600">يرجى العودة لاحقاً لمتابعة جديدنا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group flex flex-col"
              >
                <Link to={`/blog/${post.slug}`} className="relative h-56 overflow-hidden block">
                  <img
                    src={post.featured_image_url || '/images/header.webp'}
                    alt={post.alt_text || post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-sm font-bold flex items-center gap-2">
                      اقرأ المزيد <ArrowLeft size={16} />
                    </span>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 font-bold">
                    <Calendar size={14} className="text-accent" />
                    <span>{new Date(post.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-primary mb-3 leading-tight group-hover:text-accent transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {post.meta_description}
                  </p>
                  
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                  >
                    عرض التفاصيل <ArrowLeft size={16} className="text-accent" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
