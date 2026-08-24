import { formatHour12, formatDayLabel, findNowHourIndex, round } from '../utils/format.js';

let chartInstance = null;
let ChartConstructor = null; 

async function loadChartLibrary() {
  if (!ChartConstructor) {
    const module = await import('chart.js/auto');
    ChartConstructor = module.default;
  }
  return ChartConstructor;
}

const METRIC_CONFIG = {
  temperature: { hourlyKey: 'temperature_2m', color: '#3B82F6', unit: '°', decimals: 1 },
  humidity: { hourlyKey: 'relative_humidity_2m', color: '#22D3EE', unit: '%', decimals: 0 },
  precipitation: { hourlyKey: 'precipitation', color: '#818CF8', unit: ' mm', decimals: 1 },
  wind: { hourlyKey: 'wind_speed_10m', color: '#34D399', unit: ' km/h', decimals: 1 },
};

const revealPlugin = {
  id: 'lineReveal',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const progress = chart.$revealProgress ?? 1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(chartArea.left, chartArea.top, chartArea.width * progress, chartArea.height);
    ctx.clip();
  },
  afterDatasetsDraw(chart) {
    chart.ctx.restore();
  },
};

export async function renderChart(forecast, metric = 'temperature') {
  const canvas = document.getElementById('weather-chart-canvas');
  if (!canvas) return;

  const Chart = await loadChartLibrary();

  chartInstance?.destroy();

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { labels, values, color, unit, decimals } = buildSeries(forecast, metric);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 220);
  gradient.addColorStop(0, hexToRgba(color, 0.35));
  gradient.addColorStop(1, hexToRgba(color, 0));

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: color,
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
        borderWidth: 2,
      }],
    },
    plugins: [revealPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation: reducedMotion ? false : {
        duration: 900,
        easing: 'easeOutQuart',
        onProgress(event) {
          event.chart.$revealProgress = event.currentStep / event.numSteps;
        },
        onComplete(event) {
          event.chart.$revealProgress = 1;
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(19, 26, 43, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          titleColor: isDark ? '#E2E8F0' : '#1E293B',
          bodyColor: isDark ? '#CBD5E1' : '#475569',
          borderColor: hexToRgba(color, 0.5),
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10,
          displayColors: false,
          titleFont: { size: 11, weight: '600' },
          bodyFont: { size: 13, weight: '700' },
          callbacks: {
            label: (item) => `${round(item.raw, decimals)}${unit}`,
          },
        },
      },
      scales: {
        x: {
          offset: false,
          bounds: 'data',
          grid: { display: false },
          ticks: { color: textColor, maxTicksLimit: 6, font: { size: 11 } },
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 11 } },
        },
      },
      layout: {
        padding: 0,
      },
    },
  });
}

function buildSeries(forecast, metric) {
  if (metric === '7-day') {
    const { daily } = forecast;
    return {
      labels: daily.time.map((date, i) => formatDayLabel(date, i)),
      values: daily.temperature_2m_max.map((v) => round(v)),
      color: '#FB923C',
      unit: '°',
      decimals: 1,
    };
  }

  const config = METRIC_CONFIG[metric] ?? METRIC_CONFIG.temperature;
  const { hourly, timezone } = forecast;
  const startIndex = findNowHourIndex(hourly.time, timezone);
  const slice = hourly.time.slice(startIndex, startIndex + 24);

  return {
    labels: slice.map((t) => formatHour12(t)),
    values: hourly[config.hourlyKey].slice(startIndex, startIndex + 24),
    color: config.color,
    unit: config.unit,
    decimals: config.decimals,
  };
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}