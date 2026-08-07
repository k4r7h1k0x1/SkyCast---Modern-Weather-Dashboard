import { WMO_CODES, EUROPEAN_AQI_BANDS } from '../utils/constants.js';

export const GROUP_COLORS = {
  clear: 'text-amber-400',
  clouds: 'text-slate-400',
  fog: 'text-slate-300',
  drizzle: 'text-sky-400',
  rain: 'text-indigo-400',
  snow: 'text-cyan-300',
  storm: 'text-violet-500',
};

export const ICON_ANIMATION_CLASSES = {
  clear: 'icon-pulse',
  clouds: 'icon-drift',
  fog: 'icon-drift',
  drizzle: 'icon-bounce',
  rain: 'icon-bounce',
  storm: 'icon-sway',
  snow: 'icon-sway',
};

export function describeWeatherCode(code, isDay = true) {
  const entry = WMO_CODES[code] ?? { label: 'Unknown', icon: 'fa-cloud-question', group: 'clouds' };
  const colorClass = GROUP_COLORS[entry.group] ?? 'text-slate-400';

  if (!isDay) {
    if (entry.group === 'clear' && code === 0) {
      return { ...entry, icon: 'fa-moon', colorClass: 'text-indigo-300' };
    }
    if (entry.group === 'clear' && code !== 0) {
      return { ...entry, icon: 'fa-cloud-moon', colorClass: 'text-indigo-300' };
    }
  }

  return { ...entry, colorClass };
}


export function describeAirQuality(aqi) {
  const band = EUROPEAN_AQI_BANDS.find((b) => aqi <= b.max);
  return band ?? EUROPEAN_AQI_BANDS[EUROPEAN_AQI_BANDS.length - 1];
}

export function describePressure(hpa) {
  if (hpa < 1000) return 'Low pressure';
  if (hpa > 1020) return 'High pressure';
  return 'Normal pressure';
}

export function describeVisibility(km) {
  if (km >= 10) return 'Excellent';
  if (km >= 5) return 'Good';
  if (km >= 2) return 'Moderate';
  return 'Poor';
}

export function describeUvIndex(uv) {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

export function describeAqiMessage(label) {
  const messages = {
    Good: 'Air quality is good. Enjoy your usual outdoor activities.',
    Fair: 'Air quality is acceptable. Sensitive individuals should be cautious.',
    Moderate: 'Members of sensitive groups may experience health effects.',
    Poor: 'Everyone may begin to experience health effects with prolonged exposure.',
    'Very Poor': 'Health warnings — limit outdoor exertion, especially sensitive groups.',
    'Extremely Poor': 'Health alert: everyone may experience serious health effects.',
  };
  return messages[label] ?? '';
}

export const HERO_THEME_CLASSES = [
  'hero-theme-sunny',
  'hero-theme-cloudy',
  'hero-theme-rain',
  'hero-theme-snow',
  'hero-theme-night',
];

export function getHeroThemeClass(group, isDay) {
  if (!isDay) return 'hero-theme-night';

  const map = {
    clear: 'hero-theme-sunny',
    clouds: 'hero-theme-cloudy',
    fog: 'hero-theme-cloudy',
    drizzle: 'hero-theme-rain',
    rain: 'hero-theme-rain',
    storm: 'hero-theme-rain',
    snow: 'hero-theme-snow',
  };
  return map[group] ?? 'hero-theme-cloudy';
}