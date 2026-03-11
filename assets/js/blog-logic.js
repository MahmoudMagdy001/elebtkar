// ─────────────────────────────────────────────
//  blog-logic.js  —  Supabase Blog CRUD Helpers
//  IMPORTANT: Replace the two placeholder values
//  below with your real Supabase project URL and
//  anon public key before going live.
// ─────────────────────────────────────────────

// Credentials are loaded from /js/config.js (must be included before this script)
if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
  console.error('Supabase config missing! Make sure /js/config.js is loaded before blog-logic.js');
}

// Initialise the Supabase client using the CDN build
const { createClient } = supabase;
const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ─── Image Upload ─────────────────────────────
/**
 * Uploads a File object to the `article-images` storage bucket.
 * Returns the permanent public URL of the uploaded image.
 * @param {File} file
 * @returns {Promise<string>} publicUrl
 */
async function uploadFeaturedImage(file) {
  const ext = file.name.split('.').pop();
  // Use a timestamp prefix to avoid name collisions
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await sb.storage
    .from('article-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

  const { data } = sb.storage.from('article-images').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Create Post ─────────────────────────────
/**
 * Inserts a new post row into the `posts` table.
 * @param {{title:string, slug:string, meta_description:string, content:string, featured_image_url:string, alt_text:string}} postData
 * @returns {Promise<object>} The inserted row
 */
async function createPost(postData) {
  const { data, error } = await sb
    .from('posts')
    .insert([postData])
    .select()
    .single();

  if (error) throw new Error(`Failed to create post: ${error.message}`);
  return data;
}

// ─── Fetch Single Post by Slug ────────────────
/**
 * Fetches a single published post from `posts` by its `slug`.
 * @param {string} slug
 * @returns {Promise<object|null>} Post row or null if not found
 */
async function getPostBySlug(slug) {
  const { data, error } = await sb
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // row not found
    throw new Error(`Failed to fetch post: ${error.message}`);
  }
  return data;
}

// ─── Fetch All Posts (for a blog listing page) ─
/**
 * Returns all published posts ordered by most recent.
 * @returns {Promise<object[]>}
 */
async function getAllPosts() {
  const { data, error } = await sb
    .from('posts')
    .select('id, title, slug, meta_description, featured_image_url, alt_text, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch posts: ${error.message}`);
  return data ?? [];
}

// ─── Delete Post ──────────────────────────────
/**
 * Deletes a post by its id.
 * @param {string|number} id
 */
async function deletePost(id) {
  const { error } = await sb.from('posts').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete post: ${error.message}`);
}

// ─── Update Post ──────────────────────────────
/**
 * Updates an existing post row in the `posts` table.
 * @param {string|number} id
 * @param {object} postData
 * @returns {Promise<object>} The updated row
 */
async function updatePost(id, postData) {
  const { data, error } = await sb
    .from('posts')
    .update(postData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update post: ${error.message}`);
  return data;
}

// ─── Delete Service ───────────────────────────
/**
 * Deletes a service by its id.
 * @param {string|number} id
 */
async function deleteService(id) {
  const { error } = await sb.from('services').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete service: ${error.message}`);
}

// ─── Update Service ──────────────────────────
/**
 * Updates an existing service row in the `services` table.
 * @param {string|number} id
 * @param {object} srvData
 * @returns {Promise<object>} The updated row
 */
async function updateService(id, srvData) {
  const { data, error } = await sb
    .from('services')
    .update(srvData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update service: ${error.message}`);
  return data;
}

// ─── Slug Generator ───────────────────────────
/**
 * Converts any English string into a URL-safe slug.
 * Example: "How to Link Tools" → "how-to-link-tools"
 * @param {string} text
 * @returns {string}
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip non-alphanumeric
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-');            // collapse multiple hyphens
}
