var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://aia2tv.com", "Aia2tv", null, null);
module.exports = { getStreams: scraper };