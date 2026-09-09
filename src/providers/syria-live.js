var shared = require('./_shared.js');
function getStreams(tmdbId, mediaType) {
  var streams = [
    { name: "Syria Live", title: "Syria Drama Live", url: "https://live.syria-live.net/drama/playlist.m3u8", quality: "720p", headers: { "User-Agent": shared.UA } }
  ];
  return Promise.resolve(streams);
}
module.exports = { getStreams: getStreams };