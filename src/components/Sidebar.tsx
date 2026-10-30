import React from 'react';
import {
  Zap,
  LayoutGrid,
  BusFront,
  BarChart2,
  Mail,
  Calendar,
  FileCode2,
  Settings,
  LogOut,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { NavTabId } from '../types/dashboard';

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, haConnected } = useDashboard();

  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: '家居主看板 (Home)',
      icon: <LayoutGrid size={20} />,
    },
    {
      id: 'transport',
      label: '交通資訊 (巴士/小巴/船/地鐵)',
      icon: <BusFront size={20} />,
      badge: 'ETA',
    },
    {
      id: 'analytics',
      label: '能源與統計 (Analytics)',
      icon: <BarChart2 size={20} />,
    },
    {
      id: 'messages',
      label: '通知與狀態日誌 (Logs)',
      icon: <Mail size={20} />,
    },
    {
      id: 'calendar',
      label: '自動化排程 (Schedules)',
      icon: <Calendar size={20} />,
    },
    {
      id: 'docs',
      label: 'HA YAML / JSON 配置遷移',
      icon: <FileCode2 size={20} />,
    },
  ];

  return (
    <aside className="sidebar-rail" aria-label="主導航欄">
      <div className="sidebar-top">
        <button
          type="button"
          className="brand-logo-btn"
          onClick={() => setActiveNav('dashboard')}
          title="Smart Home & Transport Dashboard"
        >
          <Zap size={20} fill="currentColor" />
          <span
            className={`ha-dot ${haConnected ? 'online' : 'demo'}`}
            title={haConnected ? 'Home Assistant 已連線' : '本地演示模式'}
          />
        </button>

        <nav className="sidebar-nav">
          {mainNavItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && <span className="active-indicator-bar" />}
                {item.icon}
                {item.badge && <span className="nav-mini-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button
          type="button"
          className={`sidebar-nav-btn ${activeNav === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveNav('settings')}
          title="Home Assistant 設定與遷移 (Settings)"
          aria-label="Home Assistant 設定與遷移"
        >
          {activeNav === 'settings' && <span className="active-indicator-bar" />}
          <Settings size={20} />
        </button>
        <button
          type="button"
          className="sidebar-nav-btn"
          onClick={() => setActiveNav('docs')}
          title="匯出 / 備份設定 (Export & Migrate)"
          aria-label="匯出或備份設定"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

