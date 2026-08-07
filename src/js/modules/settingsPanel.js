import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { setTheme } from './theme.js';
import { getFavorites, toggleFavorite } from '../utils/favorites.js';

export function initSettingsPanel(triggerSelector = '#settings-toggle', panelSelector = '#settings-panel') {
  const trigger = document.querySelector(triggerSelector);
  const panel = document.querySelector(panelSelector);
  if (!trigger || !panel) return;

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = panel.hidden;
    if (willOpen) {
      renderPanel(panel);
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
    trigger.setAttribute('aria-expanded', String(willOpen));
  });

  document.addEventListener('click', (event) => {
    if (panel.hidden) return;
    if (panel.contains(event.target) || trigger.contains(event.target)) return;
    closePanel(panel, trigger);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      closePanel(panel, trigger);
      trigger.focus();
    }
  });


  document.addEventListener('skycast:theme-change', () => {
    if (!panel.hidden) renderPanel(panel);
  });
}

function closePanel(panel, trigger) {
  panel.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
}

function renderPanel(panel) {
  const theme = storage.get(STORAGE_KEYS.THEME, 'system');
  const unit = storage.get(STORAGE_KEYS.UNIT, 'celsius');
  const favorites = getFavorites();

  panel.innerHTML = `
    <div class="mb-4">
      <p class="settings-label">Theme</p>
      <div class="grid grid-cols-3 gap-1.5" role="group" aria-label="Theme">
        ${themeOptionHtml('light', 'fa-sun', 'Light', theme)}
        ${themeOptionHtml('dark', 'fa-moon', 'Dark', theme)}
        ${themeOptionHtml('system', 'fa-desktop', 'Auto', theme)}
      </div>
    </div>

    <div class="mb-4">
      <p class="settings-label">Units</p>
      <div class="grid grid-cols-2 gap-1.5" role="group" aria-label="Units">
        <button type="button" data-unit-option="celsius" class="settings-option ${unit === 'celsius' ? 'settings-option-active' : ''}">°C</button>
        <button type="button" data-unit-option="fahrenheit" class="settings-option ${unit === 'fahrenheit' ? 'settings-option-active' : ''}">°F</button>
      </div>
    </div>

    <div>
      <p class="settings-label">Favorites</p>
      ${favorites.length ? favoritesListHtml(favorites) : '<p class="px-1 text-xs text-slate-400">No pinned cities yet.</p>'}
    </div>
  `;

  panel.querySelectorAll('[data-theme-option]').forEach((button) => {
    button.addEventListener('click', () => {
      setTheme(button.dataset.themeOption);
      renderPanel(panel);
    });
  });

  panel.querySelectorAll('[data-unit-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextUnit = button.dataset.unitOption;
      storage.set(STORAGE_KEYS.UNIT, nextUnit);
      document.dispatchEvent(new CustomEvent('skycast:unit-change', { detail: { unit: nextUnit } }));
      renderPanel(panel);
    });
  });

  panel.querySelectorAll('[data-remove-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const favorite = favorites[Number(button.dataset.removeFavorite)];
      if (favorite) toggleFavorite(favorite); 
      renderPanel(panel);
      document.dispatchEvent(new CustomEvent('skycast:favorites-change'));
    });
  });
}

function themeOptionHtml(value, icon, label, current) {
  const active = value === current;
  return `
    <button type="button" data-theme-option="${value}" class="settings-option ${active ? 'settings-option-active' : ''}">
      <i class="fa-solid ${icon}" aria-hidden="true"></i> ${label}
    </button>`;
}

function favoritesListHtml(favorites) {
  const items = favorites.map((favorite, i) => `
    <li class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-600 transition-colors hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5">
      <span class="truncate"><i class="fa-solid fa-star mr-1.5 text-amber-400" aria-hidden="true"></i>${escapeHtml(favorite.name)}</span>
      <button
        type="button"
        data-remove-favorite="${i}"
        class="shrink-0 text-slate-400 transition-colors hover:text-rose-400"
        aria-label="Remove ${escapeHtml(favorite.name)} from favorites"
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </li>`).join('');

  return `<ul class="flex max-h-40 flex-col gap-0.5 overflow-y-auto">${items}</ul>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}