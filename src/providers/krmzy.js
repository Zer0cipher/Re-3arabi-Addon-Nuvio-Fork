var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://krmzy.com", "Krmzy", null, null);
module.exports = { getStreams: scraper };