import gsap from 'gsap';
import { initTheme } from './modules/theme.js';
import { initSearch } from './modules/search.js';
import { initGeolocation } from './modules/geolocation.js';
import { renderWeatherBackground } from './modules/renderWeatherBackground.js';
import { registerServiceWorker } from './utils/registerServiceWorker.js';
import { initSearchShortcut } from './modules/keyboardShortcuts.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme('#theme-toggle');
  playEntranceAnimation();
  initSearch();
  initGeolocation();
  renderWeatherBackground('weather-bg', 'clouds', true);
  wireSkipLink();
  registerServiceWorker();
  initSearchShortcut();
});

function wireSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  const main = document.getElementById('main-content');
  skipLink?.addEventListener('click', () => main?.focus());
}

function playEntranceAnimation() {
  if (!document.querySelector('header') || !document.querySelector('.feature-card')) {
    return;
  }

  if (document.documentElement.dataset.introPlayed === 'true') return;
  document.documentElement.dataset.introPlayed = 'true';

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out', clearProps: 'opacity,transform' },
  });

  tl.from('header', { y: -16, opacity: 0, duration: 0.5 })
    .from(
      'main h1, main p, #search-cta',
      { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 },
      '-=0.2',
    )
    .from(
      '.feature-card',
      { y: 20, opacity: 0, duration: 0.4, stagger: 0.06 },
      '-=0.2',
    );
}