import { getFavorites, toggleFavorite, isFavorite } from '../utils/favorites.js';

export function initFavoriteToggle(location) {
  const button = document.getElementById('favorite-toggle');
  if (!button || !location) return;

  updateButton(isFavorite(location));

  button.addEventListener('click', () => {
    toggleFavorite(location);
  });

  document.addEventListener('skycast:favoriteschange', (event) => {
    const changed = event.detail?.location;
    if (changed && changed.name === location.name && changed.country === location.country) {
      updateButton(event.detail.favorited, { animate: true });
    }
  });

  function updateButton(favorited, { animate = false } = {}) {
    const icon = button.querySelector('i');
    if (icon) icon.className = favorited ? 'fa-solid fa-star' : 'fa-regular fa-star';
    button.classList.toggle('text-amber-400', favorited);
    button.classList.toggle('text-slate-400', !favorited);
    button.setAttribute('aria-pressed', String(favorited));
    button.setAttribute('aria-label', favorited ? 'Remove from favorites' : 'Save to favorites');

    if (animate) {
      button.classList.remove('star-pop');
      void button.offsetWidth;
      button.classList.add('star-pop');
    }
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
      <div class="fav-chip fav-chip-split ${active ? 'fav-chip-active' : ''}">
        <button
          type="button"
          class="fav-chip-nav"
          data-lat="${loc.lat}"
          data-lon="${loc.lon}"
          data-name="${escapeHtml(loc.name)}"
          data-country="${escapeHtml(loc.country ?? '')}"
        >
          <i class="fa-solid fa-star" aria-hidden="true"></i>
          ${escapeHtml(loc.name)}
        </button>
        <button
          type="button"
          class="fav-chip-remove"
          data-remove-name="${escapeHtml(loc.name)}"
          data-remove-country="${escapeHtml(loc.country ?? '')}"
          aria-label="Remove ${escapeHtml(loc.name)} from favorites"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>`;
  }).join('');

  const compareLink = favorites.length >= 2
    ? `<a href="/compare.html" class="fav-chip fav-chip-compare">
         <i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> Compare
       </a>`
    : '';

  container.innerHTML = chips + compareLink;

  container.querySelectorAll('.fav-chip-nav').forEach((btn) => {
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

  container.querySelectorAll('.fav-chip-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleFavorite({ name: btn.dataset.removeName, country: btn.dataset.removeCountry });
    });
  });
}

/** Minimal HTML-escaping for place names before they hit innerHTML/attributes. */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}