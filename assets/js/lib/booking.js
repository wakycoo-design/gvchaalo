export const GST_RATE = 0.05;
export const ADVANCE_PER_PERSON = 2000;
const STORE_KEY = 'gvc.booking';

export function clampPax(pax, seatsLeft) {
  const n = Math.floor(Number(pax));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, seatsLeft);
}

export function calcPrice({ trek, departure, pax, addOns, payMode }) {
  const base = departure.price * pax;
  const addOnLines = trek.addOns
    .filter(a => addOns.includes(a.id))
    .map(a => ({ id: a.id, label: a.label, amount: a.pricePerPerson * pax }));
  const extras = addOnLines.reduce((sum, l) => sum + l.amount, 0);
  const gst = Math.round((base + extras) * GST_RATE);
  const total = base + extras + gst;
  const advance = ADVANCE_PER_PERSON * pax;
  return { base, addOnLines, gst, total, advance, payNow: payMode === 'full' ? total : advance };
}

export function makeRef(code, rand = Math.random) {
  return `GVC-${code}-${10000 + Math.floor(rand() * 90000)}`;
}

// sessionStorage can be missing or throw (private browsing, blocked storage);
// the booking then lives in memory for as long as the page is open.
export function createStore(storage = globalThis.sessionStorage) {
  let memory = null;
  return {
    load() {
      try {
        const raw = storage?.getItem(STORE_KEY);
        if (raw) return JSON.parse(raw);
        if (storage) return null;
      } catch { /* fall through to memory */ }
      return memory;
    },
    save(booking) {
      memory = booking;
      try { storage?.setItem(STORE_KEY, JSON.stringify(booking)); } catch { /* memory only */ }
    },
    clear() {
      memory = null;
      try { storage?.removeItem(STORE_KEY); } catch { /* memory only */ }
    }
  };
}
