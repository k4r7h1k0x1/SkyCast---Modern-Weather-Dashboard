export const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
export const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
export const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';
export const REVERSE_GEOCODE_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
export const WMO_CODES = {
  0: { label: 'Clear sky', icon: 'fa-sun', group: 'clear' },
  1: { label: 'Mainly clear', icon: 'fa-cloud-sun', group: 'clear' },
  2: { label: 'Partly cloudy', icon: 'fa-cloud-sun', group: 'clouds' },
  3: { label: 'Overcast', icon: 'fa-cloud', group: 'clouds' },
  45: { label: 'Fog', icon: 'fa-smog', group: 'fog' },
  48: { label: 'Depositing rime fog', icon: 'fa-smog', group: 'fog' },
  51: { label: 'Light drizzle', icon: 'fa-cloud-rain', group: 'drizzle' },
  53: { label: 'Moderate drizzle', icon: 'fa-cloud-rain', group: 'drizzle' },
  55: { label: 'Dense drizzle', icon: 'fa-cloud-rain', group: 'drizzle' },
  56: { label: 'Light freezing drizzle', icon: 'fa-cloud-meatball', group: 'drizzle' },
  57: { label: 'Dense freezing drizzle', icon: 'fa-cloud-meatball', group: 'drizzle' },
  61: { label: 'Slight rain', icon: 'fa-cloud-rain', group: 'rain' },
  63: { label: 'Moderate rain', icon: 'fa-cloud-showers-heavy', group: 'rain' },
  65: { label: 'Heavy rain', icon: 'fa-cloud-showers-heavy', group: 'rain' },
  66: { label: 'Light freezing rain', icon: 'fa-cloud-meatball', group: 'rain' },
  67: { label: 'Heavy freezing rain', icon: 'fa-cloud-meatball', group: 'rain' },
  71: { label: 'Slight snow fall', icon: 'fa-snowflake', group: 'snow' },
  73: { label: 'Moderate snow fall', icon: 'fa-snowflake', group: 'snow' },
  75: { label: 'Heavy snow fall', icon: 'fa-snowflake', group: 'snow' },
  77: { label: 'Snow grains', icon: 'fa-snowflake', group: 'snow' },
  80: { label: 'Slight rain showers', icon: 'fa-cloud-showers-heavy', group: 'rain' },
  81: { label: 'Moderate rain showers', icon: 'fa-cloud-showers-heavy', group: 'rain' },
  82: { label: 'Violent rain showers', icon: 'fa-cloud-showers-heavy', group: 'rain' },
  85: { label: 'Slight snow showers', icon: 'fa-snowflake', group: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'fa-snowflake', group: 'snow' },
  95: { label: 'Thunderstorm', icon: 'fa-cloud-bolt', group: 'storm' },
  96: { label: 'Thunderstorm with slight hail', icon: 'fa-cloud-bolt', group: 'storm' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'fa-cloud-bolt', group: 'storm' },
};

export const EUROPEAN_AQI_BANDS = [
  { max: 20, label: 'Good', color: '#34D399' },
  { max: 40, label: 'Fair', color: '#A3E635' },
  { max: 60, label: 'Moderate', color: '#FBBF24' },
  { max: 80, label: 'Poor', color: '#FB923C' },
  { max: 100, label: 'Very Poor', color: '#F87171' },
  { max: Infinity, label: 'Extremely Poor', color: '#B91C1C' },
];