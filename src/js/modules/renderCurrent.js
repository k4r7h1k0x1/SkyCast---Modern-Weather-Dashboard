import { describeWeatherCode, getHeroThemeClass, HERO_THEME_CLASSES, ICON_ANIMATION_CLASSES } from './weatherIcons.js';
import { renderWeatherBackground } from './renderWeatherBackground.js';
import { animateCountUp } from '../utils/animateCountUp.js';
import { formatFullDate, formatTime24, getZonedNow, windDirectionToCompass, round, metersToKm } from '../utils/format.js';

export function renderCurrent(forecast, unit = 'celsius') {
  const { current, daily, timezone } = forecast;
  const weather = describeWeatherCode(current.weather_code, current.is_day === 1);
  const now = getZonedNow(timezone);

  setText('unit-symbol', unit === 'fahrenheit' ? 'F' : 'C');
  animateCountUp(document.getElementById('current-temp'), String(round(current.temperature_2m)), { duration: 0.9 });
  setText('current-date', formatFullDate(now));
  setText('current-time', formatTime24(now));
  setText('current-condition', weather.label);
  setText('current-condition-sub', weather.label.toLowerCase());

  const iconEl = document.getElementById('current-icon');
  if (iconEl) {
    const animationClass = ICON_ANIMATION_CLASSES[weather.group] ?? '';
    iconEl.className = `fa-solid ${weather.icon} text-6xl ${weather.colorClass} ${animationClass}`.trim();
  }

  const miniCard = document.getElementById('hero-mini-card');
  const aura = document.getElementById('hero-aura');
  const themeClass = getHeroThemeClass(weather.group, current.is_day === 1);
  if (miniCard) {
    miniCard.classList.remove(...HERO_THEME_CLASSES);
    miniCard.classList.add(themeClass);
  }
  if (aura) {
    aura.classList.remove(...HERO_THEME_CLASSES);
    aura.classList.add(themeClass);
  }

  animateCountUp(document.getElementById('meta-humidity'), String(round(current.relative_humidity_2m)), { duration: 0.6 });
  animateCountUp(document.getElementById('meta-wind'), String(round(current.wind_speed_10m)), { duration: 0.6 });
  setText('meta-wind-dir', windDirectionToCompass(current.wind_direction_10m));
  animateCountUp(document.getElementById('meta-visibility'), String(round(metersToKm(current.visibility), 1)), { duration: 0.6 });
  animateCountUp(document.getElementById('meta-feels-like'), String(round(current.apparent_temperature)), { duration: 0.6 });
  animateCountUp(document.getElementById('meta-uv'), String(round(current.uv_index, 1)), { duration: 0.6 });
  animateCountUp(document.getElementById('meta-cloud'), `${round(current.cloud_cover)}%`, { duration: 0.6 });

  if (daily?.sunrise?.[0]) setText('meta-sunrise', formatTime24(daily.sunrise[0]));
  if (daily?.sunset?.[0]) setText('meta-sunset', formatTime24(daily.sunset[0]));

  renderWeatherBackground('weather-bg', weather.group, current.is_day === 1);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}