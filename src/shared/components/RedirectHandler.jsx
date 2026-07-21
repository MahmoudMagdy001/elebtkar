// ponytail: Simple client-side router hook to handle 301/302 redirects defined by CMS.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

let redirectsCache = null;

export default function RedirectHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirects, setRedirects] = useState(redirectsCache);
  const [loading, setLoading] = useState(!redirectsCache);

  // Load redirects once
  useEffect(() => {
    if (redirectsCache) {
      setRedirects(redirectsCache);
      setLoading(false);
      return;
    }

    let isMounted = true;
    supabase
      .from('redirects')
      .select('source_url, target_url, status_code')
      .then(({ data, error }) => {
        if (!error && data) {
          redirectsCache = data;
          if (isMounted) {
            setRedirects(data);
            setLoading(false);
          }
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
