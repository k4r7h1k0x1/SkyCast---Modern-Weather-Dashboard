import gsap from 'gsap';
import { initTheme } from './modules/theme.js';
import { initSearch } from './modules/search.js';
import { initGeolocation } from './modules/geolocation.js';
import { getFullWeatherData } from './api/openMeteo.js';
import { getFavorites } from './utils/favorites.js';
import { describeWeatherCode } from './modules/weatherIcons.js';
import { round } from './utils/format.js';
import { storage, STORAGE_KEYS } from './utils/storage.js';
import { registerServiceWorker } from './utils/registerServiceWorker.js';
import { initSearchShortcut } from './modules/keyboardShortcuts.js';

const MAX_COMPARE = 3;

document.addEventListener('DOMContentLoaded', () => {
  initTheme('#theme-toggle');
  initSearch();
  initGeolocation();
  wireSkipLink();
  registerServiceWorker();
  initSearchShortcut();
  loadComparison();
});

function wireSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  const main = document.getElementById('compare-content');
  skipLink?.addEventListener('click', () => main?.focus());
}

async function loadComparison() {
  const grid = document.getElementById('compare-grid');
  const empty = document.getElementById('compare-empty');
  if (!grid || !empty) return;

  const favorites = getFavorites().slice(0, MAX_COMPARE);

  if (favorites.length < 2) {
    empty.hidden = false;
    grid.hidden = true;
    return;
  }

  empty.hidden = true;
  grid.hidden = false;
  grid.innerHTML = favorites.map(() => skeletonCard()).join('');

  try {
    const unit = storage.get(STORAGE_KEYS.UNIT, 'celsius');
    const results = await Promise.allSettled(
      favorites.map((loc) => getFullWeatherData(loc.lat, loc.lon, { unit })),
    );

    grid.innerHTML = favorites
      .map((loc, i) => {
        const result = results[i];
        return result.status === 'fulfilled'
          ? buildCard(loc, result.value.forecast, unit)
          : errorCard(loc);
      })
      .join('');

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.from('#compare-grid > *', {
        y: 16,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    }
  } catch {
    // Defense-in-depth: loadComparison() is called fire-and-forget from
    // DOMContentLoaded, so without this the grid would otherwise be stuck
    // showing skeletons forever if something unexpected failed above.
    grid.innerHTML = favorites.map((loc) => errorCard(loc)).join('');
  }
}

function skeletonCard() {
  return `
    <div class="glass-card p-6">
      <div class="skeleton h-3 w-24"></div>
      <div class="skeleton mx-auto mt-4 h-10 w-10 rounded-full"></div>
      <div class="skeleton mx-auto mt-4 h-10 w-28"></div>
      <div class="skeleton mt-4 h-4 w-full"></div>
    </div>`;
}

function errorCard(loc) {
  return `
    <div class="glass-card flex flex-col items-center gap-2 p-6 text-center text-sm text-slate-400">
      <i class="fa-solid fa-cloud-exclamation text-2xl text-rose-400" aria-hidden="true"></i>
      Couldn't load ${escapeHtml(loc.name)}
    </div>`;
}

function buildCard(loc, forecast, unit) {
  const { current } = forecast;
  const weather = describeWeatherCode(current.weather_code, current.is_day === 1);
  const unitSymbol = unit === 'fahrenheit' ? 'F' : 'C';
  const params = new URLSearchParams({
    lat: loc.lat,
    lon: loc.lon,
    name: loc.name,
    country: loc.country ?? '',
  });

  return `
    <div class="glass-card p-6 text-center">
      <p class="text-xs font-semibold uppercase tracking-wide text-rose-400">
        ${escapeHtml(loc.name)}${loc.country ? `, ${escapeHtml(loc.country)}` : ''}
      </p>
      <i class="fa-solid ${weather.icon} mt-3 text-4xl ${weather.colorClass}" aria-hidden="true"></i>
      <p class="mt-2 text-4xl font-extrabold text-slate-800 dark:text-white">${round(current.temperature_2m)}°${unitSymbol}</p>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-300">${weather.label}</p>
      <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div><i class="fa-solid fa-droplet mr-1 text-brand" aria-hidden="true"></i>${round(current.relative_humidity_2m)}%</div>
        <div><i class="fa-solid fa-wind mr-1 text-brand" aria-hidden="true"></i>${round(current.wind_speed_10m)} km/h</div>
      </div>
      <a href="/dashboard.html?${params.toString()}" class="btn-icon mt-4 w-auto gap-2 rounded-full px-4 text-xs font-medium">
        View details <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </a>
    </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}