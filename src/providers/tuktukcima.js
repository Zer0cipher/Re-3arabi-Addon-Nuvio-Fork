var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://tuktukcima.com", "TukTukcima", null, null);
module.exports = { getStreams: scraper };