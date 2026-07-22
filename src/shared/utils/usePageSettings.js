// ponytail: Simple custom hook to fetch page content and SEO from database, caching locally in-memory.
import { useState, useEffect } from 'react';
import { supabase, fetchCached } from './supabase';

/**
 * Custom hook to load page settings (SEO and content) dynamically from Supabase.
 * @param {string} pageName - Unique name identifier of the page in the database.
 * @returns {{settings: Object|null, loading: boolean}}
 */
export function usePageSettings(pageName) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      try {
        const res = await fetchCached(`page_${pageName}`, () =>
          supabase.from('pages').select('*').eq('name', pageName).single()
        );

        if (!res.error && res.data) {
          if (isMounted) setSettings(res.data);
        }
      } catch (err) {
        console.error(`Error loading page settings for ${pageName}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [pageName]);

  return { settings, loading };
}
