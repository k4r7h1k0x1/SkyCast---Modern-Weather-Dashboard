import { geocodeCity } from '../api/openMeteo.js';
import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { addRecentSearch, getRecentSearches } from './recentSearches.js';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export function initSearch(selectors = {}) {
  const form = document.querySelector(selectors.formSelector ?? '#search-form');
  const input = document.querySelector(selectors.inputSelector ?? '#search-input');
  const list = document.querySelector(selectors.listSelector ?? '#search-suggestions');
  const spinner = document.querySelector(selectors.spinnerSelector ?? '#search-spinner');
  const cta = document.getElementById('search-cta');
  const clearBtn = document.getElementById('search-clear-btn');

  if (!form || !input || !list) return;

  let debounceTimer = null;
  let currentResults = [];
  let activeIndex = -1;
  let requestToken = 0; 

  cta?.addEventListener('click', () => input.focus());

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    input.focus();
    showRecents();
  });

  input.addEventListener('focus', () => {
    if (!input.value.trim()) showRecents();
  });

  input.addEventListener('input', () => {
    const query = input.value.trim();
    clearTimeout(debounceTimer);

    if (query.length === 0) {
      showRecents();
      return;
    }
    if (query.length < MIN_QUERY_LENGTH) {
      closeList();
      return;
    }

    debounceTimer = setTimeout(() => runSearch(query), DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (event) => {
    if (!list.classList.contains('suggestions-open')) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, currentResults.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === 'Escape') {
      closeList();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (activeIndex >= 0 && currentResults[activeIndex]) {
      selectLocation(currentResults[activeIndex]);
      return;
    }
    if (currentResults[0]) {
      selectLocation(currentResults[0]);
      return;
    }

    const query = input.value.trim();
    if (query.length >= MIN_QUERY_LENGTH) {
      geocodeCity(query)
        .then((results) => results[0] && selectLocation(results[0]))
        .catch((error) => showMessage(error.message));
    }
  });

  document.addEventListener('click', (event) => {
    if (!form.contains(event.target)) closeList();
  });

  function showRecents() {
    const recents = getRecentSearches();
    if (!recents.length) {
      closeList();
      return;
    }

    currentResults = recents.map((r) => ({
      name: r.name,
      country: r.country,
      latitude: r.lat,
      longitude: r.lon,
    }));
    renderList(currentResults, { heading: 'Recent searches', icon: 'fa-clock-rotate-left' });
  }

  async function runSearch(query) {
    const token = ++requestToken;
    spinner?.classList.remove('hidden');

    try {
      const results = await geocodeCity(query, { count: 6 });
      if (token !== requestToken) return; 
      currentResults = results;
      renderList(results);
    } catch (error) {
      if (token !== requestToken) return;
      currentResults = [];
      showMessage(error.message);
    } finally {
      if (token === requestToken) spinner?.classList.add('hidden');
    }
  }

  function renderList(results, { heading = null, icon = 'fa-location-dot' } = {}) {
    activeIndex = -1;

    const headingHtml = heading
      ? `<li class="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">${escapeHtml(heading)}</li>`
      : '';

    list.innerHTML = headingHtml + results
      .map(
        (loc, i) => `
          <li>
            <button
              type="button"
              id="suggestion-${i}"
              class="suggestion-item"
              role="option"
              aria-selected="false"
              data-index="${i}"
            >
              <span class="truncate">
                <i class="fa-solid ${icon} mr-2 text-brand/70" aria-hidden="true"></i>${escapeHtml(loc.name)}${loc.admin1 ? `, ${escapeHtml(loc.admin1)}` : ''}
              </span>
              <span class="shrink-0 text-xs text-slate-400">${escapeHtml(loc.country ?? '')}</span>
            </button>
          </li>`,
      )
      .join('');

    list.querySelectorAll('.suggestion-item').forEach((button) => {
      button.addEventListener('click', () => {
        const i = Number(button.dataset.index);
        selectLocation(results[i]);
      });
    });

    list.classList.add('suggestions-open');
    input.setAttribute('aria-expanded', 'true');
  }

  function showMessage(message) {
    list.innerHTML = `<li class="px-4 py-3 text-sm text-slate-400" role="status">${escapeHtml(message)}</li>`;
    list.classList.add('suggestions-open');
    input.setAttribute('aria-expanded', 'true');
  }

  function setActiveIndex(index) {
    activeIndex = index;
    list.querySelectorAll('.suggestion-item').forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      if (i === index) button.scrollIntoView({ block: 'nearest' });
    });
    input.setAttribute('aria-activedescendant', index >= 0 ? `suggestion-${index}` : '');
  }

  function closeList() {
    list.classList.remove('suggestions-open');
    activeIndex = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function selectLocation(loc) {
    const location = {
      name: loc.name,
      country: loc.country,
      lat: loc.latitude,
      lon: loc.longitude,
    };

    storage.set(STORAGE_KEYS.LAST_LOCATION, location);
    addRecentSearch(location);

    const params = new URLSearchParams({
      lat: loc.latitude,
      lon: loc.longitude,
      name: loc.name,
      country: loc.country ?? '',
    });
    window.location.href = `/dashboard.html?${params.toString()}`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}