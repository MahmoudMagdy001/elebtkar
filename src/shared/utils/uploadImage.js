import { supabase } from './supabase';

/**
 * Uploads a file to the 'article-images' Supabase storage bucket.
 * Returns the permanent public URL.
 * @param {File} file
 * @returns {Promise<string>} publicUrl
 */
export async function uploadImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('article-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw new Error(`فشل رفع الصورة: ${uploadError.message}`);

  const { data } = supabase.storage.from('article-images').getPublicUrl(path);
  return data.publicUrl;
}
