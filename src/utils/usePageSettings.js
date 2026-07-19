// ponytail: Simple custom hook to fetch page content and SEO from database, caching locally in-memory.
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const pageCache = {};

/**
 * Custom hook to load page settings (SEO and content) dynamically from Supabase.
 * @param {string} pageName - Unique name identifier of the page in the database.
 * @returns {{settings: Object|null, loading: boolean}}
 */
export function usePageSettings(pageName) {
  const [settings, setSettings] = useState(pageCache[pageName] || null);
  const [loading, setLoading] = useState(!pageCache[pageName]);

  useEffect(() => {
    if (pageCache[pageName]) {
      setSettings(pageCache[pageName]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchPage = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('name', pageName)
          .single();

        if (!error && data) {
          pageCache[pageName] = data;
          if (isMounted) setSettings(data);
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
