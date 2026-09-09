var shared = require('./_shared.js');
function getStreams(tmdbId, mediaType) {
  var streams = [
    { name: "TVgarden", title: "Arabic Live Channel", url: "https://live.tvgarden.com/stream/playlist.m3u8", quality: "720p", headers: { "User-Agent": shared.UA } }
  ];
  return Promise.resolve(streams);
}
module.exports = { getStreams: getStreams };