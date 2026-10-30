import yaml from 'js-yaml';
import {
  DashboardConfig,
  DeviceHardwareType,
  DeviceItem,
  RoomConfig,
  TransportRouteItem,
} from '../types/dashboard';
import { DEFAULT_DASHBOARD_CONFIG } from '../data/defaultConfig';

interface LovelaceEntityItem {
  entity: string;
  name?: string;
}

interface LovelaceCard {
  type: string;
  title?: string;
  name?: string;
  entity?: string;
  camera_image?: string;
  entities?: Array<string | LovelaceEntityItem>;
}

interface LovelaceView {
  title: string;
  path?: string;
  icon?: string;
  cards?: LovelaceCard[];
}

interface LovelaceConfig {
  title?: string;
  views?: LovelaceView[];
}

export function exportConfigToJson(config: DashboardConfig, maskToken = false): string {
  const clone: DashboardConfig = JSON.parse(JSON.stringify(config));
  if (maskToken) {
    clone.haConnection.accessToken = '';
  }
  return JSON.stringify(clone, null, 2);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Fill missing nested fields so a partial backup cannot crash the dashboard. */
export function normalizeDashboardConfig(input: unknown): DashboardConfig {
  const parsed = asRecord(input);
  const energyIn = asRecord(parsed.energy);

  return {
    ...DEFAULT_DASHBOARD_CONFIG,
    ...(parsed as Partial<DashboardConfig>),
    userName:
      typeof parsed.userName === 'string'
        ? parsed.userName
        : DEFAULT_DASHBOARD_CONFIG.userName,
    haConnection: {
      ...DEFAULT_DASHBOARD_CONFIG.haConnection,
      ...asRecord(parsed.haConnection),
    },
    primaryCamera: {
      ...DEFAULT_DASHBOARD_CONFIG.primaryCamera,
      ...asRecord(parsed.primaryCamera),
    },
    weather: {
      ...DEFAULT_DASHBOARD_CONFIG.weather,
      ...asRecord(parsed.weather),
    },
    airConditioner: {
      ...DEFAULT_DASHBOARD_CONFIG.airConditioner,
      ...asRecord(parsed.airConditioner),
    },
    mediaPlayer: {
      ...DEFAULT_DASHBOARD_CONFIG.mediaPlayer,
      ...asRecord(parsed.mediaPlayer),
    },
    energy: {
      ...DEFAULT_DASHBOARD_CONFIG.energy,
      ...energyIn,
      weeklyData: Array.isArray(energyIn.weeklyData)
        ? (energyIn.weeklyData as DashboardConfig['energy']['weeklyData'])
        : DEFAULT_DASHBOARD_CONFIG.energy.weeklyData,
      monthlyData: Array.isArray(energyIn.monthlyData)
        ? (energyIn.monthlyData as DashboardConfig['energy']['monthlyData'])
        : DEFAULT_DASHBOARD_CONFIG.energy.monthlyData,
      period:
        energyIn.period === 'Monthly' || energyIn.period === 'Weekly'
          ? energyIn.period
          : DEFAULT_DASHBOARD_CONFIG.energy.period,
    },
    quickToggles: Array.isArray(parsed.quickToggles)
      ? (parsed.quickToggles as DashboardConfig['quickToggles'])
      : DEFAULT_DASHBOARD_CONFIG.quickToggles,
    rooms: Array.isArray(parsed.rooms)
      ? (parsed.rooms as DashboardConfig['rooms'])
      : DEFAULT_DASHBOARD_CONFIG.rooms,
    transportRoutes: Array.isArray(parsed.transportRoutes)
      ? (parsed.transportRoutes as DashboardConfig['transportRoutes'])
      : DEFAULT_DASHBOARD_CONFIG.transportRoutes,
    notifications: Array.isArray(parsed.notifications)
      ? (parsed.notifications as DashboardConfig['notifications'])
      : DEFAULT_DASHBOARD_CONFIG.notifications,
    schedules: Array.isArray(parsed.schedules)
      ? (parsed.schedules as DashboardConfig['schedules'])
      : DEFAULT_DASHBOARD_CONFIG.schedules,
  };
}

export function importConfigFromJson(jsonStr: string): DashboardConfig {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid JSON configuration payload.');
  }
  return normalizeDashboardConfig(parsed);
}

