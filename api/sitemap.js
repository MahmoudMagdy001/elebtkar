const DEFAULT_SITE_URL = "https://elebtkar.vercel.app";
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fdevgkvjloezhyelciqb.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZXZna3ZqbG9lemh5ZWxjaXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTQ5MzgsImV4cCI6MjA4ODYzMDkzOH0.hahG-eXojQZulQPTRJ59rn3oaqGcuHWEHn6YVChAE_M";

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

async function fetchSupabase(table, selectQuery, extraQuery = "") {
  const endpoint = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(
    selectQuery
  )}${extraQuery}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    return { ok: false, data: [] };
  }

  const payload = await response.json();
  return { ok: true, data: Array.isArray(payload) ? payload : [] };
}

async function fetchRowsWithFallback(table, queries) {
  for (const query of queries) {
    const result = await fetchSupabase(table, query.select, query.extraQuery || "");
    if (result.ok) return result.data;
  }

  return [];
}

function getLastMod(item) {
  return normalizeDate(
    item?.updated_at ||
      item?.modified_at ||
      item?.published_at ||
      item?.created_at ||
      item?.date
  );
}

function buildUrlEntry(loc, lastmod, changefreq, priority) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${xmlEscape(lastmod)}</lastmod>`,
    `    <changefreq>${xmlEscape(changefreq)}</changefreq>`,
    `    <priority>${xmlEscape(priority)}</priority>`,
    "  </url>",
  ].join("\n");
}

export default async function handler(req, res) {
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "elebtkar.vercel.app";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const siteUrl =
      process.env.SITE_URL || (host ? `${protocol}://${host}` : DEFAULT_SITE_URL);
    const today = new Date().toISOString().slice(0, 10);

    const staticEntries = [
      { loc: `${siteUrl}/`, lastmod: today, changefreq: "weekly", priority: "1.0" },
      { loc: `${siteUrl}/services`, lastmod: today, changefreq: "weekly", priority: "0.9" },
      { loc: `${siteUrl}/blog`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${siteUrl}/privacy-policy`, lastmod: today, changefreq: "monthly", priority: "0.4" },
      { loc: `${siteUrl}/terms-and-conditions`, lastmod: today, changefreq: "monthly", priority: "0.4" },
    ];

    const [services, posts] = await Promise.all([
      fetchRowsWithFallback("services", [
        { select: "slug,updated_at,created_at" },
        { select: "slug,created_at" },
        { select: "slug" },
      ]),
      fetchRowsWithFallback("posts", [
        { select: "slug,updated_at,created_at,published" },
        { select: "slug,created_at,published" },
        { select: "slug,created_at" },
        { select: "slug" },
      ]),
    ]);

    const dynamicServiceEntries = services
      .filter((item) => item?.slug)
      .map((item) => ({
        loc: `${siteUrl}/services/${encodeURIComponent(item.slug)}`,
        lastmod: getLastMod(item),
        changefreq: "weekly",
        priority: "0.7",
      }));

    const dynamicPostEntries = posts
      .filter((item) => item?.slug)
      .map((item) => ({
        loc: `${siteUrl}/blog/${encodeURIComponent(item.slug)}`,
        lastmod: getLastMod(item),
        changefreq: "weekly",
        priority: "0.6",
      }));

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...[...staticEntries, ...dynamicServiceEntries, ...dynamicPostEntries].map((entry) =>
        buildUrlEntry(entry.loc, entry.lastmod, entry.changefreq, entry.priority)
      ),
      "</urlset>",
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch (error) {
    const fallbackXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      buildUrlEntry(`${DEFAULT_SITE_URL}/`, new Date().toISOString().slice(0, 10), "weekly", "1.0"),
      "</urlset>",
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(fallbackXml);
  }
}
