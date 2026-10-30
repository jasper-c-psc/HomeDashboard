import React from 'react';
import { Zap, Bell, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { EnergyChartCard } from '../dashboard/EnergyChartCard';
import { AirConditionerCard } from '../dashboard/AirConditionerCard';

export const AnalyticsView: React.FC = () => {
  const { config } = useDashboard();
  const totalWeeklyKwh = (config.energy?.weeklyData ?? []).reduce(
    (acc, d) => acc + d.kwh,
    0
  );

  return (
    <div className="secondary-view-container">
      <div className="transport-summary-row">
        <div className="dash-card transport-stat-card">
          <div className="stat-icon-box bus">
            <Zap size={20} />
          </div>
          <div>
            <div className="stat-card-label">本週總耗電量 (Total Weekly)</div>
            <div className="stat-card-val">{totalWeeklyKwh} kWh</div>
          </div>
        </div>
        <div className="dash-card transport-stat-card">
          <div className="stat-icon-box minibus">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-card-label">能源效率評級</div>
            <div className="stat-card-val">A+ 節能模式</div>
          </div>
        </div>
      </div>

      <div className="settings-two-col">
        <EnergyChartCard />
        <AirConditionerCard />
      </div>
    </div>
  );
};

export const NotificationsView: React.FC = () => {
  const { config, updateConfig } = useDashboard();

  return (
    <div className="secondary-view-container">
      <section className="dash-card settings-panel">
        <div className="panel-head-split">
          <h2 className="card-title">
            <Bell size={18} />
            <span>系統通知與 Home Assistant / 交通狀態日誌</span>
          </h2>
          <button
            type="button"
            className="btn-edit-rooms"
            onClick={() =>
              updateConfig((prev) => ({
                ...prev,
                notifications: (prev.notifications ?? []).map((n) => ({
                  ...n,
                  read: true,
                })),
              }))
            }
          >
            全部標示為已讀
          </button>
        </div>

        <div className="notif-full-list">
          {(config.notifications ?? []).map((n) => (
            <div key={n.id} className="notif-card-row">
              <div className="notif-row-main">
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-msg">{n.message}</div>
              </div>
              <div className="notif-item-time">{n.time}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const SchedulesView: React.FC = () => {
  const { config, updateConfig } = useDashboard();

  const toggleSchedule = (id: string) => {
    updateConfig((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  return (
    <div className="secondary-view-container">
      <section className="dash-card settings-panel">
        <h2 className="card-title">
          <Calendar size={18} />
          <span>Home Assistant 自動化排程與通勤鬧鐘 (Automations)</span>
        </h2>
        <p className="panel-desc">
          與 Home Assistant <code>automation.*</code> 實體同步的日常自動化場景。
        </p>

        <div className="notif-full-list">
          {(config.schedules ?? []).map((sched) => (
            <div key={sched.id} className="notif-card-row">
              <div className="notif-row-main">
                <div className="notif-item-title">
                  <Clock size={14} style={{ display: 'inline', marginRight: 6 }} />
                  {sched.time} — {sched.name}
                </div>
                <div className="notif-item-msg">{sched.actionSummary}</div>
                <div className="notif-item-time">
                  執行週期：{sched.days} • 實體：{sched.entityId}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sched.enabled}
                className={`pill-switch ${sched.enabled ? 'on' : 'off'}`}
                onClick={() => toggleSchedule(sched.id)}
              >
                <span className="pill-switch-thumb" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

