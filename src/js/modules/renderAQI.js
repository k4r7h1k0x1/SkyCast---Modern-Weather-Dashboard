import { describeAirQuality, describeAqiMessage } from './weatherIcons.js';
import { round } from '../utils/format.js';
import { animateCountUp } from '../utils/animateCountUp.js';

const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³', scaleMax: 75 },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', scaleMax: 150 },
  { key: 'carbon_monoxide', label: 'CO', unit: 'µg/m³', scaleMax: 400 },
  { key: 'nitrogen_dioxide', label: 'NO₂', unit: 'µg/m³', scaleMax: 200 },
  { key: 'ozone', label: 'O₃ (Ozone)', unit: 'µg/m³', scaleMax: 180 },
];

const RING_CIRCUMFERENCE = 264;

export function renderAQI(airQuality) {
  const { current } = airQuality;
  const aqi = round(current.european_aqi);
  const { label, color } = describeAirQuality(aqi);
  const displayPct = Math.max(0, Math.min(100, Number(aqi) || 0));

  const ring = document.getElementById('aqi-ring');
  const valueEl = document.getElementById('aqi-value');
  const labelEl = document.getElementById('aqi-label');
  const descEl = document.getElementById('aqi-description');
  const marker = document.getElementById('aqi-marker');

  if (valueEl) animateCountUp(valueEl, String(aqi), { duration: 0.7 });

  if (ring) {
    ring.style.stroke = color;
    ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - displayPct / 100));
  }

  if (marker) marker.style.left = `${displayPct}%`;

  if (labelEl) {
    labelEl.textContent = label;
    labelEl.style.color = color;
    labelEl.style.backgroundColor = hexToRgba(color, 0.15);
  }

  if (descEl) descEl.textContent = describeAqiMessage(label);

  const container = document.getElementById('pollutant-breakdown');
  if (!container) return;

  container.innerHTML = POLLUTANTS.map(({ key, label: pLabel, unit, scaleMax }) => {
    const value = current[key];
    const pct = Math.max(0, Math.min(100, Math.round(((value ?? 0) / scaleMax) * 100)));

    return `
      <div>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-500 dark:text-slate-300">${pLabel}</span>
          <span class="text-slate-400">${round(value, 1)} ${unit}</span>
        </div>
        <div class="mt-1 h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10">
          <div class="pollutant-bar h-full rounded-full bg-brand" data-target-width="${pct}" style="width:0%"></div>
        </div>
      </div>
    `;
  }).join('');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.querySelectorAll('.pollutant-bar').forEach((bar) => {
        bar.style.width = `${bar.dataset.targetWidth}%`;
      });
    });
  });
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}