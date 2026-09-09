var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://shahidwbas.org", "Shahidwbas", null, null);
module.exports = { getStreams: scraper };