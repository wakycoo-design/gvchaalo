import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveEntry, validateTraveller, validateEmergency } from '../assets/js/book.js';
import { getTrek } from '../assets/js/data/treks.js';

const open = slug => getTrek(slug).departures.find(d => d.seatsLeft > 0);

test('unknown trip redirects', () => {
  assert.deepEqual(resolveEntry(new URLSearchParams('trip=xyz'), null), { redirect: 'index.html#treks' });
  assert.deepEqual(resolveEntry(new URLSearchParams(''), null), { redirect: 'index.html#treks' });
});

test('sold-out or missing date falls back to first open departure', () => {
  const sold = getTrek('kedarkantha').departures.find(d => d.seatsLeft === 0);
  assert.equal(resolveEntry(new URLSearchParams(`trip=kedarkantha&date=${sold.id}`), null).booking.date, open('kedarkantha').id);
  assert.equal(resolveEntry(new URLSearchParams('trip=kedarkantha'), null).booking.date, open('kedarkantha').id);
});

test('a valid date from the URL is used and a fresh booking starts at step 0', () => {
  const { booking } = resolveEntry(new URLSearchParams('trip=kedarkantha&date=2027-01-10'), null);
  assert.equal(booking.date, '2027-01-10');
  assert.equal(booking.step, 0);
  assert.equal(booking.pax, 1);
});

test('saved booking for same trip resumes at its step', () => {
  const saved = { trip: 'kedarkantha', date: open('kedarkantha').id, pax: 2, addOns: [], travellers: [], step: 2, payMode: 'full' };
  assert.equal(resolveEntry(new URLSearchParams('trip=kedarkantha'), saved).booking.step, 2);
});

test('saved booking for another trip is ignored', () => {
  const saved = { trip: 'bhrigu-lake', date: open('bhrigu-lake').id, pax: 2, addOns: [], travellers: [], step: 2, payMode: 'full' };
  const { booking } = resolveEntry(new URLSearchParams('trip=kedarkantha'), saved);
  assert.equal(booking.trip, 'kedarkantha');
  assert.equal(booking.step, 0);
});

test('saved pax above seats left is clamped', () => {
  const saved = { trip: 'kedarkantha', date: '2026-12-27', pax: 9, addOns: [], travellers: [], step: 0, payMode: 'full' };
  assert.equal(resolveEntry(new URLSearchParams('trip=kedarkantha'), saved).booking.pax, 2);
});

test('validateTraveller flags missing and malformed fields', () => {
  const errs = validateTraveller({ name: '', age: '9', gender: '', phone: '12', email: 'nope' }, { lead: true });
  assert.deepEqual(Object.keys(errs).sort(), ['age', 'email', 'gender', 'name', 'phone']);
  assert.deepEqual(validateTraveller({ name: 'Arjun Menon', age: '24', gender: 'Male', phone: '+91 98470 12345', email: 'a@b.in' }, { lead: true }), {});
});

test('only the lead traveller needs phone and email', () => {
  assert.deepEqual(validateTraveller({ name: 'Devi', age: '27', gender: 'Female', phone: '', email: '' }, { lead: false }), {});
});

test('validateEmergency needs a name and a phone', () => {
  assert.deepEqual(Object.keys(validateEmergency({ name: '', phone: '' })).sort(), ['name', 'phone']);
  assert.deepEqual(validateEmergency({ name: 'Amma', phone: '9847012345' }), {});
});

test('a saved booking opened with a different date restarts at the batch step but keeps travellers', () => {
  const saved = { trip: 'kedarkantha', date: '2026-12-13', pax: 2, addOns: ['gear'], travellers: [{ name: 'Arjun Menon' }], step: 3, payMode: 'full', terms: true };
  const { booking } = resolveEntry(new URLSearchParams('trip=kedarkantha&date=2026-12-20'), saved);
  assert.equal(booking.date, '2026-12-20');
  assert.equal(booking.step, 0);
  assert.equal(booking.terms, false);
  assert.equal(booking.travellers[0].name, 'Arjun Menon');
});

test('a saved booking opened with the same or no date resumes its step', () => {
  const saved = { trip: 'kedarkantha', date: '2026-12-13', pax: 2, addOns: [], travellers: [], step: 3, payMode: 'full' };
  assert.equal(resolveEntry(new URLSearchParams('trip=kedarkantha&date=2026-12-13'), saved).booking.step, 3);
  assert.equal(resolveEntry(new URLSearchParams('trip=kedarkantha'), saved).booking.step, 3);
});
