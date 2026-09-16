<div align="center">

# Pasar Quest  

> Crowdsourced Malaysian Night Market Directory & Gamified Foodie Dex

[Documentation](https://github.com/mhdhamka/PasarQuest) · [Live Demo](https://ais-pre-qdduiewlvohkvzam4dwwu2-469594656936.asia-east1.run.app) · [Report Bug](https://github.com/mhdhamka/PasarQuest/issues) · [Request Feature](https://github.com/mhdhamka/PasarQuest/issues)

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Sound_FX-FF6F00?style=for-the-badge&logo=soundcharts&logoColor=white)
![Express](https://img.shields.io/badge/Express-Backend-000000?style=for-the-badge&logo=express&logoColor=white)

</div>

---

# Overview

A community-driven, interactive full-stack web application designed to help Malaysians and travelers discover, track, and explore authentic night markets (*pasar malam*) across every state and federal territory in Malaysia.

Finding which pasar malam is operating today, its exact stall hours, parking accessibility, and prayer facilities is often difficult or scattered across disparate local social media groups. **Pasar Quest** solves this by uniting real-time operating schedules, interactive Leaflet geo-mapping, crowdsourced community stall submissions, and a gamified **Pasar Dex & Foodie Passport** with daily quests and check-in streaks.

Built with modern Progressive Web App (PWA) standards, **Pasar Quest** runs identically as a responsive web dashboard on desktop browsers and as an installable, standalone mobile application on iOS and Android smartphones.

---

## Key Features

* **Cross-Platform Mobile & Web (PWA):** Installs directly onto iOS & Android home screens with standalone full-screen view, custom app icon, offline caching, and native-feeling touch interactions alongside desktop browser support.
* **Interactive Night Market Map:** Dynamic Leaflet GIS interface plotting verified night markets across all 13 states and 3 federal territories with live "Open Now" status.
* **Pasar Dex & Foodie Passport:** Gamified catalog tracking authentic Malaysian street food delicacies (Char Kway Teow, Apam Balik, Satay, Roti John, Keropok Lekor, etc.) across Common, Rare, and Legendary tiers.
* **Daily Quests & Check-in Streaks:** Engaging daily challenge system that resets at midnight, rewarding bonus XP, unlockable badges, and maintaining continuous check-in streaks with visual flame indicators.
* **Subtle Browser Audio Engine:** Zero-dependency procedural Web Audio API sound synthesis delivering delightful dings for check-ins, magical chimes for badge unlocks, and triumphant fanfares for level-ups.
* **Hyper-local Amenity Filters:** Instant filtering by state, operating day, opening hours, surau (prayer room), toilets, motorcycle/car parking, and wheelchair accessibility.
* **Offline Resiliency & Caching:** Service Worker caching ensures seamless access to cached directory records and the Pasar Dex even during spotty connectivity at crowded outdoor stalls.
* **Crowdsourced Submissions & Error Reporting:** Built-in community submission modal for new markets and a "Report Incorrect Info" workflow with pre-filled details sent directly to administrators.

---

## Mobile & Desktop Experience

| Capability | Desktop Web Browser | Mobile Device (iOS / Android) |
| :--- | :--- | :--- |
| **Interface Layout** | High-density split screen with side-by-side market feed and interactive GIS map. | Mobile-first single-column feed with toggleable map view and bottom filter drawer. |
| **App Installation** | One-click installation from Chrome/Edge address bar or top navigation bar. | Native prompt on Android / guided "Add to Home Screen" on iOS Safari. |
| **Touch Optimization** | Hover tooltips, scroll zoom, and keyboard shortcuts. | $\ge 44\text{px}$ touch targets, gesture panning, and bottom action bars. |
| **Offline Support** | Service worker asset caching with instant fallback. | Full-screen standalone PWA with real-time offline alert banner. |

### Installing as a Mobile App

1. **Android / Google Chrome / Edge:**
   - Tap the **Install App** button in the top navigation bar, or open the browser menu (`⋮`) and select **Install App** / **Add to Home screen**.
2. **iPhone & iPad (Safari):**
   - Tap the **Share** button on Safari's bottom toolbar.
   - Scroll down and choose **Add to Home Screen**.
   - Launch Pasar Quest from your home screen as a standalone, distraction-free application without browser bars.

---

## The Technology Stack

| Component | Technology | Description & Responsibilities |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 / Vite | Component architecture, responsive state management, and asset bundling. |
| **Mobile & PWA Engine** | `vite-plugin-pwa` / Workbox | Web App Manifest, Service Worker offline caching, and home-screen install hooks. |
| **Styling & Design System** | Tailwind CSS v4 / Motion | Modern dark theme, animated transitions, glassmorphism badges, and responsive touch layout. |
| **Mapping & Geospatial** | Leaflet / OpenStreetMap | Client-side geolocation, coordinate distance calculation, custom pin markers, and cluster boundaries. |
| **Audio Engine** | Web Audio API | Procedural, browser-synthesized audio feedback (check-in dings, chord chimes, harmonic fanfares) with mute controls. |
| **Backend & Dev Server** | Express.js / Node.js | Container-ready server handling API endpoints and SPA fallback. |
| **Persistence Layer** | LocalStorage API | Resilient client-side persistence for favorites, check-in history, XP level, collected foods, daily quests, and streaks. |

---

## Getting Started Locally

To run the complete Pasar Quest stack locally, follow these simple steps:

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **NPM**: v9.0.0 or later

### 2. Installation & Development

```bash
# Clone the repository
git clone https://github.com/mhdhamka/PasarQuest.git
cd PasarQuest

# Install dependencies
npm install

# Start the Vite + Express development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### 3. Production Build

```bash
# Compile client assets, generate PWA service worker, and backend bundle
npm run build

# Start production server
npm run start
```

---

## Project Architecture

```text
PasarQuest/
├── public/                # Public assets & PWA manifest icons
├── scripts/
│   └── generate-icons.js  # Automated PNG icon generation script
├── src/
│   ├── components/        # React UI components
│   │   ├── AutoLocationPrompt.tsx   # Geolocation prompt banner
│   │   ├── CheckInModal.tsx         # Stamp celebration modal with streak banner
│   │   ├── DailyQuestsTab.tsx       # Interactive daily quests & XP claims
│   │   ├── FilterDrawer.tsx         # Comprehensive mobile filter drawer
│   │   ├── Header.tsx               # Brand navigation bar with live MYT clock & PWA install
│   │   ├── HeroSearchBar.tsx        # Search, state selector & filter cockpit
│   │   ├── MarketCard.tsx           # Market listing item card
│   │   ├── MarketDetailModal.tsx    # Full market information & amenities modal
│   │   ├── MarketMap.tsx            # Leaflet interactive map component
│   │   ├── OfflineIndicator.tsx     # Network status banner for offline state
│   │   ├── PasarDexModal.tsx        # Foodie passport, badges, quests & streaks
│   │   ├── PWAInstallButton.tsx     # Cross-platform install button & iOS guide
│   │   ├── ReportIssueModal.tsx     # Inaccuracy reporting modal
│   │   └── SuggestMarketModal.tsx   # Community market contribution modal
│   ├── data/
│   │   ├── mockMarkets.ts           # Curated Malaysian night market dataset
│   │   └── pasarDexData.ts          # Food catalog, levels & badge definitions
│   ├── utils/
│   │   ├── audioFeedback.ts         # Web Audio API sound synthesizer
│   │   ├── dailyQuests.ts           # Daily quest generation & claim logic
│   │   ├── marketUtils.ts           # Hours, status, distance & sorting helpers
│   │   ├── storage.ts               # LocalStorage persistent state managers
│   │   ├── streak.ts                # Daily check-in streak tracking algorithms
│   │   └── usePWAInstall.ts         # PWA beforeinstallprompt & standalone detection hook
│   ├── App.tsx                      # Root workspace layout & state controller
│   ├── index.css                    # Tailwind CSS global styles
│   ├── main.tsx                     # React 19 application entry point
│   └── types.ts                     # Shared TypeScript interfaces & types
├── index.html             # HTML entry point with PWA meta & viewport tags
├── package.json           # Dependencies and build scripts
├── server.ts              # Express backend server with Vite middleware
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite bundler with VitePWA plugin configuration
```

---

# Contributing

Contributions are always welcome! If you'd like to add new markets, improve data accuracy, or suggest new features:

* Fork the Repository
* Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
* Commit your Changes (`git commit -m "add: some amazing feature"`)
* Push to the Branch (`git push origin feature/AmazingFeature`)
* Open a Pull Request

---

# License

This project is released under the MIT License.

Feel free to learn from, fork, and improve upon this project.

---

<div align="center">

If you found this project interesting, consider giving it a star!

Made with ❤️ by mdhamka

</div>
