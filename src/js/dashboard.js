import { initTheme } from './modules/theme.js';
import { initSearch } from './modules/search.js';
import { initGeolocation } from './modules/geolocation.js';
import { getFullWeatherData } from './api/openMeteo.js';
import { renderCurrent } from './modules/renderCurrent.js';
import { renderDetails } from './modules/renderDetails.js';
import { renderHourly } from './modules/renderHourly.js';
import { renderDaily } from './modules/renderDaily.js';
import { renderAQI } from './modules/renderAQI.js';
import { renderChart } from './modules/renderChart.js';
import { renderAlerts } from './modules/renderAlerts.js';
import { initFavoriteToggle, renderFavoritesBar } from './modules/renderFavorites.js';
import { initShareButton } from './modules/shareCard.js';
import { playDashboardEntrance } from './modules/animations.js';
import { getZonedNow, formatTime24, round } from './utils/format.js';
import { describeWeatherCode } from './modules/weatherIcons.js';
import { storage, STORAGE_KEYS } from './utils/storage.js';
import { registerServiceWorker } from './utils/registerServiceWorker.js';
import { initSearchShortcut } from './modules/keyboardShortcuts.js';
import { initScrollToTop } from './modules/scrollToTop.js';
import { showToast } from './modules/toast.js';

const elements = {};
let lastForecast = null; 
let lastLocation = null; 
let clockTimer = null;
let lastAttemptedLocation = null;

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  initTheme('#theme-toggle');
  initSearch();
  initGeolocation();
  wireChartTabs();
  wireUnitToggle();
  wireRetryButton();
  wireSkipLink();
  wireEmptyState();
  initShareButton(buildShareData);
  registerServiceWorker();
  initSearchShortcut();
  initScrollToTop();
  wireThemeChangeListener();

  const location = resolveIncomingLocation();
  document.addEventListener('skycast:favoriteschange', () => {
    renderFavoritesBar(location);
  });
  renderFavoritesBar(location);

  if (!location) {
    showEmpty();
    return;
  }

  setLocationName(location);
  initFavoriteToggle(location);
  loadDashboard(location);
});

function cacheElements() {
  elements.loading = document.getElementById('dashboard-loading');
  elements.error = document.getElementById('dashboard-error');
  elements.errorMessage = document.getElementById('dashboard-error-message');
  elements.retryBtn = document.getElementById('dashboard-retry-btn');
  elements.empty = document.getElementById('dashboard-empty');
  elements.content = document.getElementById('dashboard-content');
  elements.unitToggle = document.getElementById('unit-toggle');
  elements.unitToggleLabel = document.getElementById('unit-toggle-label');
}

function wireSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  skipLink?.addEventListener('click', () => {
    elements.content?.focus();
  });
}

function wireEmptyState() {
  document.getElementById('empty-search-btn')?.addEventListener('click', () => {
    document.getElementById('search-input')?.focus();
  });
  document.getElementById('empty-location-btn')?.addEventListener('click', () => {
    document.getElementById('my-location-btn')?.click();
  });
}

function wireRetryButton() {
  elements.retryBtn?.addEventListener('click', () => {
    if (lastAttemptedLocation) loadDashboard(lastAttemptedLocation);
  });
}

function resolveIncomingLocation() {
  const params = new URLSearchParams(window.location.search);
  const lat = params.get('lat');
  const lon = params.get('lon');

  if (lat && lon) {
    return {
      name: params.get('name') || 'Selected location',
      country: params.get('country') || '',
      lat: Number(lat),
      lon: Number(lon),
    };
  }

  return storage.get(STORAGE_KEYS.LAST_LOCATION, null);
}

function setLocationName(location) {
  const nameEl = document.getElementById('location-name');
  if (nameEl) {
    nameEl.textContent = location.country ? `${location.name}, ${location.country}` : location.name;
  }
}

/** Fetches forecast + air quality for `location` and renders every section. */
async function loadDashboard(location) {
  showLoading();
  stopLiveClock();
  lastAttemptedLocation = location;
  lastLocation = location;

  const unit = storage.get(STORAGE_KEYS.UNIT, 'celsius');
  updateUnitToggleLabel(unit);

  try {
    const { forecast, airQuality } = await getFullWeatherData(location.lat, location.lon, { unit });
    lastForecast = forecast;

    renderCurrent(forecast, unit);
    renderDetails(forecast);
    renderHourly(forecast);
    renderDaily(forecast);
    renderAQI(airQuality);
    renderAlerts(forecast);

    try {
      await renderChart(forecast, getActiveChartMetric());
    } catch {
      showToast("Couldn't load the weather chart. The rest of your data is still up to date.", { type: 'error' });
    }

    storage.set(STORAGE_KEYS.LAST_LOCATION, location);
    showContent();
    startLiveClock(forecast.timezone);
    playDashboardEntrance();
  } catch (error) {
    showError(error.message || 'Something went wrong while fetching weather data.', { canRetry: true });
  }
}

