var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://ak.sv", "Akwam", function(title) { return "/search?q=" + encodeURIComponent(title); }, null);
module.exports = { getStreams: scraper };