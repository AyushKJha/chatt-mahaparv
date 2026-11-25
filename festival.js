/* Chhath dates and sun times for the ritual strip.
   Dates follow the published panchang (Kartik Shukla Chaturthi to Saptami).
   2027 is marked provisional until panchangs agree. Sun times are computed
   in the browser for Patna, Bihar (NOAA sunrise equation), shown in IST. */
(function () {
  const PLACE = { name: 'पटना', lat: 25.5941, lon: 85.1376, tz: 5.5 };
  const YEARS = [
    { year: 2025, start: '2025-10-25' },
    { year: 2026, start: '2026-11-13' },
    { year: 2027, start: '2027-11-02', provisional: true },
  ];

  const rad = Math.PI / 180;
  // Minutes after local midnight for sunrise (rise=true) or sunset, or null in polar cases.
  function sunTime(date, rise) {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    const n = Math.round((date - start) / 864e5);
    const lngHour = PLACE.lon / 15;
    const t = n + ((rise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = (M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634 + 360) % 360;
    let RA = (Math.atan(0.91764 * Math.tan(L * rad)) / rad + 360) % 360;
    RA = (RA + Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) / 15;
    const sinDec = 0.39782 * Math.sin(L * rad), cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(PLACE.lat * rad)) / (cosDec * Math.cos(PLACE.lat * rad));
    if (cosH > 1 || cosH < -1) return null;
    const H = (rise ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad) / 15;
    const UT = (H + RA - 0.06571 * t - 6.622 - lngHour + 48) % 24;
    return Math.round(((UT + PLACE.tz) % 24) * 60);
  }

  const two = n => String(n).padStart(2, '0');
  const clock = mins => mins == null ? '—' : `${two(Math.floor(mins / 60))}:${two(mins % 60)}`;
  const dayName = d => d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', timeZone: 'UTC' });

  function pickYear(now) {
    // Show the current festival until the day after Usha Arghya, then the next one.
    return YEARS.find(y => now < Date.parse(y.start) + 5 * 864e5) || YEARS[YEARS.length - 1];
  }

  function render() {
    const strip = document.querySelector('.rituals');
    if (!strip) return;
    const chosen = pickYear(Date.now());
    const first = new Date(chosen.start + 'T00:00:00Z');
    const days = [...strip.querySelectorAll('span')];
    days.forEach((span, i) => {
      const date = new Date(first.getTime() + i * 864e5);
      let detail = dayName(date);
      if (i === 2) detail += ` · सूर्यास्त ${clock(sunTime(date, false))}`;
      if (i === 3) detail += ` · सूर्योदय ${clock(sunTime(date, true))}`;
      let small = span.querySelector('small');
      if (!small) { small = document.createElement('small'); span.append(small); }
      small.textContent = detail;
    });
    let note = document.querySelector('.rituals-note');
    if (!note) { note = document.createElement('p'); note.className = 'rituals-note'; strip.after(note); }
    note.textContent = `छठ ${chosen.year}` + (chosen.provisional ? ' (अनुमानित तिथि, स्थानीय पंचांग से मिलाईं)' : '') +
      ` · सूरज के समय ${PLACE.name} खातिर, IST में। अपना शहर में कुछ मिनट आगे-पीछे हो सकेला।`;
  }

  window.ChhathFestival = { sunTime, pickYear, YEARS, PLACE };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
