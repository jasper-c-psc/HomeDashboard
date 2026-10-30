import { TransportArrival, TransportRouteItem } from '../types/dashboard';

interface MtrScheduleResponse {
  status: number;
  message?: string;
  data?: Record<
    string,
    {
      UP?: Array<{ ttnt: string; dest: string; plat: string; time: string }>;
      DOWN?: Array<{ ttnt: string; dest: string; plat: string; time: string }>;
    }
  >;
}

const MTR_STATION_NAMES: Record<string, string> = {
  TWW: '荃灣西',
  TSW: '荃灣 Tsuen Wan',
  CEN: '中環 Central',
  ADM: '金鐘 Admiralty',
  LOF: '羅湖 Lo Wu',
  LOW: '羅湖 Lo Wu',
  LMC: '落馬洲 Lok Ma Chau',
  TUM: '屯門 Tuen Mun',
  WKS: '烏溪沙 Wu Kai Sha',
  CHW: '柴灣 Chai Wan',
  KET: '堅尼地城 Kennedy Town',
  HUH: '紅磡 Hung Hom',
  EXH: '會展 Exhibition Centre',
};

export async function fetchMtrLiveEta(
  lineCode: string,
  staCode: string
): Promise<TransportArrival[] | null> {
  try {
    const url = `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${encodeURIComponent(
      lineCode
    )}&sta=${encodeURIComponent(staCode)}&lang=TC`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as MtrScheduleResponse;
    if (json.status !== 1 || !json.data) return null;

    const key = `${lineCode}-${staCode}`;
    const stationData = json.data[key];
    if (!stationData) return null;

    const list = [...(stationData.UP || []), ...(stationData.DOWN || [])].slice(0, 4);
    if (list.length === 0) return null;

    return list.map((item) => {
      const mins = Math.max(0, parseInt(item.ttnt, 10) || 1);
      const destLabel = MTR_STATION_NAMES[item.dest] || item.dest;
      return {
        minutes: mins,
        platform: `${item.plat}號月台`,
        remark: `往 ${destLabel} (實時港鐵數據)`,
      };
    });
  } catch {
    return null;
  }
}

/** Step a simulated board forward by one minute, then recycle an arrival that has landed. */
export function tickSimulatedArrivals(
  arrivals: TransportArrival[]
): TransportArrival[] {
  return arrivals.map((arr, idx) => {
    if (arr.minutes <= 0) {
      return { ...arr, minutes: 8 + idx * 5 };
    }
    return { ...arr, minutes: arr.minutes - 1 };
  });
}

export async function refreshTransportRoutesLive(
  routes: TransportRouteItem[],
  useLiveApi: boolean
): Promise<TransportRouteItem[]> {
  const updated = await Promise.all(
    routes.map(async (route) => {
      if (useLiveApi && route.mode === 'mtr' && route.lineCode && route.staCode) {
        const liveMtr = await fetchMtrLiveEta(route.lineCode, route.staCode);
        if (liveMtr && liveMtr.length > 0) {
          return {
            ...route,
            statusText: '實時連接 data.gov.hk • 服務正常',
            arrivals: liveMtr,
          };
        }
      }

      return {
        ...route,
        arrivals: tickSimulatedArrivals(route.arrivals),
      };
    })
  );

  return updated;
}

