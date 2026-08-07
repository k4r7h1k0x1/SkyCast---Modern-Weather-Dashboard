export function renderWeatherBackground(containerId, group, isDay = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = buildMarkup(group, isDay);
}

function buildMarkup(group, isDay) {
  switch (group) {
    case 'clear':
      return isDay ? sunMarkup() : nightMarkup();
    case 'clouds':
      return `${isDay ? sunMarkup(true) : ''}${cloudsMarkup(4)}`;
    case 'fog':
      return fogMarkup();
    case 'drizzle':
      return `${cloudsMarkup(2)}${rainMarkup(8, 3.2)}`;
    case 'rain':
      return `${cloudsMarkup(2)}${rainMarkup(16, 2.2)}`;
    case 'snow':
      return `${cloudsMarkup(2)}${snowMarkup(14)}`;
    case 'storm':
      return `${cloudsMarkup(3)}${rainMarkup(18, 1.8)}<div class="wbg-flash"></div>`;
    default:
      return cloudsMarkup(3);
  }
}

function sunMarkup(faded = false) {
  const opacity = faded ? 'opacity-60' : '';
  return `<div class="wbg-sun ${opacity}"></div><div class="wbg-rays ${opacity}"></div>`;
}

function nightMarkup() {
  const stars = Array.from({ length: 10 }, () => {
    const top = rand(4, 70);
    const left = rand(5, 90);
    const delay = rand(0, 3).toFixed(2);
    return `<div class="wbg-star" style="top:${top}%; left:${left}%; animation-delay:${delay}s;"></div>`;
  }).join('');
  return `<div class="wbg-moon"></div>${stars}`;
}

function cloudsMarkup(count) {
  return Array.from({ length: count }, (_, i) => {
    const top = rand(5, 55);
    const size = rand(50, 110);
    const duration = rand(28, 55).toFixed(1);
    const delay = (-rand(0, 40)).toFixed(1);
    return `<div class="wbg-cloud" style="top:${top}%; width:${size}px; height:${size * 0.5}px; animation-duration:${duration}s; animation-delay:${delay}s;"></div>`;
  }).join('');
}

function fogMarkup() {
  return Array.from({ length: 3 }, (_, i) => {
    const top = 20 + i * 22;
    const duration = rand(18, 30).toFixed(1);
    const delay = (-rand(0, 20)).toFixed(1);
    return `<div class="wbg-fog" style="top:${top}%; animation-duration:${duration}s; animation-delay:${delay}s;"></div>`;
  }).join('');
}

function rainMarkup(count, speed) {
  return Array.from({ length: count }, () => {
    const left = rand(0, 100);
    const duration = (speed + rand(-0.3, 0.3)).toFixed(2);
    const delay = (-rand(0, speed * 2)).toFixed(2);
    return `<div class="wbg-rain" style="left:${left}%; animation-duration:${duration}s; animation-delay:${delay}s;"></div>`;
  }).join('');
}

function snowMarkup(count) {
  return Array.from({ length: count }, () => {
    const left = rand(0, 100);
    const size = rand(3, 7).toFixed(1);
    const duration = rand(6, 12).toFixed(1);
    const delay = (-rand(0, 12)).toFixed(1);
    return `<div class="wbg-snow" style="left:${left}%; width:${size}px; height:${size}px; animation-duration:${duration}s; animation-delay:${delay}s;"></div>`;
  }).join('');
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}