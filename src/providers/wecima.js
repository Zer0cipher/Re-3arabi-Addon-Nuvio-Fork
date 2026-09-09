var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://wecima.tube", "WeCima", function(title) { return "/search/" + encodeURIComponent(title) + "/"; }, function(url, type, s, e) {
  return (type === "tv" && s && e) ? url.replace(/\/watch\//, "/episode/") + "-موسم-" + s + "-حلقة-" + e + "/" : url;
});
module.exports = { getStreams: scraper };