# RainGuard

**Parametric micro-insurance for street vendors and daily-wage workers**

RainGuard is a web prototype demonstrating weather-triggered, peer-verified parametric income protection for informal workers vulnerable to extreme heat and rainfall. It is designed as a demonstration of a potential service, not as a production insurance product.

## Overview

- **Risk Monitoring** — Simulated weather telemetry per market zone with a transparent, weighted risk score (temperature 60%, rainfall 40%) and tiered payout thresholds.
- **Interactive Zone Map** — Real street map view using Leaflet + OpenStreetMap, with Hyderabad GPS coordinates for each market zone, risk-based color coding, vendor-count-scaled pins, zoom/pan controls, and a pulse effect for critical-distress zones.
- **Peer Verification** — Demonstration confirmation flow where nearby vendors validate reported ground conditions before a simulated payout is credited.
- **Worker Dashboard** — Payout history, explainable receipts, wallet balance, and withdrawal records.
- **Admin Console** — Centralized claims review, vendor oversight, and zone management for NGO administrators.
- **Accessibility** — Multilingual UI (English, Telugu, Hindi), large-text mode, offline-demo toggle, and simulated SMS alerts for feature-phone users.

## Demonstration Requirements

The prototype demonstrates the following user journeys and business rules:

1. Workers view their assigned market zone, declared daily wage, current demo weather, risk score, payout history, and wallet.
2. The risk score combines normalized temperature and rainfall scores: 60% temperature and 40% rainfall, on a 0–100 scale.
3. A score of 40 or below triggers no payout. Scores above 40 trigger 30% of the worker's daily wage; scores above 70 trigger 60%; scores above 90 trigger 80%.
4. A triggered claim is shown as awaiting peer confirmation. The demo can simulate two confirmations to demonstrate the claim moving to verified and the wallet balance changing.
5. Workers can review explainable payout receipts and demonstrate withdrawals by UPI, bank transfer, or kiosk. Admin users can review claims and demonstrate oversight actions.
6. Interface language, large-text preference, demo profile, and application records are kept in browser storage where applicable.

The weather and peer-verification flows are illustrative only. The demo uses realistic Hyderabad zone coordinates for display and risk simulation, but it does not connect to live weather feeds or real insurance infrastructure.

> **Important:** This is a demonstration prototype. Weather data, peer consensus, SMS dispatch, claims, and fund transfers are simulated. It does not provide real insurance coverage, send real SMS messages, or move actual money. Do not enter sensitive or real financial information.

## Tech Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Lucide React · React Router · Motion · Leaflet · React Leaflet

## Getting Started

### Prerequisites

- Node.js **22.12 or later** (required by the Vite 8 toolchain)
- npm (installed with Node.js)
- A modern browser with JavaScript and local storage enabled

No API keys, backend service, or environment file are required for the local demo. Internet access is needed to download npm packages during installation; the interface also loads its fonts from Google Fonts when available.

### Install and run

From the project root, install dependencies and start the development server:

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. The development server binds to `0.0.0.0` on port `3000`.

The Zone Map is rendered with Leaflet and OpenStreetMap tiles. The current data set uses Hyderabad market coordinates, and each market zone pin is sized by active protected vendors while keeping the risk color logic consistent with the rest of the page.

The app opens at sign-in. Choose a demo profile to explore **Ramesh** or **Lakshmi** (worker accounts) and **Priya** (NGO administrator), or create a local demo profile. Use **Log out** at the bottom of the sidebar to return to sign-in. No real account is created. Demo records and preferences are stored in the current browser; clearing the site's local storage resets locally saved demo data.

### Windows troubleshooting

If `npm run dev` reports that `vite` is not recognized, dependencies may not have been installed in this project folder or the install may not have completed. Run `npm install` from the folder containing `package.json`, wait for it to finish, then run `npm run dev` again. In PowerShell, if npm's command shim is not resolved, use `npm.cmd install` and `npm.cmd run dev`. Do not install Vite globally; the project uses its local dependency.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server (port 3000) |
| `npm run lint` | Type-check with TypeScript |
| `npm run build` | Build production assets to `dist/` |
| `npm run preview` | Preview the production build |

## Project Structure

| Path | Purpose |
|---|---|
| `src/pages/` | Authentication, dashboard, risk monitor, confirmations, payout history, zone map, wallet, profile, and admin screens |
| `src/components/` | Shared layout, payout dialogs, and SMS-log UI |
| `src/context/` | Demo identity and browser-persisted application state |
| `src/utils/` | Weather simulation, risk scoring, demo records, and translations |
| `src/types/` | Shared TypeScript models |
| `src/pages/ZoneMapPage.tsx` | Real-map rendering layer for Hyderabad market zones using Leaflet and OSM tile data |
| `src/pages/ZoneMapPage.css` | Zone pin styling, pulse animation, selected-state visuals, and map marker sizing |

## Roadmap

A production deployment would require a secure backend, authenticated identity, audited payout logic, real weather/satellite data integration, and data protection controls.