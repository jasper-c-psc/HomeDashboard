import React, { useEffect, useState } from 'react';
import { TransportMode, TransportRouteItem } from '../../types/dashboard';
import { LightDismissDialog } from '../LightDismissDialog';
import { useDashboard } from '../../context/DashboardContext';

interface TransportModalProps {
  open: boolean;
  initialRoute: TransportRouteItem | null;
  onClose: () => void;
}

export const TransportModal: React.FC<TransportModalProps> = ({
  open,
  initialRoute,
  onClose,
}) => {
  const { upsertTransportRoute, deleteTransportRoute, haEntities } =
    useDashboard();

  const [mode, setMode] = useState<TransportMode>('bus');
  const [operator, setOperator] = useState('KMB 九巴');
  const [routeCode, setRouteCode] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [stopName, setStopName] = useState('');
  const [lineCode, setLineCode] = useState('');
  const [staCode, setStaCode] = useState('');
  const [eta1, setEta1] = useState('3');
  const [eta2, setEta2] = useState('11');
  const [eta3, setEta3] = useState('22');
  const [remark1, setRemark1] = useState('實時班次 • 座位充足');
  const [entityId, setEntityId] = useState('');
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (initialRoute) {
      setMode(initialRoute.mode);
      setOperator(initialRoute.operator);
      setRouteCode(initialRoute.routeCode);
      setOrigin(initialRoute.origin);
      setDestination(initialRoute.destination);
      setStopName(initialRoute.stopName);
      setLineCode(initialRoute.lineCode || '');
      setStaCode(initialRoute.staCode || '');
      setEta1(String(initialRoute.arrivals[0]?.minutes ?? 3));
      setEta2(String(initialRoute.arrivals[1]?.minutes ?? 12));
      setEta3(String(initialRoute.arrivals[2]?.minutes ?? 22));
      setRemark1(initialRoute.arrivals[0]?.remark || '實時班次');
      setEntityId(initialRoute.entityId || '');
      setPinned(initialRoute.pinned);
    } else {
      setMode('bus');
      setOperator('KMB 九巴');
      setRouteCode('');
      setOrigin('');
      setDestination('');
      setStopName('');
      setLineCode('');
      setStaCode('');
      setEta1('3');
      setEta2('11');
      setEta3('20');
      setRemark1('實時 GPS 班次');
      setEntityId('');
      setPinned(true);
    }
  }, [initialRoute, open]);

  const defaultColorForMode = (m: TransportMode): string => {
    switch (m) {
      case 'bus':
        return '#ef4444';
      case 'minibus':
        return '#10b981';
      case 'ship':
        return '#06b6d4';
      case 'mtr':
        return '#e2231a';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeCode.trim() || !destination.trim()) return;

    const routePayload: TransportRouteItem = {
      id: initialRoute?.id || `tr-${Date.now()}`,
      mode,
      operator: operator.trim() || '公共運輸',
      routeCode: routeCode.trim(),
      origin: origin.trim() || '起點站',
      destination: destination.trim(),
      stopName: stopName.trim() || '常用候車站 / 碼頭',
      lineCode: mode === 'mtr' && lineCode.trim() ? lineCode.trim().toUpperCase() : undefined,
      staCode: mode === 'mtr' && staCode.trim() ? staCode.trim().toUpperCase() : undefined,
      colorHex: initialRoute?.colorHex || defaultColorForMode(mode),
      pinned,
      statusText: '實時班次正常',
      entityId: entityId.trim() || undefined,
      arrivals: [
        {
          minutes: Math.max(0, parseInt(eta1, 10) || 2),
          remark: remark1.trim() || '實時到站',
        },
        {
          minutes: Math.max(1, parseInt(eta2, 10) || 10),
          remark: '下一班次',
        },
        {
          minutes: Math.max(2, parseInt(eta3, 10) || 20),
          remark: '預定班次',
        },
      ],
    };

    upsertTransportRoute(routePayload);
    onClose();
  };

  return (
    <LightDismissDialog
      open={open}
      title={
        initialRoute
          ? `編輯交通路線 • ${initialRoute.routeCode}`
          : '新增交通資訊卡片 (巴士 / 小巴 / 船 / 地鐵)'
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-row-2">
          <label className="form-field">
            <span>交通工具類別 (Mode)</span>
            <select
              value={mode}
              onChange={(e) => {
                const nextMode = e.target.value as TransportMode;
                setMode(nextMode);
                if (nextMode === 'bus') setOperator('KMB 九巴');
                if (nextMode === 'minibus') setOperator('GMB 專線小巴');
                if (nextMode === 'ship') setOperator('天星小輪 / 新渡輪');
                if (nextMode === 'mtr') setOperator('港鐵 MTR');
              }}
            >
              <option value="bus">巴士 (Bus - 九巴/城巴)</option>
              <option value="minibus">小巴 (Minibus - 專線/紅巴)</option>
              <option value="ship">渡輪 / 船班 (Ship / Ferry)</option>
              <option value="mtr">港鐵 / 地鐵 (MTR / Subway)</option>
            </select>
          </label>

          <label className="form-field">
            <span>營辦商名稱 (Operator)</span>
            <input
              type="text"
              placeholder="例如：KMB 九巴 / 港鐵 MTR / 新渡輪"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            />
          </label>
        </div>

        <div className="form-row-2">
          <label className="form-field">
            <span>路線編號 / 航線名稱 (Route)</span>
            <input
              type="text"
              required
              placeholder="例如：968 / 28M / 荃灣綫 / 中環 ↔ 長洲"
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>候車站名 / 碼頭 / 車站 (Stop Name)</span>
            <input
              type="text"
              required
              placeholder="例如：西區海底隧道轉車站 / 金鐘站 / 中環5號碼頭"
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
            />
          </label>
        </div>

        <div className="form-row-2">
          <label className="form-field">
            <span>起點 (Origin)</span>
            <input
              type="text"
              placeholder="例如：元朗 (西)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>往目的地 (Destination)</span>
            <input
              type="text"
              required
              placeholder="例如：銅鑼灣 (天后)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </label>
        </div>

        {mode === 'mtr' && (
          <div className="form-row-2">
            <label className="form-field">
              <span>港鐵實時 API 路線代碼 (選填，如 TWL/EAL/ISL/TML)</span>
              <input
                type="text"
                placeholder="TWL"
                value={lineCode}
                onChange={(e) => setLineCode(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>港鐵車站代碼 (選填，如 ADM/CEN/EXH/HUH)</span>
              <input
                type="text"
                placeholder="ADM"
                value={staCode}
                onChange={(e) => setStaCode(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="form-row-3">
          <label className="form-field">
            <span>頭班倒數 (分鐘)</span>
            <input
              type="number"
              min="0"
              max="180"
              value={eta1}
              onChange={(e) => setEta1(e.target.value)}
            />
          </label>
          <label className="form-field">
            <span>次班倒數 (分鐘)</span>
            <input
              type="number"
              min="1"
              max="180"
              value={eta2}
              onChange={(e) => setEta2(e.target.value)}
            />
          </label>
          <label className="form-field">
            <span>第三班 (分鐘)</span>
            <input
              type="number"
              min="1"
              max="180"
              value={eta3}
              onChange={(e) => setEta3(e.target.value)}
            />
          </label>
        </div>

        <div className="form-row-2">
          <label className="form-field">
            <span>班次備註 (如：高速船 / 座位充足 / 1號月台)</span>
            <input
              type="text"
              value={remark1}
              onChange={(e) => setRemark1(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>綁定 Home Assistant 實體 (sensor.*)</span>
            <input
              type="text"
              list="ha-transport-datalist"
              placeholder="例如：sensor.kmb_968_eta"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
            <datalist id="ha-transport-datalist">
              {haEntities.map((ent) => (
                <option key={ent.entity_id} value={ent.entity_id}>
                  {ent.attributes.friendly_name || ent.entity_id}
                </option>
              ))}
            </datalist>
          </label>
        </div>

        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          <span>置頂於「常用路線」及主頁交通摘要 (Pin Route)</span>
        </label>

        <div className="modal-actions">
          {initialRoute && (
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                deleteTransportRoute(initialRoute.id);
                onClose();
              }}
            >
              刪除此路線
            </button>
          )}
          <div className="modal-actions-right">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              儲存路線並同步配置
            </button>
          </div>
        </div>
      </form>
    </LightDismissDialog>
  );
};

