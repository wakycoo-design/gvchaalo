import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

test('team page shows Saleel under the Who\'s Chaalo-ing caption', () => {
  const html = read('team.html');
  assert.match(html, /<title>Our Team · gv\.chaalo<\/title>/);
  assert.match(html, /Who's<br>Chaalo-ing/);
  assert.match(html, /id="lead-name"[^>]*>Saleel</);
  for (const img of html.matchAll(/src="(assets\/img\/saleel-[^"]+)"/g)) {
    assert.ok(existsSync(new URL(`../${img[1]}`, import.meta.url)), img[1]);
  }
});

test('desktop nav, mobile menu and footer link to the team page', () => {
  for (const f of ['index.html', 'trip.html']) {
    const html = read(f);
    assert.equal((html.match(/<a href="team\.html">Our Team<\/a>/g) || []).length, 2, f);
    assert.match(html, /<a href="team\.html">Our trek leaders<\/a>/, f);
  }
  assert.match(read('index.html'), /class="link-arrow about__team" href="team\.html"/);
});
