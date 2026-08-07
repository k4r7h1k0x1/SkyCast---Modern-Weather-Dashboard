import { describeWeatherCode } from './weatherIcons.js';
import { formatHour12, findNowHourIndex, round } from '../utils/format.js';

export function renderHourly(forecast) {
  const container = document.getElementById('hourly-forecast');
  if (!container) return;

  const { hourly, timezone } = forecast;
  const startIndex = findNowHourIndex(hourly.time, timezone);

  const count = 24;
  const html = [];

  for (let i = 0; i < count && startIndex + i < hourly.time.length; i += 1) {
    const idx = startIndex + i;
    const weather = describeWeatherCode(hourly.weather_code[idx], true);
    const label = i === 0 ? 'Now' : formatHour12(hourly.time[idx]);
    const temp = round(hourly.temperature_2m[idx]);
    const precip = round(hourly.precipitation_probability[idx]);
    const wind = round(hourly.wind_speed_10m[idx]);
    const highlight = i === 0
      ? 'border border-brand/30 bg-brand/10'
      : 'bg-black/5 dark:bg-white/5';

    html.push(`
      <div class="flex min-w-[96px] flex-col items-center gap-2 rounded-xl2 ${highlight} px-4 py-4 text-center">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-300">${label}</span>
        <i class="fa-solid ${weather.icon} text-2xl ${weather.colorClass}" aria-hidden="true"></i>
        <span class="text-lg font-bold text-slate-700 dark:text-slate-100">${temp}°</span>
        <span class="text-xs text-brand"><i class="fa-solid fa-droplet" aria-hidden="true"></i> ${precip}%</span>
        <span class="text-xs text-slate-400">${wind} km/h</span>
      </div>
    `);
  }

  container.innerHTML = html.join('');
}