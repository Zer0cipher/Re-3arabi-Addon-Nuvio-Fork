var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://replaymatch.com", "Replaymatch", null, null);
module.exports = { getStreams: scraper };