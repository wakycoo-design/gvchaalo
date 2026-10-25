import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroMessages, holdFor, HOLD_FIRST_MS, HOLD_MS } from '../assets/js/hero-sign.js';
import { TREKS } from '../assets/js/data/treks.js';

test('GVQ comes first, then one message per trek', () => {
  const msgs = heroMessages(TREKS);
  assert.deepEqual(msgs.map(m => m.title), ['GVQ', 'KEDARKANTHA', 'ANNAPURNA BC', 'BHRIGU LAKE']);
  assert.equal(msgs[1].sub, '12,500 ft · 5 days · from Dehradun');
  assert.equal(msgs[0].img, 'assets/img/hero-gvq.jpg');
  assert.equal(msgs[1].img, 'assets/img/hero-kedarkantha.jpg');
  assert.equal(msgs[0].url, '#treks');
  assert.equal(msgs[2].url, 'trip.html?id=annapurna-base-camp');
  assert.equal(msgs[3].name, 'Bhrigu Lake');
});

test('GVQ holds 4 seconds, each trek 5.5 seconds', () => {
  assert.equal(HOLD_FIRST_MS, 4000);
  assert.equal(HOLD_MS, 5500);
  assert.equal(holdFor(0), 4000);
  assert.equal(holdFor(1), 5500);
  assert.equal(holdFor(3), 5500);
});
