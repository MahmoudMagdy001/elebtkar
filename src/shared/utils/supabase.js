import { createClient } from '@supabase/supabase-js';

// ponytail: Load Supabase credentials from Vite environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const queryCache = new Map();
const pendingPromises = new Map();

/**
 * Deduplicates concurrent identical queries and caches results in memory.
 * @param {string} cacheKey - Unique key for the query
 * @param {Function} queryFn - Function executing the Supabase query
 * @param {number} [ttlMs=300000] - Cache TTL (default 5 minutes)
 */
export async function fetchCached(cacheKey, queryFn, ttlMs = 300000) {
  if (queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey);
    if (Date.now() - cached.timestamp < ttlMs) {
      return cached.result;
    }
    queryCache.delete(cacheKey);
  }

  if (pendingPromises.has(cacheKey)) {
    return pendingPromises.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const res = await queryFn();
      if (!res.error && res.data) {
        queryCache.set(cacheKey, { result: res, timestamp: Date.now() });
      }
      return res;
    } catch (err) {
      return { data: null, error: err };
    } finally {
      pendingPromises.delete(cacheKey);
    }
  })();

  pendingPromises.set(cacheKey, promise);
  return promise;
}


