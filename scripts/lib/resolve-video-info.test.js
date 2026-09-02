const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveVideoInfo } = require('./resolve-video-info.js');

function fakeFetch(responseBody, ok) {
  return function () {
    return Promise.resolve({
      ok: ok,
      status: ok ? 200 : 404,
      json: function () { return Promise.resolve(responseBody); }
    });
  };
}

test('resolveVideoInfo returns enriched entry on success', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/aaaaaaaaaaa' };
  var fake = fakeFetch({ title: '測試標題', author_name: '測試頻道' }, true);
  var result = await resolveVideoInfo(entry, fake);
  assert.deepEqual(result, {
    category: '行銷宣傳',
    type: '影片',
    url: 'https://youtu.be/aaaaaaaaaaa',
    videoId: 'aaaaaaaaaaa',
    thumbnailUrl: 'https://img.youtube.com/vi/aaaaaaaaaaa/hqdefault.jpg',
    title: '測試標題',
    channel: '測試頻道'
  });
});

test('resolveVideoInfo returns null when oEmbed responds non-200', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://youtu.be/bbbbbbbbbbb' };
  var fake = fakeFetch({}, false);
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
  var fake = fakeFetch({ author_name: 'X' }, true);
  var result = await resolveVideoInfo(entry, fake);
  assert.equal(result, null);
});

test('resolveVideoInfo returns null when the url has no extractable video id', async () => {
  var entry = { category: '行銷宣傳', type: '影片', url: 'https://example.com/not-a-video' };
  var fake = fakeFetch({}, true);
  var result = await resolveVideoInfo(entry, fake);
  assert.equal(result, null);
});
