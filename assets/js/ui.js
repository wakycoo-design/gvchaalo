// Shared page chrome: header state, mobile menu, smooth scroll, reveals, WhatsApp button.

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;
export const getLenis = () => lenis;

function initSmoothScroll() {
  if (reducedMotion() || !window.Lenis) return;
  lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add(time => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}

function headerOffset() {
  return document.querySelector('[data-header]')?.offsetHeight ?? 0;
}

function scrollToHash(hash) {
  const target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
  if (!target) return false;
  if (lenis) lenis.scrollTo(target, { offset: -headerOffset() });
  else target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  return true;
}

function initAnchors() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname) return;
    if (scrollToHash(url.hash)) {
      e.preventDefault();
      history.replaceState(null, '', url.hash);
    }
  });
}

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  let last = window.scrollY;
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-solid', y > 80 || document.body.classList.contains('page-solid'));
    header.classList.toggle('is-hidden', y > 400 && y > last && !document.body.classList.contains('menu-open'));
    last = y;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!toggle || !menu) return;
  const set = open => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);
    if (open) { lenis?.stop(); menu.querySelector('a')?.focus(); } else { lenis?.start(); }
  };
  toggle.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { set(false); toggle.focus(); }
  });
}

export function observeReveals(root = document) {
  const els = root.querySelectorAll('[data-reveal]:not(.is-in), [data-reveal-img]:not(.is-in)');
  if (!('IntersectionObserver' in window) || reducedMotion()) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach(el => io.observe(el));
}

function initFab() {
  const fab = document.querySelector('[data-fab]');
  if (!fab) return;
  // Hidden over the hero and again once the footer (which has its own WhatsApp button) is on screen.
  let footerInView = false;
  const update = () => fab.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6 && !footerInView);
  const footer = document.querySelector('.site-footer');
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { footerInView = entry.isIntersecting; update(); }, { rootMargin: '0px 0px -30% 0px' }).observe(footer);
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
}

export function initUI() {
  initSmoothScroll();
  initAnchors();
  initHeader();
  initMenu();
  initFab();
  observeReveals();
  if (location.hash) requestAnimationFrame(() => scrollToHash(location.hash));
}
