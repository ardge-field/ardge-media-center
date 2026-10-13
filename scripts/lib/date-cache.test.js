const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDateCache, mergeDates, serializeDateCache } = require('./date-cache.js');

test('parseDateCache parses valid entries', () => {
  var cache = parseDateCache('{"aaaaaaaaaaa":"2026-10-12","bbbbbbbbbbb":"2009-10-24"}');
  assert.deepEqual(cache, { aaaaaaaaaaa: '2026-10-12', bbbbbbbbbbb: '2009-10-24' });
});

test('parseDateCache ignores entries with an invalid date or id', () => {
  var cache = parseDateCache(JSON.stringify({
    aaaaaaaaaaa: '2026-10-12',
    bbbbbbbbbbb: '2026/10/12',
    ccccccccccc: null,
    'too-short': '2026-10-12'
  }));
  assert.deepEqual(cache, { aaaaaaaaaaa: '2026-10-12' });
});

test('parseDateCache throws on invalid JSON', () => {
  assert.throws(() => parseDateCache('{"aaaaaaaaaaa": '));
  assert.throws(() => parseDateCache(''));
});

test('parseDateCache throws when the JSON is not a plain object', () => {
  assert.throws(() => parseDateCache('[]'), /JSON object/);
  assert.throws(() => parseDateCache('null'), /JSON object/);
  assert.throws(() => parseDateCache('"text"'), /JSON object/);
});

test('mergeDates adds dates missing from the cache and counts them', () => {
  var result = mergeDates({ aaaaaaaaaaa: '2026-10-12' }, [
    { videoId: 'aaaaaaaaaaa', uploadDate: '2026-10-12' },
    { videoId: 'bbbbbbbbbbb', uploadDate: '2026-09-28' }
  ]);
  assert.deepEqual(result.cache, { aaaaaaaaaaa: '2026-10-12', bbbbbbbbbbb: '2026-09-28' });
  assert.equal(result.added, 1);
});

test('mergeDates never overwrites an existing cached date', () => {
  var result = mergeDates({ aaaaaaaaaaa: '2026-01-01' }, [
    { videoId: 'aaaaaaaaaaa', uploadDate: '2026-10-12' }
  ]);
  assert.equal(result.cache.aaaaaaaaaaa, '2026-01-01');
  assert.equal(result.added, 0);
});

test('mergeDates skips videos whose uploadDate is null', () => {
  var result = mergeDates({}, [{ videoId: 'aaaaaaaaaaa', uploadDate: null }]);
  assert.deepEqual(result.cache, {});
  assert.equal(result.added, 0);
});

test('mergeDates counts a repeated videoId only once', () => {
  var result = mergeDates({}, [
    { videoId: 'aaaaaaaaaaa', uploadDate: '2026-10-12' },
    { videoId: 'aaaaaaaaaaa', uploadDate: '2026-10-12' }
  ]);
  assert.deepEqual(result.cache, { aaaaaaaaaaa: '2026-10-12' });
  assert.equal(result.added, 1);
});

test('mergeDates does not mutate the input cache', () => {
  var input = { aaaaaaaaaaa: '2026-10-12' };
  mergeDates(input, [{ videoId: 'bbbbbbbbbbb', uploadDate: '2026-09-28' }]);
  assert.deepEqual(input, { aaaaaaaaaaa: '2026-10-12' });
});

test('serializeDateCache sorts keys, indents 2 spaces, ends with a newline', () => {
  var text = serializeDateCache({ bbbbbbbbbbb: '2026-09-28', aaaaaaaaaaa: '2026-10-12' });
  assert.equal(text, '{\n  "aaaaaaaaaaa": "2026-10-12",\n  "bbbbbbbbbbb": "2026-09-28"\n}\n');
});

test('serializeDateCache round-trips byte-identically', () => {
  var text = serializeDateCache({ bbbbbbbbbbb: '2026-09-28', aaaaaaaaaaa: '2026-10-12' });
  assert.equal(serializeDateCache(parseDateCache(text)), text);
});
