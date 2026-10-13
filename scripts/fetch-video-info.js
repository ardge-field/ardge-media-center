var fs = require('fs');
var path = require('path');
var parseVideosSource = require('./lib/parse-source.js').parseVideosSource;
var resolveVideoInfo = require('./lib/resolve-video-info.js').resolveVideoInfo;
var extractYouTubeId = require('./lib/url.js').extractYouTubeId;
var dateCache = require('./lib/date-cache.js');

var SOURCE_PATH = path.join(__dirname, '..', 'data', 'videos.txt');
var OUTPUT_PATH = path.join(__dirname, '..', 'data', 'videos.json');
var DATE_CACHE_PATH = path.join(__dirname, '..', 'data', 'upload-dates.json');

function loadDateCache() {
  if (!fs.existsSync(DATE_CACHE_PATH)) return {};
  try {
    return dateCache.parseDateCache(fs.readFileSync(DATE_CACHE_PATH, 'utf8'));
  } catch (err) {
    throw new Error(DATE_CACHE_PATH + ': ' + err.message);
  }
}

function main() {
  var entries, cache;
  // Started inside a promise so a synchronous failure (unreadable source,
  // malformed upload-dates.json) reaches the same catch handler below.
  return Promise.resolve()
    .then(function () {
      entries = parseVideosSource(fs.readFileSync(SOURCE_PATH, 'utf8'));
      cache = loadDateCache();
      return Promise.all(entries.map(function (entry) {
        var videoId = extractYouTubeId(entry.url);
        return resolveVideoInfo(entry, undefined, { cachedDate: videoId ? cache[videoId] : undefined });
      }));
    })
    .then(function (results) {
      var videos = results.filter(function (v) { return v !== null; });
      if (videos.length === 0 && entries.length > 0) {
        throw new Error('resolved 0 of ' + entries.length + ' entries; refusing to publish an empty catalog');
      }
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(videos, null, 2) + '\n');

      var fromCache = videos.filter(function (v) { return cache[v.videoId]; }).length;
      var merged = dateCache.mergeDates(cache, videos);
      var serialized = dateCache.serializeDateCache(merged.cache);
      var existing = fs.existsSync(DATE_CACHE_PATH) ? fs.readFileSync(DATE_CACHE_PATH, 'utf8') : null;
      if (serialized !== existing) fs.writeFileSync(DATE_CACHE_PATH, serialized);

      var missing = videos.filter(function (v) { return !v.uploadDate; });
      missing.forEach(function (v) {
        console.warn('::warning::fetch-video-info: no upload date for ' + v.videoId +
          ' (run node scripts/fetch-video-info.js locally and commit data/upload-dates.json)');
      });

      console.log('Wrote ' + videos.length + ' of ' + entries.length + ' entries to ' + OUTPUT_PATH);
      console.log('upload-dates: ' + fromCache + ' from cache, +' + merged.added + ' new, ' + missing.length + ' missing');
    });
}

main().catch(function (err) {
  console.error('fetch-video-info failed:', err);
  process.exit(1);
});
