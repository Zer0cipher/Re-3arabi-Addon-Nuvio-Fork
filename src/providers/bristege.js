var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://bristege.com", "Bristege", null, null);
module.exports = { getStreams: scraper };