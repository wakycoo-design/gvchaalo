# gv.chaalo — Website Prototype (Design Spec)

Date: 2026-10-25
Status: Draft — awaiting review

## 1. Purpose

A clickable, front-end-only prototype website for **gv.chaalo**, a Kerala-based Himalayan
trekking company (Instagram: @gv.chaalo). It is a **pitch demo to win the real build**, so it
must look and feel world-class (Black Tomato polish, Contiki energy) and the booking flow must
feel real, but nothing is persisted and no payment is taken.

**Success:** opened on a laptop or phone in front of the client, it loads fast, the hero
animation impresses in the first 3 seconds, and a full booking (trip → date → travellers →
pay → confirmation) can be clicked through end-to-end with no dead links.

## 2. Scope

In:
- Home, Trip detail (×3), Booking flow, Confirmation
- 3 trek packages with full content (below)
- Fully responsive (360px phone → wide desktop)
- Mock checkout styled like a payment gateway
- Floating WhatsApp / call button

Out (YAGNI for a demo): backend, database, real payments, admin panel, login, CMS,
blog, multi-language, search/filter page (only 3 trips).

## 3. Brand & Visual Direction

- **Name on site:** `gv.chaalo` with the mountain-peak logomark (recreated as SVG from the
  Instagram logo). Hero sign reads **↑ GVQ** as supplied by the client.
- **Mood:** Young, adventurous, outdoorsy; big edge-to-edge mountain photography; bold
  condensed headlines like their Instagram posters (e.g. "ANNAPURNA", "KEDARKANTHA").
- **Palette:** highway-sign green `#1E6B47`, logo green `#178A3E`, sky blue `#4A90D9`,
  snow white `#F7F9FB`, ink `#0F1A14`, alpine-glow orange accent `#F2A33A`.
- **Type:** Anton (display, poster headlines), Overpass (sign lettering — derived from
  Highway Gothic, and UI), Inter (body). Google Fonts.
- **Motion:** GSAP + ScrollTrigger. Smooth, purposeful; respects `prefers-reduced-motion`.

## 4. Pages

### 4.1 Home (`index.html`)
1. **Hero — "The Sign."** Full-viewport blue sky, two overhead wires across the frame.
   A green highway sign, built in SVG/CSS (not the photo), reading `↑ GVQ`.
   - Load: sign swings in on its wires from above, settles with a damped pendulum sway;
     arrow does a subtle upward nudge every few seconds; small drifting clouds (parallax).
   - Scroll (pinned): like driving under gantries — the sign text flips/rolls through
     `↑ GVQ` → `↑ KEDARKANTHA 12,500 FT` → `↑ ANNAPURNA BASE CAMP` → `↑ BHRIGU LAKE`,
     with the sky tint shifting per destination (winter blue → alpine-glow → lake teal).
     The final state un-pins into the trips section.
   - Header: logo left, nav (Treks, Why us, Gallery, Contact), "Book a trek" CTA.
2. **Upcoming treks:** 3 large poster-style cards (photo, bold name, days, altitude,
   "from ₹", next batch, seats-left pill). Hover: photo zoom, details slide up.
3. **Why gv.chaalo:** 4 points — Certified trek leaders; Small batches (max 20);
   All-inclusive from base city; Kerala crew, travel together. Counters (e.g. 2,000+
   trekkers, 150+ batches, 4.9★) animate on scroll — illustrative numbers.
4. **Gallery wall:** Instagram-style masonry with gentle horizontal drift; links to @gv.chaalo.
5. **Reviews:** 3–4 short testimonials (placeholder names), carousel on mobile.
6. **CTA band + footer:** "The mountains are calling. Chaalo." Phone 9778 448 026,
   WhatsApp, Instagram, location: Kerala.

### 4.2 Trip detail (`trip.html?id=<slug>`)
Single template rendered from data. Sections: full-bleed hero with poster title;
quick facts strip (duration, max altitude, difficulty, start/end city, season, group size);
overview; day-by-day itinerary (accordion with altitude per day + a small elevation-profile
SVG); inclusions / exclusions; things to carry; **departure dates table** (date, seats left,
price, Select) with sold-out / filling-fast states; FAQ; sticky "Book now — from ₹X" bar.

### 4.3 Booking flow (`book.html?trip=<slug>&date=<iso>`)
4-step wizard with progress bar, state held in `sessionStorage`:
1. **Batch & travellers** — date (pre-selected if passed), traveller count (1–seats left),
   optional add-ons (e.g. offloading backpack, rental gear).
2. **Traveller details** — name, age, gender, phone, email per traveller; emergency contact.
   Client-side validation with inline errors.
3. **Review** — itinerary summary, price breakdown (base × pax + add-ons + 5% GST),
   pay-full or pay-advance (₹2,000/person) choice, terms checkbox.
