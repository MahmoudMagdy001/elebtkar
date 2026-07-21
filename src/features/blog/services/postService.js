// ponytail: Direct Supabase service wrapper for blog posts & categories management.
import { supabase } from '../../../shared/utils/supabase';

export const postService = {
  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, published, created_at, status')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getPostById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updatePost(id, postData) {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deletePost(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug');
    if (error) throw error;
    return data;
  }
};
