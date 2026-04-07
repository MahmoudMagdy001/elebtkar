/**
 * config.js — Supabase Configuration
 * ─────────────────────────────────────────────
 * Central place for all environment credentials.
 * Update SUPABASE_URL and SUPABASE_ANON_KEY here
 * when switching between staging / production.
 *
 * IMPORTANT:
 *  - NEVER use the service_role key here (it is private).
 *  - The anon key is safe to expose in the browser.
 */

window.SUPABASE_URL      = 'https://fdevgkvjloezhyelciqb.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZXZna3ZqbG9lemh5ZWxjaXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTQ5MzgsImV4cCI6MjA4ODYzMDkzOH0.hahG-eXojQZulQPTRJ59rn3oaqGcuHWEHn6YVChAE_M';

// Shared promise for Supabase readiness
window.SUPABASE_READY = new Promise((resolve) => {
  window._resolveSupabaseReady = resolve;
});

// Initialize Supabase client with retry mechanism
const initSupabaseClient = async () => {
  // Wait for Supabase library to be available
  let retries = 0;
  const maxRetries = 50;
  
  while (!window.supabase && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    try {
      window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      console.log('[Config] Supabase client initialized successfully');
      window._resolveSupabaseReady(true);
      return true;
    } catch (err) {
      console.error('[Config] Failed to initialize Supabase client:', err);
      window._resolveSupabaseReady(false);
      return false;
    }
  } else {
    console.warn('[Config] Supabase library or credentials not available');
    window._resolveSupabaseReady(false);
    return false;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initSupabaseClient();
});

// Moyasar Configuration
window.MOYASAR_PUBLISHABLE_KEY = 'pk_test_GeBNMe6XGH9JBAfgP4FWRcZLXk7SrnSopAUcA6G8'; // قم باستبداله بمفتاحك الخاص من لوحة تحكم مويسر
