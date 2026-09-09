var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://topcinema.top", "Topcinema", null, null);
module.exports = { getStreams: scraper };