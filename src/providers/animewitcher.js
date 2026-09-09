var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://animewitcher.com", "Animewitcher", null, null);
module.exports = { getStreams: scraper };