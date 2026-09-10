var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin"
    };
    function fetchText(url, customHeaders = {}) {
      return fetch(url, {
        headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), customHeaders)
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
        return res.text();
      }).catch((err) => {
        console.error(`[Shared Fetch Error] ${url}:`, err.message || err);
        return null;
      });
    }
    function fetchJSON(url, customHeaders = {}) {
      return fetch(url, {
        headers: __spreadValues(__spreadProps(__spreadValues({}, DEFAULT_HEADERS), {
          "Accept": "application/json"
        }), customHeaders)
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }).catch((err) => {
        console.error(`[Shared JSON Error] ${url}:`, err.message || err);
        return null;
      });
    }
    function postForm(url, formObj = {}, customHeaders = {}) {
      const bodyParams = Object.keys(formObj).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(formObj[key])}`).join("&");
      return fetch(url, {
        method: "POST",
        headers: __spreadValues(__spreadProps(__spreadValues({}, DEFAULT_HEADERS), {
          "Content-Type": "application/x-www-form-urlencoded"
        }), customHeaders),
        body: bodyParams
      }).then((res) => res.text()).catch((err) => {
        console.error(`[Shared POST Error] ${url}:`, err.message || err);
        return null;
      });
    }
    function extractSingle(html, regex, groupIndex = 1) {
      if (!html) return null;
      const match = html.match(regex);
      return match && match[groupIndex] ? match[groupIndex].trim() : null;
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
    function extractIframeSrc(html) {
      if (!html) return null;
      const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      return iframeMatch ? iframeMatch[1] : null;
    }
    function extractDirectMedia(html) {
      if (!html) return null;
      const mediaMatch = html.match(/(https?:\/\/[^"'\s]+\.(?:m3u8|mp4)[^"'\s]*)/i);
      return mediaMatch ? mediaMatch[1] : null;
    }
    function fixUrl(url, baseUrl) {
      if (!url) return "";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      if (url.startsWith("//")) return `https:${url}`;
      const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const cleanUrl = url.startsWith("/") ? url : `/${url}`;
      return `${cleanBase}${cleanUrl}`;
    }
    function cleanTitle(title) {
      if (!title) return "";
      return title.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
    }
    function fetchTitle(url, customHeaders = {}) {
      return fetchText(url, customHeaders).then(function(html) {
        if (!html) return "";
        return extractSingle(html, /<title[^>]*>([^<]+)<\/title>/i) || "";
      });
    }
    function decodeBase64(str) {
      try {
        if (typeof atob === "function") {
          return atob(str);
        }
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let output = "";
        str = String(str).replace(/=+$/, "");
        for (let block = 0, charCode, i = 0; charCode = str.charAt(i++); ~charCode && (block = i % 4 ? block * 64 + charCode : charCode, i % 4) ? output += String.fromCharCode(255 & block >> (-2 * i & 6)) : 0) {
          charCode = chars.indexOf(charCode);
        }
        return output;
      } catch (err) {
        return null;
      }
    }
    function createStream(providerName, streamUrl, quality = "1080p", title = "", headers = {}) {
      return {
        name: providerName,
        title: title || `${providerName} - ${quality}`,
        url: streamUrl,
        quality,
        headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), headers)
      };
    }
    function createGenericScraper(baseUrl, providerName, searchPath, customHandler) {
      return function(argsOrId, type, season, episode, title) {
        let tmdbId, mediaType, s, e, searchTitle;
        if (typeof argsOrId === "object" && argsOrId !== null) {
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
          if (typeof customHandler === "function") {
            return Promise.resolve(customHandler(baseUrl, mediaType, s, e, tmdbId, searchTitle)).then(function(results) {
              return Array.isArray(results) ? results : [];
            }).catch(function(err) {
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
    module2.exports = {
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
  }
});

// src/providers/3isk.js
var shared = require_shared();
var scraper = shared.createGenericScraper("https://3isk.biz", "3isk", null, function(url, type, s, e) {
  return type === "tv" && e ? url.replace(/\/$/, "") + "-\u0627\u0644\u062D\u0644\u0642\u0629-" + e + "/" : url;
});
module.exports = { getStreams: scraper };
