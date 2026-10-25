import { getTrek } from './data/treks.js';
import { formatINR, formatDateRange } from './lib/format.js';
import { createStore } from './lib/booking.js';
import { buildICS } from './lib/ics.js';

export function confirmGuard(booking) {
  return booking?.ref ? null : 'index.html';
}

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

function init() {
  const store = createStore();
  const b = store.load();
  const redirect = confirmGuard(b);
  const trek = b && getTrek(b.trip);
  if (redirect || !trek) { location.replace('index.html'); return; }

  const dep = trek.departures.find(d => d.id === b.date);
  const dates = formatDateRange(dep.startISO, dep.endISO, { withYear: true });
  const set = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; };

  set('[data-c-sign]', esc(trek.posterName));
  set('[data-c-ref]', esc(b.ref));
  set('[data-c-lines]', [
    ['Trek', `${esc(trek.name)} · ${trek.days} days`],
    ['Batch', dates],
    ['Meet', `${esc(trek.start)}, 6:30 AM on day 1`],
    ['Travellers', b.travellers.map(t => esc(t.name)).join(', ')],
    ['Paid', `${formatINR(b.paidAmount ?? 0)}${b.payMode === 'advance' ? ' advance · balance due 15 days before' : ' · paid in full'}`]
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join(''));

  const lead = b.travellers[0]?.name?.split(' ')[0] ?? '';
  set('[data-c-hello]', lead ? `See you in the mountains, ${esc(lead)}.` : 'See you in the mountains.');

  document.querySelector('[data-c-ics]')?.addEventListener('click', () => {
    const ics = buildICS({
      title: `${trek.name} with gv.chaalo`,
      startISO: dep.startISO,
      endISO: dep.endISO,
      location: trek.start,
      description: `Booking ${b.ref}. Meet at ${trek.start}, 6:30 AM on day 1. Questions: +91 97784 48026`,
      uid: b.ref
    });
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `gvchaalo-${trek.slug}.ics` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const share = document.querySelector('[data-c-share]');
  if (share) share.href = `https://wa.me/?text=${encodeURIComponent(`I'm going to ${trek.name} with gv.chaalo (${dates})! Join me: https://www.instagram.com/gv.chaalo`)}`;

  document.querySelectorAll('[data-c-home]').forEach(a => a.addEventListener('click', () => store.clear()));

  // The plate drops in once, the same gesture as the home page sign.
  const sign = document.querySelector('[data-c-plate]');
  if (window.gsap && sign && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.gsap.timeline({ delay: 0.2 })
      .fromTo(sign, { y: -60, rotation: -7, opacity: 0 }, { y: 0, rotation: 4, opacity: 1, duration: 0.8, ease: 'power3.out' })
      .to(sign, { rotation: -1.5, duration: 0.35, ease: 'sine.inOut' })
      .to(sign, { rotation: 0, duration: 0.3, ease: 'sine.inOut' });
  }
}

if (typeof document !== 'undefined') init();
