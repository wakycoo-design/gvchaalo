import { getTrek } from './data/treks.js';
import { formatINR, formatDateRange } from './lib/format.js';

const ft = n => `${n.toLocaleString('en-IN')} ft`;

export function tripFromParams(params) {
  return getTrek(params.get('id') ?? '');
}

export function firstOpenDeparture(trek) {
  return trek.departures.find(d => d.seatsLeft > 0);
}

function seatsText(n) {
  if (n === 0) return 'Full';
  if (n <= 4) return `${n} ${n === 1 ? 'seat' : 'seats'} left`;
  return `${n} seats`;
}

export function departureRows(trek) {
  return trek.departures.map(d => {
    const dates = formatDateRange(d.startISO, d.endISO, { withYear: d.tag === 'Early bird' });
    const tag = d.tag ? `<span class="dep__tag">${d.tag}</span>` : '';
    const inner = `
      <span class="dep__dates">${dates}${tag}</span>
      <span class="dep__seats${d.seatsLeft > 0 && d.seatsLeft <= 4 ? ' is-low' : ''}">${seatsText(d.seatsLeft)}</span>
      <span class="dep__price">${formatINR(d.price)}</span>`;
    return d.seatsLeft > 0
      ? `<li><a class="dep" href="book.html?trip=${trek.slug}&amp;date=${d.id}">${inner}<span class="dep__go" aria-hidden="true">→</span></a></li>`
      : `<li><div class="dep is-full" aria-disabled="true">${inner}<span class="dep__go" aria-hidden="true"></span></div></li>`;
  }).join('');
}

export function altitudeSVG(itinerary) {
  const W = 800, H = 260, padX = 48, top = 48, base = 210;
  const alts = itinerary.map(d => d.altitudeFt);
  const max = Math.max(...alts);
  const min = Math.min(...alts) - 1500;
  const x = i => padX + (i * (W - padX * 2)) / Math.max(itinerary.length - 1, 1);
  const y = a => base - ((a - min) / (max - min)) * (base - top);
  const pts = itinerary.map((d, i) => `${x(i).toFixed(1)},${y(d.altitudeFt).toFixed(1)}`);
  const label = 'Altitude by day: ' + itinerary.map(d => `day ${d.day} ${ft(d.altitudeFt)}`).join(', ') + `. Highest point ${ft(max)}.`;

  const dots = itinerary.map((d, i) => {
    const peak = d.altitudeFt === max;
    return `<circle cx="${x(i).toFixed(1)}" cy="${y(d.altitudeFt).toFixed(1)}" r="${peak ? 6 : 4}" class="${peak ? 'alt__peak' : 'alt__dot'}"/>` +
      `<text x="${x(i).toFixed(1)}" y="${(y(d.altitudeFt) - 14).toFixed(1)}" class="alt__val${peak ? ' is-peak' : ''}">${ft(d.altitudeFt)}</text>` +
      `<text x="${x(i).toFixed(1)}" y="${base + 30}" class="alt__day">Day ${d.day}</text>`;
  }).join('');

  return `<svg class="alt" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
    <line x1="${padX}" y1="${base}" x2="${W - padX}" y2="${base}" class="alt__base"/>
    <polygon points="${padX},${base} ${pts.join(' ')} ${W - padX},${base}" class="alt__area"/>
    <polyline points="${pts.join(' ')}" class="alt__line"/>
    ${dots}
  </svg>`;
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function renderTrip(trek) {
  const open = firstOpenDeparture(trek);
  const bookUrl = open ? `book.html?trip=${trek.slug}&date=${open.id}` : 'https://wa.me/919778448026';
  document.title = `${trek.name} · gv.chaalo`;
  const set = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; };

  set('[data-trip-crumb]', esc(trek.name));
  set('[data-trip-kind]', `${esc(trek.kind)} · ${esc(trek.start)} to ${esc(trek.end)}`);
  set('[data-trip-title]', esc(trek.posterName));
  set('[data-trip-tagline]', esc(trek.tagline));
  set('[data-trip-facts]', [
    ['Duration', `${trek.days} days, ${trek.nights} nights`],
    ['Max altitude', ft(trek.maxAltitudeFt)],
    ['Difficulty', trek.difficulty],
    ['Start and end', trek.start],
    ['Season', trek.season],
    ['Group size', `Max ${trek.groupMax}`]
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join(''));

  const img = document.querySelector('[data-trip-img]');
  img.src = trek.heroImg;
  img.alt = trek.imgAlt;

  set('[data-trip-overview]', esc(trek.overview));
  set('[data-trip-alt]', altitudeSVG(trek.itinerary));
  set('[data-trip-days]', trek.itinerary.map(d => `
    <li class="day">
      <p class="day__num">Day ${d.day}</p>
      <div>
        <h3 class="day__title">${esc(d.title)}</h3>
        <p class="day__info">${ft(d.altitudeFt)} · ${esc(d.info)}</p>
        <p class="day__detail">${esc(d.detail)}</p>
      </div>
    </li>`).join(''));
  set('[data-trip-in]', trek.included.map(i => `<li>${esc(i)}</li>`).join(''));
  set('[data-trip-out]', trek.excluded.map(i => `<li>${esc(i)}</li>`).join(''));
  set('[data-trip-carry]', trek.carry.map(i => `<li>${esc(i)}</li>`).join(''));
  set('[data-trip-faq]', trek.faq.map((f, i) => `
    <details class="faq"${i === 0 ? ' open' : ''}>
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`).join(''));

  set('[data-trip-price]', formatINR(trek.priceFrom));
  set('[data-trip-deps]', departureRows(trek));
  document.querySelectorAll('[data-trip-book]').forEach(a => { a.href = bookUrl; });
  document.querySelectorAll('[data-trip-from]').forEach(el => { el.textContent = formatINR(trek.priceFrom); });

  const list = document.querySelector('[data-trip-deps]');
  const more = document.querySelector('[data-trip-more]');
  if (list && more && trek.departures.length > 5) {
    list.classList.add('is-clipped');
    more.hidden = false;
    more.addEventListener('click', () => {
      const clipped = list.classList.toggle('is-clipped');
      more.textContent = clipped ? `Show all ${trek.departures.length} dates` : 'Show fewer dates';
      more.setAttribute('aria-expanded', String(!clipped));
    });
    more.textContent = `Show all ${trek.departures.length} dates`;
  }
}

async function init() {
  const trek = tripFromParams(new URLSearchParams(location.search));
  if (!trek) { location.replace('index.html#treks'); return; }
  renderTrip(trek);
  const { initUI } = await import('./ui.js');
  initUI();
}

if (typeof document !== 'undefined') init();
