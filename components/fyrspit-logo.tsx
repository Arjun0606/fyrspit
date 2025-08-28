import Image from 'next/image';

interface FyrspitLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function FyrspitLogo({ size = 48, className = "", showText = true }: FyrspitLogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Image 
        src="/fyrspit-logo.png" 
        alt="Fyrspit - Social Aviation Platform" 
        width={size} 
        height={size} 
        className="rounded-xl shadow-lg"
        priority
      />
      {showText && (
        <span className="text-3xl font-bold text-white">Fyrspit</span>
      )}
    </div>
  );
}

// Also provide an SVG version for certain use cases
export function FyrspitLogoSVG({ size = 48, className = "", showText = true }: FyrspitLogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        className="rounded-xl shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Aircraft Body */}
        <ellipse cx="100" cy="100" rx="80" ry="25" fill="url(#orangeGradient)" stroke="#1e3a8a" strokeWidth="4"/>
        
        {/* Wings */}
        <ellipse cx="70" cy="120" rx="45" ry="15" fill="url(#yellowGradient)" stroke="#1e3a8a" strokeWidth="3"/>
        <ellipse cx="130" cy="80" rx="45" ry="15" fill="url(#yellowGradient)" stroke="#1e3a8a" strokeWidth="3"/>
        
        {/* Propeller Base */}
        <circle cx="40" cy="100" r="12" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2"/>
        
        {/* Propeller Blades */}
        <ellipse cx="40" cy="85" rx="3" ry="15" fill="#1e3a8a"/>
        <ellipse cx="40" cy="115" rx="3" ry="15" fill="#1e3a8a"/>
        <ellipse cx="25" cy="100" rx="15" ry="3" fill="#1e3a8a"/>
        <ellipse cx="55" cy="100" rx="15" ry="3" fill="#1e3a8a"/>
        
        {/* Cockpit */}
        <ellipse cx="80" cy="95" rx="15" ry="10" fill="url(#blueGradient)" stroke="#1e3a8a" strokeWidth="2"/>
        
        {/* Engine */}
        <circle cx="140" cy="105" r="8" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2"/>
        
        {/* Wing Details */}
        <circle cx="70" cy="120" r="6" fill="#1e40af"/>
        <circle cx="130" cy="80" r="6" fill="#1e40af"/>
        
        {/* Tail */}
        <path d="M 160 100 L 180 85 L 175 100 L 180 115 Z" fill="url(#orangeGradient)" stroke="#1e3a8a" strokeWidth="3"/>
        
        {/* Fire/Exhaust Effect */}
        <path d="M 175 100 Q 185 95 190 100 Q 185 105 175 100" fill="#f97316"/>
        <path d="M 180 100 Q 188 98 192 100 Q 188 102 180 100" fill="#fbbf24"/>
        
        {/* Gradients */}
        <defs>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#fbbf24", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#f97316", stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#fde047", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#fbbf24", stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#60a5fa", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#1e40af", stopOpacity:1}} />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className="text-3xl font-bold text-white">Fyrspit</span>
      )}
    </div>
  );
}
