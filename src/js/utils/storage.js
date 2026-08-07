const PREFIX = 'skycast:';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable — fail silently, app still works in-session */
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* no-op */
    }
  },
};
export const STORAGE_KEYS = {
  THEME: 'theme', 
  UNIT: 'unit', 
  LAST_LOCATION: 'lastLocation', 
  RECENT_SEARCHES: 'recentSearches',
  FAVORITES: 'favorites',
};