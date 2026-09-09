var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://lodynet.com", "Lodynet", null, null);
module.exports = { getStreams: scraper };