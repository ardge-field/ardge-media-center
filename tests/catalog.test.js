const test = require('node:test');
const assert = require('node:assert/strict');
const VideoCatalog = require('../assets/catalog.js');

test('extractYouTubeId parses watch?v= URLs', () => {
  assert.equal(
    VideoCatalog.extractYouTubeId('https://www.youtube.com/watch?v=abcdEFGH123'),
    'abcdEFGH123'
  );
});

test('extractYouTubeId parses watch URLs with extra query params', () => {
  assert.equal(
    VideoCatalog.extractYouTubeId('https://www.youtube.com/watch?v=abcdEFGH123&t=42s'),
    'abcdEFGH123'
  );
});

test('extractYouTubeId parses youtu.be short links', () => {
  assert.equal(
    VideoCatalog.extractYouTubeId('https://youtu.be/abcdEFGH123'),
    'abcdEFGH123'
  );
});

test('extractYouTubeId parses shorts links', () => {
  assert.equal(
    VideoCatalog.extractYouTubeId('https://www.youtube.com/shorts/abcdEFGH123'),
    'abcdEFGH123'
  );
});

test('extractYouTubeId returns null for unrecognized URLs', () => {
  assert.equal(VideoCatalog.extractYouTubeId('https://example.com/not-a-video'), null);
});

test('extractYouTubeId returns null for empty input', () => {
  assert.equal(VideoCatalog.extractYouTubeId(''), null);
  assert.equal(VideoCatalog.extractYouTubeId(undefined), null);
});

test('getThumbnailUrl builds the static thumbnail URL', () => {
  assert.equal(
    VideoCatalog.getThumbnailUrl('abcdEFGH123'),
    'https://img.youtube.com/vi/abcdEFGH123/hqdefault.jpg'
  );
});

test('parseVideosText parses well-formed lines', () => {
  var text = '行銷|影片|2026春季新品發表|https://youtu.be/aaaaaaaaaaa\n' +
              '教育訓練|短片|新人到職安全須知|https://youtu.be/bbbbbbbbbbb';
  var videos = VideoCatalog.parseVideosText(text);
  assert.equal(videos.length, 2);
  assert.deepEqual(videos[0], {
    category: '行銷',
    type: '影片',
    title: '2026春季新品發表',
    url: 'https://youtu.be/aaaaaaaaaaa'
  });
});

test('parseVideosText skips blank lines and # comments', () => {
  var text = '# 這是註解\n\n行銷|影片|標題A|https://youtu.be/aaaaaaaaaaa\n';
  var videos = VideoCatalog.parseVideosText(text);
  assert.equal(videos.length, 1);
});

test('parseVideosText skips malformed lines without throwing', () => {
  var text = '行銷|影片|缺欄位的一行\n行銷|影片|正常這行|https://youtu.be/aaaaaaaaaaa';
  var videos = VideoCatalog.parseVideosText(text);
  assert.equal(videos.length, 1);
  assert.equal(videos[0].title, '正常這行');
});

test('parseVideosText trims whitespace around fields', () => {
  var text = ' 行銷 | 影片 | 標題A | https://youtu.be/aaaaaaaaaaa ';
  var videos = VideoCatalog.parseVideosText(text);
  assert.equal(videos[0].category, '行銷');
  assert.equal(videos[0].url, 'https://youtu.be/aaaaaaaaaaa');
});

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
