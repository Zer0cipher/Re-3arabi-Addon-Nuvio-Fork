var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://aflaam.com", "Aflaam", null, null);
module.exports = { getStreams: scraper };