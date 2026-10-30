export type NavTabId =
  | 'dashboard'
  | 'transport'
  | 'analytics'
  | 'messages'
  | 'calendar'
  | 'docs'
  | 'settings';

export type DeviceHardwareType =
  | 'humidifier'
  | 'speaker'
  | 'cctv'
  | 'thermostat'
  | 'light'
  | 'plug'
  | 'purifier';

export interface DeviceItem {
  id: string;
  name: string;
  model: string;
  type: DeviceHardwareType;
  isOn: boolean;
  wifiConnected: boolean;
  powerActive: boolean;
  valueLabel?: string; // e.g. "70" for thermostat
  entityId?: string; // Home Assistant entity_id e.g. switch.xiaomi_humidifier
}

export interface RoomConfig {
  id: string;
  name: string;
  cameraImage: string;
  cameraResolution: string;
  cameraLive: boolean;
  cameraEntityId?: string;
  devices: DeviceItem[];
}

export interface QuickToggleDevice {
  id: string;
  name: string;
  subtitle: string;
  iconType: 'wifi' | 'tv' | 'thermostat';
  isOn: boolean;
  entityId?: string;
}

export interface PrimaryCameraConfig {
  roomName: string;
  isOn: boolean;
  isLive: boolean;
  resolution: string;
  imageUrl: string;
  entityId?: string;
}

export interface WeatherConfig {
  location: string;
  temperature: number;
  unit: 'C' | 'F';
  conditionLabel: string;
  entityId?: string;
}

export interface AirConditionerConfig {
  roomName: string;
  isOn: boolean;
  targetTemp: number;
  minTemp: number;
  maxTemp: number;
  modeLabel: string;
  etaLabel: string;
  fanSpeedLevel: number;
  fanSpeedOn: boolean;
  timerHours: number;
  timerOn: boolean;
  autoModeOn: boolean;
  entityId?: string;
}

export interface MediaPlayerConfig {
  title: string;
  artist: string;
  coverUrl: string;
  isPlaying: boolean;
  currentTimeSec: number;
  totalTimeSec: number;
  entityId?: string;
}

export interface EnergyPoint {
  day: string;
  kwh: number;
}

export interface EnergyConfig {
  period: 'Weekly' | 'Monthly';
  weeklyData: EnergyPoint[];
  monthlyData: EnergyPoint[];
  highlightedIndex: number;
  entityId?: string;
}

export type TransportMode = 'bus' | 'minibus' | 'ship' | 'mtr';

export interface TransportArrival {
  minutes: number;
  timeStr?: string;
  remark?: string; // e.g., "座位充足", "高速船", "1號月台"
  platform?: string;
}

export interface TransportRouteItem {
  id: string;
  mode: TransportMode;
  operator: string; // e.g. "KMB 九巴", "Citybus 城巴", "GMB 專線小巴", "港鐵 MTR", "天星小輪", "新渡輪"
  routeCode: string; // e.g. "968", "28M", "荃灣綫", "中環 ↔ 尖沙咀"
  origin: string;
  destination: string;
  stopName: string;
  stopId?: string; // Optional HK open data stop ID
  lineCode?: string; // Optional MTR line code e.g. TWL, ISL, EAL, TML
  staCode?: string; // Optional MTR station code e.g. CEN, ADM, TSW
  colorHex?: string;
  pinned: boolean;
  statusText: string; // e.g. "正常班次", "服務正常"
  arrivals: TransportArrival[];
  entityId?: string; // Home Assistant sensor.* entity mapping
}

export interface HomeAssistantConnectionConfig {
  baseUrl: string;
  accessToken: string;
  autoConnect: boolean;
  syncIntervalSec: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'home' | 'transport' | 'ha';
  read: boolean;
}

export interface AutomationScheduleItem {
  id: string;
  name: string;
  time: string;
  days: string;
  actionSummary: string;
  enabled: boolean;
  entityId?: string;
}

export interface DashboardConfig {
  version: string;
  userName: string;
  userAvatar: string;
  haConnection: HomeAssistantConnectionConfig;
  primaryCamera: PrimaryCameraConfig;
  weather: WeatherConfig;
  quickToggles: QuickToggleDevice[];
  airConditioner: AirConditionerConfig;
  mediaPlayer: MediaPlayerConfig;
  rooms: RoomConfig[];
  activeRoomId: string;
  energy: EnergyConfig;
  transportRoutes: TransportRouteItem[];
  useLiveHkTransportApi: boolean;
  notifications: NotificationItem[];
  schedules: AutomationScheduleItem[];
}

