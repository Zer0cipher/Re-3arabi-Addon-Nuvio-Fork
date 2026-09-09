var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://viu.com", "Viu", null, null);
module.exports = { getStreams: scraper };