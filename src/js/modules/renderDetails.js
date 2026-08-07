import {
  describeWeatherCode,
  describePressure,
  describeVisibility,
  describeUvIndex,
} from './weatherIcons.js';
import { formatTime24, windDirectionToCompass, round, metersToKm } from '../utils/format.js';
import { animateCountUp } from '../utils/animateCountUp.js';

const TIME_VALUE_KEYS = new Set(['sunrise', 'sunset']);
export function renderDetails(forecast) {
  const { current, daily } = forecast;
  const visibilityKm = metersToKm(current.visibility);
  const conditionLabel = describeWeatherCode(current.weather_code, current.is_day === 1).label;

  const cards = {
    humidity: {
      value: `${round(current.relative_humidity_2m)}%`,
      sub: `Dew point ${round(current.dew_point_2m)}°`,
    },
    'wind-speed': {
      value: `${round(current.wind_speed_10m)} km/h`,
      sub: `Direction ${windDirectionToCompass(current.wind_direction_10m)} (${round(current.wind_direction_10m)}°)`,
    },
    pressure: {
      value: `${round(current.pressure_msl)} hPa`,
      sub: describePressure(current.pressure_msl),
    },
    visibility: {
      value: `${round(visibilityKm, 1)} km`,
      sub: describeVisibility(visibilityKm),
    },
    'uv-index': {
      value: `${round(current.uv_index, 1)}`,
      sub: describeUvIndex(current.uv_index),
    },
    'cloud-cover': {
      value: `${round(current.cloud_cover)}%`,
      sub: conditionLabel,
    },
    'rain-chance': {
      value: `${round(daily?.precipitation_probability_max?.[0] ?? 0)}%`,
      sub: `${round(current.precipitation, 1)} mm now`,
    },
    'feels-like': {
      value: `${round(current.apparent_temperature)}°`,
      sub: 'Apparent temperature',
    },
    sunrise: {
      value: daily?.sunrise?.[0] ? formatTime24(daily.sunrise[0]) : '--:--',
      sub: 'Golden hour',
    },
    sunset: {
      value: daily?.sunset?.[0] ? formatTime24(daily.sunset[0]) : '--:--',
      sub: 'Blue hour',
    },
  };

  Object.entries(cards).forEach(([key, { value, sub }]) => {
    const card = document.querySelector(`[data-detail="${key}"]`);
    if (!card) return;
    const valueEl = card.querySelector('.value');
    const subEl = card.querySelector('.sub');

    if (valueEl) {
      if (TIME_VALUE_KEYS.has(key)) {
        valueEl.textContent = value;
      } else {
        animateCountUp(valueEl, value, { duration: 0.7 });
      }
    }
    if (subEl) subEl.textContent = sub;
  });
}