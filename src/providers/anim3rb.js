var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://anim3rb.com", "Anim3rb", null, null);
module.exports = { getStreams: scraper };