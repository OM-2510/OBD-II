import { useMemo, memo } from "react";
import "./LfaDash.css";
import SideArches from "./SideArches";

// ─── Constants (never change, defined once at module level) ───────────────────

const CENTER       = 250;
const RADIUS       = 165;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const START_ANGLE  = 90;
const SWEEP_ANGLE  = 240;
const MAX_RPM      = 10000;

const PARTITION_RADIUS      = 298;
const PARTITION_CIRCUMFERENCE = 2 * Math.PI * PARTITION_RADIUS;
const PARTITION_ARC_LENGTH  = (110 / 360) * PARTITION_CIRCUMFERENCE;

const TOTAL_VISIBLE_LENGTH  = CIRCUMFERENCE * (SWEEP_ANGLE / 360);

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getCoordinates(r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  };
}

function getDynamicRedline(temp) {
  if (temp < 50) return 3000;
  if (temp < 85) return 5000;
  return 6700;
}

// ─── Static tick geometry (computed once, never recalculated) ─────────────────

const TICKS = (() => {
  const result = [];
  for (let i = 0; i <= 10; i++) {
    const angle      = START_ANGLE + (i / 10) * SWEEP_ANGLE;
    const outerStart = getCoordinates(195, angle);
    const outerEnd   = getCoordinates(205, angle);
    const textPt     = getCoordinates(RADIUS, angle);

    result.push(
      <g key={`major-${i}`}>
        <line
          x1={outerStart.x} y1={outerStart.y}
          x2={outerEnd.x}   y2={outerEnd.y}
          stroke="#fff" strokeWidth="3"
        />
        <text
          x={textPt.x} y={textPt.y}
          fill="#111" fontSize="26" fontWeight="800"
          textAnchor="middle" dominantBaseline="central"
        >
          {i}
        </text>
      </g>
    );

    if (i < 10) {
      const minorAngle = START_ANGLE + ((i + 0.5) / 10) * SWEEP_ANGLE;
      const ms = getCoordinates(195, minorAngle);
      const me = getCoordinates(200, minorAngle);
      result.push(
        <line
          key={`minor-${i}`}
          x1={ms.x} y1={ms.y}
          x2={me.x} y2={me.y}
          stroke="#888" strokeWidth="2"
        />
      );
    }
  }
  return result;
})();

// ─── Component ────────────────────────────────────────────────────────────────

const LfaDash = ({
  rpm       = 2300,
  speed     = 120,
  temp      = 90,
  throttle  = 100,
  fuel      = 95,
  inst_fe   = 15,
  avg_fe    = 18,
  trip_dist = 167,
}) => {
  const clampedRpm  = Math.min(Math.max(rpm, 0), MAX_RPM);
  const redlineRpm  = getDynamicRedline(temp);
  const isRedline   = clampedRpm >= redlineRpm;

  // Only recalculates when redlineRpm changes (i.e. when temp crosses a threshold)
  const arcDashArray = useMemo(() => {
    const whiteLength = TOTAL_VISIBLE_LENGTH * (redlineRpm / MAX_RPM);
    const redLength   = TOTAL_VISIBLE_LENGTH * (MAX_RPM - redlineRpm) / MAX_RPM;
    return `0 ${whiteLength} ${redLength} ${CIRCUMFERENCE - redLength - whiteLength}`;
  }, [redlineRpm]);

  // Recalculates only when rpm changes
  const needleAngle = useMemo(
    () => START_ANGLE + (clampedRpm / MAX_RPM) * SWEEP_ANGLE,
    [clampedRpm]
  );

  const needleStyle = {
    transform:       `rotate(${needleAngle}deg)`,
    transformOrigin: `${CENTER}px ${CENTER}px`,
  };

  const needleGlowStyle = {
    ...needleStyle,
    filter:  "blur(4px)",
    opacity: 0.4,
  };

  return (
    <div className="dash-container">
      <div className="tachometer-wrapper">

        <svg
          width="100%" height="100%"
          viewBox="0 0 500 500"
          className="tachometer-svg overflow-visible"
        >
          <defs>
            <radialGradient id="centerDark" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#000000" />
              <stop offset="90%" stopColor={isRedline ? "#4a0000" : "#000049"} />
              <stop offset="100%" stopColor={isRedline ? "#ff0000" : "#0066ff"} />
            </radialGradient>
          </defs>

          <SideArches throttle={throttle} fuel={fuel} />

          {/* Outer partition arc */}
          <circle
            cx={CENTER} cy={CENTER} r={PARTITION_RADIUS}
            fill="none" stroke="#333" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${PARTITION_ARC_LENGTH} 3000`}
            transform={`rotate(-55 ${CENTER} ${CENTER})`}
          />

          {/* Ring borders */}
          <circle cx={CENTER} cy={CENTER} r="215" fill="none" stroke="#222" strokeWidth="12" />
          <circle cx={CENTER} cy={CENTER} r="195" fill="none" stroke="#333" strokeWidth="3" />

          {/* White + red arc */}
          <g transform={`rotate(${START_ANGLE} ${CENTER} ${CENTER})`}>
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#ffffff" strokeWidth="52" />
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#f03020" strokeWidth="52"
              strokeDasharray={arcDashArray}
            />
          </g>

          {/* Center fill */}
          <circle
            cx={CENTER} cy={CENTER} r="135"
            fill="url(#centerDark)"
            className={isRedline ? "redline-ping" : ""}
          />

          {/* Static ticks */}
          {TICKS}

          {/* Needle */}
          <line
            x1={CENTER + 135} y1={CENTER}
            x2={CENTER + 195} y2={CENTER}
            stroke="#0033aa" strokeWidth="4" strokeLinecap="round"
            className="tachometer-needle"
            style={needleStyle}
          />
          {/* Needle glow */}
          <line
            x1={CENTER + 135} y1={CENTER}
            x2={CENTER + 195} y2={CENTER}
            stroke="#2088ff" strokeWidth="14" strokeLinecap="round"
            className="tachometer-needle"
            style={needleGlowStyle}
          />

          <text x="250" y="365" fill="#888" fontSize="11" fontWeight="600" textAnchor="middle">
            x1000 r/min
          </text>
        </svg>

        {/* Center digital display */}
        <div className="center-display">
          <div className="speed-section">
            <span className="speed-value">{speed}</span>
            <span className="speed-unit">km/h</span>
          </div>

          <div className="divider-line" />

          <div className="trip-section">
            <div className="trip-row">
              <div className="trip-label">Inst Fuel Eco</div>
              <div className="trip-val">{inst_fe}</div>
            </div>
            <div className="trip-row">
              <div className="trip-label">Avg Fuel Eco</div>
              <div className="trip-val">{avg_fe}</div>
            </div>
            <div className="trip-row">
              <div className="trip-label">Trip Dist</div>
              <div className="trip-val">{trip_dist} Km</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// memo prevents re-render if none of the props actually changed
export default memo(LfaDash);