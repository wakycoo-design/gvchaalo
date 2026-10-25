import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatINR, formatDateRange, formatDate } from '../assets/js/lib/format.js';

test('formatINR uses Indian grouping', () => {
  assert.equal(formatINR(8999), '₹8,999');
  assert.equal(formatINR(124995), '₹1,24,995');
  assert.equal(formatINR(0), '₹0');
});

test('formatDateRange', () => {
  assert.equal(formatDateRange('2026-12-13', '2026-12-17'), '13 – 17 Dec');
  assert.equal(formatDateRange('2026-12-30', '2027-01-03'), '30 Dec – 3 Jan');
  assert.equal(formatDateRange('2027-08-07', '2027-08-10', { withYear: true }), '7 – 10 Aug 2027');
});

test('formatDate', () => {
  assert.equal(formatDate('2026-12-13'), '13 Dec');
  assert.equal(formatDate('2027-08-07', { withYear: true }), '7 Aug 2027');
});
