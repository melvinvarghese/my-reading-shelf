const assert = require('node:assert/strict');
const test = require('node:test');

const { reserveCoverRequest } = require('../src/cover-limits.js');

const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 90;

test('reserveCoverRequest_allowsRequestsBelowTheSoftLimit', () => {
  const now = 1_000_000;
  const history = Array.from({ length: LIMIT - 1 }, (_, index) => now - 1_000 - index);
  const result = reserveCoverRequest(history, now);

  assert.equal(result.allowed, true);
  assert.equal(result.timestamps.length, LIMIT);
  assert.equal(result.timestamps.at(-1), now);
});

test('reserveCoverRequest_blocksOverLimitUntilTheWindowExpires', () => {
  const now = 1_000_000;
  const history = Array.from({ length: LIMIT }, (_, index) => now - 1_000 - index);
  const blocked = reserveCoverRequest(history, now);
  const afterWindow = reserveCoverRequest(history, now + WINDOW_MS);

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.timestamps.length, LIMIT);
  assert.equal(afterWindow.allowed, true);
  assert.equal(afterWindow.timestamps.length, 1);
});
