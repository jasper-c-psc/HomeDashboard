import { HomeAssistantConnectionConfig } from '../types/dashboard';

export interface HAEntityState {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    temperature?: number;
    current_temperature?: number;
    unit_of_measurement?: string;
    media_title?: string;
    media_artist?: string;
    entity_picture?: string;
    [key: string]: unknown;
  };
  last_updated?: string;
}

export interface HAConnectionResult {
  ok: boolean;
  message: string;
  entities: HAEntityState[];
  corsBlocked?: boolean;
}

function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/+$/, '');
}

export async function fetchHomeAssistantStates(
  config: HomeAssistantConnectionConfig
): Promise<HAConnectionResult> {
  if (!config.baseUrl.trim() || !config.accessToken.trim()) {
    return {
      ok: false,
      message: '請先填寫 Home Assistant URL 及 Long-Lived Access Token。',
      entities: [],
    };
  }

  const baseUrl = normalizeBaseUrl(config.baseUrl);
  try {
    const res = await fetch(`${baseUrl}/api/states`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.accessToken.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        message: `Home Assistant 回應錯誤 (HTTP ${res.status})，請檢查 Token 權限。`,
        entities: [],
      };
    }

    const data = (await res.json()) as HAEntityState[];
    return {
      ok: true,
      message: `已成功連接 Home Assistant！共載入 ${data.length} 個實體 (Entities)。`,
      entities: Array.isArray(data) ? data : [],
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      corsBlocked: true,
      message: `無法連線至 ${baseUrl} (${errMsg})。如在瀏覽器跨網域連線，請確認 Home Assistant configuration.yaml 已加入 cors_allowed_origins。`,
      entities: [],
    };
  }
}

export async function callHomeAssistantService(
  config: HomeAssistantConnectionConfig,
  domain: string,
  service: string,
  serviceData: Record<string, unknown>
): Promise<boolean> {
  if (!config.baseUrl.trim() || !config.accessToken.trim()) {
    return false;
  }

  const baseUrl = normalizeBaseUrl(config.baseUrl);
  try {
    const res = await fetch(`${baseUrl}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function connectHomeAssistantWebSocket(
  config: HomeAssistantConnectionConfig,
  onStateChanged: (entity: HAEntityState) => void,
  onStatusChange: (connected: boolean) => void
): () => void {
  if (!config.baseUrl.trim() || !config.accessToken.trim()) {
    onStatusChange(false);
    return () => {};
  }

  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const wsUrl = baseUrl.replace(/^http/i, 'ws') + '/api/websocket';
  let ws: WebSocket | null = null;
  let closedByUser = false;

  try {
    ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'auth_required' && ws?.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'auth',
              access_token: config.accessToken.trim(),
            })
          );
        } else if (msg.type === 'auth_ok' && ws?.readyState === WebSocket.OPEN) {
          onStatusChange(true);
          ws.send(
            JSON.stringify({
              id: 1,
              type: 'subscribe_events',
              event_type: 'state_changed',
            })
          );
        } else if (
          msg.type === 'event' &&
          msg.event?.event_type === 'state_changed' &&
          msg.event?.data?.new_state
        ) {
          onStateChanged(msg.event.data.new_state as HAEntityState);
        }
      } catch {
        // ignore malformed packets
      }
    };

    ws.onerror = () => {
      if (!closedByUser) onStatusChange(false);
    };

    ws.onclose = () => {
      if (!closedByUser) onStatusChange(false);
    };
  } catch {
    onStatusChange(false);
  }

  return () => {
    closedByUser = true;
    ws?.close();
  };
}

