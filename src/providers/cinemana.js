var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://cinemana.shabakaty.com", "Cinemana", null, null);
module.exports = { getStreams: scraper };