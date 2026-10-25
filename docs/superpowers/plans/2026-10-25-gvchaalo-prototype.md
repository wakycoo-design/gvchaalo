# gv.chaalo Prototype Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static, deployable-to-GitHub-Pages prototype site for gv.chaalo: animated "↑ GVQ" sign hero, 3 trek pages, and a mock booking flow ending in a confirmation.

**Architecture:** Plain HTML pages, one CSS token/component layer, ES-module JS. All trek content lives in one data module; pure logic (formatting, pricing, booking state) lives in `lib/` and is unit-tested with Node's built-in test runner. Pages import data + lib and render into static HTML shells. No build step.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.13 (unpkg), Google Fonts (Anton, Overpass, Inter), `node --test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-10-25-gvchaalo-prototype-design.md`
**Visual reference:** `docs/concept/*.dc.html` (copy layout, colours and copy from these; they don't run on their own)

## Global Constraints

- Site is served from a subpath (`https://wakycoo-design.github.io/gvchaalo/`): **every** URL in HTML/CSS/JS is relative (`assets/…`, `trip.html?id=…`), never starting with `/`.
- Repo root contains `.nojekyll`.
- Palette: snow `#F7F9FB`, white, ink `#0F1A14`, muted text `#4A5650`, hairline `#E2E6E3`; ONE accent sign green `#1E6B47` (sign, primary button, links). Hero sky gradient `#2268BA → #4D96DE → #8FC2EE`. No orange anywhere.
- Fonts: Anton (trek names + a few big headlines), Inter 400–600 (everything else), Overpass 800 (sign plate only). Type scale 12/14/16/20/28/48/96+.
- **Design rules (spec §3) apply to every page:** no pills/chips, icon grids, stat counters, star rows, emoji, ✓/✕ lists, card shadows or stacked gradients; square/2px corners; hairlines + whitespace (section padding 160px desktop / 96px mobile); 12-col grid, asymmetric editorial layouts; max two buttons per screen (one solid green, one text link with →). `docs/concept/` is layout/content reference only — its styling is superseded.
- CDN scripts pinned exactly: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`, `…/gsap/3.12.5/ScrollTrigger.min.js`, `https://unpkg.com/lenis@1.1.13/dist/lenis.min.js`.
- Phone 9778 448 026 → WhatsApp link `https://wa.me/919778448026`. Instagram `https://www.instagram.com/gv.chaalo`.
- Payment step always shows "Demo only — no money is charged."
- Placeholders for unknown facts stay bracketed: `[2,000+]`, `[150+]`, `[4.9★]`, review quotes, `[Second number]`, cancellation policy.
- `prefers-reduced-motion: reduce` → no pinning, no swing/roll; sign shows static `↑ GVQ`.
- Works from 360px wide upward with no horizontal scroll.

## Review Focus

1. Deep link to `book.html` with a missing/unknown `trip` or a sold-out `date` → redirect to `index.html#treks` (or the trip page), never a blank wizard. *(Task 6 test)*
2. Traveller count above seats left (URL or stepper) → clamped to seats left, never below 1. *(Task 2 test)*
3. Page refresh mid-booking keeps the wizard step and inputs; storage that throws (private mode) falls back to memory without crashing. *(Task 2 test)*
4. Opening `confirm.html` directly with no completed booking → redirect to `index.html`. *(Task 7 test)*
5. Asset paths break under the `/gvchaalo/` subpath. *(Task 8 check: `grep` for `src="/`, `href="/`, `url(/`)*

---

### Task 1: Scaffold, design tokens, trek data, formatting

**Files:**
- Create: `.nojekyll`, `package.json`, `assets/css/base.css`, `assets/js/data/treks.js`, `assets/js/lib/format.js`
- Test: `tests/format.test.js`, `tests/treks.test.js`

**Interfaces:**
- Produces:
  - `package.json`: `{"name":"gvchaalo","private":true,"type":"module","scripts":{"test":"node --test tests/"}}` (no dependencies)
  - `TREKS: Trek[]` and `getTrek(slug: string): Trek | undefined` from `data/treks.js`
  - `Trek = { slug, code, name, posterName, tagline, start, end, days, nights, maxAltitudeFt, difficulty, season, groupMax: 20, priceFrom, heroImg, cardImg, overview, itinerary: Day[], included: string[], excluded: string[], carry: string[], faq: {q,a}[], addOns: AddOn[], departures: Departure[] }`
  - `Day = { day, title, altitudeFt, detail, info }`; `AddOn = { id: 'offload'|'gear', label, note, pricePerPerson }`; `Departure = { id: 'YYYY-MM-DD', startISO, endISO, seatsLeft, price, tag?: 'New Year'|'Early bird' }`
  - `formatINR(n: number): string` → `"₹8,999"`, Indian grouping (`₹1,24,995`)
  - `formatDateRange(startISO, endISO, { withYear = false } = {}): string` → `"13 – 17 Dec"`; different months `"30 Dec – 3 Jan"`; `withYear` appends the end year → `"7 – 10 Aug 2027"`. Callers pass `withYear: true` for departures tagged `'Early bird'`.

- [ ] **Step 1: Write failing tests**

```js
// tests/format.test.js
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { formatINR, formatDateRange } from '../assets/js/lib/format.js';
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
// tests/treks.test.js
test('three treks with spec values', () => {
  assert.deepEqual(TREKS.map(t => t.slug), ['kedarkantha', 'annapurna-base-camp', 'bhrigu-lake']);
  assert.equal(getTrek('kedarkantha').priceFrom, 8999);
  assert.equal(getTrek('annapurna-base-camp').maxAltitudeFt, 13550);
  assert.equal(getTrek('bhrigu-lake').days, 4);
  assert.equal(getTrek('nope'), undefined);
});
test('every departure is well formed', () => {
  for (const t of TREKS) for (const d of t.departures) {
    assert.match(d.id, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(d.seatsLeft >= 0 && d.seatsLeft <= 20);
    assert.ok(d.price >= t.priceFrom);
    assert.equal(t.itinerary.length, t.days);
  }
});
test('each trek has a sold-out and a low-seat departure', () => {
  for (const t of TREKS) {
    assert.ok(t.departures.some(d => d.seatsLeft === 0));
    assert.ok(t.departures.some(d => d.seatsLeft > 0 && d.seatsLeft <= 4));
  }
});
```

- [ ] **Step 2: Run `npm test`** — Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `format.js` and `treks.js`**
  - Content: copy the spec §5 table, itineraries and departure dates exactly. Kedarkantha copy (overview, day details, inclusions, FAQ) from `docs/concept/Trek.dc.html`; write the other two treks in the same voice and length.
  - Codes: `KDK`, `ABC`, `BHR`. Add-ons: Kedarkantha offload ₹1,500 / gear ₹800; ABC porter ₹3,500 / gear ₹1,200; Bhrigu offload ₹1,200 / gear ₹800.
  - Images: `assets/img/kedarkantha.jpg`, `annapurna.jpg`, `bhrigu-lake.jpg`.
  - Bhrigu departures (2027 season) all carry `tag: 'Early bird'` at `price: 7499` (= `priceFrom`); the tag is a label only.
  - Each trek includes at least one `seatsLeft: 0` and one `seatsLeft` ≤ 4.
- [ ] **Step 4: Write `base.css`**: `:root` tokens from Global Constraints, reset, type scale (`--display: Anton`, `--sign: Overpass`, `--body: Inter`), `.container { max-width: 1280px; padding-inline: 32px }` (16px under 600px), focus-visible ring `#F2A33A`.
- [ ] **Step 5: Run `npm test`** — Expected: all PASS.
- [ ] **Step 6: Commit** `feat: scaffold, tokens, trek data and formatting`

---

### Task 2: Booking logic (pricing, reference, state store)

**Files:**
- Create: `assets/js/lib/booking.js`
- Test: `tests/booking.test.js`

**Interfaces:**
- Consumes: `Trek`, `Departure`, `AddOn` (Task 1)
- Produces:
  - `clampPax(pax: number, seatsLeft: number): number` → integer in `[1, seatsLeft]`
  - `calcPrice({ trek, departure, pax, addOns: string[], payMode: 'full'|'advance' }) → { base, addOnLines: {id,label,amount}[], gst, total, advance, payNow }` — GST 5% on (base + add-ons), rounded to nearest rupee; `advance = 2000 × pax`; `payNow = payMode === 'full' ? total : advance`
  - `makeRef(code: string, rand = Math.random): string` → `GVC-KDK-48213` (5 digits, 10000–99999)
  - `createStore(storage?: Storage): { load(): Booking|null, save(b: Booking): void, clear(): void }` — key `gvc.booking`; any storage exception → in-memory fallback
  - `Booking = { trip, date, pax, addOns: string[], travellers: Traveller[], emergency: {name, phone}, payMode, step: 0|1|2|3, ref?: string, paidAt?: string }`

- [ ] **Step 1: Write failing tests**

```js
test('clampPax', () => {
  assert.equal(clampPax(5, 4), 4); assert.equal(clampPax(0, 4), 1); assert.equal(clampPax(2.7, 9), 2);
});
test('calcPrice Kedarkantha 2 pax + gear', () => {
  const trek = getTrek('kedarkantha'); const departure = trek.departures.find(d => d.seatsLeft > 0);
  const p = calcPrice({ trek, departure, pax: 2, addOns: ['gear'], payMode: 'full' });
  assert.equal(p.base, 2 * departure.price);
  assert.deepEqual(p.addOnLines.map(l => l.amount), [1600]);
  assert.equal(p.gst, Math.round((p.base + 1600) * 0.05));
  assert.equal(p.total, p.base + 1600 + p.gst);
  assert.equal(p.payNow, p.total);
});
test('advance mode', () => {
  const trek = getTrek('kedarkantha'); const departure = trek.departures.find(d => d.seatsLeft > 0);
  const p = calcPrice({ trek, departure, pax: 3, addOns: [], payMode: 'advance' });
  assert.equal(p.advance, 6000); assert.equal(p.payNow, 6000);
});
test('makeRef', () => {
  assert.equal(makeRef('KDK', () => 0.38), 'GVC-KDK-44200');
  assert.match(makeRef('ABC'), /^GVC-ABC-\d{5}$/);
});
test('store round-trips and survives a throwing storage', () => {
  const mem = new Map(); const fake = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: k => mem.delete(k) };
  const s = createStore(fake); s.save({ trip: 'kedarkantha', step: 1 }); assert.equal(s.load().step, 1);
  s.clear(); assert.equal(s.load(), null);
  const broken = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  const b = createStore(broken); b.save({ trip: 'bhrigu-lake', step: 2 }); assert.equal(b.load().step, 2);
});
```

- [ ] **Step 2: Run `npm test`** — Expected: FAIL.
- [ ] **Step 3: Implement `booking.js`** (`makeRef`: `10000 + Math.floor(rand() * 90000)`).
- [ ] **Step 4: Run `npm test`** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: booking pricing, reference and state store`

---

### Task 3: Site shell and home page (static sections)

**Files:**
- Create: `index.html`, `assets/css/components.css`, `assets/css/pages.css`, `assets/js/ui.js`, `assets/js/home.js`, `assets/img/logo.svg`

**Interfaces:**
- Consumes: `TREKS`, `formatINR`, `formatDateRange`
- Produces:
  - `initUI(): void` in `ui.js` — header (transparent over hero, solid `#FFFFFF` with ink text after 80px scroll), mobile menu toggle (`aria-expanded`, closes on link click / Esc), WhatsApp FAB, `[data-reveal]` fade-up via IntersectionObserver (skipped under reduced motion)
  - `renderTrekRow(trek, index): string` in `home.js` — full-width editorial row (photo spans 7 of 12 columns, text 4; alternate sides by `index`), linking `trip.html?id=<slug>`; next departure = first with `seatsLeft > 0`; when `seatsLeft ≤ 4`, a plain small-text line "`N` seats left on `<date>`"
  - Header/footer markup copied identically into every page (no includes)

- [ ] **Step 1: Build `index.html`** per spec §4.1 order: hero (`#sign-stage` for Task 4, headline "Walk above the clouds.", one green "Explore treks" button + one "WhatsApp us →" text link), `01 — Treks` (`<div id="trek-rows">`), `02 — About` (one large paragraph + one tall photo), `03 — From the trail` (5-photo drifting strip + @gv.chaalo link), Words (one pull quote, prev/next), footer CTA + minimal footer. WhatsApp FAB is a small quiet circle, ink on white. Logo SVG is the mountain mark from the concept.
- [ ] **Step 2: Implement `ui.js`, `home.js`** (`home.js` fills `#trek-rows` from `TREKS`; `[data-reveal]` text reveals line by line, images fade + scale 1.04 → 1 over 900ms).
- [ ] **Step 3: Verify** — `python3 -m http.server 8080` from repo root, open `http://localhost:8080/`: 3 cards render with correct prices/next batch, menu works at 375px, no console errors, no horizontal scroll at 360px.
- [ ] **Step 4: Commit** `feat: home page shell and sections`

---

### Task 4: Hero sign animation

**Files:**
- Create: `assets/js/hero-sign.js`, `assets/css/hero.css`
- Modify: `index.html` (load GSAP, ScrollTrigger, Lenis; import `hero-sign.js`)

**Interfaces:**
- Consumes: `TREKS` (sign messages), `#sign-stage`
- Produces: `initHeroSign(stage: HTMLElement, messages: {title, sub, sky: [top, bottom]}[]): void`
  - Messages: `{ GVQ / THIS WAY TO THE HIMALAYAS }` then one per trek: `KEDARKANTHA / 12,500 FT · 5 DAYS · DEC–MAR` (sky winter blue `#2268BA→#9CC9F0`), `ANNAPURNA BC / 13,550 FT · 9 DAYS · NEPAL` (alpine glow `#3B5BA0→#F2B66A`), `BHRIGU LAKE / 14,000 FT · 4 DAYS · MANALI` (lake teal `#1F6F8B→#8FD3D8`)

- [ ] **Step 1: Build the sign DOM** (built in `initHeroSign`): wires as inline SVG with `vector-effect="non-scaling-stroke"`, hangers, green plate with 4 bolts, arrow SVG, text window. Sign sizes: 640px wide desktop, `min(92vw, 340px)` under 600px; long titles auto-shrink to fit (`font-size` from available width).
- [ ] **Step 2: Load timeline** — swing in from above with damped pendulum (rotate −9° → 5° → −2.5° → 1.2° → 0, ~1.9s, `transform-origin` above the plate), then an endless ±0.6° sway; clouds drift slowly; light parallax on the hero photo when scrolling (no pinning, no scroll-jacking).
- [ ] **Step 3: Message cycle (time-based)** — `↑ GVQ` holds **4s** from the moment the swing settles; then each trek message holds 3s; then `↑ GVQ` again (4s); loop. Each change rolls the text up (old out, new in, 0.7s `power3.inOut`) with a tiny plate jolt, and tweens the sky gradient. Export the hold durations as `HOLD_FIRST_MS = 4000`, `HOLD_MS = 3000`. Pause the loop when the hero leaves the viewport (IntersectionObserver) or `document.hidden`; resume where it stopped. Lenis drives smooth scroll and calls `ScrollTrigger.update`.
- [ ] **Step 4: Reduced motion / no-JS** — the HTML already contains the static `↑ GVQ` sign so the hero is complete without JS; with `prefers-reduced-motion: reduce`, skip all timelines and the cycle.
- [ ] **Step 5: Verify** — desktop and 375px: swing-in plays, GVQ stays ~4s, then the 3 treks cycle and loop back; scrolling away and back resumes; with macOS "Reduce motion" on, the sign is static; no console errors.
- [ ] **Step 6: Commit** `feat: animated GVQ highway-sign hero`

---

### Task 5: Trip page

**Files:**
- Create: `trip.html`, `assets/js/trip.js`

**Interfaces:**
- Consumes: `getTrek`, `formatINR`, `formatDateRange`, `initUI`
- Produces: `renderTrip(trek): void`; departure buttons link to `book.html?trip=<slug>&date=<id>`; sold-out rows are disabled `<button disabled>` with strikethrough

- [ ] **Step 1: Build `trip.html`** following `docs/concept/Trek.dc.html`: hero with poster title, facts strip, overview, altitude-profile SVG (generated from `itinerary[].altitudeFt`, summit dot in `#F2A33A`), day-by-day list, included/excluded, things to carry, FAQ (`<details>`), departures card, sticky mobile "Book now — from ₹X" bar.
- [ ] **Step 2: Implement `trip.js`** — unknown/missing `id` → `location.replace('index.html#treks')`; sets `document.title` to `<Trek name> — gv.chaalo`.
- [ ] **Step 3: Verify** — all 3 `trip.html?id=…` pages render with their own data; `trip.html?id=xyz` redirects; sold-out date not clickable.
- [ ] **Step 4: Commit** `feat: trip detail page`

---

### Task 6: Booking wizard

**Files:**
- Create: `book.html`, `assets/js/book.js`
- Test: `tests/book-guard.test.js`

**Interfaces:**
- Consumes: `getTrek`, `calcPrice`, `clampPax`, `createStore`, `makeRef`, `formatINR`, `formatDateRange`
- Produces:
  - `resolveEntry(params: URLSearchParams, saved: Booking|null): { redirect: string } | { booking: Booking }` (exported, pure) — saved booking for the same trip wins (resume); unknown trip → `{redirect:'index.html#treks'}`; missing or sold-out date → first open departure; pax clamped
  - On payment success: saves `{ ...booking, ref: makeRef(trek.code), paidAt: ISO }` then `location.href = 'confirm.html'`

- [ ] **Step 1: Write failing tests** for `resolveEntry`:

```js
test('unknown trip redirects', () => {
  assert.deepEqual(resolveEntry(new URLSearchParams('trip=xyz'), null), { redirect: 'index.html#treks' });
});
test('sold-out date falls back to first open departure', () => {
  const t = getTrek('kedarkantha'); const sold = t.departures.find(d => d.seatsLeft === 0);
  const { booking } = resolveEntry(new URLSearchParams(`trip=kedarkantha&date=${sold.id}`), null);
  assert.equal(booking.date, t.departures.find(d => d.seatsLeft > 0).id);
});
test('saved booking for same trip resumes at its step', () => {
  const saved = { trip: 'kedarkantha', date: getTrek('kedarkantha').departures.find(d => d.seatsLeft > 0).id, pax: 2, addOns: [], travellers: [], step: 2, payMode: 'full' };
  assert.equal(resolveEntry(new URLSearchParams('trip=kedarkantha'), saved).booking.step, 2);
});
```

  (`book.js` must not touch `document` at import time so Node can import `resolveEntry`; DOM wiring runs from an `init()` called only when `typeof document !== 'undefined'`.)

- [ ] **Step 2: Run `npm test`** — Expected: FAIL.
- [ ] **Step 3: Implement `book.html` + `book.js`** following `docs/concept/Booking.dc.html`: progress pills; step 0 batch / travellers stepper / add-ons; step 1 one form card per traveller (name, age, gender, phone, email) + emergency contact, `required` + pattern validation with inline errors under fields; step 2 review + full/advance choice + terms checkbox (required); step 3 payment modal (UPI / Card / Netbanking tabs, focus trapped, Esc closes, Pay shows a spinner for 1.6s then success). Summary sidebar always reflects `calcPrice`. Every change saves via the store.
- [ ] **Step 4: Run `npm test`** — Expected: PASS.
- [ ] **Step 5: Verify manually** — full flow for each trek at desktop and 375px; refresh on step 1 keeps typed details; keyboard-only run-through works.
- [ ] **Step 6: Commit** `feat: mock booking wizard`

---

### Task 7: Confirmation page

**Files:**
- Create: `confirm.html`, `assets/js/confirm.js`, `assets/js/lib/ics.js`
- Test: `tests/ics.test.js`, `tests/confirm-guard.test.js`

**Interfaces:**
- Consumes: `createStore`, `getTrek`, `formatINR`, `formatDateRange`
- Produces:
  - `buildICS({ title, startISO, endISO, location, description, uid }): string` — `VCALENDAR`/`VEVENT`, all-day `DTSTART;VALUE=DATE:20261213`, `DTEND` = day after `endISO`, CRLF line endings
  - `confirmGuard(booking: Booking|null): string|null` → `'index.html'` unless `booking?.ref`, else `null`

- [ ] **Step 1: Write failing tests** — ICS contains `BEGIN:VEVENT`, `DTSTART;VALUE=DATE:20261213`, `DTEND;VALUE=DATE:20261218`, lines joined with `\r\n`; `confirmGuard(null) === 'index.html'`, `confirmGuard({ref:'GVC-KDK-12345'}) === null`.
- [ ] **Step 2: Run `npm test`** — Expected: FAIL.
- [ ] **Step 3: Implement** — page per concept "You're going!" state: sign plate flips to `↑ <POSTER NAME>`, reference, summary, paid amount, "Add to calendar" (Blob download `gvchaalo-<slug>.ics`), "Share on WhatsApp" (`https://wa.me/?text=` encoded), what-happens-next list, "Back to home" (clears store).
- [ ] **Step 4: Run `npm test`** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: booking confirmation page`

---

### Task 8: QA and deploy

**Files:**
- Modify: `README.md` (how to run locally, live URL)

- [ ] **Step 1: Subpath check** — `grep -rnE '(src|href)="/|url\(/' --include=*.html --include=*.css --include=*.js .` → Expected: no matches outside `docs/`.
- [ ] **Step 2: `npm test`** — Expected: all PASS.
- [ ] **Step 3: Lighthouse** (Chrome DevTools, mobile) on `index.html` and `trip.html?id=kedarkantha` → performance ≥ 85, accessibility ≥ 90. Fix: hero image `fetchpriority="high"`, others `loading="lazy"`, explicit `width`/`height`.
- [ ] **Step 4: Commit and push** `chore: QA fixes and README` → `git push`.
- [ ] **Step 5: Verify live** — after the Pages build shows `built` (`gh api repos/wakycoo-design/gvchaalo/pages/builds --jq '.[0].status'`), open `https://wakycoo-design.github.io/gvchaalo/`, click home → trek → book → pay → confirm on desktop and phone.
