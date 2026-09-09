var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://egydead.pro", "Egydead", function(title) { return "/?s=" + encodeURIComponent(title); }, null);
module.exports = { getStreams: scraper };