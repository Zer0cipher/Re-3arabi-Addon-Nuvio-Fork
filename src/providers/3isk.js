var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://3isk.biz", "3isk", null, function(url, type, s, e) {
  return (type === "tv" && e) ? url.replace(/\/$/, "") + "-الحلقة-" + e + "/" : url;
});
module.exports = { getStreams: scraper };