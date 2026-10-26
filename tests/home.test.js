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

test('renderTrekRow has a Book now button for the next open batch', () => {
  const html = renderTrekRow(getTrek('kedarkantha'), 0);
  assert.match(html, /<a class="btn[^"]*" href="book\.html\?trip=kedarkantha&amp;date=2026-12-13">Book now<\/a>/);
});

test('reviews render with name, trek, star rating and a sample label', async () => {
  const { REVIEWS, renderReview, reviewSummary } = await import('../assets/js/home.js');
  assert.deepEqual(REVIEWS.map(r => r.name), ['Ameen', 'Anamika', 'Philip', 'Mathew']);
  const html = renderReview(REVIEWS[0]);
  assert.match(html, /Ameen/);
  assert.match(html, /aria-label="5 out of 5 stars"/);
  assert.match(html, />A<\/span>/);
  assert.equal(reviewSummary(REVIEWS), '4.8');
});

test('home copy uses no em dashes', async () => {
  const { readFileSync } = await import('node:fs');
  for (const f of ['index.html', 'trip.html', 'book.html', 'confirm.html', 'assets/js/home.js', 'assets/js/data/treks.js', 'assets/js/ui.js', 'assets/js/trip.js', 'assets/js/book.js', 'assets/js/confirm.js']) {
    assert.doesNotMatch(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), /—/, f);
  }
});
