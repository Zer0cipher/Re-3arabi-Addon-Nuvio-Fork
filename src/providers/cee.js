var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://cee.org", "Cee", null, null);
module.exports = { getStreams: scraper };