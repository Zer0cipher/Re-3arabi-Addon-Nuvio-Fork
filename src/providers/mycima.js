var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://mycima.out", "MyCima", function(title) { return "/search/" + encodeURIComponent(title); }, null);
module.exports = { getStreams: scraper };