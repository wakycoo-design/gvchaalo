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

const ICON = {
  days: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  alt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 20 9 9l4 6 3-4 5.5 9z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>'
};

// Poster-style card for the swipeable treks row.
export function renderTrekCard(trek) {
  const next = nextDeparture(trek);
  const url = `trip.html?id=${trek.slug}`;
  const withYear = next?.tag === 'Early bird';
  const status = !next
    ? 'All batches full'
    : next.seatsLeft <= 4
      ? `${next.seatsLeft} seats left · ${formatDate(next.startISO, { withYear })}`
      : `Next batch · ${formatDate(next.startISO, { withYear })}`;
  const book = next
    ? `<a class="btn btn--light btn--sm" href="book.html?trip=${trek.slug}&amp;date=${next.id}">Book now</a>`
    : `<a class="btn btn--light btn--sm" href="https://wa.me/919778448026">Join waitlist</a>`;

  return `
    <article class="tcard">
      <img class="tcard__img" src="${trek.cardImg}" width="1400" height="933" loading="lazy" alt="${trek.imgAlt}">
      <span class="tcard__badge">${trek.badge}</span>
      <div class="tcard__poster" aria-hidden="true">
        <span class="tcard__poster-name">${trek.posterName}</span>
        <span class="tcard__poster-sub">${trek.start} to ${trek.end}</span>
      </div>
      <div class="tcard__body">
        <span class="tcard__status">${status}</span>
        <h3 class="tcard__name"><a class="tcard__link" href="${url}">${trek.name}</a></h3>
        <ul class="tcard__meta">
          <li>${ICON.days}${trek.days} Days</li>
          <li>${ICON.alt}${trek.maxAltitudeFt.toLocaleString('en-IN')} ft</li>
          <li>${ICON.pin}${trek.start}</li>
        </ul>
        <div class="tcard__foot">
          <p class="tcard__price">From <strong>${formatINR(trek.priceFrom)}</strong> pp</p>
          ${book}
        </div>
      </div>
    </article>`;
}

function initCarousel() {
  const track = document.querySelector('[data-cards]');
  const dots = document.querySelector('[data-card-dots]');
  if (!track || !dots) return;
  const cards = [...track.children];
  dots.innerHTML = cards.map((c, i) => `<button type="button" aria-label="Show trek ${i + 1} of ${cards.length}"></button>`).join('');
  const buttons = [...dots.children];
  const setActive = i => buttons.forEach((b, j) => b.setAttribute('aria-current', String(i === j)));
  setActive(0);
  buttons.forEach((b, i) => b.addEventListener('click', () => {
    track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: 'smooth' });
  }));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(cards.indexOf(e.target)); });
    }, { root: track, threshold: 0.6 });
    cards.forEach(c => io.observe(c));
  }
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
  document.querySelector('[data-cards]').innerHTML = TREKS.map(renderTrekCard).join('');
  initCarousel();
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
