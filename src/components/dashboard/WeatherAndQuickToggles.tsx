import React from 'react';
import { MapPin, Wifi, Tv, Snowflake } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const WeatherAndQuickToggles: React.FC = () => {
  const { config, toggleQuickDevice } = useDashboard();
  const { weather, quickToggles } = config;

  const renderQuickIcon = (type: 'wifi' | 'tv' | 'thermostat') => {
    switch (type) {
      case 'wifi':
        return <Wifi size={20} />;
      case 'tv':
        return <Tv size={20} />;
      case 'thermostat':
        return <Snowflake size={20} />;
    }
  };

  return (
    <div className="weather-and-quick-col">
      {/* Outdoor Weather Card */}
      <section className="dash-card weather-card" aria-label="Outdoor Weather">
        <div className="weather-illustration" aria-hidden="true">
          <svg viewBox="0 0 180 125" className="weather-svg">
            <defs>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>
            </defs>
            {/* Sun rays */}
            <g stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round">
              <line x1="95" y1="10" x2="95" y2="18" />
              <line x1="120" y1="16" x2="115" y2="23" />
              <line x1="138" y1="34" x2="130" y2="38" />
              <line x1="143" y1="58" x2="134" y2="58" />
              <line x1="70" y1="16" x2="75" y2="23" />
              <line x1="52" y1="34" x2="60" y2="38" />
            </g>
            {/* Sun body */}
            <circle cx="95" cy="56" r="28" fill="url(#sunGrad)" />
            {/* Soft blue back cloud */}
            <path
              d="M45 98 C30 98 20 87 22 73 C24 61 35 53 47 54 C54 41 72 37 86 45 C98 52 103 65 102 74 C114 75 122 84 120 94 C118 98 112 98 105 98 Z"
              fill="#7dd3fc"
              opacity="0.45"
              transform="translate(16, -6)"
            />
            {/* Foreground cloud */}
            <path
              d="M36 108 C20 108 10 96 12 81 C14 68 25 60 38 61 C46 46 66 42 81 51 C92 57 97 68 97 76 C111 76 121 86 121 97 C121 104 114 108 104 108 Z"
              fill="url(#cloudGrad)"
            />
          </svg>
        </div>

        <div className="weather-info">
          <div className="weather-location">
            <MapPin size={14} fill="currentColor" />
            <span>{weather.location}</span>
          </div>
          <div className="weather-temp">
            {weather.temperature}
            <span className="temp-deg">°</span>
            <span className="temp-unit">{weather.unit}</span>
          </div>
          <div className="weather-label">{weather.conditionLabel}</div>
        </div>
      </section>

      {/* 3 Quick Device Toggle Cards */}
      <div className="quick-toggles-row">
        {quickToggles.map((item) => (
          <div
            key={item.id}
            className={`dash-card quick-toggle-card ${item.isOn ? 'is-on' : 'is-off'}`}
          >
            <div className="quick-card-top">
              <span className="quick-state-label">{item.isOn ? 'ON' : 'OFF'}</span>
              <button
                type="button"
                role="switch"
                aria-checked={item.isOn}
                aria-label={`Toggle ${item.name}`}
                className={`pill-switch small ${item.isOn ? 'on' : 'off'}`}
                onClick={() => toggleQuickDevice(item.id)}
              >
                <span className="pill-switch-thumb" />
              </button>
            </div>

            <div className={`quick-icon-circle ${item.isOn ? 'active' : ''}`}>
              {renderQuickIcon(item.iconType)}
            </div>

            <div className="quick-device-name">{item.name}</div>
            <div className="quick-device-sub">{item.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

