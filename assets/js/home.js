import { TREKS } from './data/treks.js';
import { formatINR, formatDate } from './lib/format.js';

const QUOTES = [
  { text: '[A real review from a gv.chaalo trekker goes here — taken from Google or Instagram.]', by: '[Name] · Kedarkantha, Dec 2025' },
  { text: '[A second review. Short, specific and in the trekker’s own words works best.]', by: '[Name] · Annapurna Base Camp, Nov 2025' },
  { text: '[A third review, ideally from someone who came alone and left with a group of friends.]', by: '[Name] · Bhrigu Lake, Sep 2026' }
];

export function nextDeparture(trek) {
  return trek.departures.find(d => d.seatsLeft > 0);
}

export function renderTrekRow(trek, index) {
  const next = nextDeparture(trek);
  const url = `trip.html?id=${trek.slug}`;
  const withYear = next?.tag === 'Early bird';
  const nextLine = next
    ? `Next batch <strong>${formatDate(next.startISO, { withYear })}</strong>` +
      (next.seatsLeft <= 4 ? ` · ${next.seatsLeft} seats left` : '')
    : 'All batches full — <a href="https://wa.me/919778448026">join the waitlist</a>';

  return `
    <article class="trek-row${index % 2 ? ' trek-row--flip' : ''}">
      <a class="trek-row__media" href="${url}" tabindex="-1" aria-hidden="true" data-reveal-img>
        <img src="${trek.cardImg}" width="1400" height="933" loading="lazy" alt="">
      </a>
      <div class="trek-row__body" data-reveal>
        <p class="label">${trek.kind} · ${trek.start}</p>
        <h3 class="trek-row__name"><a href="${url}">${trek.posterName}</a></h3>
        <p class="trek-row__tagline">${trek.tagline}</p>
        <dl class="facts">
          <div><dt>Duration</dt><dd>${trek.days} days</dd></div>
          <div><dt>Max altitude</dt><dd>${trek.maxAltitudeFt.toLocaleString('en-IN')} ft</dd></div>
          <div><dt>Season</dt><dd>${trek.season}</dd></div>
          <div><dt>From</dt><dd>${formatINR(trek.priceFrom)}</dd></div>
        </dl>
        <p class="trek-row__next">${nextLine}</p>
        <a class="link-arrow trek-row__cta" href="${url}">View trek</a>
      </div>
    </article>`;
}

function initQuotes() {
  const fig = document.querySelector('[data-quotes]');
  if (!fig) return;
  const text = fig.querySelector('[data-quote-text]');
  const by = fig.querySelector('[data-quote-by]');
  const count = document.querySelector('[data-quote-count]');
  let i = 0;
  const show = n => {
    i = (n + QUOTES.length) % QUOTES.length;
    fig.classList.add('is-fading');
    setTimeout(() => {
      text.textContent = QUOTES[i].text;
      by.textContent = QUOTES[i].by;
      count.textContent = `${i + 1} / ${QUOTES.length}`;
      fig.classList.remove('is-fading');
    }, 350);
  };
  document.querySelector('[data-quote-prev]')?.addEventListener('click', () => show(i - 1));
  document.querySelector('[data-quote-next]')?.addEventListener('click', () => show(i + 1));
}

function initStrip() {
  const track = document.querySelector('[data-strip-track]');
  if (!track) return;
  // Duplicate the photos once so the CSS marquee loops without a seam.
  [...track.children].forEach(img => {
    const copy = img.cloneNode(true);
    copy.alt = '';
    copy.setAttribute('aria-hidden', 'true');
    track.appendChild(copy);
  });
}

async function init() {
  document.getElementById('trek-rows').innerHTML = TREKS.map(renderTrekRow).join('');
  initStrip();
  initQuotes();
  const { initUI } = await import('./ui.js');
  initUI();
}

if (typeof document !== 'undefined') init();
