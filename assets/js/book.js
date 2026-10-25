import { getTrek } from './data/treks.js';
import { formatINR, formatDateRange } from './lib/format.js';
import { calcPrice, clampPax, createStore, makeRef, ADVANCE_PER_PERSON } from './lib/booking.js';

const STEPS = ['Batch', 'Travellers', 'Review', 'Pay'];

// ---------- Pure helpers (unit-tested) ----------

const openDep = (trek, id) => trek.departures.find(d => d.id === id && d.seatsLeft > 0);

export function resolveEntry(params, saved) {
  const trek = getTrek(params.get('trip') ?? '');
  if (!trek) return { redirect: 'index.html#treks' };
  const first = trek.departures.find(d => d.seatsLeft > 0);
  if (!first) return { redirect: `trip.html?id=${trek.slug}` };

  let resume = saved && saved.trip === trek.slug && !saved.ref ? saved : null;
  const urlDep = openDep(trek, params.get('date') ?? '');
  // Arriving with a different batch than the saved one: start over at step 0 so the
  // customer confirms the new batch, but keep the details they already typed.
  if (resume && urlDep && urlDep.id !== resume.date) resume = { ...resume, step: 0, terms: false };
  const date = (urlDep ?? openDep(trek, resume?.date ?? '') ?? first).id;
  const dep = openDep(trek, date);
  const base = resume ?? { travellers: [], emergency: { name: '', phone: '' }, addOns: [], payMode: 'full', step: 0, pax: 1 };
  return { booking: { ...base, trip: trek.slug, date, pax: clampPax(base.pax, dep.seatsLeft) } };
}

const digits = s => String(s ?? '').replace(/\D/g, '');
const validPhone = s => digits(s).length >= 10 && digits(s).length <= 13;

export function validateTraveller(t, { lead }) {
  const errs = {};
  if (String(t.name ?? '').trim().length < 2) errs.name = 'Enter the full name as on ID';
  const age = Number(t.age);
  if (!Number.isInteger(age) || age < 12 || age > 70) errs.age = 'Age must be 12 to 70';
  if (!t.gender) errs.gender = 'Choose one';
  if (lead) {
    if (!validPhone(t.phone)) errs.phone = 'Enter a 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(t.email ?? '').trim())) errs.email = 'Enter a valid email';
  }
  return errs;
}

export function validateEmergency(e) {
  const errs = {};
  if (String(e?.name ?? '').trim().length < 2) errs.name = 'Enter a name';
  if (!validPhone(e?.phone)) errs.phone = 'Enter a 10-digit mobile number';
  return errs;
}

