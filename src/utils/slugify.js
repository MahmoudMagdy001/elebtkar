/**
 * Converts a string to a URL-friendly slug.
 * - Replaces spaces with hyphens
 * - Removes special characters (keeps Arabic, English, numbers, hyphens)
 * - Collapses multiple hyphens into one
 * - Trims leading/trailing hyphens
 * - Lowercases English letters
 */
export const slugifyLive = (text) => {
  if (!text) return '';
  return text
    .toString()
    .trimStart() // only trim start so trailing spaces can become hyphens
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '') // Remove special chars (keep Arabic, English, numbers, hyphens)
    .replace(/-+/g, '-');            // Collapse multiple hyphens
};

export const slugify = (text) => {
  if (!text) return '';
  return slugifyLive(text).replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens on final save
};
