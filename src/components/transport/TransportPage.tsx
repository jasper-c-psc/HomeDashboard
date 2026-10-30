import React, { useEffect, useState } from 'react';
import {
  Bus,
  CarFront,
  Ship,
  TrainFront,
  Star,
  RefreshCw,
  Plus,
  Edit3,
  Clock,
  MapPin,
  Radio,
  Link2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { TransportMode, TransportRouteItem } from '../../types/dashboard';
import { TransportModal } from './TransportModal';

type FilterTab = 'all' | 'pinned' | TransportMode;

const MTR_STATUS_LINES = [
  { name: '荃灣綫', color: '#e2231a', status: '服務正常' },
  { name: '港島綫', color: '#0860a8', status: '服務正常' },
  { name: '東鐵綫', color: '#5ce1e6', status: '服務正常' },
  { name: '屯馬綫', color: '#9a3b26', status: '服務正常' },
  { name: '觀塘綫', color: '#00ab4e', status: '服務正常' },
  { name: '東涌綫', color: '#f7943e', status: '服務正常' },
  { name: '將軍澳綫', color: '#7d499d', status: '服務正常' },
  { name: '機場快綫', color: '#00888a', status: '服務正常' },
];

export const TransportPage: React.FC = () => {
  const {
    config,
    searchQuery,
    updateConfig,
    togglePinTransportRoute,
    refreshTransportData,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRouteItem | null>(
    null
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTransportData();
    setTimeout(() => setRefreshing(false), 350);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshTransportData();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [refreshTransportData]);

  const renderModeIcon = (mode: TransportMode, size = 18) => {
    switch (mode) {
      case 'bus':
        return <Bus size={size} />;
      case 'minibus':
        return <CarFront size={size} />;
      case 'ship':
        return <Ship size={size} />;
      case 'mtr':
        return <TrainFront size={size} />;
    }
  };

  const getModeLabel = (mode: TransportMode) => {
    switch (mode) {
      case 'bus':
        return '巴士 Bus';
      case 'minibus':
        return '小巴 Minibus';
      case 'ship':
        return '渡輪 Ship';
      case 'mtr':
        return '港鐵 MTR';
    }
  };

  const filteredRoutes = config.transportRoutes.filter((r) => {
    if (activeTab === 'pinned' && !r.pinned) return false;
    if (
      activeTab !== 'all' &&
      activeTab !== 'pinned' &&
      r.mode !== activeTab
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.routeCode.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.stopName.toLowerCase().includes(q) ||
        r.operator.toLowerCase().includes(q) ||
        (r.entityId || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countByMode = (m: TransportMode) =>
    config.transportRoutes.filter((r) => r.mode === m).length;

  return (
    <div className="transport-page-container">
      {/* Top Hero Summary Row */}
      <div className="transport-summary-row">
        <div className="dash-card transport-stat-card">
          <div className="stat-icon-box bus">
            <Bus size={22} />
          </div>
          <div>
            <div className="stat-card-label">巴士路線 (KMB / 城巴)</div>
            <div className="stat-card-val">{countByMode('bus')} 條監測中</div>
          </div>
        </div>

        <div className="dash-card transport-stat-card">
          <div className="stat-icon-box minibus">
            <CarFront size={22} />
          </div>
          <div>
            <div className="stat-card-label">專線 / 公共小巴 (GMB)</div>
            <div className="stat-card-val">{countByMode('minibus')} 條監測中</div>
          </div>
        </div>

        <div className="dash-card transport-stat-card">
          <div className="stat-icon-box ship">
            <Ship size={22} />
          </div>
          <div>
            <div className="stat-card-label">渡輪及船班 (Star / Sun Ferry)</div>
            <div className="stat-card-val">{countByMode('ship')} 條航線</div>
          </div>
        </div>

        <div className="dash-card transport-stat-card">
          <div className="stat-icon-box mtr">
            <TrainFront size={22} />
          </div>
          <div>
            <div className="stat-card-label">港鐵實時月台 (MTR Lines)</div>
            <div className="stat-card-val">{countByMode('mtr')} 個車站</div>
          </div>
        </div>
      </div>

      {/* MTR Network Status Strip */}
      <section className="dash-card mtr-status-banner" aria-label="港鐵全線服務狀態">
        <div className="mtr-banner-left">
          <TrainFront size={18} className="mtr-banner-icon" />
          <span className="mtr-banner-title">港鐵全線服務狀態</span>
        </div>
        <div className="mtr-lines-scroll">
          {MTR_STATUS_LINES.map((line) => (
            <div key={line.name} className="mtr-line-chip">
              <span
                className="mtr-line-dot"
                style={{ backgroundColor: line.color }}
              />
              <span className="mtr-line-name">{line.name}</span>
              <CheckCircle2 size={13} className="mtr-ok-icon" />
            </div>
          ))}
        </div>
      </section>

      {/* Main Transport Board */}
      <section className="dash-card transport-board-card">
        <div className="transport-board-header">
          <div className="transport-tabs" role="tablist">
            {(
              [
                { id: 'all', label: '全部交通 (All)' },
                { id: 'pinned', label: '★ 常用置頂' },
                { id: 'bus', label: '巴士 (Bus)' },
                { id: 'minibus', label: '小巴 (Minibus)' },
                { id: 'ship', label: '渡輪 / 船班 (Ship)' },
                { id: 'mtr', label: '港鐵 / 地鐵 (MTR)' },
              ] as Array<{ id: FilterTab; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`transport-tab-btn ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="transport-board-actions">
            <button
              type="button"
              className={`live-api-pill ${
                config.useLiveHkTransportApi ? 'active' : ''
              }`}
              onClick={() =>
                updateConfig((prev) => ({
                  ...prev,
                  useLiveHkTransportApi: !prev.useLiveHkTransportApi,
                }))
              }
              title="切換是否連接香港 data.gov.hk 實時交通開放數據 API"
            >
              <Radio size={13} />
              <span>
                {config.useLiveHkTransportApi
                  ? 'HK Open Data 實時連線'
                  : '本地模擬倒數'}
              </span>
            </button>

            <button
              type="button"
              className="btn-edit-rooms"
              onClick={handleRefresh}
            >
              <RefreshCw
                size={13}
                className={refreshing ? 'spin-anim' : ''}
              />
              <span>更新到站時間</span>
            </button>

            <button
              type="button"
              className="btn-add-device"
              onClick={() => {
                setEditingRoute(null);
                setModalOpen(true);
              }}
            >
              <span>新增路線</span>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="transport-cards-grid">
          {filteredRoutes.map((route) => {
            const firstEta = route.arrivals[0];
            return (
              <article key={route.id} className="transport-route-card">
                <div className="route-card-top">
                  <div className="route-badge-group">
                    <span
                      className="route-code-badge"
                      style={{
                        backgroundColor: route.colorHex || '#2d7ff9',
                      }}
                    >
                      {renderModeIcon(route.mode, 14)}
                      <span>{route.routeCode}</span>
                    </span>
                    <span className="route-operator-tag">
                      {route.operator} • {getModeLabel(route.mode)}
                    </span>
                  </div>

                  <div className="route-card-controls">
                    <button
                      type="button"
                      className={`icon-action-btn ${
                        route.pinned ? 'pinned' : ''
                      }`}
                      onClick={() => togglePinTransportRoute(route.id)}
                      title={route.pinned ? '取消置頂' : '置頂路線'}
                    >
                      <Star
                        size={15}
                        fill={route.pinned ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn"
                      onClick={() => {
                        setEditingRoute(route);
                        setModalOpen(true);
                      }}
                      title="編輯路線或綁定 Home Assistant"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>

                <div className="route-direction-row">
                  <div className="route-dest-main">
                    <span className="route-origin-text">{route.origin}</span>
                    <ArrowRight size={14} className="route-arrow" />
                    <span className="route-dest-text">{route.destination}</span>
                  </div>
                  <div className="route-stop-line">
                    <MapPin size={13} />
                    <span>{route.stopName}</span>
                  </div>
                </div>

                {/* Next Arrival Hero + Subsequent Arrivals */}
                <div className="route-eta-box">
                  <div className="next-eta-primary">
                    <div className="eta-label">下一班抵站 (Next)</div>
                    <div className="eta-big-number">
                      {firstEta ? (
                        firstEta.minutes <= 0 ? (
                          <span className="arriving-now">即將到站</span>
                        ) : (
                          <>
                            {firstEta.minutes}
                            <span className="eta-unit">分鐘</span>
                          </>
                        )
                      ) : (
                        '--'
                      )}
                    </div>
                    {firstEta?.timeStr && (
                      <div className="eta-clock-str">
                        航班時間 {firstEta.timeStr}
                      </div>
                    )}
                    {firstEta?.platform && (
                      <div className="eta-platform-pill">
                        {firstEta.platform}
                      </div>
                    )}
                  </div>

                  <div className="subsequent-eta-list">
                    {route.arrivals.map((arr, idx) => (
                      <div key={idx} className="sub-eta-row">
                        <div className="sub-eta-left">
                          <Clock size={12} />
                          <span className="sub-eta-mins">
                            {arr.minutes <= 0
                              ? '即將到站'
                              : `${arr.minutes} 分鐘`}
                          </span>
                          {arr.timeStr && (
                            <span className="sub-eta-clock">({arr.timeStr})</span>
                          )}
                        </div>
                        <span className="sub-eta-remark">
                          {arr.platform ? `${arr.platform} • ` : ''}
                          {arr.remark || '準時'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="route-card-footer">
                  <span className="route-status-dot-text">
                    <span className="status-green-dot" />
                    {route.statusText}
                  </span>
                  {route.entityId && (
                    <span
                      className="ha-entity-chip"
                      title="已映射至 Home Assistant Sensor，可隨設定匯出遷移"
                    >
                      <Link2 size={11} />
                      {route.entityId}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <TransportModal
        open={modalOpen}
        initialRoute={editingRoute}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

