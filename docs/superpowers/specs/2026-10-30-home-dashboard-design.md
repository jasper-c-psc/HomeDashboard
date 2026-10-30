# Localhost Smart Home & Transport Dashboard Design Spec

**Date:** 2026-10-30  
**Topic:** Localhost Home Dashboard with Home Assistant Migration & Real-Time Transport Page (Bus, Minibus, Ferry/Ship, MTR)

---

## 1. Overview & Goals

Build a localhost web-based Smart Home Dashboard that faithfully reproduces the dark, modern UI from the reference design while adding:
1. **Home Assistant (HA) Integration & Settings Migration:** Live connection via Home Assistant WebSocket & REST APIs, entity mapping for all dashboard widgets, and bidirectional configuration migration (JSON full backup/restore + Home Assistant Lovelace YAML import/export).
2. **Dedicated Transport Page (交通資訊專頁):** A comprehensive real-time & customizable transport dashboard covering **Bus (巴士 - KMB/Citybus)**, **Minibus (專線/紅色小巴 - GMB)**, **Ferry/Ship (渡輪/船班)**, and **MTR/Subway (港鐵/地鐵)** with live ETA countdowns, route/stop management, service status alerts, and Home Assistant transport sensor (`sensor.*`) binding.

---

## 2. Visual Design & Layout Architecture

### 2.1 Theme Tokens
- **Canvas Background:** `#0b0c10` (deep matte obsidian)
- **Card Surface Primary:** `#16181e`
- **Card Surface Elevated / Inner Tile:** `#1f222a`
- **Primary Accent:** `#2d7ff9` / `#3b82f6` (electric blue with subtle glow `rgba(45, 127, 249, 0.35)`)
- **Status Colors:**
  - Live / Alert Red: `#ef4444`
  - Online / Normal Green: `#22c55e`
  - Warning / Delay Amber: `#f59e0b`
- **Typography:** Inter / system sans-serif, clean hierarchy with high-contrast white (`#ffffff`) headings and muted slate (`#8b92a5`) labels.

### 2.2 Navigation Structure (Left Sidebar Rail)
1. **Home Dashboard (`dashboard`)** — Main smart home control center (1:1 match with reference image).
2. **Transport Info (`transport` / 交通資訊)** — Bus, Minibus, Ship/Ferry, and MTR live arrival & route board.
3. **Energy & Analytics (`analytics`)** — Detailed power & climate trends.
4. **Notifications & Activity Log (`messages`)** — Device state history & transport/home alerts.
5. **Schedules & Automations (`calendar`)** — Smart home & commute timers/scenes.
6. **Lovelace YAML & Migration (`docs`)** — Interactive YAML/JSON configuration viewer, importer, and exporter.
7. **Settings (`settings`)** — Home Assistant connection (URL + Long-Lived Access Token), Entity Mapper, User Profile, and Data Reset.

---

## 3. Main Home Dashboard Specification (Reference Image 1:1)

### 3.1 Top Header Bar
- Dynamic greeting (`Good Morning, Lemonaru` — user name configurable in Settings).
- Global search bar (`Search`) that filters devices, rooms, or transport routes.
- Notification bell icon with unread indicator and dropdown popover.
- User profile pill (`Lemonaru` with avatar and quick menu).

### 3.2 Dashboard Grid Cards
1. **Primary Camera Card (`Bed Room`):**
   - Header with subtitle `Camera`, title `Bed Room`, and blue toggle switch.
   - Live viewport with `● Live` badge (top-left), `4K Resolution` frosted badge (top-right).
   - Supports Home Assistant `camera.*` stream/snapshot proxy URL or high-res room visuals.
2. **Outdoor Weather + 3 Quick Toggles:**
   - **Weather Card:** Location pin (`Yogyakarta` or user-configured city / HA `weather.*` entity), large temperature (`28°C`), label (`Outdoor Temperature`), and custom sun-behind-cloud vector illustration.
   - **Quick Toggle Row (3 Cards):**
     - `Nest Wifi` (`Connected`, Wi-Fi icon, ON/OFF switch)
     - `Benq Tv` (`Connect - Stanby`, TV icon, ON/OFF switch)
     - `Thermostat` (`Coling to 24 c`, Snowflake icon, ON/OFF switch)
3. **My Rooms Section (`My Rooms`):**
   - Header with `Edit` button (toggles device editing/entity mapping inline) and blue `Add Device +` button.
   - Room Tabs: `Living Room`, `Dining Room`, `Bed Room`, `Bath Room`, `Backyard`, `Garage` (plus ability to add custom rooms).
   - **Left Sub-column:**
     - Room Camera preview (`● Live`, `4K Resolution`).
     - **Media Player Widget:** Album art (`Bring Me To Life - Evanescence`), animated/interactive blue waveform progress bar (`1:36` / `-3:24`), previous / play-pause / next buttons. Syncs with HA `media_player.*`.
   - **Right Sub-column (2×2 Device Cards):**
     - `Humidifier` (`Xiaomi Mi - X500`)
     - `Speaker` (`Google Speaker - A21`)
     - `Camera CCTV` (`Google Camera - X2`)
     - `Thermostat` (`Google Thermostat` with circular `70` indicator)
     - Each tile features custom hardware illustration, top-right toggle switch, Wi-Fi indicator, and green power indicator.
