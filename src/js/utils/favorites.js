import { storage, STORAGE_KEYS } from "../utils/storage.js";

const MAX_FAVORITES = 8;

/** Returns pinned cities. */
export function getFavorites() {
  return storage.get(STORAGE_KEYS.FAVORITES, []);
}

export function isFavorite(location) {
  return getFavorites().some(
    (f) => f.name === location.name && f.country === location.country,
  );
}

export function toggleFavorite(location) {
  const current = getFavorites();
  const exists = current.some(
    (f) => f.name === location.name && f.country === location.country,
  );

  let updated;
  let favorited;

  if (exists) {
    updated = current.filter(
      (f) => !(f.name === location.name && f.country === location.country),
    );
    favorited = false;
  } else {
    updated = [...current, location].slice(0, MAX_FAVORITES);
    favorited = true;
  }

  storage.set(STORAGE_KEYS.FAVORITES, updated);
  document.dispatchEvent(
    new CustomEvent("skycast:favoriteschange", {
      detail: { location, favorited },
    }),
  );
  return favorited;
}

export { MAX_FAVORITES };
