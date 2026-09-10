const fs = require('fs').promises;
const path = require('path');

const CONFIG_PATH = path.resolve(__dirname, '../../scrapers.config.json');
const TIMEOUT_MS = 5000;
const COMMON_TLDS = ['.sarl', '.live', '.cam', '.site', '.net', '.co', '.org', '.top', '.tv', '.com', '.me', '.run', '.vip', '.pro'];
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function testUrl(url, keywords = []) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) return { ok: false, finalUrl: null };

    const finalUrl = res.url;
    if (finalUrl.includes('expireddomains') || finalUrl.includes('dan.com') || finalUrl.includes('sedo.com')) {
      return { ok: false, finalUrl: null };
    }

    const html = (await res.text()).toLowerCase();
    const isValid = keywords.length === 0 || keywords.some(kw => html.includes(kw.toLowerCase()));

    return { ok: isValid, finalUrl };
  } catch {
    return { ok: false, finalUrl: null };
  }
}

function generateCandidateDomains(baseUrl) {
  const candidates = new Set();
  try {
    const parsed = new URL(baseUrl);
    const domainParts = parsed.hostname.replace(/^www\./, '').split('.');
    const rawName = domainParts[0];

    for (const tld of COMMON_TLDS) {
      candidates.add(`${parsed.protocol}//${rawName}${tld}`);
      candidates.add(`${parsed.protocol}//www.${rawName}${tld}`);
    }
  } catch {}
  return Array.from(candidates);
}

async function searchDuckDuckGo(query) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return [];

    const html = await res.text();
    const matches = [...html.matchAll(/class="result__url"[^>]*href="\/l\/\?uddg=([^&"]+)"/g)];

    return [...new Set(matches.map(m => {
      try {
        const parsed = new URL(decodeURIComponent(m[1]));
        return `${parsed.protocol}//${parsed.hostname}`;
      } catch {
        return null;
      }
    }).filter(Boolean))];
  } catch {
    return [];
  }
}

async function getOrUpdateDomain(providerId, defaultBaseUrl) {
  try {
    const rawData = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(rawData);
    const provider = config.providers[providerId];

    if (!provider) return defaultBaseUrl;

    // 1. Test current primary URL
    const primaryCheck = await testUrl(provider.baseUrl, provider.keywords);
    if (primaryCheck.ok) return provider.baseUrl;

    console.warn(`[${providerId}] Primary domain offline (${provider.baseUrl}). Testing fallbacks...`);

    // 2. Test pre-configured fallbacks
    for (const fallback of provider.fallbacks || []) {
      const fallbackCheck = await testUrl(fallback, provider.keywords);
      if (fallbackCheck.ok) {
        return await updateConfigAndReturn(config, providerId, fallbackCheck.finalUrl.replace(/\/$/, ''));
      }
    }

    // 3. Probe TLD variations dynamically
    console.warn(`[${providerId}] Fallbacks failed. Probing TLD variations...`);
    for (const candidate of generateCandidateDomains(provider.baseUrl)) {
      const candidateCheck = await testUrl(candidate, provider.keywords);
      if (candidateCheck.ok) {
        return await updateConfigAndReturn(config, providerId, candidateCheck.finalUrl.replace(/\/$/, ''));
      }
    }

    // 4. Search web for live active mirror
    console.warn(`[${providerId}] Searching web for active domain...`);
    const searchResults = await searchDuckDuckGo(`موقع ${provider.name || providerId} الاصلي`);
    for (const url of searchResults) {
      const searchCheck = await testUrl(url, provider.keywords);
      if (searchCheck.ok) {
        return await updateConfigAndReturn(config, providerId, searchCheck.finalUrl.replace(/\/$/, ''));
      }
    }

    return provider.baseUrl || defaultBaseUrl;
  } catch (err) {
    return defaultBaseUrl;
  }
}

async function updateConfigAndReturn(config, providerId, newUrl) {
  const provider = config.providers[providerId];
  if (provider && !provider.fallbacks.includes(provider.baseUrl)) {
    provider.fallbacks.push(provider.baseUrl);
  }
  if (provider) provider.baseUrl = newUrl;
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  return newUrl;
}

module.exports = { getOrUpdateDomain };