// ---------- DOM ----------

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function init() {
  const store = createStore();
  const entry = resolveEntry(new URLSearchParams(location.search), store.load());
  if (entry.redirect) { location.replace(entry.redirect); return; }

  let b = entry.booking;
  const trek = getTrek(b.trip);
  const root = document.querySelector('[data-book]');
  const summary = document.querySelector('[data-summary]');
  const progress = document.querySelector('[data-progress]');
  const modal = document.querySelector('[data-pay]');
  let errors = {};
  let termsError = false;

  const dep = () => trek.departures.find(d => d.id === b.date);
  const price = () => calcPrice({ trek, departure: dep(), pax: b.pax, addOns: b.addOns, payMode: b.payMode });
  const dates = d => formatDateRange(d.startISO, d.endISO, { withYear: d.tag === 'Early bird' });
  const save = () => store.save(b);
  const syncTravellers = () => {
    b.travellers = Array.from({ length: b.pax }, (_, i) => b.travellers[i] ?? { name: '', age: '', gender: '', phone: '', email: '' });
  };

  document.querySelectorAll('[data-exit]').forEach(a => { a.href = `trip.html?id=${trek.slug}`; });
  document.title = `Book ${trek.name} — gv.chaalo`;

  function renderProgress() {
    progress.innerHTML = STEPS.map((s, i) => {
      const state = i < b.step ? 'is-done' : i === b.step ? 'is-current' : '';
      return `<li class="${state}"${i === b.step ? ' aria-current="step"' : ''}><span>${String(i + 1).padStart(2, '0')}</span>${s}</li>`;
    }).join('');
    progress.style.setProperty('--p', `${((b.step + 1) / STEPS.length) * 100}%`);
  }

  function renderSummary() {
    const p = price();
    const d = dep();
    summary.innerHTML = `
      <img class="sum__img" src="${trek.cardImg}" width="1400" height="933" alt="">
      <p class="label sum__kind">${esc(trek.kind)}</p>
      <h2 class="sum__name display">${esc(trek.posterName)}</h2>
      <p class="sum__meta">${dates(d)} · ${trek.days} days · ${esc(trek.start)}</p>
      <dl class="sum__lines">
        <div><dt>Trek fee × ${b.pax}</dt><dd>${formatINR(p.base)}</dd></div>
        ${p.addOnLines.map(l => `<div><dt>${esc(l.label)} × ${b.pax}</dt><dd>${formatINR(l.amount)}</dd></div>`).join('')}
        <div><dt>GST 5%</dt><dd>${formatINR(p.gst)}</dd></div>
        <div class="sum__total"><dt>Total</dt><dd>${formatINR(p.total)}</dd></div>
        ${b.payMode === 'advance' ? `<div class="sum__now"><dt>Pay now (advance)</dt><dd>${formatINR(p.advance)}</dd></div>` : ''}
      </dl>`;
  }

  const fieldErr = (key) => errors[key] ? `<span class="field__err" id="err-${key}">${errors[key]}</span>` : '';
  const aria = key => errors[key] ? ` aria-invalid="true" aria-describedby="err-${key}"` : '';
  const input = (key, label, value, attrs = '') => `
    <label class="field${errors[key] ? ' has-err' : ''}">
      <span class="field__label">${label}</span>
      <input name="${key}" value="${esc(value)}"${attrs}${aria(key)}>
      ${fieldErr(key)}
    </label>`;
  const select = (key, label, value, opts) => `
    <label class="field${errors[key] ? ' has-err' : ''}">
      <span class="field__label">${label}</span>
      <select name="${key}"${aria(key)}>
        <option value="">Select</option>
        ${opts.map(o => `<option${o === value ? ' selected' : ''}>${o}</option>`).join('')}
      </select>
      ${fieldErr(key)}
    </label>`;

  function stepBatch() {
    const d = dep();
    return `
      <h1 class="book__title">Choose your batch</h1>
      <fieldset class="choice-list">
        <legend class="label">Departure</legend>
        ${trek.departures.map(x => `
          <label class="choice${x.seatsLeft === 0 ? ' is-off' : ''}">
            <input type="radio" name="date" value="${x.id}"${x.id === b.date ? ' checked' : ''}${x.seatsLeft === 0 ? ' disabled' : ''}>
            <span class="choice__main">${dates(x)}${x.tag ? ` <span class="choice__tag">${x.tag}</span>` : ''}</span>
            <span class="choice__side">${x.seatsLeft === 0 ? 'Full' : x.seatsLeft <= 4 ? `${x.seatsLeft} seats left` : `${x.seatsLeft} seats`}</span>
            <span class="choice__price">${formatINR(x.price)}</span>
          </label>`).join('')}
      </fieldset>

      <div class="book__group">
        <p class="label" id="pax-label">Travellers</p>
        <div class="stepper" role="group" aria-labelledby="pax-label">
          <button type="button" class="icon-btn" data-pax="-1" aria-label="Remove a traveller"${b.pax <= 1 ? ' disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg></button>
          <output class="stepper__n" aria-live="polite">${b.pax}</output>
          <button type="button" class="icon-btn" data-pax="1" aria-label="Add a traveller"${b.pax >= d.seatsLeft ? ' disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
          <span class="muted stepper__hint">${d.seatsLeft} seats left on this batch</span>
        </div>
      </div>

      <fieldset class="choice-list book__group">
        <legend class="label">Add-ons</legend>
        ${trek.addOns.map(a => `
          <label class="choice">
            <input type="checkbox" name="addon" value="${a.id}"${b.addOns.includes(a.id) ? ' checked' : ''}>
            <span class="choice__main">${esc(a.label)}<span class="choice__note">${esc(a.note)}</span></span>
            <span class="choice__price">${formatINR(a.pricePerPerson)} <span class="muted">/ person</span></span>
          </label>`).join('')}
      </fieldset>
      <div class="book__nav"><span></span><button type="button" class="btn" data-next>Continue to traveller details</button></div>`;
  }

  function stepTravellers() {
    return `
      <h1 class="book__title">Who's trekking?</h1>
      <p class="book__intro muted">Names exactly as on your ID. We'll WhatsApp the trip kit to the lead traveller.</p>
      ${b.travellers.map((t, i) => `
        <fieldset class="form-block" data-traveller="${i}">
          <legend class="label">${i === 0 ? 'Traveller 1 · lead' : `Traveller ${i + 1}`}</legend>
          <div class="form-grid">
            ${input(`t${i}.name`, 'Full name', t.name, ' autocomplete="name" class="span-2"')}
            ${input(`t${i}.age`, 'Age', t.age, ' inputmode="numeric" maxlength="2"')}
            ${select(`t${i}.gender`, 'Gender', t.gender, ['Female', 'Male', 'Other'])}
            ${i === 0 ? input('t0.phone', 'Mobile (WhatsApp)', t.phone, ' type="tel" autocomplete="tel" inputmode="tel"') : ''}
            ${i === 0 ? input('t0.email', 'Email', t.email, ' type="email" autocomplete="email"') : ''}
          </div>
        </fieldset>`).join('')}
      <fieldset class="form-block">
        <legend class="label">Emergency contact</legend>
        <div class="form-grid">
          ${input('e.name', 'Name', b.emergency.name)}
          ${input('e.phone', 'Mobile', b.emergency.phone, ' type="tel" inputmode="tel"')}
        </div>
      </fieldset>
      <div class="book__nav"><button type="button" class="link-arrow link-arrow--back" data-back>Back</button><button type="button" class="btn" data-next>Review booking</button></div>`;
  }

  function stepReview() {
    const p = price();
    const lead = b.travellers[0];
    return `
      <h1 class="book__title">Review and pay</h1>
      <dl class="review">
        <div><dt>Trek</dt><dd>${esc(trek.name)}, ${trek.days} days from ${esc(trek.start)}</dd></div>
        <div><dt>Batch</dt><dd>${dates(dep())}</dd></div>
        <div><dt>Travellers</dt><dd>${b.travellers.map(t => esc(t.name)).join(', ')}</dd></div>
        <div><dt>Lead contact</dt><dd>${esc(lead.phone)} · ${esc(lead.email)}</dd></div>
        <div><dt>Add-ons</dt><dd>${p.addOnLines.length ? p.addOnLines.map(l => esc(l.label)).join(', ') : 'None'}</dd></div>
      </dl>
      <fieldset class="choice-list book__group">
        <legend class="label">Payment</legend>
        <label class="choice">
          <input type="radio" name="pay" value="full"${b.payMode === 'full' ? ' checked' : ''}>
          <span class="choice__main">Pay in full</span>
          <span class="choice__price">${formatINR(p.total)}</span>
        </label>
        <label class="choice">
          <input type="radio" name="pay" value="advance"${b.payMode === 'advance' ? ' checked' : ''}>
          <span class="choice__main">Reserve with an advance<span class="choice__note">${formatINR(ADVANCE_PER_PERSON)} per person now, balance 15 days before departure</span></span>
          <span class="choice__price">${formatINR(p.advance)}</span>
        </label>
      </fieldset>
      <label class="check${termsError ? ' has-err' : ''}">
        <input type="checkbox" name="terms"${b.terms ? ' checked' : ''}${termsError ? ' aria-invalid="true" aria-describedby="err-terms"' : ''}>
        <span>I agree to the trek terms, the cancellation policy and the fitness declaration.</span>
      </label>
      ${termsError ? '<span class="field__err" id="err-terms">Please accept the terms to continue</span>' : ''}
      <div class="book__nav"><button type="button" class="link-arrow link-arrow--back" data-back>Back</button><button type="button" class="btn" data-next>Pay ${formatINR(p.payNow)}</button></div>`;
  }

  function render({ focus = false } = {}) {
    syncTravellers();
    renderProgress();
    renderSummary();
    root.innerHTML = [stepBatch, stepTravellers, stepReview, stepReview][b.step]();
    if (focus) {
      const target = root.querySelector('[aria-invalid="true"]') ?? root.querySelector('.book__title');
      if (target === root.querySelector('.book__title')) target.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (b.step === 3) openPay(); else closePay();
  }

  function go(step) {
    b.step = step;
    save();
    render({ focus: true });
  }

  function validateStep() {
    errors = {};
    if (b.step === 1) {
      b.travellers.forEach((t, i) => {
        Object.entries(validateTraveller(t, { lead: i === 0 })).forEach(([k, v]) => { errors[`t${i}.${k}`] = v; });
      });
      Object.entries(validateEmergency(b.emergency)).forEach(([k, v]) => { errors[`e.${k}`] = v; });
      return Object.keys(errors).length === 0;
    }
    if (b.step === 2) {
      termsError = !b.terms;
      return !termsError;
    }
    return true;
  }

  root.addEventListener('click', e => {
    const pax = e.target.closest('[data-pax]');
    if (pax) {
      b.pax = clampPax(b.pax + Number(pax.dataset.pax), dep().seatsLeft);
      save(); render();
      root.querySelector(`[data-pax="${pax.dataset.pax}"]:not([disabled])`)?.focus();
      return;
    }
    if (e.target.closest('[data-back]')) { errors = {}; termsError = false; go(b.step - 1); return; }
    if (e.target.closest('[data-next]')) {
      if (validateStep()) go(b.step + 1);
      else render({ focus: true });
    }
  });

  root.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'date') { b.date = t.value; b.pax = clampPax(b.pax, dep().seatsLeft); save(); render(); }
    else if (t.name === 'addon') { b.addOns = [...root.querySelectorAll('input[name="addon"]:checked')].map(i => i.value); save(); renderSummary(); }
    else if (t.name === 'pay') { b.payMode = t.value; save(); render(); root.querySelector(`input[name="pay"][value="${t.value}"]`)?.focus(); }
    else if (t.name === 'terms') { b.terms = t.checked; termsError = false; save(); }
    else if (t.tagName === 'SELECT') onField(t);
  });

  function onField(t) {
    const [scope, key] = t.name.split('.');
    if (scope === 'e') b.emergency[key] = t.value;
    else if (scope?.startsWith('t')) b.travellers[Number(scope.slice(1))][key] = t.value;
    else return;
    if (errors[t.name]) {
      delete errors[t.name];
      const field = t.closest('.field');
      field?.classList.remove('has-err');
      field?.querySelector('.field__err')?.remove();
      t.removeAttribute('aria-invalid');
    }
    save();
  }
  root.addEventListener('input', e => { if (e.target.tagName === 'INPUT' && e.target.name.includes('.')) onField(e.target); });

  // ---------- Payment modal (demo) ----------
  let lastFocus = null;
  let processing = false;

  function openPay() {
    if (!modal.hidden) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('[data-pay-amount]').textContent = formatINR(price().payNow);
    modal.querySelector('[data-pay-btn]').textContent = `Pay ${formatINR(price().payNow)}`;
    selectTab('upi');
    requestAnimationFrame(() => modal.querySelector('[role="tab"][aria-selected="true"]')?.focus());
  }
  function closePay() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocus?.focus?.();
  }
  function selectTab(id) {
    modal.querySelectorAll('[role="tab"]').forEach(tab => {
      const on = tab.dataset.tab === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    modal.querySelectorAll('[role="tabpanel"]').forEach(p => { p.hidden = p.dataset.panel !== id; });
  }

  modal.addEventListener('click', e => {
    if (e.target.closest('[data-pay-close]') || e.target === modal) { if (!processing) go(2); return; }
    const tab = e.target.closest('[role="tab"]');
    if (tab) { selectTab(tab.dataset.tab); return; }
    const pay = e.target.closest('[data-pay-btn]');
    if (pay && !processing) {
      processing = true;
      pay.disabled = true;
      pay.innerHTML = '<span class="spinner" aria-hidden="true"></span>Processing…';
      setTimeout(() => {
        b = { ...b, ref: makeRef(trek.code), paidAt: new Date().toISOString(), paidAmount: price().payNow };
        save();
        const q = new URLSearchParams({ ref: b.ref, trip: b.trip, date: b.date, pax: String(b.pax), paid: String(b.paidAmount), mode: b.payMode });
        location.href = `confirm.html?${q}`;
      }, 1600);
    }
  });

  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !processing) { go(2); return; }
    const tabs = [...modal.querySelectorAll('[role="tab"]')];
    const i = tabs.indexOf(document.activeElement);
    if (i >= 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next.dataset.tab); next.focus(); e.preventDefault();
    }
    if (e.key === 'Tab') {
      const focusables = [...modal.querySelectorAll('button:not([disabled]), input, [tabindex="0"]')].filter(el => !el.closest('[hidden]'));
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  save();
  render();
}

if (typeof document !== 'undefined') init();
