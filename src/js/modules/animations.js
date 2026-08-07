import gsap from 'gsap';

const SECTION_SELECTOR = '#dashboard-content > section';
const INNER_ITEM_SELECTOR = '.detail-card, #hourly-forecast > *, #daily-forecast > *, #pollutant-breakdown > *';

let observer = null;

export function playDashboardEntrance() {
  if (document.documentElement.dataset.dashboardIntroBound === 'true') return;

  const sections = document.querySelectorAll(SECTION_SELECTOR);
  if (!sections.length) return;

  document.documentElement.dataset.dashboardIntroBound = 'true';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  gsap.set(sections, { opacity: 0, y: 24 });

  observer = new IntersectionObserver(handleIntersect, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  });

  sections.forEach((section) => observer.observe(section));
}

function handleIntersect(entries) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    revealSection(entry.target);
    observer.unobserve(entry.target);
  });
}

function revealSection(section) {
  const innerItems = section.querySelectorAll(INNER_ITEM_SELECTOR);

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out', clearProps: 'opacity,transform' },
  });

  tl.to(section, { opacity: 1, y: 0, duration: 0.5 });

  if (innerItems.length) {
    tl.from(innerItems, {
      opacity: 0,
      y: 14,
      duration: 0.35,
      stagger: 0.035,
    }, '-=0.25');
  }
}