4. **Payment (mock)** — gateway-style modal: UPI / Card / Netbanking tabs; "Pay" shows a
   2-second processing state then succeeds. Clearly labelled "Demo — no money is charged".

### 4.4 Confirmation
"You're going! 🏔" with a short celebratory animation (sign flips to `↑ <TREK NAME>`),
booking reference (e.g. `GVC-KDK-48213`), summary, "Add to calendar" (.ics download),
"Share on WhatsApp", and what-happens-next checklist.

## 5. Trek Content (drafted by us; client may correct)

| | Kedarkantha | Annapurna Base Camp | Bhrigu Lake |
|---|---|---|---|
| Slug | `kedarkantha` | `annapurna-base-camp` | `bhrigu-lake` |
| Start–end | Dehradun → Dehradun | Gorakhpur → Gorakhpur | Manali → Manali |
| Duration | 5D / 4N | 9D / 8N | 4D / 3N |
| Max altitude | 12,500 ft | 13,550 ft (4,130 m) | 14,000 ft |
| Difficulty | Easy–Moderate | Moderate | Easy–Moderate |
| Season | Dec–Mar (winter snow) | Oct–Dec | Aug–Sep |
| Price from | ₹8,999 | ₹24,999 | ₹7,499 |

**Itineraries**
- *Kedarkantha:* D1 Dehradun → Sankri drive (6,400 ft); D2 Sankri → Juda ka Talab (9,100 ft);
  D3 → Kedarkantha Base (11,250 ft); D4 pre-dawn summit (12,500 ft) → descend to Hargaon;
  D5 → Sankri → Dehradun.
- *Annapurna BC:* D1 Gorakhpur → Sunauli border → Pokhara; D2 drive to Jhinu, trek to
  Chhomrong (7,120 ft); D3 → Bamboo (7,640 ft); D4 → Deurali (10,500 ft); D5 → Machhapuchhre
  BC → Annapurna BC (13,550 ft); D6 sunrise at ABC → Bamboo; D7 → Jhinu hot springs;
  D8 → Pokhara; D9 Pokhara → Gorakhpur. (Indian citizens: Aadhaar/Voter ID, no passport.)
- *Bhrigu Lake:* D1 Manali → Gulaba → Jonker Thach camp (10,000 ft); D2 → Rola Kholi
  (12,000 ft); D3 → Bhrigu Lake (14,000 ft) and back; D4 → Gulaba → Manali.

**Departures (mock, relative to Oct 2026):**
- Kedarkantha: 6, 13, 20, 27 Dec 2026; 10, 24 Jan; 7, 21 Feb; 7 Mar 2027
- ABC: 1, 15, 29 Nov; 13 Dec 2026
- Bhrigu Lake: 2027 season — 7, 21 Aug; 4, 18 Sep ("Early-bird" pricing)
Seat counts vary per batch to show "Filling fast" and "Sold out" states.

## 6. Architecture

Static site, no build step, deployable to Netlify/Vercel by drag-and-drop.

```
index.html  trip.html  book.html  confirm.html
assets/
  css/  base.css (tokens, reset, type)  components.css  pages.css
  js/
    data/treks.js     — single source of truth: all trek content + departures
    lib/booking.js    — booking state (sessionStorage), pricing, reference generator
    lib/format.js     — ₹ currency, dates
    hero-sign.js      — hero sign build + GSAP timelines
    home.js  trip.js  book.js  confirm.js  — per-page render/wiring
    ui.js             — header, mobile menu, WhatsApp button, reveal-on-scroll
  img/  logo.svg, sign assets, trek photos
```

- **Libraries (CDN, pinned):** GSAP 3.12.5 + ScrollTrigger, Lenis (smooth scroll).
- **Data flow:** pages read `treks.js` → render; booking steps read/write a single
  `booking` object in `sessionStorage`; confirm page reads it and clears on "Done".
- **Robustness:** unknown trip slug / missing booking state → friendly redirect to home
  treks section; storage unavailable → state kept in memory for the session.
- **Images:** free stock (Unsplash) of matching locations until the client supplies
  originals; all `loading="lazy"` except hero; sized via `srcset`.

## 7. Quality Bar / Verification

- Manual click-through of all 3 treks × full booking on desktop and 375px mobile.
- No console errors; Lighthouse performance ≥ 85, accessibility ≥ 90.
- Keyboard-navigable wizard; visible focus; reduced-motion disables pin/scroll effects.

## 8. Open Items (non-blocking)

- Client's clean logo file and original trek photos (currently recreated/stock).
- Confirm brand name usage: site uses "gv.chaalo"; hero sign shows "GVQ".
- Second phone number (truncated in screenshots).
