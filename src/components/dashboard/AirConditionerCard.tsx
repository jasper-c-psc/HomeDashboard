import React from 'react';
import { Wind, Clock, Sparkles, Minus, Plus } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const AirConditionerCard: React.FC = () => {
  const { config, toggleAirConditioner, adjustAcTemp, toggleAcSubMode } =
    useDashboard();
  const { airConditioner } = config;

  // Compute radial ticks from 135 deg to 405 deg (270 deg arc, 29 ticks)
  const totalTicks = 29;
  const startAngle = 135;
  const sweepAngle = 270;
  const normalizedProgress = Math.max(
    0,
    Math.min(
      1,
      (airConditioner.targetTemp - airConditioner.minTemp) /
        (airConditioner.maxTemp - airConditioner.minTemp)
    )
  );
  const activeTickLimit = Math.round(normalizedProgress * (totalTicks - 1));
  const pointerAngleDeg = startAngle + normalizedProgress * sweepAngle;
  const pointerAngleRad = (pointerAngleDeg * Math.PI) / 180;
  const cx = 130;
  const cy = 130;
  const outerPointerR = 108;
  const px = cx + outerPointerR * Math.cos(pointerAngleRad);
  const py = cy + outerPointerR * Math.sin(pointerAngleRad);

  return (
    <section
      className="dash-card ac-card"
      aria-label="Air Conditioner Control"
    >
      <div className="card-header-row">
        <div>
          <h2 className="card-title">{airConditioner.roomName === 'Living Room' ? 'Air Conditioner' : `AC • ${airConditioner.roomName}`}</h2>
          <div className="card-subtitle">{airConditioner.roomName}</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={airConditioner.isOn}
          aria-label="Toggle Air Conditioner"
          className={`pill-switch ${airConditioner.isOn ? 'on' : 'off'}`}
          onClick={toggleAirConditioner}
        >
          <span className="pill-switch-thumb" />
        </button>
      </div>

      <div className="ac-dial-container">
        <svg viewBox="0 0 260 245" className="ac-dial-svg">
          {/* Outer subtle arc ring */}
          <circle
            cx={cx}
            cy={cy}
            r="102"
            fill="none"
            stroke="#1e222d"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Inner dark dial plate */}
          <circle
            cx={cx}
            cy={cy}
            r="76"
            fill="#14171f"
            stroke="#222632"
            strokeWidth="1.5"
          />

          {/* Radial ticks */}
          {Array.from({ length: totalTicks }).map((_, idx) => {
            const angleDeg = startAngle + (idx / (totalTicks - 1)) * sweepAngle;
            const rad = (angleDeg * Math.PI) / 180;
            const rInner = 84;
            const rOuter = 94;
            const x1 = cx + rInner * Math.cos(rad);
            const y1 = cy + rInner * Math.sin(rad);
            const x2 = cx + rOuter * Math.cos(rad);
            const y2 = cy + rOuter * Math.sin(rad);
            const isLit = airConditioner.isOn && idx <= activeTickLimit;
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isLit ? '#2d7ff9' : '#2c3140'}
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}

          {/* Blue pointer indicator on outer ring */}
          {airConditioner.isOn && (
            <circle
              cx={px}
              cy={py}
              r="4.5"
              fill="#2d7ff9"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />
          )}

          {/* Center readout text */}
          <text
            x={cx}
            y={cy - 24}
            textAnchor="middle"
            className="ac-svg-mode"
          >
            {airConditioner.isOn ? airConditioner.modeLabel : 'SYSTEM OFF'}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            className="ac-svg-temp"
          >
            {airConditioner.targetTemp.toFixed(1)}°
          </text>
          <text
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            className="ac-svg-eta"
          >
            {airConditioner.isOn ? airConditioner.etaLabel : 'STANDBY'}
          </text>
        </svg>

        <div className="ac-temp-controls">
          <span className="ac-bound-label">{airConditioner.minTemp}°</span>
          <button
            type="button"
            className="ac-step-btn"
            onClick={() => adjustAcTemp(-0.5)}
            aria-label="Decrease temperature"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            className="ac-step-btn"
            onClick={() => adjustAcTemp(0.5)}
            aria-label="Increase temperature"
          >
            <Plus size={16} />
          </button>
          <span className="ac-bound-label">{airConditioner.maxTemp}°</span>
        </div>
      </div>

      <div className="ac-bottom-modes">
        <div className="ac-mode-item">
          <button
            type="button"
            className={`ac-mode-pill ${airConditioner.fanSpeedOn ? 'active' : ''}`}
            onClick={() => toggleAcSubMode('fan')}
          >
            <Wind size={18} />
          </button>
          <div className="ac-mode-title">Fan Speed</div>
          <div className="ac-mode-sub">
            {airConditioner.fanSpeedLevel} Level •{' '}
            {airConditioner.fanSpeedOn ? 'On' : 'Off'}
          </div>
        </div>

        <div className="ac-mode-item">
          <button
            type="button"
            className={`ac-mode-pill ${airConditioner.timerOn ? 'active' : ''}`}
            onClick={() => toggleAcSubMode('timer')}
          >
            <Clock size={18} />
          </button>
          <div className="ac-mode-title">Timer</div>
          <div className="ac-mode-sub">
            {airConditioner.timerHours} Hours •{' '}
            {airConditioner.timerOn ? 'On' : 'Off'}
          </div>
        </div>

        <div className="ac-mode-item">
          <button
            type="button"
            className={`ac-mode-pill ${airConditioner.autoModeOn ? 'active' : ''}`}
            onClick={() => toggleAcSubMode('auto')}
          >
            <Sparkles size={18} />
          </button>
          <div className="ac-mode-title">Auto Mode</div>
          <div className="ac-mode-sub">
            {airConditioner.autoModeOn ? 'Power On' : 'Power Off'}
          </div>
        </div>
      </div>
    </section>
  );
};

