import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from '../utils/lazyFramer';
import { Calendar, ArrowRight, Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { cn } from '../utils/cn';
import SEO from '../components/SEO';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        // navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-20 md:pt-36 pb-24 section-padding section-inner mx-auto animate-pulse">
        <SEO title="جاري التحميل..." />
        <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-full bg-gray-200 rounded mb-8" />
        <div className="h-96 md:h-[450px] bg-gray-200 rounded-2xl mb-10" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 md:pt-44 pb-24 section-padding text-center">
        <SEO title="المقال غير موجود" />
        <h2 className="text-3xl font-extrabold text-primary mb-4">المقال غير موجود</h2>
        <Link to="/blog" className="btn-primary">العودة للمدونة</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO 
        title={post.title}
        description={post.meta_description}
        image={post.featured_image_url}
        type="article"
        seoSettings={post.seo_settings}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.featured_image_url,
          "datePublished": post.created_at,
          "author": {
            "@type": "Organization",
            "name": "الابتكار"
          },
          "publisher": {
            "@type": "Organization",
            "name": "الابتكار",
            "logo": {
              "@type": "ImageObject",
              "url": "https://elebtikar-sa.com/images/logo.png"
            }
          },
          "description": post.meta_description
        }}
      />
      {/* Hero */}
      <header className="relative pt-24 md:pt-44 pb-32 section-padding bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="hidden md:block absolute top-[-20%] right-[-10%] md:w-[50%] md:h-[70%] bg-accent blur-[150px] rounded-full" />
          <div className="hidden md:block absolute bottom-[-20%] left-[-10%] md:w-[50%] md:h-[70%] bg-primary blur-[150px] rounded-full" />
        </div>

        <div className="max-w-[1000px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-right"
          >
            <Link to="/blog" className="inline-flex items-center gap-2 text-accent font-bold mb-8 hover:text-white transition-colors group">
              <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
              العودة للمدونة
            </Link>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center md:justify-start gap-2 text-white/70 text-sm font-bold">
              <Calendar size={16} className="text-accent" />
              <span>{new Date(post.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <section className="py-24 section-padding relative z-10 -mt-24 md:-mt-32">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Featured Image */}
            <div className="relative h-96 md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden mb-16 shadow-2xl border-4 border-white/10 group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none z-10" />
              <img
                src={post.featured_image_url || '/images/header.png'}
                alt={post.alt_text || post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px] gap-12 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
              <div 
                className="article-content prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <aside className="lg:sticky lg:top-[120px] h-fit">
                <div className="flex lg:flex-col gap-4 justify-center items-center">
                  <p className="text-[0.7rem] font-extrabold text-primary/40 uppercase tracking-widest hidden lg:block mb-2">مشاركة</p>
                  
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1da1f2] hover:text-white hover:border-transparent transition-all hover:-translate-y-1 shadow-sm"
                  >
                    <i className="ph ph-twitter-logo text-[20px]"></i>
                  </a>
                  
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1877f2] hover:text-white hover:border-transparent transition-all hover:-translate-y-1 shadow-sm"
                  >
                    <i className="ph ph-facebook-logo text-[20px]"></i>
                  </a>
                  
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#0a66c2] hover:text-white hover:border-transparent transition-all hover:-translate-y-1 shadow-sm"
                  >
                    <i className="ph ph-linkedin-logo text-[20px]"></i>
                  </a>
                  
                  <button 
                    onClick={handleCopyLink}
                    className={cn(
                      "w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm",
                      copied ? "bg-green-500 text-white border-transparent" : "text-gray-400 hover:bg-primary hover:text-white hover:border-transparent"
                    )}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PostDetail;
