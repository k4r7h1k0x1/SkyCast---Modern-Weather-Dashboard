import { storage, STORAGE_KEYS } from './storage.js';

const MAX_FAVORITES = 8;

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

  if (exists) {
    const updated = current.filter(
      (f) => !(f.name === location.name && f.country === location.country),
    );
    storage.set(STORAGE_KEYS.FAVORITES, updated);
    return false;
  }

  const updated = [...current, location].slice(0, MAX_FAVORITES);
  storage.set(STORAGE_KEYS.FAVORITES, updated);
  return true;
}

export { MAX_FAVORITES };