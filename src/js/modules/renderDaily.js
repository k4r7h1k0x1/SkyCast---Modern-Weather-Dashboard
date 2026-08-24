import { describeWeatherCode } from './weatherIcons.js';
import { formatDayLabel, round } from '../utils/format.js';

export function renderDaily(forecast) {
  const container = document.getElementById('daily-forecast');
  if (!container) return;

  const { daily } = forecast;
  const mins = daily.temperature_2m_min;
  const maxs = daily.temperature_2m_max;
  const overallMin = Math.min(...mins);
  const overallMax = Math.max(...maxs);
  const range = overallMax - overallMin || 1;

  const html = daily.time.map((date, i) => {
    const weather = describeWeatherCode(daily.weather_code[i], true);
    const precip = round(daily.precipitation_probability_max?.[i] ?? 0);
    const min = round(mins[i]);
    const max = round(maxs[i]);

    const rawWidthPct = ((max - min) / range) * 100;
    const widthPct = Math.max(rawWidthPct, 6); 
    const leftPct = Math.max(0, Math.min(((min - overallMin) / range) * 100, 100 - widthPct));

    return `
      <div class="daily-row flex items-center gap-2 rounded-xl px-2 py-3 text-sm transition-colors duration-150 sm:gap-3">
        <span class="w-9 shrink-0 font-semibold sm:w-12 ${i === 0 ? 'text-brand' : 'text-slate-600 dark:text-slate-200'}">
          ${formatDayLabel(date, i)}
        </span>
        <i class="fa-solid ${weather.icon} w-5 shrink-0 text-center ${weather.colorClass}" aria-hidden="true"></i>
        <span class="hidden w-28 shrink-0 truncate text-xs text-slate-400 sm:inline">${weather.label}</span>
        <span class="w-11 shrink-0 text-xs text-brand sm:w-14"><i class="fa-solid fa-droplet" aria-hidden="true"></i> ${precip}%</span>
        <span class="w-7 shrink-0 text-right text-xs text-slate-400 sm:w-8">${min}°</span>
        <div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            class="absolute h-full rounded-full bg-gradient-to-r from-brand to-accent-orange"
            style="left:${leftPct}%; width:${widthPct}%;"
          ></div>
        </div>
        <span class="w-7 shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-200 sm:w-8">${max}°</span>
      </div>
    `;
  });

  container.innerHTML = html.join('');
}