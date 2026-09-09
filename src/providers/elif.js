var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://elif.com", "Elif", null, null);
module.exports = { getStreams: scraper };