function buildShareData() {
  if (!lastForecast || !lastLocation) return null;

  const { current } = lastForecast;
  const unit = storage.get(STORAGE_KEYS.UNIT, 'celsius');
  const weather = describeWeatherCode(current.weather_code, current.is_day === 1);

  return {
    name: lastLocation.name,
    country: lastLocation.country,
    temp: round(current.temperature_2m),
    unit: unit === 'fahrenheit' ? 'F' : 'C',
    condition: weather.label,
    humidity: round(current.relative_humidity_2m),
    wind: round(current.wind_speed_10m),
  };
}

function startLiveClock(timezone) {
  const timeEl = document.getElementById('current-time');
  if (!timeEl) return;

  clockTimer = setInterval(() => {
    timeEl.textContent = formatTime24(getZonedNow(timezone));
  }, 30_000);
}

function stopLiveClock() {
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = null;
}

function wireUnitToggle() {
  elements.unitToggle?.addEventListener('click', () => {
    const current = storage.get(STORAGE_KEYS.UNIT, 'celsius');
    const next = current === 'celsius' ? 'fahrenheit' : 'celsius';
    storage.set(STORAGE_KEYS.UNIT, next);

    const location = resolveIncomingLocation();
    if (location) loadDashboard(location);
  });
}

function updateUnitToggleLabel(unit) {
  if (elements.unitToggleLabel) {
    elements.unitToggleLabel.textContent = unit === 'celsius' ? 'Switch to °F' : 'Switch to °C';
  }
}

function setDashboardState(state) {
  if (elements.loading) {
    elements.loading.hidden = state !== 'loading';
    elements.loading.classList.toggle('flex', state === 'loading');
  }
  if (elements.error) {
    elements.error.hidden = state !== 'error';
    elements.error.classList.toggle('flex', state === 'error');
  }
  if (elements.empty) {
    elements.empty.hidden = state !== 'empty';
    elements.empty.classList.toggle('flex', state === 'empty');
  }
  if (elements.content) {
    elements.content.hidden = state !== 'content';
  }
}

function showLoading() {
  setDashboardState('loading');
}

function showEmpty() {
  setDashboardState('empty');
}

function showContent() {
  setDashboardState('content');
  if (elements.content) {
    elements.content.style.opacity = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (elements.content) elements.content.style.opacity = '';
      });
    });
  }
}

function showError(message, { canRetry = false } = {}) {
  setDashboardState('error');
  if (elements.errorMessage) elements.errorMessage.textContent = message;
  if (elements.retryBtn) elements.retryBtn.hidden = !canRetry;
}

function wireThemeChangeListener() {
  document.addEventListener('skycast:themechange', () => {
    if (lastForecast) {
      renderChart(lastForecast, getActiveChartMetric()).catch(() => {
      });
    }
  });
}

function getActiveChartMetric() {
  const active = document.querySelector('.chart-tab.active');
  return active?.dataset.chart ?? 'temperature';
}

function wireChartTabs() {
  const tabsContainer = document.getElementById('chart-tabs');
  const tabs = document.querySelectorAll('.chart-tab');
  const indicator = document.getElementById('chart-tab-indicator');
  const caption = document.getElementById('chart-caption');

  const captions = {
    temperature: '24-hour temperature trend',
    humidity: '24-hour humidity trend',
    precipitation: '24-hour precipitation trend',
    wind: '24-hour wind speed trend',
    '7-day': '7-day outlook',
  };

  function moveIndicatorTo(tab) {
    if (!indicator || !tabsContainer || !tab) return;
    const containerRect = tabsContainer.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    indicator.style.width = `${tabRect.width}px`;
    indicator.style.height = `${tabRect.height}px`;
    indicator.style.transform = `translate(${tabRect.left - containerRect.left}px, ${tabRect.top - containerRect.top}px)`;
    indicator.style.opacity = '1';
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      moveIndicatorTo(tab);
      if (caption) caption.textContent = captions[tab.dataset.chart] ?? '';
      if (lastForecast) {
        renderChart(lastForecast, tab.dataset.chart).catch(() => {
          showToast("Couldn't load the chart. Check your connection and try again.", { type: 'error' });
        });
      }
    });
  });
  requestAnimationFrame(() => moveIndicatorTo(document.querySelector('.chart-tab.active')));

  if (tabsContainer && 'ResizeObserver' in window) {
    new ResizeObserver(() => {
      moveIndicatorTo(document.querySelector('.chart-tab.active'));
    }).observe(tabsContainer);
  }
}