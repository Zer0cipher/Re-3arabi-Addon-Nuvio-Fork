// Base headers required to pass simple Cloudflare / anti-bot checks on Arabic sites
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate'
};

/**
 * Safe fetch wrapper that returns raw HTML/Text
 */
async function fetchText(url, customHeaders = {}) {
  try {
    const res = await fetch(url, {
      headers: { ...DEFAULT_HEADERS, ...customHeaders }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.error(`[Shared Fetch Error] ${url}:`, err);
    return null;
  }
}

/**
 * Safe fetch wrapper for JSON APIs
 */
async function fetchJSON(url, customHeaders = {}) {
  try {
    const res = await fetch(url, {
      headers: { 
        ...DEFAULT_HEADERS, 
        'Accept': 'application/json',
        ...customHeaders 
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`[Shared JSON Error] ${url}:`, err);
    return null;
  }
}

/**
 * Regex helper to pull a single capture group from HTML string
 */
function extractSingle(html, regex, groupIndex = 1) {
  if (!html) return null;
  const match = html.match(regex);
  return match ? match[groupIndex] : null;
}

/**
 * Regex helper to pull all occurrences of a pattern from HTML string
 */
function extractAll(html, regex) {
  if (!html) return [];
  const matches = [];
  let match;
  // Ensure the global flag 'g' is present
  const gRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  while ((match = gRegex.exec(html)) !== null) {
    matches.push(match);
  }
  return matches;
}

module.exports = {
  DEFAULT_HEADERS,
  fetchText,
  fetchJSON,
  extractSingle,
  extractAll
};