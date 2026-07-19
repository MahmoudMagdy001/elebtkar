// ponytail: Merges dynamic page SEO configurations with site-wide settings and schemas in the head.
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../utils/supabase';

let siteSettingsCache = null;

/**
 * SEO Component for managing page metadata dynamically.
 * Supports direct props or a unified seoSettings object from database.
 */
const SEO = ({ 
  title, 
  description, 
  canonical, 
  type = 'website', 
  image,
  keywords,
  schema,
  seoSettings = {}
}) => {
  const [siteSettings, setSiteSettings] = useState(siteSettingsCache);

  useEffect(() => {
    if (siteSettingsCache) {
      setSiteSettings(siteSettingsCache);
      return;
    }
    let isMounted = true;
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data && isMounted) {
          siteSettingsCache = data;
          setSiteSettings(data);
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Merge values: Page-specific props vs. DB seoSettings vs. DB siteSettings vs. hardcoded fallbacks
  const siteName = siteSettings?.site_name || 'الابتكار';
  const pageTitle = seoSettings?.meta_title || title;
  const fullTitle = pageTitle ? `${pageTitle} | ${siteName}` : siteName;

  const defaultDescription = siteSettings?.site_description || 'الابتكار: شريكك في التسويق الرقمي بالمملكة العربية السعودية. خدمات SEO، تطوير مواقع ومتاجر، إدارة تواصل اجتماعي، وذكاء اصطناعي. اطلب استشارتك المجانية الآن.';
  const metaDescription = seoSettings?.meta_description || description || defaultDescription;
  
  const baseUrl = window.location.origin;
  
  // Image handling
  const ogImgFromDB = seoSettings?.og_image || siteSettings?.default_seo?.og_image;
  const rawImage = ogImgFromDB || image;
  const metaImage = rawImage 
    ? (rawImage.startsWith('http') ? rawImage : `${baseUrl}${rawImage}`) 
    : `${baseUrl}/src/assets/images/logs.png`;

  // Canonical Url
  const metaUrl = seoSettings?.canonical_url || canonical || window.location.href;

  // Keywords
  const metaKeywords = seoSettings?.keywords || keywords || siteSettings?.default_seo?.keywords;

  // Robots directives
  const robotsIndex = seoSettings?.robots_index !== false; // default true
  const robotsFollow = seoSettings?.robots_follow !== false; // default true
  const robotsArchive = seoSettings?.robots_archive !== false; // default true
  const robotsSnippet = seoSettings?.robots_snippet !== false; // default true

  const robotsDirectives = [
    robotsIndex ? 'index' : 'noindex',
    robotsFollow ? 'follow' : 'nofollow',
    !robotsArchive && 'noarchive',
    !robotsSnippet && 'nosnippet'
  ].filter(Boolean).join(', ');

  // Schemas list
  const schemas = [];
  if (schema) schemas.push(schema);
  if (seoSettings?.json_ld) schemas.push(seoSettings.json_ld);
  if (seoSettings?.faq_schema) schemas.push(seoSettings.faq_schema);
  if (seoSettings?.article_schema) schemas.push(seoSettings.article_schema);
  if (seoSettings?.breadcrumb_schema) schemas.push(seoSettings.breadcrumb_schema);
  if (seoSettings?.organization_schema) schemas.push(seoSettings.organization_schema);

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <link rel="canonical" href={metaUrl} />
      <meta name="robots" content={robotsDirectives} />

      {/* Social OG */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoSettings?.og_title || fullTitle} />
      <meta property="og:description" content={seoSettings?.og_description || metaDescription} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={seoSettings?.twitter_card || "summary_large_image"} />
      <meta name="twitter:title" content={seoSettings?.og_title || fullTitle} />
      <meta name="twitter:description" content={seoSettings?.og_description || metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Search Engine Verifications */}
      {siteSettings?.verification_codes?.google && (
        <meta name="google-site-verification" content={siteSettings.verification_codes.google} />
      )}
      {siteSettings?.verification_codes?.bing && (
        <meta name="msvalidate.01" content={siteSettings.verification_codes.bing} />
      )}
      {siteSettings?.verification_codes?.yandex && (
        <meta name="yandex-verification" content={siteSettings.verification_codes.yandex} />
      )}
      
      <html lang="ar" dir="rtl" />

      {/* Structured Schema Injections */}
      {schemas.map((sch, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(sch)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
