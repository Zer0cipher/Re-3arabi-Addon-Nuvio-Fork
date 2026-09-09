var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://eseek.com", "Eseek", null, null);
module.exports = { getStreams: scraper };