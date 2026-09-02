var urlLib = require('./url.js');
var extractYouTubeId = urlLib.extractYouTubeId;
var getThumbnailUrl = urlLib.getThumbnailUrl;

function resolveVideoInfo(entry, fetchImpl) {
  fetchImpl = fetchImpl || fetch;
  var videoId = extractYouTubeId(entry.url);
  if (!videoId) {
    console.warn('fetch-video-info: could not extract a video id from ' + entry.url);
    return Promise.resolve(null);
  }
  var oembedUrl = 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(entry.url);
  return fetchImpl(oembedUrl)
    .then(function (res) {
      if (!res.ok) throw new Error('oEmbed HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      return {
        category: entry.category,
        type: entry.type,
        url: entry.url,
        videoId: videoId,
        thumbnailUrl: getThumbnailUrl(videoId),
        title: data.title,
        channel: data.author_name
      };
    })
    .catch(function (err) {
      console.warn('fetch-video-info: failed to resolve ' + entry.url + ': ' + err.message);
      return null;
    });
}

module.exports = { resolveVideoInfo: resolveVideoInfo };
