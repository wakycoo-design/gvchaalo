import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TREKS, getTrek } from '../assets/js/data/treks.js';

test('three treks with spec values', () => {
  assert.deepEqual(TREKS.map(t => t.slug), ['kedarkantha', 'annapurna-base-camp', 'bhrigu-lake']);
  assert.equal(getTrek('kedarkantha').priceFrom, 8999);
  assert.equal(getTrek('annapurna-base-camp').maxAltitudeFt, 13550);
  assert.equal(getTrek('bhrigu-lake').days, 4);
  assert.equal(getTrek('nope'), undefined);
});

test('every departure is well formed', () => {
  for (const t of TREKS) {
    assert.equal(t.itinerary.length, t.days);
    for (const d of t.departures) {
      assert.match(d.id, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(d.seatsLeft >= 0 && d.seatsLeft <= 20);
      assert.ok(d.price >= t.priceFrom);
    }
  }
});

test('each trek has a sold-out and a low-seat departure', () => {
  for (const t of TREKS) {
    assert.ok(t.departures.some(d => d.seatsLeft === 0));
    assert.ok(t.departures.some(d => d.seatsLeft > 0 && d.seatsLeft <= 4));
  }
});
