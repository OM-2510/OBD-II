import './LfaDash.css';
import SideArches from './SideArches';

const LfaDash = ({ rpm = 2300, speed = 120, temp = 90, throttle = 100, fuel = 95, inst_fe = 15, avg_fe = 18, trip_dist = 167 }) => {
  const getDynamicRedline = (temp) => {
    if (temp < 50) return 3000; 
    if (temp < 85) return 5000; 
    return 6700;                
  };
  
  const maxRpm = 10000;
  const redlineRpm = getDynamicRedline(temp);
  const clampedRpm = Math.min(Math.max(rpm, 0), maxRpm);
  const isRedline = clampedRpm >= redlineRpm;

  const center = 250;
  const radius = 165; 
  const circumference = 2 * Math.PI * radius;
 
  const startAngle = 90; 
  const sweepAngle = 240;
  const sweepFraction = sweepAngle / 360; 
  
  const totalVisibleLength = circumference * sweepFraction;  
  const whiteLength = totalVisibleLength * (redlineRpm / maxRpm);
  
  const redLength = totalVisibleLength * (maxRpm - redlineRpm) / maxRpm;
  const redDashArray = `0 ${whiteLength} ${redLength} ${circumference - redLength - whiteLength}`;

  // --- RIGHT PARTITION ARC MATH ---
  // Mirrors the exact radius of the SideArches outer curve
  const partitionRadius = 298;
  const partitionCircumference = 2 * Math.PI * partitionRadius;
  // 110 degrees perfectly mirrors the span from bottom-left to top-left
  const partitionArcLength = (110 / 360) * partitionCircumference;

  const getCoordinates = (r, angleInDegrees) => {
    const radians = (angleInDegrees * Math.PI) / 180; 
    return {
      x: center + r * Math.cos(radians),
      y: center + r * Math.sin(radians)
    };
  };

  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = startAngle + (i / 10) * sweepAngle;
    const outerTickStart = getCoordinates(195, angle);
    const outerTickEnd = getCoordinates(205, angle);
    const textPoint = getCoordinates(radius, angle);

    ticks.push(
      <g key={`major-${i}`}>
        <line 
          x1={outerTickStart.x} y1={outerTickStart.y} 
          x2={outerTickEnd.x} y2={outerTickEnd.y} 
          stroke="#fff" strokeWidth="3" 
        />
        <text 
          x={textPoint.x} y={textPoint.y} 
          fill='#111' 
          fontSize="26" fontWeight="800"
          textAnchor="middle" dominantBaseline="central"
        >
          {i}
        </text>
      </g>
    );

    if (i < 10) {
      const minorAngle = startAngle + ((i + 0.5) / 10) * sweepAngle;
      const minorTickStart = getCoordinates(195, minorAngle);
      const minorTickEnd = getCoordinates(200, minorAngle);
      ticks.push(
        <line 
          key={`minor-${i}`}
          x1={minorTickStart.x} y1={minorTickStart.y} 
          x2={minorTickEnd.x} y2={minorTickEnd.y} 
          stroke="#888" strokeWidth="2" 
        />
      );
    }
  }

  const needleAngle = startAngle + (clampedRpm / maxRpm) * sweepAngle;
  const needleStart = getCoordinates(135, needleAngle); 
  const needleEnd = getCoordinates(195, needleAngle);   

  return (
    <div className="dash-container">
      <div className="tachometer-wrapper">
        
        <svg width="100%" height="100%" viewBox="0 0 500 500" className="tachometer-svg overflow-visible">
          
          <defs>
            <radialGradient id="centerDark" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#000000" />
              <stop offset="90%" stopColor={isRedline? "#4a0000" : "#000049"} />
              <stop offset="100%" stopColor={isRedline? "#ff0000" : "#0066ff"} />
            </radialGradient>
          </defs>

          <SideArches 
            throttle={throttle}
            fuel={fuel}
          />

          <circle 
            cx={center} cy={center} r={partitionRadius}
            fill="none" stroke="#333" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${partitionArcLength} 3000`}
            transform={`rotate(-55 ${center} ${center})`}
          />

          {/* Thin Outer Rings */}
          <circle cx={center} cy={center} r="215" fill="none" stroke="#222" strokeWidth="12" />
          <circle cx={center} cy={center} r="195" fill="none" stroke="#333" strokeWidth="3" />
          
          <g transform={`rotate(${startAngle} ${center} ${center})`}>
            <circle
              cx={center} cy={center} r={radius}
              fill="none" stroke="#ffffff" strokeWidth="52"
            />
            <circle
              cx={center} cy={center} r={radius}
              fill="none" stroke="#f03020" strokeWidth="52"
              strokeDasharray={redDashArray}
            />
          </g>

          {/* Inner Dark Screen */}
          <circle cx={center} cy={center} r="135" fill="url(#centerDark)" className={isRedline ? "redline-ping" : ""}/>

          {/* Ticks and Numbers */}
          {ticks}

          {/* The Needle */}
          <line
            x1={needleStart.x} y1={needleStart.y}
            x2={needleEnd.x} y2={needleEnd.y}
            stroke="#0033aa" strokeWidth="4" strokeLinecap="round"
            className="tachometer-needle"
          />
          <line
            x1={needleStart.x} y1={needleStart.y}
            x2={needleEnd.x} y2={needleEnd.y}
            stroke="#2088ff" strokeWidth="14" strokeLinecap="round"
            opacity="0.4" style={{ filter: 'blur(4px)' }}
            className="tachometer-needle"
          />

          <text x="250" y="365" fill="#888" fontSize="11" fontWeight="600" textAnchor="middle">
            x1000 r/min
          </text>
        </svg>

        {/* Center Digital Display */}
        <div className="center-display">
          <div className="speed-section">
            <span className="speed-value">{speed}</span>
            <span className="speed-unit">km/h</span>
          </div>
          
          <div className="divider-line"></div>
            <div className='trip-section'>
              <div className='trip-row'>
                <div className='trip-label'>Inst Fuel Eco</div>
                <div className='trip-val'>{inst_fe}</div>
              </div>

              <div className='trip-row'>
                <div className='trip-label'>Avg Fuel Eco</div>
                <div className='trip-val'>{avg_fe}</div>
              </div>
            
              <div className='trip-row'>
                <div className='trip-label'>Trip Dist</div>
                <div className='trip-val'>{trip_dist} Km</div>
              </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default LfaDash;