var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://shahid4u.com", "Shahid4u", function(title) { return "/search?q=" + encodeURIComponent(title); }, function(url, type, s, e) {
  return (type === "tv" && s && e) ? url.replace(/\/watch\//, "/episode/") + "-موسم-" + s + "-حلقة-" + e : url;
});
module.exports = { getStreams: scraper };