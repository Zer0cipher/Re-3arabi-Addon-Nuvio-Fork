var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://cimaclub.com", "CimaClub", null, null);
module.exports = { getStreams: scraper };