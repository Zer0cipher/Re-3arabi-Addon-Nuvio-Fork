var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://cimatn.com", "Cimatn", null, null);
module.exports = { getStreams: scraper };