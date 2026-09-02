const test = require('node:test');
const assert = require('node:assert/strict');
const VideoCatalog = require('../assets/catalog.js');

var SAMPLE_VIDEOS = [
  { category: '行銷', type: '影片', title: '2026春季新品發表會', url: 'https://youtu.be/aaaaaaaaaaa' },
  { category: '教育訓練', type: '短片', title: '新人到職安全須知', url: 'https://youtu.be/bbbbbbbbbbb' },
  { category: '教育訓練', type: '影片', title: '內部系統操作教學', url: 'https://youtu.be/ccccccccccc' }
];

test('groupOptions returns unique categories and types in first-seen order', () => {
  var options = VideoCatalog.groupOptions(SAMPLE_VIDEOS);
  assert.deepEqual(options.categories, ['行銷', '教育訓練']);
  assert.deepEqual(options.types, ['影片', '短片']);
});

test('filterVideos with no filters returns all videos', () => {
  var result = VideoCatalog.filterVideos(SAMPLE_VIDEOS, {});
  assert.equal(result.length, 3);
});

test('filterVideos filters by category', () => {
  var result = VideoCatalog.filterVideos(SAMPLE_VIDEOS, { category: '教育訓練' });
  assert.equal(result.length, 2);
});

test('filterVideos filters by type', () => {
  var result = VideoCatalog.filterVideos(SAMPLE_VIDEOS, { type: '短片' });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, '新人到職安全須知');
});

test('filterVideos filters by category and type together', () => {
  var result = VideoCatalog.filterVideos(SAMPLE_VIDEOS, { category: '教育訓練', type: '影片' });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, '內部系統操作教學');
});

test('filterVideos filters by keyword against title, category and type', () => {
  var result = VideoCatalog.filterVideos(SAMPLE_VIDEOS, { keyword: '安全' });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, '新人到職安全須知');
});

test('filterVideos keyword match is case-insensitive', () => {
  var videos = [{ category: 'Marketing', type: 'Video', title: 'Launch Demo', url: 'https://youtu.be/xxxxxxxxxxx' }];
  var result = VideoCatalog.filterVideos(videos, { keyword: 'launch' });
  assert.equal(result.length, 1);
});
