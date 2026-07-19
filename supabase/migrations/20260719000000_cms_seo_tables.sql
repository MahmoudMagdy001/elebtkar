-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  seo_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  seo_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create redirects table
CREATE TABLE IF NOT EXISTS redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  status_code INTEGER DEFAULT 301 NOT NULL CHECK (status_code IN (301, 302)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create site_settings table (singleton row to store site config, scripts, robots rule)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT DEFAULT 'الابتكار' NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  site_description TEXT,
  default_seo JSONB DEFAULT '{}'::jsonb,
  scripts JSONB DEFAULT '{"head": "", "body_start": "", "body_end": ""}'::jsonb,
  verification_codes JSONB DEFAULT '{"google": "", "bing": "", "yandex": ""}'::jsonb,
  robots_txt TEXT DEFAULT 'User-agent: *'::text,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row for site_settings
INSERT INTO site_settings (id, site_name) 
VALUES (1, 'الابتكار') 
ON CONFLICT (id) DO NOTHING;

-- 5. Create media_library table (for image optimization / ALT management)
CREATE TABLE IF NOT EXISTS media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size_bytes INTEGER,
  mime_type TEXT,
  alt_text TEXT DEFAULT '',
  title TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Extend posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'الابتكار';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_title TEXT DEFAULT '';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_caption TEXT DEFAULT '';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{}'::jsonb;

-- 7. Extend services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{}'::jsonb;
