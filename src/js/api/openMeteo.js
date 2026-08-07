import {
  GEOCODING_API,
  FORECAST_API,
  AIR_QUALITY_API,
  REVERSE_GEOCODE_API,
} from '../utils/constants.js';

function buildUrl(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Network request failed. Check your internet connection.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.reason || `Request failed with status ${response.status}.`);
  }

  return response.json();
}


export async function geocodeCity(query, { count = 5, language = 'en' } = {}) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Enter at least 2 characters to search for a city.');
  }

  const url = buildUrl(GEOCODING_API, {
    name: trimmed,
    count,
    language,
    format: 'json',
  });

  const data = await fetchJson(url);

  if (!data.results?.length) {
    throw new Error(`No results found for "${trimmed}".`);
  }

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    countryCode: r.country_code,
    admin1: r.admin1 ?? '',
    timezone: r.timezone,
  }));
}

export async function reverseGeocode(lat, lon) {
  const url = buildUrl(REVERSE_GEOCODE_API, {
    latitude: lat,
    longitude: lon,
    localityLanguage: 'en',
  });

  try {
    const data = await fetchJson(url);
    const name = data.city || data.locality || data.principalSubdivision || 'Your Location';
    return { name, country: data.countryName || '' };
  } catch {
    return { name: 'Your Location', country: '' };
  }
}

export async function getForecast(lat, lon, { unit = 'celsius', windUnit = 'kmh' } = {}) {
  const url = buildUrl(FORECAST_API, {
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'visibility',
      'uv_index',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_speed_10m_max',
    ].join(','),
    temperature_unit: unit,
    wind_speed_unit: windUnit,
    timezone: 'auto',
    forecast_days: 7,
  });

  return fetchJson(url);
}

export async function getAirQuality(lat, lon) {
  const url = buildUrl(AIR_QUALITY_API, {
    latitude: lat,
    longitude: lon,
    current: [
      'european_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'ozone',
    ].join(','),
    timezone: 'auto',
    forecast_days: 1,
  });

  return fetchJson(url);
}

export async function getFullWeatherData(lat, lon, options = {}) {
  const [forecast, airQuality] = await Promise.all([
    getForecast(lat, lon, options),
    getAirQuality(lat, lon),
  ]);
  return { forecast, airQuality };
}