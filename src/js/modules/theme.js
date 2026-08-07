import { storage, STORAGE_KEYS } from '../utils/storage.js';

const THEMES = ['light', 'dark', 'system'];

const ICONS = {
  light: 'fa-solid fa-sun',
  dark: 'fa-solid fa-moon',
  system: 'fa-solid fa-desktop',
};

const LABELS = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function resolveTheme(theme) {
  if (theme === 'system') {
    return mediaQuery.matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.setAttribute('data-theme-mode', theme);
}

function updateToggleUI(button, theme) {
  if (!button) return;
  const icon = button.querySelector('i');
  if (icon) icon.className = ICONS[theme];
  button.setAttribute('aria-label', LABELS[theme]);
  button.setAttribute('title', LABELS[theme]);
}

export function setTheme(theme) {
  storage.set(STORAGE_KEYS.THEME, theme);
  applyTheme(theme);
  document.dispatchEvent(new CustomEvent('skycast:theme-change', { detail: { theme } }));
}


export function initTheme(toggleSelector = '#theme-toggle') {
  const stored = storage.get(STORAGE_KEYS.THEME, 'system');
  applyTheme(stored);

  const button = document.querySelector(toggleSelector);
  updateToggleUI(button, stored);

  button?.addEventListener('click', () => {
    const current = storage.get(STORAGE_KEYS.THEME, 'system');
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    setTheme(next);
  });

  document.addEventListener('skycast:theme-change', (event) => {
    updateToggleUI(button, event.detail.theme);
  });

  mediaQuery.addEventListener('change', () => {
    const current = storage.get(STORAGE_KEYS.THEME, 'system');
    if (current === 'system') applyTheme('system');
  });
}

export function applyStoredThemeEarly() {
  const stored = storage.get(STORAGE_KEYS.THEME, 'system');
  applyTheme(stored);
}