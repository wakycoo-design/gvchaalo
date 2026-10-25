import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildICS } from '../assets/js/lib/ics.js';
import { confirmGuard } from '../assets/js/confirm.js';

test('buildICS makes an all-day event ending the day after the trek', () => {
  const ics = buildICS({ title: 'Kedarkantha with gv.chaalo', startISO: '2026-12-13', endISO: '2026-12-17', location: 'Dehradun', description: 'Ref GVC-KDK-44200', uid: 'GVC-KDK-44200' });
  assert.match(ics, /BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261213/);
  assert.match(ics, /DTEND;VALUE=DATE:20261218/);
  assert.match(ics, /SUMMARY:Kedarkantha with gv\.chaalo/);
  assert.ok(ics.split('\r\n').length > 8);
  assert.doesNotMatch(ics.replace(/\r\n/g, ''), /\n/);
});

test('buildICS rolls month and year over correctly', () => {
  assert.match(buildICS({ title: 'x', startISO: '2026-12-27', endISO: '2026-12-31', location: '', description: '', uid: 'u' }), /DTEND;VALUE=DATE:20270101/);
});

test('buildICS escapes commas and semicolons', () => {
  assert.match(buildICS({ title: 'a, b; c', startISO: '2026-12-13', endISO: '2026-12-13', location: '', description: '', uid: 'u' }), /SUMMARY:a\\, b\\; c/);
});

test('confirmGuard sends visitors without a paid booking home', () => {
  assert.equal(confirmGuard(null), 'index.html');
  assert.equal(confirmGuard({ trip: 'kedarkantha' }), 'index.html');
  assert.equal(confirmGuard({ trip: 'kedarkantha', ref: 'GVC-KDK-12345' }), null);
});

test('confirmation can be rebuilt from the URL when storage was unavailable', async () => {
  const { bookingFromParams } = await import('../assets/js/confirm.js');
  const b = bookingFromParams(new URLSearchParams('ref=GVC-KDK-44200&trip=kedarkantha&date=2026-12-13&pax=2&paid=4000&mode=advance'));
  assert.equal(b.ref, 'GVC-KDK-44200');
  assert.equal(b.trip, 'kedarkantha');
  assert.equal(b.paidAmount, 4000);
  assert.equal(b.payMode, 'advance');
  assert.equal(b.travellers.length, 0);
  assert.equal(bookingFromParams(new URLSearchParams('')), null);
  assert.equal(bookingFromParams(new URLSearchParams('ref=GVC-XXX-1&trip=nope&date=2026-12-13')), null);
});
