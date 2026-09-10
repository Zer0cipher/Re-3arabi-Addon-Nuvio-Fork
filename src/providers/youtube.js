var shared = require('./_shared.js');
var BASE_URL = 'https://www.youtube.com/';

function getStreams(tmdbId, mediaType) {
  return shared.fetchTitle(tmdbId, mediaType)
    .then(function(title) {
      return fetch(`${BASE_URL}/results?search_query=${encodeURIComponent(title + " كامل")}`, {
        headers: { "User-Agent": shared.UA }
      });
    })
    .then(function(res) { return res.text(); })
    .then(function(html) {
      var matches = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/g) || [];
      var streams = [];
      var seen = {};
      for (var i = 0; i < matches.length && streams.length < 3; i++) {
        var videoId = matches[i].replace("/watch?v=", "");
        if (!seen[videoId]) {
          seen[videoId] = true;
          streams.push({
            name: "YouTube Arabic",
            title: "Full Video Stream",
            url: `${BASE_URL}/watch?v=${videoId}`,
            quality: "720p",
            headers: { "User-Agent": shared.UA }
          });
        }
      }
      return streams;
    })
    .catch(function() { return []; });
}

module.exports = { getStreams: getStreams };