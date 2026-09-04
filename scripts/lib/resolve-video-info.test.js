const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveVideoInfo, extractUploadDate } = require('./resolve-video-info.js');

var VALID_WATCH_HTML = '<script>var ytInitialPlayerResponse = {"microformat":{"playerMicroformatRenderer":{"uploadDate":"2026-08-25T23:16:39-07:00"}}};</script>';

function fakeFetch(oembedBody, watchHtml, oembedOk) {
  oembedOk = oembedOk === undefined ? true : oembedOk;
  return function (url) {
    if (url.indexOf('oembed') !== -1) {
      return Promise.resolve({
        ok: oembedOk,
        status: oembedOk ? 200 : 404,
        json: function () { return Promise.resolve(oembedBody); }
      });
    }
    if (watchHtml === null) {
      return Promise.resolve({ ok: false, status: 404 });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      text: function () { return Promise.resolve(watchHtml); }
    });
  };
}

test('extractUploadDate parses a valid uploadDate from HTML', () => {
  assert.equal(extractUploadDate(VALID_WATCH_HTML), '2026-08-25');
});

test('extractUploadDate returns null when uploadDate is absent', () => {
  assert.equal(extractUploadDate('<html>no date here</html>'), null);
});

test('resolveVideoInfo returns enriched entry on success', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/aaaaaaaaaaa' };
  var fake = fakeFetch(
    { title: '測試標題', author_name: '測試頻道', author_url: 'https://www.youtube.com/@test' },
    VALID_WATCH_HTML
  );
  var result = await resolveVideoInfo(entry, fake);
  assert.deepEqual(result, {
    category: '行銷宣傳',
    type: '影片',
    url: 'https://youtu.be/aaaaaaaaaaa',
    videoId: 'aaaaaaaaaaa',
    thumbnailUrl: 'https://img.youtube.com/vi/aaaaaaaaaaa/hqdefault.jpg',
    title: '測試標題',
    channel: '測試頻道',
    channelUrl: 'https://www.youtube.com/@test',
    uploadDate: '2026-08-25'
  });
});

test('resolveVideoInfo returns entry with uploadDate null when the watch page fetch fails', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/fffffffffff' };
  var fake = fakeFetch(
    { title: '測試標題', author_name: '測試頻道', author_url: 'https://www.youtube.com/@test' },
    null
  );
  var result = await resolveVideoInfo(entry, fake);
  assert.notEqual(result, null);
  assert.equal(result.uploadDate, null);
  assert.equal(result.title, '測試標題');
});

test('resolveVideoInfo returns null when oEmbed responds non-200', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/bbbbbbbbbbb' };
  var fake = fakeFetch({}, VALID_WATCH_HTML, false);
  var result = await resolveVideoInfo(entry, fake);
  assert.equal(result, null);
});

test('resolveVideoInfo returns null when fetch throws', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/ccccccccccc' };
  var fake = function () { return Promise.reject(new Error('network down')); };
  var result = await resolveVideoInfo(entry, fake);
  assert.equal(result, null);
});

test('resolveVideoInfo returns null when oEmbed response is missing title', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/ddddddddddd' };
  var fake = fakeFetch({ author_name: 'X', author_url: 'https://www.youtube.com/@x' }, VALID_WATCH_HTML);
  var result = await resolveVideoInfo(entry, fake);
  assert.equal(result, null);
});

test('resolveVideoInfo returns null when oEmbed response is missing author_url', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/eeeeeeeeeee' };
  var fake = fakeFetch({ title: '測試標題', author_name: '測試頻道' }, VALID_WATCH_HTML);
  var result = await resolveVideoInfo(entry, fake);
  assert.equal(result, null);
});

test('resolveVideoInfo returns null when the url has no extractable video id', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://example.com/not-a-video' };
  var fake = fakeFetch({}, VALID_WATCH_HTML);
  var result = await resolveVideoInfo(entry, fake);
  assert.equal(result, null);
});
