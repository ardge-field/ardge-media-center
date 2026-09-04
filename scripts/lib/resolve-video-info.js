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
      if (typeof data.title !== 'string' || !data.title ||
          typeof data.author_name !== 'string' || !data.author_name ||
          typeof data.author_url !== 'string' || !data.author_url) {
        throw new Error('oEmbed response missing title/author_name/author_url');
      }
      return {
        category: entry.category,
        type: entry.type,
        url: entry.url,
        videoId: videoId,
        thumbnailUrl: getThumbnailUrl(videoId),
        title: data.title,
        channel: data.author_name,
        channelUrl: data.author_url
      };
    })
    .catch(function (err) {
      console.warn('fetch-video-info: failed to resolve ' + entry.url + ': ' + err.message);
      return null;
    });
}

module.exports = { resolveVideoInfo: resolveVideoInfo };
