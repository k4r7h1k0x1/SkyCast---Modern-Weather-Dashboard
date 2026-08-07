import gsap from 'gsap';

export function animateCountUp(el, targetText, { duration = 0.8 } = {}) {
  if (!el) return;

  const match = String(targetText).match(/^(-?\d+(?:\.\d+)?)(.*)$/s);
  if (!match) {
    el.textContent = targetText;
    return;
  }

  const [, numStr, suffix] = match;
  const target = Number(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

  if (!Number.isFinite(target)) {
    el.textContent = targetText;
    return;
  }

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = `${target.toFixed(decimals)}${suffix}`;
    el.dataset.rawValue = String(target);
    return;
  }

  const previous = Number(el.dataset.rawValue);
  const from = Number.isFinite(previous) ? previous : 0;
  const proxy = { value: from };

  gsap.to(proxy, {
    value: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = `${proxy.value.toFixed(decimals)}${suffix}`;
    },
  });

  el.dataset.rawValue = String(target);
}