// The "↑ GVQ" highway sign: swings in on its wire, holds GVQ, then rolls through
// each trek like gantry signs passing overhead. Time-based, never scroll-jacked.

export const HOLD_FIRST_MS = 4000;
export const HOLD_MS = 3000;

const SKIES = {
  home: ['#2268BA', '#4D96DE', '#CFE4F6'],
  kedarkantha: ['#1D5FA8', '#5B9BDA', '#DDEBF7'],
  'annapurna-base-camp': ['#36559A', '#B98E92', '#F6DDC4'],
  'bhrigu-lake': ['#1B6A80', '#4FA2B2', '#CFEDEE']
};

export function heroMessages(treks) {
  return [
    { title: 'GVQ', sub: 'This way to the Himalaya', sky: SKIES.home },
    ...treks.map(t => ({
      title: t.posterName,
      sub: `${t.maxAltitudeFt.toLocaleString('en-IN')} ft · ${t.days} days · from ${t.start}`,
      sky: SKIES[t.slug] ?? SKIES.home
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
  const sky = document.querySelector('[data-sky]');
  const hero = stage.closest('[data-hero]');
  if (!sign || !win) return;
  // The sign starts hidden (hero.css) so it never flashes in place before swinging in.
  const reveal = () => { sign.style.opacity = '1'; };
  if (!gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return reveal();

  let current = win.querySelector('[data-sign-msg]');
  let index = 0;
  let timer = null;
  let running = true;

  // 1. Swing in from above and settle like a hanging plate.
  // GVQ's 4 seconds count from the moment the sign appears, swing included.
  const intro = gsap.timeline({ onStart: schedule, onComplete: startSway, delay: 0.25 });
  intro
    .set(sign, { opacity: 1 })
    .fromTo(sign, { y: () => -(sign.getBoundingClientRect().bottom + 40), rotation: -9 },
      { y: 0, rotation: 5, duration: 1.05, ease: 'power3.out' })
    .to(sign, { rotation: -2.5, duration: 0.42, ease: 'sine.inOut' })
    .to(sign, { rotation: 1.2, duration: 0.36, ease: 'sine.inOut' })
    .to(sign, { rotation: -0.6, duration: 0.32, ease: 'sine.inOut' });

  function startSway() {
    gsap.to(sign, { rotation: 0.6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  function schedule() {
    timer?.kill();
    timer = gsap.delayedCall(holdFor(index) / 1000, advance);
    if (!running) timer.pause();
  }

  function advance() {
    index = (index + 1) % messages.length;
    const m = messages[index];
    const next = buildMsg(m);
    win.appendChild(next);
    fitTitle(next, win);
    gsap.timeline()
      .fromTo(next, { yPercent: 110 }, { yPercent: 0, duration: 0.75, ease: 'power3.inOut' }, 0)
      .to(current, { yPercent: -110, duration: 0.75, ease: 'power3.inOut', onComplete: (old => () => old.remove())(current) }, 0)
      .to(plate, { y: 3, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, 0.05);
    if (sky) {
      gsap.to(sky, { '--sky-top': m.sky[0], '--sky-mid': m.sky[1], '--sky-bottom': m.sky[2], duration: 1.4, ease: 'sine.inOut' });
    }
    current = next;
    schedule();
  }

  // Pause the cycle while the hero is off screen or the tab is hidden; resume where it stopped.
  const setRunning = on => {
    running = on;
    if (!timer) return;
    on ? timer.resume() : timer.pause();
  };
  let heroVisible = true;
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; setRunning(heroVisible && !document.hidden); }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => setRunning(heroVisible && !document.hidden));

  window.addEventListener('resize', () => fitTitle(current, win));

  // Gentle depth on scroll: the sign drifts up slower than the page, the copy fades.
  if (window.ScrollTrigger && hero) {
    gsap.registerPlugin(window.ScrollTrigger);
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(stage, { yPercent: -18, ease: 'none', scrollTrigger: st });
    gsap.to(hero.querySelector('.hero__copy'), { opacity: 0, y: -40, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
    gsap.to(hero.querySelector('.hero__clouds'), { yPercent: 12, ease: 'none', scrollTrigger: st });
  }
}
