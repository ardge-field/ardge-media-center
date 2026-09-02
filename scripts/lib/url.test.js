const test = require('node:test');
const assert = require('node:assert/strict');
const { extractYouTubeId, getThumbnailUrl } = require('./url.js');

test('extractYouTubeId parses watch?v= URLs', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=abcdEFGH123'), 'abcdEFGH123');
});

test('extractYouTubeId parses watch URLs with extra query params', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=abcdEFGH123&t=42s'), 'abcdEFGH123');
});

test('extractYouTubeId parses youtu.be short links', () => {
  assert.equal(extractYouTubeId('https://youtu.be/abcdEFGH123'), 'abcdEFGH123');
});

test('extractYouTubeId parses shorts links', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/abcdEFGH123'), 'abcdEFGH123');
});

test('extractYouTubeId returns null for unrecognized URLs', () => {
  assert.equal(extractYouTubeId('https://example.com/not-a-video'), null);
});

test('extractYouTubeId returns null for empty input', () => {
  assert.equal(extractYouTubeId(''), null);
  assert.equal(extractYouTubeId(undefined), null);
});

test('getThumbnailUrl builds the static thumbnail URL', () => {
  assert.equal(getThumbnailUrl('abcdEFGH123'), 'https://img.youtube.com/vi/abcdEFGH123/hqdefault.jpg');
});
