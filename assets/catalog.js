// Media Center catalog: parsing, filtering and rendering for the video list.
// See ../../media_center_video_catalog_design_20260901_v1.md for the data format.

var VideoCatalog = {};

function extractYouTubeId(url) {
  if (!url) return null;
  var patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = url.match(patterns[i]);
    if (m) return m[1];
  }
  return null;
}

function getThumbnailUrl(videoId) {
  return 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
}

function parseVideosText(text) {
  var videos = [];
  var lines = text.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line === '' || line.indexOf('#') === 0) continue;
    var parts = line.split('|');
    if (parts.length !== 4) {
      console.warn('videos.txt: skipping malformed line ' + (i + 1) + ': ' + line);
      continue;
    }
    videos.push({
      category: parts[0].trim(),
      type: parts[1].trim(),
      title: parts[2].trim(),
      url: parts[3].trim()
    });
  }
  return videos;
}

VideoCatalog.extractYouTubeId = extractYouTubeId;
VideoCatalog.getThumbnailUrl = getThumbnailUrl;
VideoCatalog.parseVideosText = parseVideosText;

if (typeof module === 'object' && module.exports) {
  module.exports = VideoCatalog;
} else {
  window.VideoCatalog = VideoCatalog;
}
