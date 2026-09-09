var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://tuniflix.com", "Tuniflix", null, null);
module.exports = { getStreams: scraper };