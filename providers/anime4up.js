var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/providers/_shared.js
var require_shared = __commonJS({
  "src/providers/_shared.js"(exports2, module2) {
    var DEFAULT_HEADERS = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate"
    };
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
    async function fetchJSON(url, customHeaders = {}) {
      try {
        const res = await fetch(url, {
          headers: {
            ...DEFAULT_HEADERS,
            "Accept": "application/json",
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
    function extractSingle(html, regex, groupIndex = 1) {
      if (!html) return null;
      const match = html.match(regex);
      return match ? match[groupIndex] : null;
    }
    function extractAll(html, regex) {
      if (!html) return [];
      const matches = [];
      let match;
      const gRegex = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
      while ((match = gRegex.exec(html)) !== null) {
        matches.push(match);
      }
      return matches;
    }
    module2.exports = {
      DEFAULT_HEADERS,
      fetchText,
      fetchJSON,
      extractSingle,
      extractAll
    };
  }
});

// src/providers/anime4up.js
var shared = require_shared();
var scraper = shared.createGenericScraper("https://anime4up.com", "Anime4up", null, function(url, type, s, e) {
  return type === "tv" && e ? url.replace("/anime/", "/episode/") + "-\u0627\u0644\u062D\u0644\u0642\u0629-" + e + "/" : url;
});
module.exports = { getStreams: scraper };
