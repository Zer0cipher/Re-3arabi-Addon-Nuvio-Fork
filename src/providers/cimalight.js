var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://cimalight.com", "Cimalight", null, null);
module.exports = { getStreams: scraper };