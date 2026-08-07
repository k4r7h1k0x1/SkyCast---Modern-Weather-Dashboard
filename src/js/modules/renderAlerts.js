const ALERT_STYLES = {
  danger: { classes: 'border-rose-600/40 bg-rose-600/10 text-rose-400', icon: 'fa-triangle-exclamation' },
  warning: { classes: 'border-amber-500/40 bg-amber-500/10 text-orange-500', icon: 'fa-circle-exclamation' },
};

export function buildAlerts(forecast) {
  const { current, daily } = forecast;
  const alerts = [];

  if (current.uv_index >= 11) {
    alerts.push({ level: 'danger', message: 'Extreme UV — avoid sun exposure, especially 10am-4pm.' });
  } else if (current.uv_index >= 8) {
    alerts.push({ level: 'warning', message: 'High UV — wear sunscreen and seek shade.' });
  }

  if (current.temperature_2m >= 40) {
    alerts.push({ level: 'danger', message: 'Extreme heat — stay hydrated and avoid strenuous activity.' });
  } else if (current.temperature_2m <= 0) {
    alerts.push({ level: 'warning', message: 'Freezing conditions — watch for icy surfaces.' });
  }

  const rainChance = daily?.precipitation_probability_max?.[0] ?? 0;
  if (rainChance >= 80) {
    alerts.push({ level: 'warning', message: `Heavy rain expected today (${Math.round(rainChance)}% chance).` });
  }

  if (current.wind_speed_10m >= 50) {
    alerts.push({ level: 'warning', message: 'Strong winds — secure loose outdoor items.' });
  }

  if ([95, 96, 99].includes(current.weather_code)) {
    alerts.push({ level: 'danger', message: 'Thunderstorm activity in the area — stay indoors if possible.' });
  }

  if (current.visibility < 1000) {
    alerts.push({ level: 'warning', message: 'Low visibility due to fog — drive carefully.' });
  }

  return alerts;
}

export function renderAlerts(forecast, containerId = 'weather-alerts') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const alerts = buildAlerts(forecast);
  if (!alerts.length) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = alerts.map((alert) => {
    const style = ALERT_STYLES[alert.level] ?? ALERT_STYLES.warning;
    return `
      <div class="flex items-center gap-2 rounded-xl2 border ${style.classes} px-4 py-2.5 text-sm font-medium">
        <i class="fa-solid ${style.icon}" aria-hidden="true"></i>
        <span>${escapeHtml(alert.message)}</span>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}