import { showToast } from '../modules/toast.js';

export function initShareButton(getShareData, buttonId = 'share-btn') {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener('click', () => {
    const data = getShareData();
    if (!data) {
      showToast('Weather data is still loading — try again in a moment.', { type: 'info' });
      return;
    }

    try {
      shareCard(data);
    } catch {
      showToast("Couldn't generate the share card. Please try again.", { type: 'error' });
    }
  });
}

function shareCard(data) {
  const canvas = buildShareCanvas(data);

  canvas.toBlob(async (blob) => {
    if (!blob) {
      showToast("Couldn't generate the share image.", { type: 'error' });
      return;
    }

    const fileName = `skycast-${data.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Weather in ${data.name}`,
          text: `${data.temp}°${data.unit} and ${data.condition} in ${data.name}`,
        });
        return;
      } catch {
        // User cancelled the share sheet, or it failed — fall through to download.
      }
    }

    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Couldn't download the share image.", { type: 'error' });
    }
  }, 'image/png');
}

function buildShareCanvas({ name, country, temp, unit, condition, humidity, wind }) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 450;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#0E1220');
  bg.addColorStop(1, '#080B14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#3B82F6';
  ctx.font = 'bold 28px "Segoe UI", sans-serif';
  ctx.fillText('☁ SkyCast', 40, 60);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 24px "Segoe UI", sans-serif';
  ctx.fillText(country ? `${name}, ${country}` : name, 40, 120);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 100px "Segoe UI", sans-serif';
  ctx.fillText(`${temp}°${unit}`, 40, 240);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 26px "Segoe UI", sans-serif';
  ctx.fillText(condition, 40, 280);

  ctx.fillStyle = '#64748B';
  ctx.font = '400 18px "Segoe UI", sans-serif';
  ctx.fillText(`Humidity ${humidity}%   ·   Wind ${wind} km/h`, 40, 320);

  ctx.fillStyle = '#475569';
  ctx.font = '400 14px "Segoe UI", sans-serif';
  ctx.fillText('Powered by Open-Meteo', 40, 410);

  return canvas;
}