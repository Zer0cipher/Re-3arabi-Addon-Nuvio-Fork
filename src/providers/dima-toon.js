var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://dimatoon.com", "Dima Toon", null, null);
module.exports = { getStreams: scraper };