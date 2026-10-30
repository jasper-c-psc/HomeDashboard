import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const EnergyChartCard: React.FC = () => {
  const { config, setEnergyPeriod, setEnergyHighlight } = useDashboard();
  const { energy } = config;

  const data =
    energy.period === 'Weekly' ? energy.weeklyData : energy.monthlyData;
  const activeIdx = Math.min(energy.highlightedIndex, data.length - 1);

  // SVG chart dimensions
  const width = 320;
  const height = 165;
  const padLeft = 34;
  const padRight = 14;
  const padTop = 32;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxVal = 170;

  const points = data.map((d, idx) => {
    const x = padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
    const y = padTop + plotH - (Math.min(maxVal, d.kwh) / maxVal) * plotH;
    return { x, y, ...d };
  });

  // Build polyline path with intermediate points to look like the jagged-smooth energy chart in the image
  const linePath = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
    padTop + plotH
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const highlightedPt = points[activeIdx];
  const yTicks = [170, 120, 60, 20, 0];

  if (points.length === 0) {
    return (
      <section className="dash-card energy-card" aria-label="Energy Used">
        <h2 className="card-title">Energy Used</h2>
        <p className="panel-desc">沒有能源資料。</p>
      </section>
    );
  }

  return (
    <section className="dash-card energy-card" aria-label="Energy Used">
      <div className="card-header-row">
        <h2 className="card-title">Energy Used</h2>
        <button
          type="button"
          className="period-dropdown-btn"
          onClick={() =>
            setEnergyPeriod(energy.period === 'Weekly' ? 'Monthly' : 'Weekly')
          }
        >
          <span>{energy.period}</span>
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="energy-chart-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} className="energy-svg">
          <defs>
            <linearGradient id="energyAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d7ff9" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#2d7ff9" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="highlightBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d7ff9" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2d7ff9" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines & Y axis labels */}
          {yTicks.map((val) => {
            const y = padTop + plotH - (val / maxVal) * plotH;
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#1f2330"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="energy-axis-label"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Vertical highlight pillar under selected day */}
          {highlightedPt && (
            <rect
              x={highlightedPt.x - 13}
              y={highlightedPt.y}
              width="26"
              height={padTop + plotH - highlightedPt.y}
              rx="6"
              fill="url(#highlightBarGrad)"
            />
          )}

          {/* Area fill */}
          <path d={areaPath} fill="url(#energyAreaGrad)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#2d7ff9"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Interactive points & X axis labels */}
          {points.map((pt, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <g
                key={pt.day}
                className="energy-point-group"
                onClick={() => setEnergyHighlight(idx)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 5 : 10}
                  fill={isSelected ? '#ffffff' : 'transparent'}
                  stroke={isSelected ? '#2d7ff9' : 'none'}
                  strokeWidth={isSelected ? 3 : 0}
                />
                <text
                  x={pt.x}
                  y={height - 6}
                  textAnchor="middle"
                  className={`energy-axis-label ${isSelected ? 'active' : ''}`}
                >
                  {pt.day}
                </text>
              </g>
            );
          })}

          {/* Tooltip Callout above highlighted point */}
          {highlightedPt && (
            <g
              transform={`translate(${Math.min(
                width - 42,
                Math.max(52, highlightedPt.x)
              )}, ${Math.max(24, highlightedPt.y - 14)})`}
            >
              <rect
                x="-30"
                y="-22"
                width="60"
                height="20"
                rx="5"
                fill="#ffffff"
              />
              <polygon points="-4,-2 4,-2 0,3" fill="#ffffff" />
              <text
                x="0"
                y="-9"
                textAnchor="middle"
                fill="#0b0c10"
                fontSize="9.5"
                fontWeight="700"
              >
                {highlightedPt.kwh} kWh
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
};

