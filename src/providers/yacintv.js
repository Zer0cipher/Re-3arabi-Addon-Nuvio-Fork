var shared = require('./_shared.js');
function getStreams(tmdbId, mediaType) {
  var streams = [
    { name: "YacinTV", title: "BeIN Sports 1 HD", url: "https://live.yacintv.one/bein1/playlist.m3u8", quality: "720p", headers: { "User-Agent": shared.UA } },
    { name: "YacinTV", title: "BeIN Sports 2 HD", url: "https://live.yacintv.one/bein2/playlist.m3u8", quality: "720p", headers: { "User-Agent": shared.UA } },
    { name: "YacinTV", title: "SSC Sports 1 HD", url: "https://live.yacintv.one/ssc1/playlist.m3u8", quality: "720p", headers: { "User-Agent": shared.UA } }
  ];
  return Promise.resolve(streams);
}
module.exports = { getStreams: getStreams };