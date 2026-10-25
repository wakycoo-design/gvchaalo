import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampPax, calcPrice, makeRef, createStore } from '../assets/js/lib/booking.js';
import { getTrek } from '../assets/js/data/treks.js';

const openDeparture = (trek) => trek.departures.find(d => d.seatsLeft > 0);

test('clampPax keeps travellers between 1 and seats left', () => {
  assert.equal(clampPax(5, 4), 4);
  assert.equal(clampPax(0, 4), 1);
  assert.equal(clampPax(2.7, 9), 2);
  assert.equal(clampPax(NaN, 9), 1);
});

test('calcPrice Kedarkantha 2 pax + gear, pay in full', () => {
  const trek = getTrek('kedarkantha');
  const departure = openDeparture(trek);
  const p = calcPrice({ trek, departure, pax: 2, addOns: ['gear'], payMode: 'full' });
  assert.equal(p.base, 2 * departure.price);
  assert.deepEqual(p.addOnLines.map(l => l.amount), [1600]);
  assert.equal(p.gst, Math.round((p.base + 1600) * 0.05));
  assert.equal(p.total, p.base + 1600 + p.gst);
  assert.equal(p.payNow, p.total);
});

test('calcPrice advance mode charges 2,000 per person now', () => {
  const trek = getTrek('kedarkantha');
  const p = calcPrice({ trek, departure: openDeparture(trek), pax: 3, addOns: [], payMode: 'advance' });
  assert.equal(p.advance, 6000);
  assert.equal(p.payNow, 6000);
});

test('makeRef', () => {
  assert.equal(makeRef('KDK', () => 0.38), 'GVC-KDK-44200');
  assert.match(makeRef('ABC'), /^GVC-ABC-\d{5}$/);
});

test('store round-trips a booking', () => {
  const mem = new Map();
  const fake = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: k => mem.delete(k) };
  const s = createStore(fake);
  s.save({ trip: 'kedarkantha', step: 1 });
  assert.equal(s.load().step, 1);
  s.clear();
  assert.equal(s.load(), null);
});

test('store survives a storage that throws (private mode)', () => {
  const broken = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  const b = createStore(broken);
  b.save({ trip: 'bhrigu-lake', step: 2 });
  assert.equal(b.load().step, 2);
});

test('createStore falls back to memory when reading sessionStorage itself throws', () => {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try {
    const s = createStore();
    s.save({ trip: 'kedarkantha', step: 1 });
    assert.equal(s.load().step, 1);
  } finally {
    if (desc) Object.defineProperty(globalThis, 'sessionStorage', desc); else delete globalThis.sessionStorage;
  }
});
