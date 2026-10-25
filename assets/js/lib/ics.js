const escText = s => String(s).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');

function dayAfter(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

const compact = iso => iso.replace(/-/g, '');

export function buildICS({ title, startISO, endISO, location, description, uid }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//gv.chaalo//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}@gvchaalo`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(startISO)}`,
    `DTEND;VALUE=DATE:${compact(dayAfter(endISO))}`,
    `SUMMARY:${escText(title)}`,
    `LOCATION:${escText(location)}`,
    `DESCRIPTION:${escText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ].join('\r\n');
}
