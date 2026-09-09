var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://witanime.com", "Witanime", null, function(url, type, s, e) {
  return (type === "tv" && e) ? url.replace("/anime/", "/episode/") + "-الحلقة-" + e + "/" : url;
});
module.exports = { getStreams: scraper };