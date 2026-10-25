// The "↑ GVQ" highway sign: swings in on its wire, holds GVQ, then rolls through
// each trek like gantry signs passing overhead while the photograph behind it
// crossfades to that trek. Time-based, never scroll-jacked.

export const HOLD_FIRST_MS = 4000;
export const HOLD_MS = 3000;

const FADE_S = 1.3;
const HERO_IMG = {
  home: 'assets/img/hero-gvq.jpg',
  kedarkantha: 'assets/img/hero-kedarkantha.jpg',
  'annapurna-base-camp': 'assets/img/hero-annapurna.jpg',
  'bhrigu-lake': 'assets/img/hero-bhrigu.jpg'
};

export function heroMessages(treks) {
  return [
    { title: 'GVQ', sub: 'This way to the Himalaya', name: 'gv.chaalo', img: HERO_IMG.home, url: '#treks' },
    ...treks.map(t => ({
      title: t.posterName,
      sub: `${t.maxAltitudeFt.toLocaleString('en-IN')} ft · ${t.days} days · from ${t.start}`,
      name: t.name,
      img: HERO_IMG[t.slug] ?? t.heroImg,
      url: `trip.html?id=${t.slug}`
    }))
  ];
}

export function holdFor(index) {
  return index === 0 ? HOLD_FIRST_MS : HOLD_MS;
}

function buildMsg(m) {
  const el = document.createElement('div');
  el.className = 'sign__msg';
  el.innerHTML = '<span class="sign__title"></span><span class="sign__sub"></span>';
  el.firstChild.textContent = m.title;
  el.lastChild.textContent = m.sub;
  return el;
}

// Long names (ANNAPURNA BC) shrink to fit the plate; GVQ keeps the full size.
function fitTitle(msgEl, windowEl) {
  const title = msgEl.querySelector('.sign__title');
  title.style.fontSize = '';
  const avail = windowEl.clientWidth;
  const need = title.scrollWidth;
  if (need > avail) {
    const size = parseFloat(getComputedStyle(title).fontSize);
    title.style.fontSize = `${Math.floor(size * (avail / need) * 0.98)}px`;
  }
}

export function initHeroSign(stage, messages) {
  const gsap = window.gsap;
  const sign = stage.querySelector('[data-sign]');
  const plate = stage.querySelector('.sign__plate');
  const win = stage.querySelector('.sign__window');
  const hero = stage.closest('[data-hero]');
  const media = hero?.querySelector('[data-hero-media]');
  const index = hero?.querySelector('[data-hero-index]');
  if (!sign || !win) return;
  // The sign starts hidden (hero.css) so it never flashes in place before swinging in.
  const reveal = () => { sign.style.opacity = '1'; };
  if (!gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return reveal();

  // One <img> per message; the first is already in the HTML, the rest load after.
  const imgs = messages.map((m, i) => {
    if (i === 0) return media?.querySelector('img');
    const img = new Image();
    img.className = 'hero__img';
    img.alt = '';
    img.decoding = 'async';
    img.src = m.img;
    media?.appendChild(img);
    return img;
  });

  const total = String(messages.length).padStart(2, '0');
  const idxNum = index?.querySelector('[data-idx]');
  const idxName = index?.querySelector('[data-idx-name]');
  const bar = index?.querySelector('[data-idx-bar]');
  const setIndex = i => {
    if (!index) return;
    idxNum.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
    idxName.textContent = messages[i].name;
    index.href = messages[i].url;
  };

  let current = win.querySelector('[data-sign-msg]');
  let at = 0;
  let timer = null;
  let barTween = null;
  let running = true;

  // Slow push-in on the visible photograph for as long as it is on screen.
  const pushIn = (img, seconds) => gsap.fromTo(img, { scale: 1.1 }, { scale: 1, duration: seconds, ease: 'none', overwrite: 'auto' });

  function schedule() {
    timer?.kill();
    barTween?.kill();
    const hold = holdFor(at) / 1000;
    timer = gsap.delayedCall(hold, advance);
    if (bar) barTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: hold, ease: 'none' });
    if (!running) { timer.pause(); barTween?.pause(); }
  }

  // GVQ's 4 seconds count from the moment the sign appears, swing included.
  const intro = gsap.timeline({ onStart: schedule, onComplete: startSway, delay: 0.25 });
  intro
    .set(sign, { opacity: 1 })
    .fromTo(sign, { y: () => -(sign.getBoundingClientRect().bottom + 40), rotation: -9 },
      { y: 0, rotation: 5, duration: 1.05, ease: 'power3.out' })
    .to(sign, { rotation: -2.5, duration: 0.42, ease: 'sine.inOut' })
    .to(sign, { rotation: 1.2, duration: 0.36, ease: 'sine.inOut' })
    .to(sign, { rotation: -0.6, duration: 0.32, ease: 'sine.inOut' });
  if (imgs[0]) pushIn(imgs[0], HOLD_FIRST_MS / 1000 + FADE_S + 1);
  setIndex(0);

  function startSway() {
    gsap.to(sign, { rotation: 0.6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  function advance() {
    const prev = at;
    at = (at + 1) % messages.length;
    const next = buildMsg(messages[at]);
    win.appendChild(next);
    fitTitle(next, win);
    gsap.timeline()
      .fromTo(next, { yPercent: 110 }, { yPercent: 0, duration: 0.75, ease: 'power3.inOut' }, 0)
      .to(current, { yPercent: -110, duration: 0.75, ease: 'power3.inOut', onComplete: (old => () => old.remove())(current) }, 0)
      .to(plate, { y: 3, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, 0.05);
    current = next;

    const out = imgs[prev], inn = imgs[at];
    if (out && inn) {
      gsap.set(inn, { zIndex: 2 });
      gsap.set(out, { zIndex: 1 });
      gsap.fromTo(inn, { opacity: 0 }, { opacity: 1, duration: FADE_S, ease: 'power2.inOut', onComplete: () => gsap.set(out, { opacity: 0 }) });
      pushIn(inn, holdFor(at) / 1000 + FADE_S + 1);
    }
    setIndex(at);
    schedule();
  }

  // Pause while the hero is off screen or the tab is hidden; resume where it stopped.
  const setRunning = on => {
    running = on;
    if (!timer) return;
    on ? (timer.resume(), barTween?.resume()) : (timer.pause(), barTween?.pause());
  };
  let heroVisible = true;
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; setRunning(heroVisible && !document.hidden); }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => setRunning(heroVisible && !document.hidden));

  window.addEventListener('resize', () => fitTitle(current, win));

  // Gentle depth on scroll: photo and sign drift at different speeds, the copy fades.
  if (window.ScrollTrigger && hero) {
    gsap.registerPlugin(window.ScrollTrigger);
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(stage, { yPercent: -18, ease: 'none', scrollTrigger: st });
    if (media) gsap.to(media, { yPercent: 12, ease: 'none', scrollTrigger: st });
    gsap.to(hero.querySelector('.hero__copy'), { opacity: 0, y: -40, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
  }
}
