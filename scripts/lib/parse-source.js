function parseVideosSource(text) {
  var entries = [];
  var lines = text.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line === '' || line.indexOf('#') === 0) continue;
    var parts = line.split('|');
    if (parts.length !== 3) {
      console.warn('::warning::videos.txt line ' + (i + 1) + ' has ' + parts.length + ' fields, expected 3 (分類|類型|網址); skipped: ' + line);
      continue;
    }
    entries.push({
      category: parts[0].trim(),
      type: parts[1].trim(),
      url: parts[2].trim()
    });
  }
  return entries;
}

module.exports = { parseVideosSource: parseVideosSource };
