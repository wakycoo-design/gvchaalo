const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// ISO dates are parsed by hand so the result never shifts with the viewer's timezone.
function parts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

export function formatDateRange(startISO, endISO, { withYear = false } = {}) {
  const a = parts(startISO);
  const b = parts(endISO);
  const left = a.m === b.m && a.y === b.y ? `${a.d}` : `${a.d} ${MONTHS[a.m - 1]}`;
  const right = `${b.d} ${MONTHS[b.m - 1]}`;
  return `${left} – ${right}` + (withYear ? ` ${b.y}` : '');
}

export function formatDate(iso, { withYear = false } = {}) {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]}` + (withYear ? ` ${y}` : '');
}
