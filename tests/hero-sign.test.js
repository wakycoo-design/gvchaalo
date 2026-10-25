import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroMessages, holdFor, HOLD_FIRST_MS, HOLD_MS } from '../assets/js/hero-sign.js';
import { TREKS } from '../assets/js/data/treks.js';

test('GVQ comes first, then one message per trek', () => {
  const msgs = heroMessages(TREKS);
  assert.deepEqual(msgs.map(m => m.title), ['GVQ', 'KEDARKANTHA', 'ANNAPURNA BC', 'BHRIGU LAKE']);
  assert.equal(msgs[1].sub, '12,500 ft · 5 days · from Dehradun');
  assert.equal(msgs[1].sky.length, 3);
});

test('GVQ holds 4 seconds, each trek 3 seconds', () => {
  assert.equal(HOLD_FIRST_MS, 4000);
  assert.equal(HOLD_MS, 3000);
  assert.equal(holdFor(0), 4000);
  assert.equal(holdFor(1), 3000);
  assert.equal(holdFor(3), 3000);
});
