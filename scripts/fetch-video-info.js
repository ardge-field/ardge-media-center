var fs = require('fs');
var path = require('path');
var parseVideosSource = require('./lib/parse-source.js').parseVideosSource;
var resolveVideoInfo = require('./lib/resolve-video-info.js').resolveVideoInfo;

var SOURCE_PATH = path.join(__dirname, '..', 'data', 'videos.txt');
var OUTPUT_PATH = path.join(__dirname, '..', 'data', 'videos.json');

function main() {
  var text = fs.readFileSync(SOURCE_PATH, 'utf8');
  var entries = parseVideosSource(text);
  return Promise.all(entries.map(function (entry) { return resolveVideoInfo(entry); }))
    .then(function (results) {
      var videos = results.filter(function (v) { return v !== null; });
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(videos, null, 2) + '\n');
      console.log('Wrote ' + videos.length + ' of ' + entries.length + ' entries to ' + OUTPUT_PATH);
    });
}

main().catch(function (err) {
  console.error('fetch-video-info failed:', err);
  process.exit(1);
});
