import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, fetchCached } from '../utils/supabase';

export default function RedirectHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirects, setRedirects] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load redirects once with caching
  useEffect(() => {
    let isMounted = true;
    fetchCached('redirects_all', () =>
      supabase.from('redirects').select('source_url, target_url, status_code')
    ).then(({ data, error }) => {
      if (!error && data && isMounted) {
        setRedirects(data);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, []);

  // Listen to path changes and match redirects
  useEffect(() => {
    if (loading || !redirects) return;

    const currentPath = location.pathname + location.search;
    const match = redirects.find(
      r => r.source_url.toLowerCase() === currentPath.toLowerCase() ||
           decodeURIComponent(r.source_url).toLowerCase() === currentPath.toLowerCase()
    );

    if (match) {
      if (match.target_url.startsWith('http')) {
        window.location.replace(match.target_url);
      } else {
        navigate(match.target_url, { replace: true });
      }
    }
  }, [location, redirects, loading, navigate]);

  return children;
}
