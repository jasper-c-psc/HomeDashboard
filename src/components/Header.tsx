import React, { useState } from 'react';
import { Search, Bell, ChevronDown, BusFront, Home, Link2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const Header: React.FC = () => {
  const {
    config,
    activeNav,
    setActiveNav,
    searchQuery,
    setSearchQuery,
    haConnected,
  } = useDashboard();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = config.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="greeting-title">Good Morning, {config.userName}</h1>
        <div className="header-quick-pills">
          <button
            type="button"
            className={`quick-view-pill ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <Home size={14} />
            <span>智能家居看板</span>
          </button>
          <button
            type="button"
            className={`quick-view-pill ${activeNav === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveNav('transport')}
          >
            <BusFront size={14} />
            <span>交通資訊 (巴士/小巴/船/地鐵)</span>
          </button>
          <button
            type="button"
            className={`ha-status-pill ${haConnected ? 'connected' : 'demo'}`}
            onClick={() => setActiveNav('settings')}
            title="點擊設定 Home Assistant 連線或配置遷移"
          >
            <Link2 size={13} />
            <span>{haConnected ? 'HA Live 已同步' : 'HA 遷移就緒 (Demo)'}</span>
          </button>
        </div>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            placeholder="Search devices or routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search devices or routes"
          />
        </div>

        <div className="popover-wrapper">
          <button
            type="button"
            className="header-icon-box"
            onClick={() => {
              setShowNotif((prev) => !prev);
              setShowProfileMenu(false);
            }}
            aria-label="通知中心"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>

          {showNotif && (
            <div className="header-dropdown notif-dropdown">
              <div className="dropdown-head">
                <span>系統與交通提示</span>
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => {
                    setShowNotif(false);
                    setActiveNav('messages');
                  }}
                >
                  查看全部
                </button>
              </div>
              <div className="dropdown-list">
                {notifications.map((n) => (
                  <div key={n.id} className="dropdown-notif-item">
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="popover-wrapper">
          <button
            type="button"
            className="profile-pill-btn"
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotif(false);
            }}
          >
            <img
              src={config.userAvatar}
              alt={config.userName}
              className="profile-avatar"
            />
            <span className="profile-name">{config.userName}</span>
            <ChevronDown size={15} className="profile-chevron" />
          </button>

          {showProfileMenu && (
            <div className="header-dropdown profile-dropdown">
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  setActiveNav('settings');
                }}
              >
                Home Assistant 連線與設定
              </button>
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  setActiveNav('docs');
                }}
              >
                匯出 / 匯入 Lovelace YAML
              </button>
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  setActiveNav('transport');
                }}
              >
                管理常用交通路線
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

