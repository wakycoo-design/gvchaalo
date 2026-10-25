# gv.chaalo — Website Prototype

Pitch-demo website for **gv.chaalo**, a Kerala-based Himalayan trekking company
([@gv.chaalo](https://www.instagram.com/gv.chaalo)).

Front-end only: no backend, no real payments. The booking flow is a clickable mock.

**Live:** https://wakycoo-design.github.io/gvchaalo/

## Run it locally

No build step. From the repo root:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
npm test                      # unit tests (Node 22+, no dependencies)
```

## Site map

| Page | What it does |
|---|---|
| `index.html` | Home: animated "↑ GVQ" sign hero (GVQ 8s, then each trek every 5.5s), treks, about, trail photos, reviews |
| `trip.html?id=<slug>` | Trek page: facts, altitude chart, day by day, inclusions, FAQ, departures |
| `book.html?trip=<slug>&date=<YYYY-MM-DD>` | Mock booking: batch → travellers → review → demo payment |
| `confirm.html` | Confirmation with booking reference and calendar download |

All trek content (prices, dates, itineraries) lives in `assets/js/data/treks.js`.

## What's here

| Path | What it is |
|---|---|
| `docs/superpowers/specs/2026-10-25-gvchaalo-prototype-design.md` | Design spec: pages, trek content, architecture |
| `docs/concept/` | Concept screens (home, trek page, booking flow, mobile) exported from the design canvas. They use the canvas runtime and image links, so they don't render on their own. They're a reference for the build. |
| `assets/img/` | Stock photos (Unsplash) used until real gv.chaalo photos arrive |

## Treks in the prototype

- **Kedarkantha** — Dehradun → Dehradun · 5D/4N · 12,500 ft · Dec–Mar · from ₹8,999
- **Annapurna Base Camp** — Gorakhpur → Gorakhpur · 9D/8N · 13,550 ft · Oct–Dec · from ₹24,999
- **Bhrigu Lake** — Manali → Manali · 4D/3N · 14,000 ft · Aug–Sep · from ₹7,499

## Still needed from the client

- Clean logo file and original trek photos
- Second phone number
- Real reviews, stats and cancellation policy

## Photo credits

Photos from [Unsplash](https://unsplash.com), used under the Unsplash License.
