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
