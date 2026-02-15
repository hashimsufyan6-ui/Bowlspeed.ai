import React from 'react';

interface SpeedGaugeProps {
  speed: number;
  unit: 'KPH' | 'MPH';
  maxSpeed?: number;
}

const SpeedGauge: React.FC<SpeedGaugeProps> = ({ speed, unit, maxSpeed = 160 }) => {
  // Normalize speed for the gauge (0 to 100%)
  // Assuming realistic max for amateur/pro ranges. 160kph is express pace.
  const percentage = Math.min((speed / maxSpeed) * 100, 100);
  
  // Calculate stroke dasharray for the semi-circle
  // Radius 40, Circumference = 2 * pi * 40 ≈ 251.2
  // Semi-circle = 125.6
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const strokeDashoffset = halfCircumference - (percentage / 100) * halfCircumference;

  // Determine color based on speed
  let colorClass = "text-green-500";
  if (speed > 100) colorClass = "text-yellow-400";
  if (speed > 130) colorClass = "text-orange-500";
  if (speed > 145) colorClass = "text-red-600";
  if (unit === 'MPH') {
      if (speed > 60) colorClass = "text-yellow-400";
      if (speed > 80) colorClass = "text-orange-500";
      if (speed > 90) colorClass = "text-red-600";
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-64 h-40 overflow-visible" viewBox="0 0 120 70">
        {/* Background Arc */}
        <path
          d="M 10,60 A 50,50 0 0,1 110,60"
          className="stroke-gray-800 fill-none"
          strokeWidth="10"
          strokeLinecap="round"
        />
        
        {/* Foreground Arc (Progress) */}
        <path
          d="M 10,60 A 50,50 0 0,1 110,60"
          className={`fill-none transition-all duration-1000 ease-out ${colorClass}`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={halfCircumference}
          strokeDashoffset={strokeDashoffset}
          style={{ 
            strokeDasharray: halfCircumference,
            strokeDashoffset: strokeDashoffset
           }}
        />
        
        {/* Ticks */}
        <g className="text-gray-600 text-[4px] font-mono">
          <text x="10" y="70" textAnchor="middle">0</text>
          <text x="60" y="20" textAnchor="middle">{Math.round(maxSpeed / 2)}</text>
          <text x="110" y="70" textAnchor="middle">{maxSpeed}+</text>
        </g>
      </svg>
      
      <div className="absolute top-20 flex flex-col items-center">
        <span className={`text-6xl font-display font-bold tabular-nums tracking-tighter ${colorClass}`}>
          {Math.round(speed)}
        </span>
        <span className="text-gray-400 font-bold text-lg tracking-widest">{unit}</span>
      </div>
    </div>
  );
};

export default SpeedGauge;
