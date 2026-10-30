# Localhost Home Dashboard

A local smart-home and Hong Kong transport dashboard. It runs in the browser, works without an account, and can connect to Home Assistant when you want live devices.

The home screen follows a dark control-room layout: bedroom camera, outdoor weather, quick toggles, room devices, an air-conditioner dial, and an energy chart. A second page tracks buses, minibuses, ferries, and the MTR.

## What you can do

- Browse the demo home as **Lemonaru** with rooms, devices, a media player, and a weekly energy chart. No server account is required.
- Switch rooms, toggle devices, step the air-conditioner temperature by 0.5°, and filter devices from the search box.
- Open **交通資訊** for pinned bus, minibus, ferry, and MTR routes. MTR cards can read live arrivals from `data.gov.hk`. Other modes keep a local countdown when the live feed is unavailable.
- Connect Home Assistant with a base URL and a long-lived access token. The app calls the REST API and subscribes to `state_changed` over WebSocket.
- Export and import a full JSON backup, and export or import a Home Assistant Lovelace YAML dashboard.

Demo photos and album art are files in `public/images/`, so the board still renders when you are offline.

## Requirements

- Node.js 20 or newer
- npm

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). If that port is already used, Vite prints the next free port.

```bash
npm test
npm run build
```

`npm test` runs the JSON, Lovelace YAML, and transport countdown checks. `npm run build` typechecks the project and writes `dist/`.

## Home Assistant

1. In Home Assistant, create a long-lived access token.
2. In this app, open **Settings** and enter the Home Assistant URL, for example `http://homeassistant.local:8123`, plus the token.
3. Choose **Test connection**. A successful call loads entity states and fills matching widgets.
4. If the browser blocks the request, add the dashboard origin to `configuration.yaml` and restart Home Assistant:

```yaml
http:
  cors_allowed_origins:
    - http://localhost:5173
    - http://127.0.0.1:5173
```

The Settings page keeps a copy of this snippet. Entity IDs can be edited per device, and the same IDs are included in JSON and YAML exports.

The dashboard stores its config in `localStorage` under `lemonaru_smart_home_dashboard_v2`. **Reset to demo data** in Settings clears that copy.

## Project layout

| Path | Role |
| --- | --- |
| `src/App.tsx` | Shell and page switch |
| `src/context/DashboardContext.tsx` | State, persistence, Home Assistant actions |
| `src/services/haService.ts` | REST and WebSocket client |
| `src/services/transportService.ts` | MTR live ETA and simulated countdown |
| `src/services/migrationService.ts` | JSON and Lovelace YAML migration |
| `src/components/transport/` | Transport board |
| `src/components/settings/` | Connection, mapping, import and export |
| `public/images/` | Offline camera, avatar, and album art |

---

# 本地智能家居與交通看板

這是一個在瀏覽器裡運行的智能家居與香港交通看板。不用帳號就能看演示數據；需要即時裝置時，再連接 Home Assistant。

主畫面是深色控制室佈局：睡房鏡頭、室外天氣、快速開關、房間裝置、冷氣轉盤，以及用電圖表。另一頁追蹤巴士、小巴、渡輪和港鐵。

## 可以做什麼

- 以 **Lemonaru** 的演示家居瀏覽房間、裝置、音樂播放器和每週用電。不需要伺服器帳號。
- 切換房間、開關裝置、以 0.5° 調整冷氣溫度，並用搜尋框過濾裝置。
- 打開 **交通資訊**，查看已釘選的巴士、小巴、渡輪和港鐵路線。港鐵卡片可向 `data.gov.hk` 讀取實時到站；其他交通在沒有實時資料時使用本地倒數。
- 用網址和長期存取令牌連接 Home Assistant。程式會呼叫 REST API，並透過 WebSocket 訂閱 `state_changed`。
- 匯出或匯入完整 JSON 備份，以及 Home Assistant Lovelace YAML 儀表板。

演示用的鏡頭畫面和專輯封面放在 `public/images/`，離線時看板仍然能顯示。

## 環境

- Node.js 20 或更新版本
- npm

## 啟動

```bash
npm install
npm run dev
```

打開 [http://127.0.0.1:5173](http://127.0.0.1:5173)。如果 5173 已被佔用，Vite 會在終端機印出下一個可用埠。

```bash
npm test
npm run build
```

`npm test` 檢查 JSON、Lovelace YAML 和交通倒數。`npm run build` 會做型別檢查並輸出 `dist/`。

## 連接 Home Assistant

1. 在 Home Assistant 建立長期存取令牌（Long-Lived Access Token）。
2. 在本應用的 **設定** 填入 Home Assistant 網址，例如 `http://homeassistant.local:8123`，以及令牌。
3. 按 **測試連線**。成功後會載入實體狀態，並填入對應的小工具。
4. 若瀏覽器攔截請求，把看板的來源加進 `configuration.yaml`，然後重啟 Home Assistant：

```yaml
http:
  cors_allowed_origins:
    - http://localhost:5173
    - http://127.0.0.1:5173
```

設定頁內有同一段可複製的片段。每個裝置的實體 ID 都可以改，JSON 和 YAML 匯出都會帶上這些 ID。

看板設定存在瀏覽器的 `localStorage`，鍵名是 `lemonaru_smart_home_dashboard_v2`。在設定裡選擇 **重設為預設演示數據** 會清掉這份複本。

## 目錄

| 路徑 | 作用 |
| --- | --- |
| `src/App.tsx` | 外框與頁面切換 |
| `src/context/DashboardContext.tsx` | 狀態、本地儲存、Home Assistant 動作 |
| `src/services/haService.ts` | REST 與 WebSocket 客戶端 |
| `src/services/transportService.ts` | 港鐵實時到站與模擬倒數 |
| `src/services/migrationService.ts` | JSON 與 Lovelace YAML 遷移 |
| `src/components/transport/` | 交通看板 |
| `src/components/settings/` | 連線、實體對應、匯入與匯出 |
| `public/images/` | 離線鏡頭、頭像和專輯圖 |
