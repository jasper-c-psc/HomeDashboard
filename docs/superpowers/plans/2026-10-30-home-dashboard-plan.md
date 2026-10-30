# Localhost Smart Home & Transport Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localhost React + TypeScript + Vite Smart Home & Transport Dashboard matching the dark reference UI 1:1, with live Home Assistant WebSocket/REST integration, JSON/Lovelace YAML settings migration, and a dedicated real-time Transport Page (Bus, Minibus, Ferry/Ship, MTR).

**Architecture:** A modular React + TypeScript application backed by a unified `DashboardContext` that persists configuration to `localStorage`, synchronizes entity states with a live Home Assistant server via WebSocket/REST (`haService.ts`), fetches/simulates Hong Kong transport ETA data (`transportService.ts`), and provides bidirectional JSON & Home Assistant Lovelace YAML config migration (`migrationService.ts`).

**Tech Stack:** React 19, TypeScript, Vite, Lucide React icons, Vitest (for unit testing services and migration engine), native CSS variables & Grid layout.

## Global Constraints

- Canvas Background: `#0b0c10`, Card Surface Primary: `#16181e`, Card Surface Elevated: `#1f222a`, Primary Accent: `#2d7ff9` / `#3b82f6`.
- Must work 100% offline/out-of-the-box in Demo Mode with pre-populated rooms, devices, cameras, AC dial, energy chart, and transport routes.
- Must support live Home Assistant connection (`URL` + `Long-Lived Access Token`) and bidirectional settings migration (JSON & Home Assistant Lovelace YAML).
- Modal dialogs must use native `<dialog closedby="any">` with `showModal()` and the `!('closedBy' in HTMLDialogElement.prototype)` backdrop click fallback.

---

