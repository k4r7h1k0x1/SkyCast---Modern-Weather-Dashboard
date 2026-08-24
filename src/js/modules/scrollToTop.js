export function initScrollToTop(buttonId = 'scroll-top-btn', sentinelId = 'scroll-top-sentinel') {
  const button = document.getElementById(buttonId);
  const sentinel = document.getElementById(sentinelId);
  if (!button || !sentinel) return;

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      // Sentinel out of view (scrolled past it) -> show the button.
      button.classList.toggle('scroll-top-visible', !entry.isIntersecting);
    },
    { threshold: 0 },
  );

  observer.observe(sentinel);
}