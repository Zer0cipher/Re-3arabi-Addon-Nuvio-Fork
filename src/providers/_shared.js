/**
 * _shared.js - Universal Utilities for Nuvio Arabic Scrapers
 * Designed for React Native (Hermes) runtime compatibility.
 */

const { getOrUpdateDomain } = require('./confighelper.js');

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin'
};

// ==========================================
// HTTP REQUEST UTILITIES
// ==========================================

function fetchText(url, customHeaders = {}) {
  if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return Promise.resolve(null);
  }

  return fetch(url, {
    headers: { ...DEFAULT_HEADERS, ...customHeaders }
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
    return res.text();
  })
  .catch(err => {
    console.error(`[Shared Fetch Error] ${url}:`, err.message || err);
    return null;
  });
}

function fetchJSON(url, customHeaders = {}) {
  if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return Promise.resolve(null);
  }

  return fetch(url, {
    headers: {
      ...DEFAULT_HEADERS,
      'Accept': 'application/json',
      ...customHeaders
    }
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .catch(err => {
    console.error(`[Shared JSON Error] ${url}:`, err.message || err);
    return null;
  });
}

function postForm(url, formObj = {}, customHeaders = {}) {
  if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return Promise.resolve(null);
  }

  const bodyParams = Object.keys(formObj || {})
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(formObj[key])}`)
    .join('&');

  return fetch(url, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...customHeaders
    },
    body: bodyParams
  })
  .then(res => res.text())
  .catch(err => {
    console.error(`[Shared POST Error] ${url}:`, err.message || err);
    return null;
  });
}

// ==========================================
// REGEX & PARSING HELPERS
// ==========================================

function extractSingle(html, regex, groupIndex = 1) {
  if (!html || typeof html !== 'string') return null;
  const match = html.match(regex);
  return match && match[groupIndex] ? match[groupIndex].trim() : null;
}

function extractAll(html, regex) {
  if (!html || typeof html !== 'string') return [];
  const matches = [];
  let match;
  const gRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  while ((match = gRegex.exec(html)) !== null) {
    matches.push(match);
  }
  return matches;
}

function extractIframeSrc(html) {
  if (!html || typeof html !== 'string') return null;
  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return iframeMatch ? iframeMatch[1] : null;
}

function extractDirectMedia(html) {
  if (!html || typeof html !== 'string') return null;
  const mediaMatch = html.match(/(https?:\/\/[^"'\s]+\.(?:m3u8|mp4)[^"'\s]*)/i);
  return mediaMatch ? mediaMatch[1] : null;
}

// ==========================================
// STRING & URL HELPERS
// ==========================================

function fixUrl(url, baseUrl) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  
  const cleanBase = (baseUrl && typeof baseUrl === 'string' && baseUrl.endsWith('/')) ? baseUrl.slice(0, -1) : (baseUrl || '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
}

function cleanTitle(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchTitle(urlOrObj, customHeaders = {}) {
  if (!urlOrObj) return Promise.resolve('');
  
  // If an object with title/name properties was passed (e.g. from test runners)
  if (typeof urlOrObj === 'object') {
    if (urlOrObj.title) return Promise.resolve(urlOrObj.title);
    if (urlOrObj.name) return Promise.resolve(urlOrObj.name);
    return Promise.resolve('');
  }

  // If a web URL was passed, fetch the HTML title
  if (typeof urlOrObj === 'string' && urlOrObj.startsWith('http')) {
    return fetchText(urlOrObj, customHeaders)
      .then(function(html) {
        if (!html) return '';
        return extractSingle(html, /<title[^>]*>([^<]+)<\/title>/i) || '';
      });
  }

  // If a raw title string was passed directly
  if (typeof urlOrObj === 'string') {
    return Promise.resolve(urlOrObj);
  }

  return Promise.resolve('');
}

function decodeBase64(str) {
  try {
    if (typeof atob === 'function') {
      return atob(str);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = String(str).replace(/=+$/, '');
    for (
      let block = 0, charCode, i = 0;
      (charCode = str.charAt(i++));
      ~charCode && ((block = i % 4 ? block * 64 + charCode : charCode), i % 4)
        ? (output += String.fromCharCode(255 & (block >> ((-2 * i) & 6))))
        : 0
    ) {
      charCode = chars.indexOf(charCode);
    }
    return output;
  } catch (err) {
    return null;
  }
}

// ==========================================
// STREAM RESPONSE FORMATTER & FACTORY
// ==========================================

function createStream(providerName, streamUrl, quality = '1080p', title = '', headers = {}) {
  return {
    name: providerName,
    title: title || `${providerName} - ${quality}`,
    url: streamUrl,
    quality: quality,
    headers: { ...DEFAULT_HEADERS, ...headers }
  };
}

function createGenericScraper(baseUrl, providerName, searchPath, customHandler) {
  return function(argsOrId, type, season, episode, title) {
    let tmdbId, mediaType, s, e, searchTitle;

    if (typeof argsOrId === 'object' && argsOrId !== null) {
      tmdbId = argsOrId.tmdbId;
      mediaType = argsOrId.type || argsOrId.mediaType;
      s = argsOrId.season;
      e = argsOrId.episode;
      searchTitle = argsOrId.title;
    } else {
      tmdbId = argsOrId;
      mediaType = type;
      s = season;
      e = episode;
      searchTitle = title;
    }

    try {
      if (typeof customHandler === 'function') {
        return Promise.resolve(getOrUpdateDomain(providerName, baseUrl))
          .then(function(activeBaseUrl) {
            return customHandler(activeBaseUrl, mediaType, s, e, tmdbId, searchTitle);
          })
          .then(function(results) {
            return Array.isArray(results) ? results : [];
          })
          .catch(function(err) {
            console.error(`[${providerName} Error]:`, err.message || err);
            return [];
          });
      }
    } catch (err) {
      console.error(`[${providerName} Error]:`, err.message || err);
    }
    return Promise.resolve([]);
  };
}

module.exports = {
  DEFAULT_HEADERS,
  fetchText,
  fetchJSON,
  postForm,
  extractSingle,
  extractAll,
  extractIframeSrc,
  extractDirectMedia,
  fixUrl,
  cleanTitle,
  fetchTitle,
  decodeBase64,
  createStream,
  createGenericScraper
};