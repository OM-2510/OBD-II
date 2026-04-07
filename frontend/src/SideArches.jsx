const SideArches = ({ throttle = 0, fuel = 20 }) => {
  const safeThrottle = Math.max(0, Math.min(throttle, 100));
  const safeFuel = Math.max(0, Math.min(fuel, 100));

  const center = 250;

  // --- THE COMPRESSED "SANDWICH" RADII ---
  const rOuterCurve = 298; 
  const rActive = 290;     
  const rTickOuter = 283;  
  const rTickInner = 273;  

  // --- TRIGONOMETRY ENGINE ---
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
      const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
      return {
        x: centerX + r * Math.cos(angleInRadians),
        y: centerY + r * Math.sin(angleInRadians)
      };
    };

    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  };

  // --- ANGLES ---
  const fuelStart = 125;
  const fuelEnd = 165;
  
  const throttleStart = 195;
  const throttleEnd = 235;

  // Generate Arc Paths
  const fuelOuterPath = describeArc(center, center, rOuterCurve, fuelStart, fuelEnd);
  const fuelActivePath = describeArc(center, center, rActive, fuelStart, fuelEnd);
  
  const throttleOuterPath = describeArc(center, center, rOuterCurve, throttleStart, throttleEnd);
  const throttleActivePath = describeArc(center, center, rActive, throttleStart, throttleEnd);

  // --- HELPER: GET POINTS ---
  const getPoint = (r, angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  const drawTick = (angle) => {
    const p1 = getPoint(rTickOuter, angle); 
    const p2 = getPoint(rTickInner, angle); 
    return <line key={angle} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#aaa" strokeWidth="2" strokeLinecap="butt" />;
  };

  // --- TIGHTENED LABEL POSITIONS ---
  const fuelE = getPoint(rOuterCurve + 10, fuelStart);
  const fuelF = getPoint(rOuterCurve + 10, fuelEnd);
  
  const thr0 = getPoint(rOuterCurve + 10, throttleStart);
  const thrMax = getPoint(rOuterCurve + 10, throttleEnd);

  // INNER ICONS 
  const fuelIconPos = getPoint(rTickInner - 16, (fuelStart + fuelEnd) / 2);
  const thrIconPos = getPoint(rTickInner - 16, (throttleStart + throttleEnd) / 2);

  return (
    <g className="side-arches-group">
      <defs>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ========================================= */}
      {/* 1. LEFT BOUNDING CURVE                    */}
      {/* ========================================= */}
      <path d={fuelOuterPath} fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" />
      <path d={throttleOuterPath} fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" />

      {/* ========================================= */}
      {/* 3. RIGHT INWARD TICKS                     */}
      {/* ========================================= */}
      {drawTick(fuelStart)}
      {drawTick((fuelStart + fuelEnd) / 2)}
      {drawTick(fuelEnd)}

      {drawTick(throttleStart)}
      {drawTick((throttleStart + throttleEnd) / 2)}
      {drawTick(throttleEnd)}

      {/* ========================================= */}
      {/* 2. COMPRESSED ACTIVE DATA BLOCKS          */}
      {/* ========================================= */}
      <path 
        d={fuelActivePath} fill="none" stroke="#0088ff" strokeWidth="10" 
        strokeLinecap="butt" 
        pathLength="100" 
        strokeDasharray={`${safeFuel} 105`} 
        style={{ filter: 'url(#softGlow)', transition: 'stroke-dasharray 0.5s ease-out' }} 
      />

      <path 
        d={throttleActivePath} fill="none" stroke="#e62e2e" strokeWidth="10" 
        strokeLinecap="butt" 
        pathLength="100" 
        strokeDasharray={`${safeThrottle} 105`} 
        style={{ filter: 'url(#softGlow)', transition: 'stroke-dasharray 0.1s ease-out' }} 
      />

      {/* ========================================= */}
      {/* 4. INTUITIVE OEM ICONS & LABELS           */}
      {/* ========================================= */}
      
      <text x={fuelE.x} y={fuelE.y} fill="#888" fontSize="12" fontWeight="bold" textAnchor="end" dominantBaseline="central">E</text>
      <text x={fuelF.x} y={fuelF.y} fill="#888" fontSize="11" fontWeight="bold" textAnchor="end" dominantBaseline="central">1/1</text>

      <text x={thr0.x} y={thr0.y} fill="#888" fontSize="12" fontWeight="bold" textAnchor="end" dominantBaseline="central">0</text>
      <text x={thrMax.x} y={thrMax.y} fill="#888" fontSize="11" fontWeight="bold" textAnchor="end" dominantBaseline="central">MAX</text>

      {/* INNER: LFA Fuel Pump Icon */}
      <g transform={`translate(${fuelIconPos.x}, ${fuelIconPos.y}) scale(0.85)`}>
        <polygon points="-14,0 -8,-4 -8,4" fill="#6688cc" /> 
        <rect x="-3" y="-8" width="10" height="16" rx="2" fill="none" stroke="#6688cc" strokeWidth="2" /> 
        <rect x="-1" y="-5" width="6" height="5" fill="#6688cc" /> 
        <path d="M7,-2 Q14,-2 14,4 L14,8" fill="none" stroke="#6688cc" strokeWidth="2" strokeLinecap="round" /> 
      </g>

      {/* INNER: Suspended Gas Pedal Icon */}
      <g transform={`translate(${thrIconPos.x}, ${thrIconPos.y}) scale(0.85)`}>
        {/* Pedal Base (Slanted for perspective) */}
        <path d="M -2,-5 L 4,-5 L 1,8 L -5,8 Z" fill="none" stroke="#cc5555" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Horizontal Anti-Slip Grips */}
        <line x1="-3" y1="-1" x2="3" y2="-1" stroke="#cc5555" strokeWidth="1.5" />
        <line x1="-4" y1="3.5" x2="2" y2="3.5" stroke="#cc5555" strokeWidth="1.5" />

        {/* Suspended Lever Arm */}
        <path d="M 1,-5 L 3,-9 L 6,-9" fill="none" stroke="#cc5555" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Top Pivot Joint */}
        <circle cx="6" cy="-9" r="1.5" fill="#cc5555" />
      </g>

    </g>
  );
};

export default SideArches;