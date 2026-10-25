// Single source of truth for every trek on the site.
// Departures are demo data for the prototype (relative to the Oct 2026 pitch).

export const TREKS = [
  {
    slug: 'kedarkantha',
    code: 'KDK',
    name: 'Kedarkantha',
    posterName: 'KEDARKANTHA',
    kind: 'Winter snow trek',
    tagline: 'The classic first snow trek. Pine forests under snow, a frozen-lake camp and a sunrise summit.',
    start: 'Dehradun',
    end: 'Dehradun',
    days: 5,
    nights: 4,
    maxAltitudeFt: 12500,
    difficulty: 'Easy–Moderate',
    season: 'Dec – Mar',
    groupMax: 20,
    priceFrom: 8999,
    heroImg: 'assets/img/kedarkantha.jpg',
    cardImg: 'assets/img/kedarkantha.jpg',
    imgAlt: 'A trekker in a red jacket on a snowy ridge facing a sharp white peak',
    overview: 'Kedarkantha is where most people fall for the mountains. Five days through snow-buried pine and oak, a camp beside the frozen Juda ka Talab, and a 3 AM push to a summit that opens up Swargarohini, Bandarpoonch and Black Peak at first light. Short, honest effort, enormous reward. Right for first-timers with a basic fitness routine.',
    itinerary: [
      { day: 1, title: 'Dehradun to Sankri', altitudeFt: 6400, info: '200 km drive · 9–10 hrs', detail: 'Pick-up at Dehradun at 6:30 AM. The road follows the Yamuna and then the Tons into Govind Pashu Vihar. Gear check and briefing in the evening.' },
      { day: 2, title: 'Sankri to Juda ka Talab', altitudeFt: 9100, info: '4 km · 5 hrs', detail: 'A steady climb through pine and oak to camp beside a lake that freezes solid in winter.' },
      { day: 3, title: 'Juda ka Talab to Kedarkantha Base', altitudeFt: 11250, info: '4 km · 4 hrs', detail: 'Out of the trees and into open snowfields, with the summit in view the whole way. Early dinner, early night.' },
      { day: 4, title: 'Summit, then down to Hargaon', altitudeFt: 12500, info: '10 km · 9–10 hrs', detail: 'Headlamps on at 3 AM. Sunrise from the top over the whole Garhwal range, then a long, happy descent to Hargaon camp.' },
      { day: 5, title: 'Hargaon to Sankri, drive to Dehradun', altitudeFt: 6400, info: '6 km trek · 200 km drive', detail: 'A short walk down to Sankri and the drive back. Expect to reach Dehradun around 8–9 PM.' }
    ],
    included: ['Dehradun ↔ Sankri transport', 'Homestay in Sankri and 3 nights in tents', 'All vegetarian meals on the trek', 'Forest permits and camping fees', 'Certified trek leader, cook and support staff', 'Microspikes and gaiters'],
    excluded: ['Travel from Kerala to Dehradun', 'Backpack offloading', 'Personal gear and travel insurance', '5% GST'],
    carry: ['40–50 L backpack with rain cover', 'Trekking shoes with ankle support', 'Three warm layers and a down jacket', 'Thermal inner wear, woollen cap and gloves', 'Sunglasses, sunscreen and a 1 L water bottle'],
    faq: [
      { q: 'Is it OK for a first-timer?', a: 'Yes. If you can jog 4 km in 30 minutes you are ready. We send a 4-week prep plan after you book.' },
      { q: 'How cold does it get?', a: 'Expect −8 °C to −12 °C at night in December and January. Our tents and sleeping bags are rated for it.' },
      { q: 'What is the cancellation policy?', a: '[Client cancellation policy goes here.]' }
    ],
    addOns: [
      { id: 'offload', label: 'Backpack offloading', note: 'A mule carries your bag', pricePerPerson: 1500 },
      { id: 'gear', label: 'Rental gear kit', note: 'Jacket, poles and gloves', pricePerPerson: 800 }
    ],
    departures: [
      { id: '2026-12-06', startISO: '2026-12-06', endISO: '2026-12-10', seatsLeft: 0, price: 8999 },
      { id: '2026-12-13', startISO: '2026-12-13', endISO: '2026-12-17', seatsLeft: 4, price: 8999 },
      { id: '2026-12-20', startISO: '2026-12-20', endISO: '2026-12-24', seatsLeft: 9, price: 8999 },
      { id: '2026-12-27', startISO: '2026-12-27', endISO: '2026-12-31', seatsLeft: 2, price: 9999, tag: 'New Year' },
      { id: '2027-01-10', startISO: '2027-01-10', endISO: '2027-01-14', seatsLeft: 14, price: 8999 },
      { id: '2027-01-24', startISO: '2027-01-24', endISO: '2027-01-28', seatsLeft: 18, price: 8999 },
      { id: '2027-02-07', startISO: '2027-02-07', endISO: '2027-02-11', seatsLeft: 16, price: 8999 },
      { id: '2027-02-21', startISO: '2027-02-21', endISO: '2027-02-25', seatsLeft: 20, price: 8999 },
      { id: '2027-03-07', startISO: '2027-03-07', endISO: '2027-03-11', seatsLeft: 20, price: 8999 }
    ]
  },
  {
    slug: 'annapurna-base-camp',
    code: 'ABC',
    name: 'Annapurna Base Camp',
    posterName: 'ANNAPURNA BC',
    kind: 'Nepal Himalaya trek',
    tagline: 'Nine days into a ring of 8,000-metre peaks, with hot springs on the way home.',
    start: 'Gorakhpur',
    end: 'Gorakhpur',
    days: 9,
    nights: 8,
    maxAltitudeFt: 13550,
    difficulty: 'Moderate',
    season: 'Oct – Dec',
    groupMax: 20,
    priceFrom: 24999,
    heroImg: 'assets/img/annapurna.jpg',
    cardImg: 'assets/img/annapurna.jpg',
    imgAlt: 'The Annapurna range at dawn above a valley of mist',
    overview: 'Annapurna Base Camp is a walk into an amphitheatre. Terraced villages give way to rhododendron and bamboo forest, then the Modi Khola gorge opens into a basin ringed by Annapurna I, Machhapuchhre and Hiunchuli. Teahouse stays every night, real beds, dal bhat that tastes better each day. Indian citizens need only Aadhaar or a Voter ID, no passport.',
    itinerary: [
      { day: 1, title: 'Gorakhpur to Pokhara', altitudeFt: 2700, info: 'Sunauli border · 8–9 hrs drive', detail: 'Cross into Nepal at Sunauli and drive through the hills to Pokhara. Evening by Phewa Lake.' },
      { day: 2, title: 'Pokhara to Jhinu, trek to Chhomrong', altitudeFt: 7120, info: '3 hrs drive · 4 hrs trek', detail: 'Drive to the trailhead and climb the stone steps to Chhomrong, with the first view of Annapurna South.' },
      { day: 3, title: 'Chhomrong to Bamboo', altitudeFt: 7640, info: '6 hrs', detail: 'Down to the Chhomrong Khola and back up into the cool bamboo forest of the Modi valley.' },
      { day: 4, title: 'Bamboo to Deurali', altitudeFt: 10500, info: '5 hrs', detail: 'The valley narrows and the trees thin out. Waterfalls on both sides.' },
      { day: 5, title: 'Deurali to Annapurna Base Camp', altitudeFt: 13550, info: '6 hrs via MBC', detail: 'Through Machhapuchhre Base Camp and into the sanctuary. Sunset on Annapurna I.' },
      { day: 6, title: 'Sunrise at ABC, down to Bamboo', altitudeFt: 7640, info: '7 hrs', detail: 'Wake early for the peaks turning gold, then a long descent back down the valley.' },
      { day: 7, title: 'Bamboo to Jhinu', altitudeFt: 5780, info: '6 hrs', detail: 'Finish the day soaking in the natural hot springs by the river.' },
      { day: 8, title: 'Jhinu to Pokhara', altitudeFt: 2700, info: '1 hr trek · 3 hrs drive', detail: 'Back to Pokhara for a lakeside dinner with the whole group.' },
      { day: 9, title: 'Pokhara to Gorakhpur', altitudeFt: 250, info: '8–9 hrs drive', detail: 'Drive back across the border. Drop at Gorakhpur railway station by evening.' }
    ],
    included: ['Gorakhpur ↔ Pokhara transport', '2 nights hotel in Pokhara, 6 nights teahouses', 'All meals on the trek', 'ACAP and TIMS permits', 'Certified trek leader and local guide', 'First-aid kit and oxygen cylinder'],
    excluded: ['Travel from Kerala to Gorakhpur', 'Porter for personal bags', 'Hot showers and charging at teahouses', '5% GST'],
    carry: ['Aadhaar card or Voter ID (original)', '40–50 L backpack with rain cover', 'Trekking shoes with ankle support', 'Down jacket and two fleece layers', 'Sleeping bag liner'],
    faq: [
      { q: 'Do I need a passport?', a: 'No. Indian citizens can enter Nepal with an original Aadhaar card or Voter ID.' },
      { q: 'How hard is it?', a: 'Moderate. Most days are 5–7 hours on stone steps. Start training 6 weeks before.' },
      { q: 'What is the cancellation policy?', a: '[Client cancellation policy goes here.]' }
    ],
    addOns: [
      { id: 'offload', label: 'Porter for your bag', note: 'Up to 10 kg, all 7 trek days', pricePerPerson: 3500 },
      { id: 'gear', label: 'Rental gear kit', note: 'Down jacket, poles and gloves', pricePerPerson: 1200 }
    ],
    departures: [
      { id: '2026-11-01', startISO: '2026-11-01', endISO: '2026-11-09', seatsLeft: 0, price: 24999 },
      { id: '2026-11-15', startISO: '2026-11-15', endISO: '2026-11-23', seatsLeft: 3, price: 24999 },
      { id: '2026-11-29', startISO: '2026-11-29', endISO: '2026-12-07', seatsLeft: 11, price: 24999 },
      { id: '2026-12-13', startISO: '2026-12-13', endISO: '2026-12-21', seatsLeft: 16, price: 24999 }
    ]
  },
  {
    slug: 'bhrigu-lake',
    code: 'BHR',
    name: 'Bhrigu Lake',
    posterName: 'BHRIGU LAKE',
    kind: 'Alpine meadow trek',
    tagline: 'Four days over green meadows to a glacial lake at 14,000 ft, right above Manali.',
    start: 'Manali',
    end: 'Manali',
    days: 4,
    nights: 3,
    maxAltitudeFt: 14000,
    difficulty: 'Easy–Moderate',
    season: 'Aug – Sep',
    groupMax: 20,
    priceFrom: 7499,
    heroImg: 'assets/img/bhrigu-lake.jpg',
    cardImg: 'assets/img/bhrigu-lake.jpg',
    imgAlt: 'A turquoise alpine lake beneath snow-streaked peaks',
    overview: 'Bhrigu Lake climbs straight out of Manali into some of the widest meadows in Himachal. Three camps, horses grazing all around, the Pir Panjal and Dhauladhar on either side, and a small glacial lake that changes colour with the sky. The best short high-altitude trek you can do on a long weekend.',
    itinerary: [
      { day: 1, title: 'Manali to Gulaba, trek to Jonker Thach', altitudeFt: 10000, info: '1 hr drive · 3 hrs trek', detail: 'Drive up the Rohtang road to Gulaba and walk through birch forest to the first meadow camp.' },
      { day: 2, title: 'Jonker Thach to Rola Kholi', altitudeFt: 12000, info: '4 hrs', detail: 'Rolling grassland with views back to Hanuman Tibba and the Seven Sisters.' },
      { day: 3, title: 'Rola Kholi to Bhrigu Lake and back', altitudeFt: 14000, info: '8 km · 6–7 hrs', detail: 'The big day. A steady climb to the lake, time at the top, and back to camp for a celebration dinner.' },
      { day: 4, title: 'Rola Kholi to Gulaba, drive to Manali', altitudeFt: 6700, info: '4 hrs trek · 1 hr drive', detail: 'A fast descent through the meadows and back to Manali by afternoon.' }
    ],
    included: ['Manali ↔ Gulaba transport', '3 nights in tents', 'All vegetarian meals on the trek', 'Forest permits and camping fees', 'Certified trek leader and support staff'],
    excluded: ['Travel from Kerala to Manali', 'Backpack offloading', 'Personal gear and travel insurance', '5% GST'],
    carry: ['30–40 L backpack with rain cover', 'Trekking shoes with ankle support', 'Rain jacket and a warm fleece', 'Cap, sunglasses and sunscreen', '1 L water bottle'],
    faq: [
      { q: 'Is August not monsoon?', a: 'Bhrigu sits in the rain shadow. Expect some showers, but August and September are when the meadows are greenest.' },
      { q: 'Is it OK for a first-timer?', a: 'Yes, with a month of regular walking or running. Day 3 is the only long day.' },
      { q: 'What is the cancellation policy?', a: '[Client cancellation policy goes here.]' }
    ],
    addOns: [
      { id: 'offload', label: 'Backpack offloading', note: 'A mule carries your bag', pricePerPerson: 1200 },
      { id: 'gear', label: 'Rental gear kit', note: 'Rain jacket, poles and gloves', pricePerPerson: 800 }
    ],
    departures: [
      { id: '2027-08-07', startISO: '2027-08-07', endISO: '2027-08-10', seatsLeft: 0, price: 7499, tag: 'Early bird' },
      { id: '2027-08-21', startISO: '2027-08-21', endISO: '2027-08-24', seatsLeft: 4, price: 7499, tag: 'Early bird' },
      { id: '2027-09-04', startISO: '2027-09-04', endISO: '2027-09-07', seatsLeft: 12, price: 7499, tag: 'Early bird' },
      { id: '2027-09-18', startISO: '2027-09-18', endISO: '2027-09-21', seatsLeft: 18, price: 7499, tag: 'Early bird' }
    ]
  }
];

export function getTrek(slug) {
  return TREKS.find(t => t.slug === slug);
}
