import { reverseGeocode } from '../api/openMeteo.js';
import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { showToast } from '../modules/toast.js';

function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

const ERROR_MESSAGES = {
  1: 'Location access was denied. You can still search for a city above.',
  2: 'Your location is currently unavailable. Please try again or search for a city.',
  3: 'Locating you took too long. Please try again or search for a city.',
};

export function initGeolocation(buttonSelector = '#my-location-btn') {
  const button = document.querySelector(buttonSelector);
  if (!button) return;

  const icon = button.querySelector('i');

  button.addEventListener('click', async () => {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation is not supported by your browser.', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 5 * 60_000, 
      });

      const { latitude, longitude } = position.coords;
      const { name, country } = await reverseGeocode(latitude, longitude);

      storage.set(STORAGE_KEYS.LAST_LOCATION, { name, country, lat: latitude, lon: longitude });

      const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        name,
        country,
      });
      window.location.href = `/dashboard.html?${params.toString()}`;
    } catch (error) {
      setLoading(false);
      const message = ERROR_MESSAGES[error?.code] ?? 'Could not determine your location.';
      showToast(message, { type: 'error' });
    }
  });

  function setLoading(isLoading) {
    button.disabled = isLoading;
    button.classList.toggle('opacity-60', isLoading);
    if (!icon) return;
    icon.className = isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-location-crosshairs';
  }
}