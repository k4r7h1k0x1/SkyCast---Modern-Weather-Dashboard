import { getFavorites, isFavorite, toggleFavorite } from '../utils/favorites.js';

export function initFavoriteToggle(location) {
  const button = document.getElementById('favorite-toggle');
  if (!button || !location) return;

  updateButton(isFavorite(location));

  button.addEventListener('click', () => {
    const nowFavorited = toggleFavorite(location);
    updateButton(nowFavorited);
    renderFavoritesBar(location);
  });

  function updateButton(favorited) {
    const icon = button.querySelector('i');
    if (icon) icon.className = favorited ? 'fa-solid fa-star' : 'fa-regular fa-star';
    button.classList.toggle('text-amber-400', favorited);
    button.classList.toggle('text-slate-400', !favorited);
    button.setAttribute('aria-pressed', String(favorited));
    button.setAttribute('aria-label', favorited ? 'Remove from favorites' : 'Save to favorites');
  }
}

export function renderFavoritesBar(activeLocation = null) {
  const container = document.getElementById('favorites-bar');
  if (!container) return;

  const favorites = getFavorites();
  if (!favorites.length) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;

  const chips = favorites.map((loc) => {
    const active = activeLocation && loc.name === activeLocation.name && loc.country === activeLocation.country;
    return `
      <button
        type="button"
        class="fav-chip ${active ? 'fav-chip-active' : ''}"
        data-lat="${loc.lat}"
        data-lon="${loc.lon}"
        data-name="${escapeHtml(loc.name)}"
        data-country="${escapeHtml(loc.country ?? '')}"
      >
        <i class="fa-solid fa-star" aria-hidden="true"></i>
        ${escapeHtml(loc.name)}
      </button>`;
  }).join('');

  const compareLink = favorites.length >= 2
    ? `<a href="/compare.html" class="fav-chip fav-chip-compare">
         <i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> Compare
       </a>`
    : '';

  container.innerHTML = chips + compareLink;

  container.querySelectorAll('.fav-chip[data-lat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const params = new URLSearchParams({
        lat: btn.dataset.lat,
        lon: btn.dataset.lon,
        name: btn.dataset.name,
        country: btn.dataset.country,
      });
      window.location.href = `/dashboard.html?${params.toString()}`;
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}