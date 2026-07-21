// ponytail: Standard hook to fetch, filter, and delete posts.
import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || 'خطأ في تحميل المقالات');
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id) => {
    setError(null);
    try {
      await postService.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'خطأ في حذف المقال');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    deletePost
  };
}
