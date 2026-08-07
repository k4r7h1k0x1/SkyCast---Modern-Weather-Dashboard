<link rel="icon" type="image/svg+xml" href="./src/assets/logo.png" />

<p class="mt-1">
        Built by k4r7h1k0x1<i class="fa-solid fa-heart text-rose-600"></i> 
      </p>

/**
 * Resolves a free-text city/place name to a list of candidate locations
 * using Open-Meteo's Geocoding API.
 *
 * @param {string} query - City, town, or postal code to search for
 * @param {{ count?: number, language?: string }} [options]
 * @returns {Promise<Array<{
 *   id: number, name: string, latitude: number, longitude: number,
 *   country: string, countryCode: string, admin1: string, timezone: string,
 * }>>}
 */


 /**
 * Resolves GPS coordinates to a display-friendly place name.
 *
 * Open-Meteo's Geocoding API does not support reverse lookups (coordinates
 * → name), so this uses BigDataCloud's free, keyless, CORS-enabled reverse
 * geocoding endpoint solely for the display name. All weather and air
 * quality data still comes exclusively from Open-Meteo.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{ name: string, country: string }>}
 */


 /**
 * Fetches current conditions, a 24-hour forecast, and a 7-day forecast for
 * a coordinate pair from Open-Meteo's Forecast API.
 *
 * @param {number} lat
 * @param {number} lon
 * @param {{ unit?: 'celsius' | 'fahrenheit', windUnit?: 'kmh'|'ms'|'mph'|'kn' }} [options]
 */