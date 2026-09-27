# SkyCast — Modern Weather Dashboard

A real-time weather dashboard with hourly and 7-day forecasts, live air
quality, threshold-based weather alerts, favorites, city comparison, and
offline support — built with vanilla JavaScript, Tailwind CSS, and GSAP,
powered entirely by the free [Open-Meteo API](https://open-meteo.com)
(no API key, no backend server required).

---

## Features

### Core weather experience
- **Live conditions** — current temperature, condition, humidity, wind, visibility, feels-like, sunrise/sunset, UV index, and cloud cover
- **24-hour forecast** — scrollable hourly strip starting from the actual current hour (computed from the device clock in the searched city's own timezone, not the API's last-observation timestamp, which can lag by up to an hour)
- **7-day forecast** — with proportional min/max temperature range bars
- **Interactive charts** — temperature, humidity, precipitation, wind, and a 7-day view, switchable by tab, rendered with Chart.js (lazy-loaded — it's not downloaded until a chart is actually shown)
- **Air Quality Index** — European AQI gauge plus a PM2.5 / PM10 / CO / NO₂ / O₃ pollutant breakdown, sourced from Open-Meteo's Air Quality API
- **Threshold-based weather alerts** — plain-language banners for high UV, extreme heat/cold, heavy rain, strong wind, storms, and fog. These are heuristics computed from the forecast data, not official meteorological warnings (Open-Meteo doesn't provide those)
- **°C/°F unit toggle**, persisted across visits

### Search & location
- **City search** with live autocomplete (Open-Meteo Geocoding API), debounced, full keyboard navigation (↑/↓/Enter/Esc)
- **"My Location"** via the browser Geolocation API, reverse-geocoded to a place name
- **Recent searches** — last 5 cities, shown in the search dropdown when the box is focused empty
- **`/` keyboard shortcut** focuses the search box from anywhere on the page

### Personalization
- **Favorites** — pin cities, quick-switch between them from a chip row on the dashboard
- **Compare view** (`compare.html`) — side-by-side conditions for 2–3 pinned cities
- **Settings panel** — a single place for theme (light/dark/system), units, and favorites management
- **Share** — generates a branded PNG summary card of current conditions (uses the native Web Share API on supported devices, falls back to a direct download elsewhere)
- **Toast notifications** for transient feedback (e.g. location errors) instead of browser `alert()` dialogs

### Visual design & motion
- Glassmorphism cards (frosted translucency, layered depth shadows) throughout
- Condition-aware ambient background animation (drifting clouds, falling rain/snow, rotating sun rays, twinkling stars at night) behind the hero
- A tinted "aura" glow behind the current-conditions mini-card that changes color with the weather (amber for sun, blue for rain, white for cloud, indigo for night) and swaps in a moon icon after dark
- Scroll-triggered card reveals, animated number count-ups, a left-to-right chart draw-in effect, and per-condition icon micro-animations (pulse/bounce/sway/drift)
- Every animation respects `prefers-reduced-motion`

### Reliability & accessibility
- **PWA** — installable, with a service worker that caches the app shell and the last-fetched weather data for offline viewing
- **SEO** — Open Graph / Twitter Card meta tags, a real favicon and app icons, `manifest.json`
- **Custom 404 page** matching the app's branding (see [Deployment Notes](#deployment-notes) — it needs one extra step to work on most static hosts)
- Full keyboard navigation, skip-to-content links, ARIA labeling throughout, and a visible focus ring on every interactive element
- **25 automated unit tests** covering the date/time formatting, weather-code descriptors, and API input validation (see [Testing](#testing))

---

## Tech stack

| | |
|---|---|
| Build tool | [Vite](https://vitejs.dev) 5 (multi-page: `index.html`, `dashboard.html`, `compare.html`) |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3 |
| Animation | [GSAP](https://gsap.com) |
| Charts | [Chart.js](https://www.chartjs.org) 4 (lazy-loaded) |
| Icons | Font Awesome 6 (via CDN) |
| Weather data | [Open-Meteo](https://open-meteo.com) — Forecast, Geocoding, and Air Quality APIs (free, no key) |
| Reverse geocoding | [BigDataCloud](https://www.bigdatacloud.com) client-side API (free, no key) — used only to turn GPS coordinates into a place name for "My Location"; all weather/AQI data is Open-Meteo |
| Testing | Node's built-in [`node:test`](https://nodejs.org/api/test.html) runner — zero extra dependencies |

No backend, no database, no API keys, and no environment variables are required anywhere in this project.

---

## References 

<img width="1918" height="1001" alt="image" src="https://github.com/user-attachments/assets/80d76982-ff34-4ff1-9c0c-2774151dfd63" />

---
<img width="1902" height="994" alt="image" src="https://github.com/user-attachments/assets/c4b0245f-f3ae-4fdd-8d8a-1c79544481d4" />

---
<img width="1875" height="733" alt="image" src="https://github.com/user-attachments/assets/503b90b9-0335-4d42-9231-0dab566f17f7" />

---
<img width="1906" height="961" alt="image" src="https://github.com/user-attachments/assets/3cc2dcd5-9e9a-486c-b79c-a960e3949b05" />

---

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server → http://localhost:5173
npm run dev

# Run the test suite
npm test

# Build for production → outputs to dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## Project structure

```
skycast-weather-dashboard/
├── index.html              # Landing page
├── dashboard.html          # Main weather dashboard
├── compare.html            # Side-by-side comparison for pinned cities
├── 404.html                # Custom not-found page
│
├── src/
│   ├── css/main.css        # Tailwind + all custom component/animation styles
│   └── js/
│       ├── main.js         # index.html entry
│       ├── dashboard.js    # dashboard.html entry
│       ├── compare.js      # compare.html entry
│       │
│       ├── api/
│       │   ├── openMeteo.js       # every network call (geocoding, forecast, air quality)
│       │   └── openMeteo.test.js
│       │
│       ├── modules/        # one file per feature
│       │   ├── theme.js               # light/dark/system toggle
│       │   ├── search.js              # autocomplete, keyboard nav, recent searches
│       │   ├── geolocation.js         # "My Location" flow
│       │   ├── favorites.js           # pin/unpin cities
│       │   ├── recentSearches.js      # last-5-searches storage
│       │   ├── weatherIcons.js        # WMO code → icon/label/color, AQI bands
│       │   ├── weatherIcons.test.js
│       │   ├── renderCurrent.js       # hero band
│       │   ├── renderDetails.js       # "Today's Details" 10-card grid
│       │   ├── renderHourly.js        # 24-hour strip
│       │   ├── renderDaily.js         # 7-day forecast
│       │   ├── renderChart.js         # Chart.js line charts (lazy-loaded)
│       │   ├── renderAQI.js           # AQI gauge + pollutant bars
│       │   ├── renderAlerts.js        # threshold-based weather alerts
│       │   ├── renderFavorites.js     # favorites chip row + pin toggle
│       │   ├── renderWeatherBackground.js  # ambient condition animation
│       │   ├── animations.js          # scroll-triggered card reveals
│       │   ├── shareCard.js           # PNG share card generation
│       │   ├── toast.js               # in-app toast notifications
│       │   └── settingsPanel.js       # unified theme/unit/favorites panel
|       │   └── sw.js                # Service worker (offline caching)****
│       │
│       └── utils/
│           ├── storage.js             # namespaced localStorage helper
│           ├── format.js              # date/time/wind/rounding helpers
│           ├── format.test.js
│           ├── animateCountUp.js      # shared number count-up animation
│           ├── constants.js           # API URLs, WMO code table, AQI bands
│           └── registerServiceWorker.js
│
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
└── package.json
```

---

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page — search a city or use current location |
| `dashboard.html` | Full weather dashboard for a given `?lat=&lon=&name=&country=` |
| `compare.html` | Side-by-side view for pinned favorite cities (needs 2+ pinned) |
| `404.html` | Branded not-found page — see note below |

---

## Testing

```bash
npm test
```

Runs 25 tests via Node's built-in test runner (no Jest/Vitest/other framework installed — nothing extra to configure):
- Date/time parsing and formatting, including timezone-safe "current hour" resolution
- Weather-code → icon/label/color mapping, including day/night swaps
- AQI band classification, pressure/visibility/UV classification
- API layer input validation (e.g. rejecting too-short search queries before making a network call)

---

## Deployment notes

- **Static hosting only** — the entire app is client-side; any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, etc.) works.
- **`404.html` needs one manual step on most hosts.** Because it isn't one of Vite's build entry points (only `index.html`, `dashboard.html`, and `compare.html` are), running `npm run build` does not automatically place it in `dist/` the way a bundled page is. Before deploying, either:
  - add it to a "custom error page" setting in your host's dashboard (Netlify: `_redirects` file with a `404` rule; Vercel: `vercel.json`), pointing at a copy of `404.html`, **or**
  - manually copy `404.html` into `dist/` as a post-build step.

  This is a one-time deployment configuration item, not a bug in the app itself.
- The service worker (`public/sw.js`) caches the app shell and the last successful Open-Meteo response per city, so a previously-viewed city's weather remains viewable offline. It does not cache new cities you haven't visited before.

---

## Known limitations

- **Font Awesome loads from a CDN**, not self-hosted. This is a reasonable trade-off for load time in most cases (browser cache sharing across sites, no build-time icon subsetting needed), but it does mean the icons briefly depend on `cdnjs.cloudflare.com` being reachable. A `preconnect` hint is already in place to minimize that cost.
- **Weather alerts are heuristic**, not official warnings — Open-Meteo does not provide a government weather-alert feed. Thresholds are documented in `renderAlerts.js`.
- **Reverse geocoding** (coordinates → city name for "My Location") uses BigDataCloud's free API since Open-Meteo doesn't offer this; if that service is ever unreachable, "My Location" still works but falls back to labeling the pin "Your Location" instead of a real place name.

---

## Data sources & credits

- Weather and air quality data: [Open-Meteo](https://open-meteo.com) (CC BY 4.0)
- Reverse geocoding: [BigDataCloud](https://www.bigdatacloud.com)
- Icons: [Font Awesome](https://fontawesome.com) Free
- Fonts: [Sora](https://fonts.google.com/specimen/Sora) & [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
