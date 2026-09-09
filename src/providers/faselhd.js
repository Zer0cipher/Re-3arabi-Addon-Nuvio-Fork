var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://www.faselhd.club", "FaselHD", null, function(url, type, s, e) {
  return (type === "tv" && s && e) ? url.replace(/\/$/, "") + "-season-" + s + "-episode-" + e : url;
});
module.exports = { getStreams: scraper };