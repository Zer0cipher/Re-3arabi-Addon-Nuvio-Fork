var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://anime-phoenix.com", "Anime-Phoenix", null, null);
module.exports = { getStreams: scraper };