var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://alooytv.com", "Alooytv", null, null);
module.exports = { getStreams: scraper };