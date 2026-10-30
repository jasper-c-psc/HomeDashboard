import React, { useState } from 'react';
import {
  Edit3,
  Plus,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Wifi,
  Power,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DeviceHardwareType, DeviceItem } from '../../types/dashboard';
import { DeviceModal } from './DeviceModal';

const HardwareIllustration: React.FC<{
  type: DeviceHardwareType;
  valueLabel?: string;
}> = ({ type, valueLabel }) => {
  switch (type) {
    case 'humidifier':
      return (
        <svg viewBox="0 0 80 96" className="device-hw-svg">
          <defs>
            <linearGradient id="humBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          <rect
            x="18"
            y="10"
            width="44"
            height="76"
            rx="8"
            fill="url(#humBody)"
          />
          <rect x="38.5" y="22" width="3" height="22" rx="1.5" fill="#475569" />
          <circle cx="40" cy="68" r="2.5" fill="#94a3b8" />
        </svg>
      );
    case 'speaker':
      return (
        <svg viewBox="0 0 80 96" className="device-hw-svg">
          <defs>
            <linearGradient id="spkTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="spkBase" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
          {/* Base fabric */}
          <path
            d="M18 48 L62 48 L59 78 C58 84 50 88 40 88 C30 88 22 84 21 78 Z"
            fill="url(#spkBase)"
          />
          {/* Upper white shell */}
          <path
            d="M21 50 L59 50 L56 22 C55 15 48 12 40 12 C32 12 25 15 24 22 Z"
            fill="url(#spkTop)"
          />
          <ellipse cx="40" cy="18" rx="14" ry="4" fill="#e2e8f0" />
        </svg>
      );
    case 'cctv':
      return (
        <svg viewBox="0 0 80 96" className="device-hw-svg">
          {/* Stand base */}
          <ellipse cx="40" cy="83" rx="22" ry="6" fill="#cbd5e1" />
          <rect x="35" y="68" width="10" height="14" fill="#94a3b8" />
          {/* White camera sphere */}
          <circle cx="40" cy="44" r="26" fill="#f1f5f9" />
          {/* Black lens face */}
          <circle cx="40" cy="43" r="16" fill="#0f172a" />
          {/* Inner lens */}
          <circle cx="40" cy="43" r="6" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <circle cx="42" cy="41" r="2" fill="#38bdf8" />
          <circle cx="40" cy="31" r="1.8" fill="#22c55e" />
        </svg>
      );
    case 'thermostat':
      return (
        <svg viewBox="0 0 80 96" className="device-hw-svg">
          <defs>
            <linearGradient id="nestRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          {/* Outer metallic bevel */}
          <circle cx="40" cy="48" r="31" fill="url(#nestRing)" />
          {/* Dark dial display */}
          <circle cx="40" cy="48" r="25" fill="#090d16" />
          <circle
            cx="40"
            cy="48"
            r="21"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />
          <text
            x="40"
            y="53"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="15"
            fontWeight="700"
          >
            {valueLabel || '70'}
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 96" className="device-hw-svg">
          <rect x="20" y="16" width="40" height="64" rx="12" fill="#e2e8f0" />
          <circle cx="40" cy="48" r="12" fill="#2d7ff9" opacity="0.85" />
        </svg>
      );
  }
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const MyRoomsSection: React.FC = () => {
  const {
    config,
    searchQuery,
    setActiveRoom,
    toggleRoomDevice,
    toggleMediaPlay,
    skipMediaTrack,
  } = useDashboard();
  const [editMode, setEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceItem | null>(null);

  const activeRoom =
    config.rooms.find((r) => r.id === config.activeRoomId) || config.rooms[0];

  const filteredDevices = activeRoom.devices.filter((dev) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      dev.name.toLowerCase().includes(q) ||
      dev.model.toLowerCase().includes(q) ||
      (dev.entityId || '').toLowerCase().includes(q)
    );
  });

  const remainingSec = Math.max(
    0,
    config.mediaPlayer.totalTimeSec - config.mediaPlayer.currentTimeSec
  );

  // Waveform heights for the audio visualizer bar
  const waveHeights = [
    25, 45, 70, 95, 60, 80, 100, 75, 50, 85, 65, 40, 30, 55, 75, 45, 30, 20, 35,
    50, 25, 40, 30, 20, 35, 25, 18, 30,
  ];
  const progressRatio =
    config.mediaPlayer.currentTimeSec / config.mediaPlayer.totalTimeSec;
  const activeWaveCount = Math.round(progressRatio * waveHeights.length);

  return (
    <section className="dash-card my-rooms-card" aria-label="My Rooms">
      <div className="my-rooms-header">
        <h2 className="card-title">My Rooms</h2>
        <div className="my-rooms-actions">
          <button
            type="button"
            className={`btn-edit-rooms ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode((prev) => !prev)}
          >
            <span>{editMode ? 'Done' : 'Edit'}</span>
            <Edit3 size={13} />
          </button>
          <button
            type="button"
            className="btn-add-device"
            onClick={() => {
              setEditingDevice(null);
              setModalOpen(true);
            }}
          >
            <span>Add Device</span>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Room Navigation Tabs */}
      <div className="room-tabs-bar" role="tablist">
        {config.rooms.map((room) => {
          const isCurrent = room.id === activeRoom.id;
          return (
            <button
              key={room.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              className={`room-tab-btn ${isCurrent ? 'active' : ''}`}
              onClick={() => setActiveRoom(room.id)}
            >
              {room.name}
            </button>
          );
        })}
      </div>

      <div className="room-content-grid">
        {/* Left column: Room Camera + Media Player */}
        <div className="room-left-stack">
          <div className="room-camera-box">
            <img
              src={activeRoom.cameraImage}
              alt={`${activeRoom.name} view`}
              className="room-camera-img"
            />
            <div className="camera-overlay-badges">
              <span className="camera-badge live-badge">
                <span
                  className={`live-dot ${activeRoom.cameraLive ? 'active' : ''}`}
                />
                Live
              </span>
              <span className="camera-badge res-badge">
                {activeRoom.cameraResolution}
              </span>
            </div>
          </div>

          {/* Media Player Card */}
          <div className="media-player-tile">
            <img
              src={config.mediaPlayer.coverUrl}
              alt={config.mediaPlayer.title}
              className="media-album-art"
            />
            <div className="media-center-info">
              <div className="media-track-title">{config.mediaPlayer.title}</div>
              <div className="media-track-artist">{config.mediaPlayer.artist}</div>

              <div className="media-waveform-row" aria-hidden="true">
                {waveHeights.map((h, i) => (
                  <span
                    key={i}
                    className={`wave-bar ${i <= activeWaveCount ? 'played' : ''}`}
                    style={{ height: `${Math.max(4, (h / 100) * 18)}px` }}
                  />
                ))}
              </div>

              <div className="media-timestamps">
                <span>{formatDuration(config.mediaPlayer.currentTimeSec)}</span>
                <span>- {formatDuration(remainingSec)}</span>
              </div>
            </div>

            <div className="media-controls-row">
              <button
                type="button"
                className="media-icon-btn"
                onClick={() => skipMediaTrack('prev')}
                aria-label="Previous track"
              >
                <SkipBack size={16} />
              </button>
              <button
                type="button"
                className="media-play-btn"
                onClick={toggleMediaPlay}
                aria-label={config.mediaPlayer.isPlaying ? 'Pause' : 'Play'}
              >
                {config.mediaPlayer.isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                className="media-icon-btn"
                onClick={() => skipMediaTrack('next')}
                aria-label="Next track"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: 2x2 Device Cards */}
        <div className="room-devices-grid">
          {filteredDevices.map((dev) => (
            <div
              key={dev.id}
              className={`room-device-tile ${dev.isOn ? 'is-on' : 'is-off'} ${
                editMode ? 'editable' : ''
              }`}
              onClick={() => {
                if (editMode) {
                  setEditingDevice(dev);
                  setModalOpen(true);
                }
              }}
            >
              <div className="device-tile-top">
                <div className="device-illustration-wrap">
                  <HardwareIllustration
                    type={dev.type}
                    valueLabel={dev.valueLabel}
                  />
                </div>

                <div className="device-right-indicators">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dev.isOn}
                    aria-label={`Toggle ${dev.name}`}
                    className={`pill-switch small ${dev.isOn ? 'on' : 'off'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRoomDevice(activeRoom.id, dev.id);
                    }}
                  >
                    <span className="pill-switch-thumb" />
                  </button>

                  <span
                    className={`mini-status-circle wifi ${
                      dev.wifiConnected && dev.isOn ? 'active' : ''
                    }`}
                    title={dev.entityId || 'Wi-Fi Status'}
                  >
                    <Wifi size={11} />
                  </span>

                  <span
                    className={`mini-status-circle power ${
                      dev.powerActive && dev.isOn ? 'active' : ''
                    }`}
                    title="Power Active"
                  >
                    <Power size={11} />
                  </span>
                </div>
              </div>

              <div className="device-tile-bottom">
                <div className="device-tile-name">{dev.name}</div>
                <div className="device-tile-model">
                  {editMode && dev.entityId ? dev.entityId : dev.model}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeviceModal
        open={modalOpen}
        roomId={activeRoom.id}
        initialDevice={editingDevice}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
};

