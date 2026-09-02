const test = require('node:test');
const assert = require('node:assert/strict');
const { parseVideosSource } = require('./parse-source.js');

test('parseVideosSource parses well-formed lines', () => {
  var text = '行銷宣傳|影片|https://youtu.be/aaaaaaaaaaa\n' +
              '教育訓練|短片|https://youtu.be/bbbbbbbbbbb';
  var entries = parseVideosSource(text);
  assert.equal(entries.length, 2);
  assert.deepEqual(entries[0], {
    category: '行銷宣傳',
    type: '影片',
    url: 'https://youtu.be/aaaaaaaaaaa'
  });
});

test('parseVideosSource skips blank lines and # comments', () => {
  var text = '# 這是註解\n\n行銷宣傳|影片|https://youtu.be/aaaaaaaaaaa\n';
  var entries = parseVideosSource(text);
  assert.equal(entries.length, 1);
});

test('parseVideosSource skips malformed lines without throwing', () => {
  var text = '行銷宣傳|影片\n行銷宣傳|影片|https://youtu.be/aaaaaaaaaaa';
  var entries = parseVideosSource(text);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, 'https://youtu.be/aaaaaaaaaaa');
});

test('parseVideosSource trims whitespace around fields', () => {
  var text = ' 行銷宣傳 | 影片 | https://youtu.be/aaaaaaaaaaa ';
  var entries = parseVideosSource(text);
  assert.equal(entries[0].category, '行銷宣傳');
  assert.equal(entries[0].url, 'https://youtu.be/aaaaaaaaaaa');
});
