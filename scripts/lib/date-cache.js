// Upload-date cache: data/upload-dates.json, committed to git.
// YouTube serves CI runners a watch page without the upload date, so dates
// are fetched on the maintainer's machine and persisted here; the build uses
// a cached date instead of scraping. See
// ../../../media_center_upload_date_cache_design_20261013_v1.md.

var ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateCache(text) {
  var data = JSON.parse(text);
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('upload date cache must be a JSON object of { videoId: "YYYY-MM-DD" }');
  }
  var cache = {};
  Object.keys(data).forEach(function (id) {
    var date = data[id];
    if (!ID_PATTERN.test(id) || typeof date !== 'string' || !DATE_PATTERN.test(date)) {
      console.warn('::warning::upload-dates.json: ignoring invalid entry ' +
        JSON.stringify(id) + ': ' + JSON.stringify(date));
      return;
    }
    cache[id] = date;
  });
  return cache;
}

// Append-only: a date already in the cache is never replaced, so a hand
// corrected value survives later builds.
function mergeDates(cache, videos) {
  var merged = Object.assign({}, cache);
  var added = 0;
  videos.forEach(function (video) {
    if (!video.uploadDate || merged[video.videoId]) return;
    merged[video.videoId] = video.uploadDate;
    added++;
  });
  return { cache: merged, added: added };
}

// Sorted keys keep git diffs limited to the lines actually added.
function serializeDateCache(cache) {
  var sorted = {};
  Object.keys(cache).sort().forEach(function (id) {
    sorted[id] = cache[id];
  });
  return JSON.stringify(sorted, null, 2) + '\n';
}

module.exports = {
  parseDateCache: parseDateCache,
  mergeDates: mergeDates,
  serializeDateCache: serializeDateCache
};
