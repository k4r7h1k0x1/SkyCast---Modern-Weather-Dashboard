const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export function parseIsoParts(input) {
  if (typeof input === 'object' && input !== null) return input;

  const [datePart, timePart = '00:00'] = input.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return { year, month, day, hour, minute };
}


export function getZonedNow(timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: map.hour === '24' ? 0 : Number(map.hour),
    minute: Number(map.minute),
  };
}

export function findNowHourIndex(hourlyTimes, timeZone) {
  const now = getZonedNow(timeZone);
  const key = [
    `${String(now.year).padStart(4, '0')}-${String(now.month).padStart(2, '0')}-${String(now.day).padStart(2, '0')}`,
    `T${String(now.hour).padStart(2, '0')}:00`,
  ].join('');

  const index = hourlyTimes.indexOf(key);
  return index === -1 ? 0 : index;
}

function weekdayIndex({ year, month, day }) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function formatFullDate(input) {
  const parts = parseIsoParts(input);
  return `${WEEKDAYS[weekdayIndex(parts)]}, ${parts.day} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

export function formatTime24(input) {
  const { hour, minute } = parseIsoParts(input);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatHour12(input) {
  const { hour } = parseIsoParts(input);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12} ${period}`;
}

export function formatDayLabel(input, index) {
  if (index === 0) return 'Today';
  return WEEKDAYS[weekdayIndex(parseIsoParts(input))].slice(0, 3);
}

export function windDirectionToCompass(degrees) {
  const index = Math.round(degrees / 22.5) % 16;
  return COMPASS[index];
}

export function round(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function metersToKm(meters) {
  return meters / 1000;
}