import { storage, STORAGE_KEYS } from '../utils/storage.js';

const MAX_RECENT = 5;
export function getRecentSearches() {
  return storage.get(STORAGE_KEYS.RECENT_SEARCHES, []);
}

export function addRecentSearch(location) {
  const existing = getRecentSearches().filter(
    (loc) => !(loc.name === location.name && loc.country === location.country),
  );
  const updated = [location, ...existing].slice(0, MAX_RECENT);
  storage.set(STORAGE_KEYS.RECENT_SEARCHES, updated);
  return updated;
}