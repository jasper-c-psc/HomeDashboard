import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  DashboardConfig,
  DeviceItem,
  NavTabId,
  TransportRouteItem,
} from '../types/dashboard';
import { DEFAULT_DASHBOARD_CONFIG } from '../data/defaultConfig';
import {
  callHomeAssistantService,
  connectHomeAssistantWebSocket,
  fetchHomeAssistantStates,
  HAEntityState,
} from '../services/haService';
import { normalizeDashboardConfig } from '../services/migrationService';
import { refreshTransportRoutesLive } from '../services/transportService';

const STORAGE_KEY = 'lemonaru_smart_home_dashboard_v2';

interface DashboardContextValue {
  config: DashboardConfig;
  activeNav: NavTabId;
  setActiveNav: (tab: NavTabId) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  haConnected: boolean;
  haStatusMessage: string;
  haEntities: HAEntityState[];
  updateConfig: (updater: (prev: DashboardConfig) => DashboardConfig) => void;
  replaceFullConfig: (next: DashboardConfig) => void;
  resetToDefault: () => void;
  togglePrimaryCamera: () => void;
  toggleQuickDevice: (id: string) => void;
  toggleAirConditioner: () => void;
  adjustAcTemp: (delta: number) => void;
  toggleAcSubMode: (mode: 'fan' | 'timer' | 'auto') => void;
  setActiveRoom: (roomId: string) => void;
  toggleRoomDevice: (roomId: string, deviceId: string) => void;
  upsertRoomDevice: (roomId: string, device: DeviceItem) => void;
  deleteRoomDevice: (roomId: string, deviceId: string) => void;
  toggleMediaPlay: () => void;
  skipMediaTrack: (dir: 'prev' | 'next') => void;
  setEnergyPeriod: (period: 'Weekly' | 'Monthly') => void;
  setEnergyHighlight: (index: number) => void;
  upsertTransportRoute: (route: TransportRouteItem) => void;
  deleteTransportRoute: (id: string) => void;
  togglePinTransportRoute: (id: string) => void;
  refreshTransportData: () => Promise<void>;
  testAndSyncHomeAssistant: (
    baseUrl?: string,
    accessToken?: string
  ) => Promise<{ ok: boolean; message: string }>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<DashboardConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return normalizeDashboardConfig(JSON.parse(raw));
      }
    } catch {
      // ignore corrupted storage
    }
    return DEFAULT_DASHBOARD_CONFIG;
  });

  const [activeNav, setActiveNav] = useState<NavTabId>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [haConnected, setHaConnected] = useState(false);
  const [haStatusMessage, setHaStatusMessage] = useState(
    '本地演示模式 (Demo Mode) • 可於設定連接 Home Assistant'
  );
  const [haEntities, setHaEntities] = useState<HAEntityState[]>([]);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore storage quota errors
    }
  }, [config]);

  const applyHaEntitiesToConfig = (entities: HAEntityState[]) => {
    if (!entities.length) return;
    const entityMap = new Map<string, HAEntityState>();
    entities.forEach((e) => entityMap.set(e.entity_id, e));

    setConfig((prev) => {
      const next = { ...prev };

      // Sync Weather
      if (next.weather.entityId && entityMap.has(next.weather.entityId)) {
        const w = entityMap.get(next.weather.entityId)!;
        const temp =
          typeof w.attributes.temperature === 'number'
            ? w.attributes.temperature
            : parseFloat(w.state);
        if (!Number.isNaN(temp)) {
          next.weather = { ...next.weather, temperature: Math.round(temp) };
        }
      }

      // Sync AC
      if (
        next.airConditioner.entityId &&
        entityMap.has(next.airConditioner.entityId)
      ) {
        const ac = entityMap.get(next.airConditioner.entityId)!;
        const isOff = ac.state === 'off' || ac.state === 'unavailable';
        const target =
          typeof ac.attributes.temperature === 'number'
            ? ac.attributes.temperature
            : next.airConditioner.targetTemp;
        next.airConditioner = {
          ...next.airConditioner,
          isOn: !isOff,
          targetTemp: target,
        };
      }

      // Sync Quick Toggles
      next.quickToggles = next.quickToggles.map((qt) => {
        if (qt.entityId && entityMap.has(qt.entityId)) {
          const st = entityMap.get(qt.entityId)!;
          const isOn = st.state !== 'off' && st.state !== 'unavailable' && st.state !== 'standby';
          return { ...qt, isOn };
        }
        return qt;
      });

      // Sync Room Devices
      next.rooms = next.rooms.map((room) => ({
        ...room,
        devices: room.devices.map((dev) => {
          if (dev.entityId && entityMap.has(dev.entityId)) {
            const st = entityMap.get(dev.entityId)!;
            const isOn = st.state !== 'off' && st.state !== 'unavailable';
            return {
              ...dev,
              isOn,
              powerActive: isOn,
              wifiConnected: st.state !== 'unavailable',
            };
          }
          return dev;
        }),
      }));

      // Sync Transport HA Sensors
      next.transportRoutes = next.transportRoutes.map((tr) => {
        if (tr.entityId && entityMap.has(tr.entityId)) {
          const st = entityMap.get(tr.entityId)!;
          const mins = parseInt(st.state, 10);
          if (!Number.isNaN(mins)) {
            const updatedArrivals = [...tr.arrivals];
            if (updatedArrivals.length > 0) {
              updatedArrivals[0] = {
                ...updatedArrivals[0],
                minutes: Math.max(0, mins),
                remark: `HA 實時狀態 (${st.entity_id})`,
              };
            }
            return {
              ...tr,
              statusText: `HA 同步正常 (${st.state} min)`,
              arrivals: updatedArrivals,
            };
          }
        }
        return tr;
      });

      return next;
    });
  };

  // Connect WebSocket if autoConnect is enabled and credentials exist
  useEffect(() => {
    if (
      !config.haConnection.autoConnect ||
      !config.haConnection.baseUrl ||
      !config.haConnection.accessToken
    ) {
      return;
    }

    const disconnect = connectHomeAssistantWebSocket(
      config.haConnection,
      (changedEntity) => {
        setHaEntities((prev) => {
          const idx = prev.findIndex((e) => e.entity_id === changedEntity.entity_id);
          if (idx === -1) return [...prev, changedEntity];
          const copy = [...prev];
          copy[idx] = changedEntity;
          return copy;
        });
        applyHaEntitiesToConfig([changedEntity]);
      },
      (connected) => {
        setHaConnected(connected);
        if (connected) {
          setHaStatusMessage('Home Assistant WebSocket 實時同步中');
        }
      }
    );

    return disconnect;
  }, [
    config.haConnection.autoConnect,
    config.haConnection.baseUrl,
    config.haConnection.accessToken,
  ]);

  const updateConfig = (updater: (prev: DashboardConfig) => DashboardConfig) => {
    setConfig((prev) => updater(prev));
  };

  const replaceFullConfig = (next: DashboardConfig) => {
    setConfig(next);
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULT_DASHBOARD_CONFIG);
    setHaConnected(false);
    setHaStatusMessage('已重設為預設配置 (Demo Mode)');
  };

  const togglePrimaryCamera = () => {
    setConfig((prev) => {
      const nextOn = !prev.primaryCamera.isOn;
      if (haConnected && prev.primaryCamera.entityId) {
        callHomeAssistantService(prev.haConnection, 'homeassistant', 'toggle', {
          entity_id: prev.primaryCamera.entityId,
        });
      }
      return {
        ...prev,
        primaryCamera: { ...prev.primaryCamera, isOn: nextOn },
      };
    });
  };

  const toggleQuickDevice = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      quickToggles: prev.quickToggles.map((item) => {
        if (item.id !== id) return item;
        const nextOn = !item.isOn;
        if (haConnected && item.entityId) {
          callHomeAssistantService(prev.haConnection, 'homeassistant', 'toggle', {
            entity_id: item.entityId,
          });
        }
        return {
          ...item,
          isOn: nextOn,
          subtitle:
            item.iconType === 'wifi'
              ? nextOn
                ? 'Connected'
                : 'Disconnected'
              : item.iconType === 'tv'
                ? nextOn
                  ? 'Connected - On'
                  : 'Connect - Stanby'
                : nextOn
                  ? 'Coling to 24 c'
                  : 'System Off',
        };
      }),
    }));
  };

  const toggleAirConditioner = () => {
    setConfig((prev) => {
      const nextOn = !prev.airConditioner.isOn;
      if (haConnected && prev.airConditioner.entityId) {
        callHomeAssistantService(prev.haConnection, 'climate', 'set_hvac_mode', {
          entity_id: prev.airConditioner.entityId,
          hvac_mode: nextOn ? 'cool' : 'off',
        });
      }
      return {
        ...prev,
        airConditioner: { ...prev.airConditioner, isOn: nextOn },
      };
    });
  };

  const adjustAcTemp = (delta: number) => {
    setConfig((prev) => {
      const clamped = Math.min(
        prev.airConditioner.maxTemp,
        Math.max(
          prev.airConditioner.minTemp,
          Math.round((prev.airConditioner.targetTemp + delta) * 2) / 2
        )
      );
      if (haConnected && prev.airConditioner.entityId) {
        callHomeAssistantService(prev.haConnection, 'climate', 'set_temperature', {
          entity_id: prev.airConditioner.entityId,
          temperature: clamped,
        });
      }
      return {
        ...prev,
        airConditioner: {
          ...prev.airConditioner,
          targetTemp: clamped,
          isOn: true,
        },
      };
    });
  };

  const toggleAcSubMode = (mode: 'fan' | 'timer' | 'auto') => {
    setConfig((prev) => {
      const ac = prev.airConditioner;
      if (mode === 'fan') {
        // Off → level 1 on → 2 → 3 → off. One click changes one thing.
        if (!ac.fanSpeedOn) {
          return {
            ...prev,
            airConditioner: { ...ac, fanSpeedOn: true, fanSpeedLevel: 1 },
          };
        }
        if (ac.fanSpeedLevel < 3) {
          return {
            ...prev,
            airConditioner: {
              ...ac,
              fanSpeedOn: true,
              fanSpeedLevel: ac.fanSpeedLevel + 1,
            },
          };
        }
        return {
          ...prev,
          airConditioner: { ...ac, fanSpeedOn: false },
        };
      }
      if (mode === 'timer') {
        return {
          ...prev,
          airConditioner: {
            ...ac,
            timerOn: !ac.timerOn,
          },
        };
      }
      return {
        ...prev,
        airConditioner: {
          ...ac,
          autoModeOn: !ac.autoModeOn,
        },
      };
    });
  };

  const setActiveRoom = (roomId: string) => {
    setConfig((prev) => ({ ...prev, activeRoomId: roomId }));
  };

  const toggleRoomDevice = (roomId: string, deviceId: string) => {
    setConfig((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          devices: room.devices.map((dev) => {
            if (dev.id !== deviceId) return dev;
            const nextOn = !dev.isOn;
            if (haConnected && dev.entityId) {
              callHomeAssistantService(prev.haConnection, 'homeassistant', 'toggle', {
                entity_id: dev.entityId,
              });
            }
            return {
              ...dev,
              isOn: nextOn,
              powerActive: nextOn,
              wifiConnected: nextOn ? true : dev.wifiConnected,
            };
          }),
        };
      }),
    }));
  };

  const upsertRoomDevice = (roomId: string, device: DeviceItem) => {
    setConfig((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const exists = room.devices.some((d) => d.id === device.id);
        return {
          ...room,
          devices: exists
            ? room.devices.map((d) => (d.id === device.id ? device : d))
            : [...room.devices, device],
        };
      }),
    }));
  };

  const deleteRoomDevice = (roomId: string, deviceId: string) => {
    setConfig((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? { ...room, devices: room.devices.filter((d) => d.id !== deviceId) }
          : room
      ),
    }));
  };

  const toggleMediaPlay = () => {
    setConfig((prev) => {
      if (haConnected && prev.mediaPlayer.entityId) {
        callHomeAssistantService(
          prev.haConnection,
          'media_player',
          'media_play_pause',
          { entity_id: prev.mediaPlayer.entityId }
        );
      }
      return {
        ...prev,
        mediaPlayer: {
          ...prev.mediaPlayer,
          isPlaying: !prev.mediaPlayer.isPlaying,
        },
      };
    });
  };

  const skipMediaTrack = (dir: 'prev' | 'next') => {
    const tracks = [
      {
        title: 'Bring Me To Life',
        artist: 'Evanescene',
        coverUrl: '/images/album-life.svg',
        currentTimeSec: 96,
        totalTimeSec: 300,
      },
      {
        title: 'Midnight City',
        artist: 'M83',
        coverUrl: '/images/album-midnight.svg',
        currentTimeSec: 64,
        totalTimeSec: 243,
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd',
        coverUrl: '/images/album-starboy.svg',
        currentTimeSec: 112,
        totalTimeSec: 230,
      },
    ];
    setConfig((prev) => {
      const idx = tracks.findIndex((t) => t.title === prev.mediaPlayer.title);
      const nextIdx =
        dir === 'next'
          ? (idx + 1) % tracks.length
          : (idx - 1 + tracks.length) % tracks.length;
      const chosen = tracks[nextIdx];
      return {
        ...prev,
        mediaPlayer: {
          ...prev.mediaPlayer,
          ...chosen,
          isPlaying: true,
        },
      };
    });
  };

  const setEnergyPeriod = (period: 'Weekly' | 'Monthly') => {
    setConfig((prev) => ({
      ...prev,
      energy: { ...prev.energy, period },
    }));
  };

  const setEnergyHighlight = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      energy: { ...prev.energy, highlightedIndex: index },
    }));
  };

  const upsertTransportRoute = (route: TransportRouteItem) => {
    setConfig((prev) => {
      const exists = prev.transportRoutes.some((r) => r.id === route.id);
      return {
        ...prev,
        transportRoutes: exists
          ? prev.transportRoutes.map((r) => (r.id === route.id ? route : r))
          : [route, ...prev.transportRoutes],
      };
    });
  };

  const deleteTransportRoute = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      transportRoutes: prev.transportRoutes.filter((r) => r.id !== id),
    }));
  };

  const togglePinTransportRoute = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      transportRoutes: prev.transportRoutes.map((r) =>
        r.id === id ? { ...r, pinned: !r.pinned } : r
      ),
    }));
  };

  const refreshTransportData = useCallback(async () => {
    const latest = configRef.current;
    const updated = await refreshTransportRoutesLive(
      latest.transportRoutes,
      latest.useLiveHkTransportApi
    );
    setConfig((prev) => ({
      ...prev,
      transportRoutes: prev.transportRoutes.map((current) => {
        const fresh = updated.find((route) => route.id === current.id);
        if (!fresh) return current;
        return {
          ...current,
          arrivals: fresh.arrivals,
          statusText: fresh.statusText,
        };
      }),
    }));
  }, []);

  const testAndSyncHomeAssistant = async (
    baseUrl?: string,
    accessToken?: string
  ) => {
    const targetConn = {
      ...config.haConnection,
      baseUrl: baseUrl !== undefined ? baseUrl : config.haConnection.baseUrl,
      accessToken:
        accessToken !== undefined ? accessToken : config.haConnection.accessToken,
    };

    const res = await fetchHomeAssistantStates(targetConn);
    setHaConnected(res.ok);
    setHaStatusMessage(res.message);
    if (res.ok) {
      setHaEntities(res.entities);
      applyHaEntitiesToConfig(res.entities);
    }
    return { ok: res.ok, message: res.message };
  };

  return (
    <DashboardContext.Provider
      value={{
        config,
        activeNav,
        setActiveNav,
        searchQuery,
        setSearchQuery,
        haConnected,
        haStatusMessage,
        haEntities,
        updateConfig,
        replaceFullConfig,
        resetToDefault,
        togglePrimaryCamera,
        toggleQuickDevice,
        toggleAirConditioner,
        adjustAcTemp,
        toggleAcSubMode,
        setActiveRoom,
        toggleRoomDevice,
        upsertRoomDevice,
        deleteRoomDevice,
        toggleMediaPlay,
        skipMediaTrack,
        setEnergyPeriod,
        setEnergyHighlight,
        upsertTransportRoute,
        deleteTransportRoute,
        togglePinTransportRoute,
        refreshTransportData,
        testAndSyncHomeAssistant,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextValue => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return ctx;
};