4. **Air Conditioner Card (`Air Conditioner - Living Room`):**
   - Master power toggle switch.
   - Custom SVG circular dial with 28 radial tick marks (active ticks highlighted in electric blue + directional pointer triangle), center text `COOLING TO`, `21.5°`, `UNDER 7 MIN`.
   - Range labels `16°` and `32°` with circular `-` and `+` step buttons (`0.5°` increments).
   - Bottom 3 mode controls: `Fan Speed` (`2 Level • Off`), `Timer` (`5 Hours • Off`), `Auto Mode` (`Power On` highlighted in blue).
   - Binds to HA `climate.*` (`set_temperature`, `set_hvac_mode`, `set_fan_mode`).
5. **Energy Used Card (`Energy Used`):**
   - Period selector (`Weekly` / `Monthly`).
   - Custom SVG area & line chart (`Mon` to `Sun`, Y-axis `0, 20, 60, 120, 170`).
   - Interactive hover & highlighted Friday peak with white callout tooltip (`102 kWh`) and glowing blue point + vertical gradient bar.

---

## 4. Transport Page Specification (交通資訊專頁)

Designed in the exact same dark glassmorphic aesthetic (`#16181e` / `#1f222a` / `#2d7ff9` accents) to provide an at-a-glance commute dashboard.

### 4.1 Transport Categories & Tabs
- **All Pinned Commutes (常用路線總覽)** — Combined view of bookmarked routes across all modes.
- **Bus (巴士 - KMB / Citybus)** — Route number badge (e.g., `968`, `101`, `A21`, `E22`), destination, stop name, next 3 arrival ETAs (`2 min`, `11 min`, `23 min`), capacity/wheelchair icons, and live refresh.
- **Minibus (小巴 - 專線小巴 GMB / 紅色小巴)** — Green/Red minibus badge (e.g., `28M`, `1A`, `8`), origin → destination, stop name, next 3 arrival countdowns, and frequency info.
- **Ferry / Ship (渡輪 / 船班)** — Operator & pier route (e.g., `中環 ↔ 尖沙咀 Star Ferry`, `中環 ↔ 長洲`, `北角 ↔ 紅磡`), next sailing times (`15:45`, `16:00`, `16:15`), vessel type (普通渡輪 / 高速船), and berth status.
- **MTR / Subway (港鐵 / 地鐵)** — Official line color badges (e.g., 荃灣綫 Tsuen Wan Line, 港島綫 Island Line, 東鐵綫 East Rail Line, 屯馬綫 Tuen Ma Line), station selector, Up/Down platform directions, next 4 train arrival countdowns + destination, and Line Service Status indicator (`服務正常 Good Service` / delay alerts).

### 4.2 Data Sources & Home Assistant Integration
1. **Live Open Data API Mode (Hong Kong `data.gov.hk` Real-Time ETA):**
   - Built-in support for fetching real-time arrival data from Hong Kong public transport open APIs (`data.etabus.gov.hk` for KMB, `rt.data.gov.hk` for MTR/Citybus, `data.etagmb.gov.hk` for Green Minibus) with automatic fallback to rich simulated real-time countdowns when offline or for custom routes.
2. **Home Assistant Sensor Binding:**
   - Each transport route card can optionally bind to a Home Assistant `sensor.*` entity (e.g., `sensor.next_bus_home`, `sensor.mtr_eta`, `sensor.ferry_schedule`), displaying the live state and attributes from HA.
3. **Custom Route Manager (`Add Route +`):**
   - Users can add, edit, pin/unpin, or delete any Bus, Minibus, Ship/Ferry, or MTR station/route, and all transport settings are included in the JSON & Home Assistant Lovelace YAML migration!

---

## 5. Home Assistant Connection & Settings Migration Engine

### 5.1 Connection Architecture (`haService.ts`)
- **WebSocket Client:** Connects to `ws(s)://<ha_host>/api/websocket`, authenticates with `Long-Lived Access Token`, fetches initial states (`get_states`), and subscribes to `state_changed` events.
- **REST Fallback & Service Calls:** Calls `POST /api/services/<domain>/<service>` with `Authorization: Bearer <token>`.
- **Connection Diagnostics:** Clear status badge (`Connected to HA`, `Connecting...`, or `Demo Mode (Offline)`), plus a one-click copyable `configuration.yaml` CORS snippet if the browser blocks cross-origin requests.

### 5.2 Migration Formats (`migrationService.ts`)
1. **Dashboard JSON Snapshot (`.json`):**
   - Exports/imports complete state: user profile, HA connection config (optional token masking), rooms, devices, entity mappings, and pinned transport routes.
2. **Home Assistant Lovelace YAML (`.yaml`):**
   - **Export to HA:** Generates valid Home Assistant Lovelace dashboard YAML (`title`, `views` for Home Rooms + Transport view, using `picture-entity`, `thermostat`, `media-control`, `entities`, and `sensor` cards) so users can paste their dashboard straight into Home Assistant's Raw Configuration Editor.
   - **Import from HA:** Parses a Lovelace YAML config and maps its views/cards/entities into the localhost dashboard's rooms, devices, and transport cards.

---

## 6. Verification Plan
- Unit tests for state reducers, Lovelace YAML serializer/parser, JSON migration validator, and transport ETA formatter.
- Live localhost verification checking all interactive widgets: room switching, AC dial adjustment, device toggling, adding/editing devices, Transport page filtering & live countdowns, and Settings HA migration import/export.

