import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tripFromParams, departureRows, altitudeSVG, firstOpenDeparture } from '../assets/js/trip.js';
import { getTrek } from '../assets/js/data/treks.js';

test('unknown or missing trip id gives no trek', () => {
  assert.equal(tripFromParams(new URLSearchParams('id=xyz')), undefined);
  assert.equal(tripFromParams(new URLSearchParams('')), undefined);
  assert.equal(tripFromParams(new URLSearchParams('id=bhrigu-lake')).slug, 'bhrigu-lake');
});

test('open departures link to booking, sold-out ones do not', () => {
  const trek = getTrek('kedarkantha');
  const html = departureRows(trek);
  assert.match(html, /href="book\.html\?trip=kedarkantha&amp;date=2026-12-13"/);
  assert.doesNotMatch(html, /date=2026-12-06"/);
  assert.match(html, /6 – 10 Dec[\s\S]*?Full/);
});

test('first open departure skips sold-out', () => {
  assert.equal(firstOpenDeparture(getTrek('annapurna-base-camp')).id, '2026-11-15');
});

test('altitude chart has one point per day and an accessible label', () => {
  const trek = getTrek('kedarkantha');
  const svg = altitudeSVG(trek.itinerary);
  assert.equal((svg.match(/<circle/g) || []).length, 5);
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-label="[^"]*12,500 ft/);
});
