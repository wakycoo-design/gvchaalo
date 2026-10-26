import { TREKS } from './data/treks.js';
import { formatINR, formatDate } from './lib/format.js';

// Sample reviews for the prototype; the page labels them as such.
export const REVIEWS = [
  { name: 'Ameen', trek: 'Kedarkantha', when: 'Dec 2025', rating: 5, tone: '#1E6B47',
    text: 'First snow trek and easily the best decision of my year. The summit sunrise was unreal, and the team handled everything from Dehradun onwards. Already eyeing Annapurna.' },
  { name: 'Anamika', trek: 'Bhrigu Lake', when: 'Sep 2026', rating: 5, tone: '#8A5A3C',
    text: 'Went solo, came back with ten new friends. The leaders were patient with slow walkers like me, and the food at camp was honestly better than some restaurants.' },
  { name: 'Philip', trek: 'Annapurna Base Camp', when: 'Nov 2025', rating: 5, tone: '#3D5A80',
    text: 'Nine days and zero stress. Border, permits, teahouses, all sorted. Standing at base camp with Annapurna right in front of you is something I will never forget.' },
  { name: 'Mathew', trek: 'Kedarkantha', when: 'Jan 2026', rating: 4, tone: '#5B5F4A',
    text: 'Well organised and safety first. They really keep the groups small. Only wish the drive from Dehradun was shorter, but that is the mountains. Will go again.' }
];

export function reviewSummary(reviews) {
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

export function renderReview(r) {
  const stars = '★'.repeat(r.rating) + '<span class="stars__off">' + '★'.repeat(5 - r.rating) + '</span>';
  return `
    <figure class="review">
      <figcaption class="review__who">
        <span class="review__avatar" style="background:${r.tone}">${r.name[0]}</span>
        <span class="review__meta"><strong>${r.name}</strong><span>${r.trek} · ${r.when}</span></span>
        <span class="review__g">Google</span>
      </figcaption>
      <p class="stars" aria-label="${r.rating} out of 5 stars">${stars}</p>
      <blockquote class="review__text">${r.text}</blockquote>
    </figure>`;
}

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
    : 'All batches are full. <a href="https://wa.me/919778448026">Join the waitlist</a>';
  const book = next
    ? `<a class="btn btn--sm" href="book.html?trip=${trek.slug}&amp;date=${next.id}">Book now</a>`
    : '';

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
        <div class="trek-row__actions">
          ${book}
          <a class="link-arrow" href="${url}">View trek</a>
        </div>
      </div>
    </article>`;
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
  const list = document.querySelector('[data-reviews]');
  if (list) list.innerHTML = REVIEWS.map(renderReview).join('');
  const score = document.querySelector('[data-review-score]');
  if (score) score.textContent = reviewSummary(REVIEWS);
  initStrip();
  const [{ initUI }, { initHeroSign, heroMessages }] = await Promise.all([import('./ui.js'), import('./hero-sign.js')]);
  initUI();
  const stage = document.getElementById('sign-stage');
  if (stage) initHeroSign(stage, heroMessages(TREKS));
}

if (typeof document !== 'undefined') init();
