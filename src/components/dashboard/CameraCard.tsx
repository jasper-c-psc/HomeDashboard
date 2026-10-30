import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

export const CameraCard: React.FC = () => {
  const { config, togglePrimaryCamera } = useDashboard();
  const { primaryCamera } = config;

  return (
    <section className="dash-card camera-primary-card" aria-label="Bed Room Camera">
      <div className="card-header-row">
        <div>
          <div className="card-eyebrow">Camera</div>
          <h2 className="card-title">{primaryCamera.roomName}</h2>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={primaryCamera.isOn}
          aria-label={`Toggle ${primaryCamera.roomName} Camera`}
          className={`pill-switch ${primaryCamera.isOn ? 'on' : 'off'}`}
          onClick={togglePrimaryCamera}
        >
          <span className="pill-switch-thumb" />
        </button>
      </div>

      <div className="camera-viewport">
        {primaryCamera.isOn ? (
          <img
            src={primaryCamera.imageUrl}
            alt={`${primaryCamera.roomName} live stream`}
            className="camera-feed-img"
          />
        ) : (
          <div className="camera-offline-placeholder">
            <span>Camera Standby ({primaryCamera.entityId})</span>
          </div>
        )}

        <div className="camera-overlay-badges">
          <span className="camera-badge live-badge">
            <span className={`live-dot ${primaryCamera.isOn ? 'active' : ''}`} />
            Live
          </span>
          <span className="camera-badge res-badge">{primaryCamera.resolution}</span>
        </div>
      </div>
    </section>
  );
};