export function exportToLovelaceYaml(config: DashboardConfig): string {
  const overviewCards: LovelaceCard[] = [
    {
      type: 'picture-entity',
      name: config.primaryCamera.roomName,
      entity: config.primaryCamera.entityId || 'camera.bed_room_camera',
      camera_image: config.primaryCamera.entityId || 'camera.bed_room_camera',
    },
    {
      type: 'weather-forecast',
      name: config.weather.location,
      entity: config.weather.entityId || 'weather.home',
    },
    {
      type: 'thermostat',
      name: config.airConditioner.roomName,
      entity: config.airConditioner.entityId || 'climate.living_room_ac',
    },
    {
      type: 'media-control',
      entity: config.mediaPlayer.entityId || 'media_player.living_room_speaker',
    },
    {
      type: 'entities',
      title: 'Quick Controls',
      entities: config.quickToggles.map((q) => ({
        entity: q.entityId || `switch.${q.id.replace(/[^a-z0-9_]/gi, '_')}`,
        name: q.name,
      })),
    },
    ...config.rooms.map((room) => ({
      type: 'entities',
      title: room.name,
      entities: room.devices.map((dev) => ({
        entity: dev.entityId || `switch.${dev.id.replace(/[^a-z0-9_]/gi, '_')}`,
        name: `${dev.name} (${dev.model})`,
      })),
    })),
  ];

  const transportCards: LovelaceCard[] = [
    {
      type: 'entities',
      title: '香港交通實時抵站 (Bus / Minibus / Ferry / MTR)',
      entities: config.transportRoutes.map((tr) => ({
        entity: tr.entityId || `sensor.transport_${tr.id.replace(/[^a-z0-9_]/gi, '_')}`,
        name: `[${tr.operator}] ${tr.routeCode} 往 ${tr.destination} @ ${tr.stopName}`,
      })),
    },
  ];

  const lovelaceDoc: LovelaceConfig = {
    title: `${config.userName} Smart Home`,
    views: [
      {
        title: 'Home Overview',
        path: 'default_view',
        icon: 'mdi:view-dashboard',
        cards: overviewCards,
      },
      {
        title: 'Transport ETA',
        path: 'transport',
        icon: 'mdi:bus-clock',
        cards: transportCards,
      },
    ],
  };

  return yaml.dump(lovelaceDoc, { lineWidth: 100, noRefs: true });
}

function inferHardwareType(entityId: string): DeviceHardwareType {
  const lower = entityId.toLowerCase();
  if (lower.startsWith('humidifier.') || lower.includes('humidifier')) return 'humidifier';
  if (lower.startsWith('media_player.') || lower.includes('speaker')) return 'speaker';
  if (lower.startsWith('camera.') || lower.includes('cctv')) return 'cctv';
  if (lower.startsWith('climate.') || lower.includes('thermostat')) return 'thermostat';
  if (lower.startsWith('light.')) return 'light';
  if (lower.startsWith('fan.')) return 'purifier';
  return 'plug';
}

