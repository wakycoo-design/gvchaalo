import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderTrekRow, nextDeparture } from '../assets/js/home.js';
import { getTrek } from '../assets/js/data/treks.js';

test('nextDeparture skips sold-out batches', () => {
  assert.equal(nextDeparture(getTrek('kedarkantha')).id, '2026-12-13');
});

test('renderTrekRow links to the trip page and flags low seats in plain text', () => {
  const html = renderTrekRow(getTrek('kedarkantha'), 0);
  assert.match(html, /href="trip\.html\?id=kedarkantha"/);
  assert.match(html, /4 seats left/);
  assert.match(html, /₹8,999/);
  assert.doesNotMatch(html, /trek-row--flip/);
});

test('renderTrekRow alternates sides and shows the year for early-bird batches', () => {
  const html = renderTrekRow(getTrek('bhrigu-lake'), 1);
  assert.match(html, /trek-row--flip/);
  assert.match(html, /21 Aug 2027/);
});
