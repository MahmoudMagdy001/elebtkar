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

// Initialize Supabase client for all pages
document.addEventListener('DOMContentLoaded', () => {
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
});

// Moyasar Configuration
window.MOYASAR_PUBLISHABLE_KEY = 'pk_test_GeBNMe6XGH9JBAfgP4FWRcZLXk7SrnSopAUcA6G8'; // قم باستبداله بمفتاحك الخاص من لوحة تحكم مويسر
