var shared = require('./_shared.js');
var scraper = shared.createGenericScraper("https://tuniflexblog.com", "TuniflexBlog", null, null);
module.exports = { getStreams: scraper };