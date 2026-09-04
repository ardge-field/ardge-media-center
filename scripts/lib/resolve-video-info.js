var urlLib = require('./url.js');
var extractYouTubeId = urlLib.extractYouTubeId;
var getThumbnailUrl = urlLib.getThumbnailUrl;

// YouTube's oEmbed response has no upload-date field. The watch page's HTML
// embeds one in a JSON blob (no API key needed, since this is a plain public
// page fetch) — this pulls just the YYYY-MM-DD prefix out of it.
function extractUploadDate(html) {
  var m = html.match(/"uploadDate":"(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function resolveVideoInfo(entry, fetchImpl) {
  fetchImpl = fetchImpl || fetch;
  var videoId = extractYouTubeId(entry.url);
  if (!videoId) {
    console.warn('fetch-video-info: could not extract a video id from ' + entry.url);
    return Promise.resolve(null);
  }
  var oembedUrl = 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(entry.url);
  var watchUrl = 'https://www.youtube.com/watch?v=' + videoId;

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
      // The upload date comes from a second, best-effort fetch: if the watch
      // page is unreachable or its markup no longer has the field, the video
      // still gets published — just without a date to sort/display.
      // A realistic browser User-Agent is set because some hosting IPs (e.g.
      // CI runners) get served a stripped-down page for non-browser-looking
      // requests, which is missing the JSON blob this regex needs.
      return fetchImpl(watchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      })
        .then(function (res) { return res.ok ? res.text().then(function (html) { return { html: html, status: res.status }; }) : { html: null, status: res.status }; })
        .catch(function (err) { return { html: null, status: null, error: err.message }; })
        .then(function (result) {
          var html = result.html;
          var uploadDate = html ? extractUploadDate(html) : null;
          if (!uploadDate) {
            console.warn('fetch-video-info: could not determine upload date for ' + entry.url +
              ' (status=' + result.status + ', bytes=' + (html ? html.length : 0) + (result.error ? ', error=' + result.error : '') + ')');
          }
          return {
            category: entry.category,
            type: entry.type,
            url: entry.url,
            videoId: videoId,
            thumbnailUrl: getThumbnailUrl(videoId),
            title: data.title,
            channel: data.author_name,
            channelUrl: data.author_url,
            uploadDate: uploadDate
          };
        });
    })
    .catch(function (err) {
      console.warn('fetch-video-info: failed to resolve ' + entry.url + ': ' + err.message);
      return null;
    });
}

module.exports = { resolveVideoInfo: resolveVideoInfo, extractUploadDate: extractUploadDate };