### Task 1: Project Scaffolding, Types & Default Demo State

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/types/dashboard.ts`
- Create: `src/data/defaultConfig.ts`

- [ ] **Step 1: Initialize Vite + React + TypeScript + Vitest project files**
- [ ] **Step 2: Define core data structures (`DashboardConfig`, `Room`, `DeviceItem`, `QuickDevice`, `ClimateState`, `MediaPlayerState`, `TransportRoute`, `HAConfig`) in `src/types/dashboard.ts`**
- [ ] **Step 3: Populate `src/data/defaultConfig.ts` with exact reference image data (`Lemonaru`, `Yogyakarta 28°C`, `Living Room` / `Bed Room` / `Dining Room` / `Bath Room` / `Backyard` / `Garage`, `Nest Wifi`, `Benq Tv`, `Thermostat`, `Humidifier Xiaomi Mi - X500`, `Speaker Google Speaker - A21`, `Camera CCTV Google Camera - X2`, `Google Thermostat`, `Bring Me To Life - Evanescence`, `21.5°` AC, Weekly Energy `102 kWh` on Friday, and default HK Bus/Minibus/Ferry/MTR routes)**

---

### Task 2: Home Assistant Adapter, Transport ETA Service & Settings Migration Engine (with Unit Tests)

**Files:**
- Create: `src/services/migrationService.ts`
- Create: `src/services/haService.ts`
- Create: `src/services/transportService.ts`
- Test: `src/services/__tests__/migrationService.test.ts`

- [ ] **Step 1: Write unit tests for JSON export/import and Home Assistant Lovelace YAML export/import in `src/services/__tests__/migrationService.test.ts`**
- [ ] **Step 2: Implement `migrationService.ts` (JSON validation/serialization + Lovelace YAML generator and parser supporting rooms, devices, climate, media player, and transport sensors)**
- [ ] **Step 3: Implement `haService.ts` (Home Assistant REST API state fetch, service call `homeassistant/toggle`, `climate/set_temperature`, and WebSocket `/api/websocket` live subscription)**
- [ ] **Step 4: Implement `transportService.ts` (Real-time HK KMB / MTR / GMB open API fetcher with graceful simulated countdown fallback for Bus, Minibus, Ferry/Ship, and MTR)**
- [ ] **Step 5: Run Vitest unit tests and verify all pass**

---

### Task 3: Dashboard State Context & Left Sidebar + Top Header Layout

**Files:**
- Create: `src/context/DashboardContext.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/components/LightDismissDialog.tsx`

- [ ] **Step 1: Build `DashboardContext.tsx` managing active page, rooms, devices, AC state, media state, energy period, transport routes, HA live connection status, and search query**
- [ ] **Step 2: Build `LightDismissDialog.tsx` using `<dialog closedby="any">` + `showModal()` + Safari/legacy backdrop-click fallback**
- [ ] **Step 3: Build `Sidebar.tsx` and `Header.tsx` matching the reference image (`Good Morning, Lemonaru`, search input, notification popover, profile switcher)**

---

### Task 4: Main Smart Home Dashboard Widgets (1:1 Reference Design)

**Files:**
- Create: `src/components/dashboard/CameraCard.tsx`
- Create: `src/components/dashboard/WeatherAndQuickToggles.tsx`
- Create: `src/components/dashboard/AirConditionerCard.tsx`
- Create: `src/components/dashboard/MyRoomsSection.tsx`
- Create: `src/components/dashboard/EnergyChartCard.tsx`
- Create: `src/components/dashboard/DeviceModal.tsx`

- [ ] **Step 1: Implement `CameraCard.tsx` (`Bed Room`, `● Live`, `4K Resolution`, power switch, camera image/stream)**
- [ ] **Step 2: Implement `WeatherAndQuickToggles.tsx` (`Yogyakarta 28°C` with custom sun+cloud SVG + `Nest Wifi`, `Benq Tv`, `Thermostat` toggle cards)**
- [ ] **Step 3: Implement `AirConditionerCard.tsx` (`Living Room`, custom radial tick-mark SVG gauge, `COOLING TO 21.5°`, `UNDER 7 MIN`, `-` / `+` buttons from `16°` to `32°`, `Fan Speed`, `Timer`, `Auto Mode` buttons)**
- [ ] **Step 4: Implement `MyRoomsSection.tsx` (Room tabs, `Edit` mode, `Add Device +` button, Room Live Camera, `Bring Me To Life - Evanescence` waveform media player, and 2×2 hardware-styled device cards: Humidifier, Speaker, Camera CCTV, Thermostat)**
- [ ] **Step 5: Implement `EnergyChartCard.tsx` (`Weekly` / `Monthly` selector, smooth SVG area + line chart Mon–Sun with interactive tooltip `102 kWh`)**

---

### Task 5: Transport Page (交通資訊專頁: 巴士 Bus、小巴 Minibus、渡輪 Ship/Ferry、港鐵 MTR)

**Files:**
- Create: `src/components/transport/TransportPage.tsx`
- Create: `src/components/transport/TransportModal.tsx`

- [ ] **Step 1: Build `TransportPage.tsx` with category filter tabs (`全部常用 All`, `巴士 Bus`, `小巴 Minibus`, `渡輪 Ship/Ferry`, `港鐵 MTR`), live HK Open Data toggle, MTR line status banner, and route cards showing next 3 arrivals, platform/pier details, and bound Home Assistant `sensor.*` entity badges**
- [ ] **Step 2: Build `TransportModal.tsx` allowing users to add/edit custom Bus, Minibus, Ferry, or MTR routes and bind them to HA entities**

---

### Task 6: Home Assistant Settings & Migration Page + Secondary Sidebar Views

**Files:**
- Create: `src/components/settings/SettingsAndMigrationView.tsx`
- Create: `src/components/views/SecondaryViews.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

- [ ] **Step 1: Build `SettingsAndMigrationView.tsx` with HA URL & Long-Lived Access Token form, Test Connection & Sync Entities button, CORS helper snippet, Entity Mapper table, JSON Export/Import, and interactive Home Assistant Lovelace YAML Export/Import editor**
- [ ] **Step 2: Build `SecondaryViews.tsx` for Analytics, Activity Notifications, and Automation Schedules**
- [ ] **Step 3: Assemble `App.tsx` and pixel-accurate `index.css` dark theme styling**
- [ ] **Step 4: Run unit tests, build verification, and start the localhost server to inspect in browser**