export function importFromLovelaceYaml(
  yamlStr: string,
  baseConfig: DashboardConfig = DEFAULT_DASHBOARD_CONFIG
): DashboardConfig {
  const parsed = yaml.load(yamlStr) as LovelaceConfig | undefined;
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.views)) {
    throw new Error('Invalid Home Assistant Lovelace YAML: missing "views" array.');
  }

  const nextConfig: DashboardConfig = JSON.parse(JSON.stringify(baseConfig));
  if (parsed.title) {
    const cleanedUser = parsed.title.replace(/\s*Smart Home$/i, '').trim();
    if (cleanedUser) nextConfig.userName = cleanedUser;
  }

  const importedRooms: RoomConfig[] = [...nextConfig.rooms];
  const importedTransport: TransportRouteItem[] = [...nextConfig.transportRoutes];

  for (const view of parsed.views) {
    const isTransportView =
      view.path === 'transport' ||
      /transport|交通|commute|bus|mtr/i.test(view.title || '');
    const cards = view.cards || [];

    for (const card of cards) {
      if (card.type === 'thermostat' && card.entity) {
        nextConfig.airConditioner.entityId = card.entity;
        if (card.name) nextConfig.airConditioner.roomName = card.name;
      } else if (card.type === 'picture-entity' && card.entity) {
        nextConfig.primaryCamera.entityId = card.entity;
        if (card.name) nextConfig.primaryCamera.roomName = card.name;
      } else if (card.type === 'weather-forecast' && card.entity) {
        nextConfig.weather.entityId = card.entity;
        if (card.name) nextConfig.weather.location = card.name;
      } else if (card.type === 'media-control' && card.entity) {
        nextConfig.mediaPlayer.entityId = card.entity;
      } else if (card.type === 'entities' && Array.isArray(card.entities)) {
        const cardTitle = card.title || view.title || 'Imported Room';

        if (isTransportView || /commute|transport|eta|交通|巴士|港鐵/i.test(cardTitle)) {
          for (const rawEnt of card.entities) {
            const entityId = typeof rawEnt === 'string' ? rawEnt : rawEnt.entity;
            const label = typeof rawEnt === 'string' ? rawEnt : rawEnt.name || rawEnt.entity;
            if (!entityId) continue;

            const existingIdx = importedTransport.findIndex((r) => r.entityId === entityId);
            if (existingIdx === -1) {
              importedTransport.push({
                id: `tr-ha-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                mode: entityId.includes('mtr')
                  ? 'mtr'
                  : entityId.includes('ferry') || entityId.includes('ship')
                    ? 'ship'
                    : entityId.includes('gmb') || entityId.includes('minibus')
                      ? 'minibus'
                      : 'bus',
                operator: 'HA Sensor',
                routeCode: label.split(' ')[0] || 'HA',
                origin: 'Home Assistant',
                destination: label,
                stopName: entityId,
                colorHex: '#2d7ff9',
                pinned: true,
                statusText: '已綁定 Home Assistant 實體',
                entityId,
                arrivals: [
                  { minutes: 3, remark: '來自 HA Sensor' },
                  { minutes: 12, remark: '預計班次' },
                ],
              });
            }
          }
        } else if (cardTitle !== 'Quick Controls') {
          let room = importedRooms.find(
            (r) => r.name.toLowerCase() === cardTitle.toLowerCase()
          );
          if (!room) {
            room = {
              id: cardTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              name: cardTitle,
              cameraImage:
                '/images/living.svg',
              cameraResolution: '4K Resolution',
              cameraLive: true,
              devices: [],
            };
            importedRooms.push(room);
          }

          for (const rawEnt of card.entities) {
            const entityId = typeof rawEnt === 'string' ? rawEnt : rawEnt.entity;
            const label = typeof rawEnt === 'string' ? rawEnt : rawEnt.name || rawEnt.entity;
            if (!entityId) continue;

            const existingDev = room.devices.find((d) => d.entityId === entityId);
            if (!existingDev) {
              const newDev: DeviceItem = {
                id: `dev-ha-${Math.random().toString(36).slice(2, 7)}`,
                name: label.replace(/\s*\(.*\)$/, ''),
                model: entityId,
                type: inferHardwareType(entityId),
                isOn: true,
                wifiConnected: true,
                powerActive: true,
                entityId,
              };
              room.devices.push(newDev);
            }
          }
        }
      }
    }
  }

  nextConfig.rooms = importedRooms;
  nextConfig.transportRoutes = importedTransport;
  return nextConfig;
}

