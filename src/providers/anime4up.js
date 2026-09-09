var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://anime4up.com", "Anime4up", null, function(url, type, s, e) {
  return (type === "tv" && e) ? url.replace("/anime/", "/episode/") + "-الحلقة-" + e + "/" : url;
});
module.exports = { getStreams: scraper };