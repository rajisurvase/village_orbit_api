import React from "react";

export const VillageSceneSVG: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 400 400"
    className={`w-full h-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sky */}
    <rect width="400" height="200" fill="#87CEEB" />

    {/* Sun */}
    <circle cx="320" cy="60" r="40" fill="#FFD700" className="animate-pulse" />
    <circle cx="320" cy="60" r="50" fill="#FFA500" opacity="0.3" className="animate-pulse" />

    {/* Clouds */}
    <g opacity="0.8">
      <ellipse cx="80" cy="40" rx="30" ry="20" fill="white" />
      <ellipse cx="110" cy="45" rx="35" ry="18" fill="white" />
      <ellipse cx="50" cy="50" rx="25" ry="15" fill="white" />
    </g>

    {/* Ground */}
    <rect y="200" width="400" height="200" fill="#90EE90" />

    {/* Rice Field */}
    <rect y="200" width="400" height="80" fill="#7CB342" />

    {/* Main Hut */}
    <g>
      {/* Base */}
      <rect x="100" y="150" width="120" height="80" fill="#D4A574" />

      {/* Roof */}
      <polygon points="100,150 160,80 220,150" fill="#8B4513" />

      {/* Door */}
      <rect x="145" y="200" width="30" height="40" fill="#654321" />
      <circle cx="173" cy="220" r="3" fill="#FFD700" />

      {/* Window */}
      <rect x="115" y="165" width="25" height="25" fill="#87CEEB" />
      <line x1="127.5" y1="165" x2="127.5" y2="190" stroke="#333" strokeWidth="1" />
      <line x1="115" y1="177.5" x2="140" y2="177.5" stroke="#333" strokeWidth="1" />

      {/* Chimney */}
      <rect x="155" y="70" width="12" height="15" fill="#C0C0C0" />
    </g>

    {/* Second Hut */}
    <g opacity="0.8" transform="translate(200, 20)">
      <rect x="100" y="150" width="90" height="60" fill="#D4A574" />
      <polygon points="100,150 145,105 190,150" fill="#8B4513" />
      <rect x="125" y="190" width="20" height="30" fill="#654321" />
    </g>

    {/* Farmer Figure */}
    <g className="animate-pulse">
      {/* Head */}
      <circle cx="50" cy="130" r="8" fill="#DEB887" />
      {/* Body */}
      <rect x="46" y="140" width="8" height="20" fill="#FF6B6B" />
      {/* Legs */}
      <line x1="48" y1="160" x2="48" y2="175" stroke="#8B4513" strokeWidth="2" />
      <line x1="52" y1="160" x2="52" y2="175" stroke="#8B4513" strokeWidth="2" />
      {/* Arms */}
      <line x1="46" y1="145" x2="30" y2="140" stroke="#DEB887" strokeWidth="2" />
      <line x1="54" y1="145" x2="70" y2="140" stroke="#DEB887" strokeWidth="2" />
    </g>

    {/* Woman Figure */}
    <g className="animate-pulse" style={{ animationDelay: "0.5s" }}>
      {/* Head */}
      <circle cx="320" cy="140" r="8" fill="#DEB887" />
      {/* Hair */}
      <path d="M 312 138 Q 320 130 328 138" fill="#8B4513" />
      {/* Body */}
      <rect x="316" y="150" width="8" height="20" fill="#4CAF50" />
      {/* Legs */}
      <line x1="318" y1="170" x2="318" y2="185" stroke="#8B4513" strokeWidth="2" />
      <line x1="322" y1="170" x2="322" y2="185" stroke="#8B4513" strokeWidth="2" />
      {/* Arms */}
      <line x1="316" y1="155" x2="300" y2="150" stroke="#DEB887" strokeWidth="2" />
      <line x1="324" y1="155" x2="340" y2="150" stroke="#DEB887" strokeWidth="2" />
    </g>

    {/* Trees */}
    <g>
      {/* Tree 1 */}
      <rect x="250" y="170" width="6" height="40" fill="#8B4513" />
      <circle cx="253" cy="160" r="20" fill="#228B22" />

      {/* Tree 2 */}
      <rect x="330" y="180" width="5" height="35" fill="#8B4513" />
      <circle cx="332.5" cy="172" r="18" fill="#228B22" />
    </g>

    {/* Birds */}
    <g opacity="0.6">
      <path d="M 70 50 Q 80 45 90 50" stroke="#333" strokeWidth="2" fill="none" />
      <text x="88" y="48" fontSize="8">
        ✈
      </text>
    </g>

    {/* Animated Plants */}
    <g className="animate-bounce" style={{ animationDelay: "0s" }}>
      <ellipse cx="150" cy="280" rx="8" ry="15" fill="#7CB342" />
      <ellipse cx="145" cy="275" rx="6" ry="10" fill="#8BC34A" />
      <ellipse cx="155" cy="275" rx="6" ry="10" fill="#8BC34A" />
    </g>

    <g className="animate-bounce" style={{ animationDelay: "0.2s" }}>
      <ellipse cx="280" cy="290" rx="8" ry="15" fill="#7CB342" />
      <ellipse cx="275" cy="285" rx="6" ry="10" fill="#8BC34A" />
      <ellipse cx="285" cy="285" rx="6" ry="10" fill="#8BC34A" />
    </g>
  </svg>
);

export const PhoneAppMockup: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 380"
    className={`w-full h-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Phone Body */}
    <rect x="10" y="10" width="180" height="360" rx="20" fill="#000" />

    {/* Screen */}
    <defs>
      <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#4CAF50", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#009688", stopOpacity: 1 }} />
      </linearGradient>
    </defs>

    <rect x="18" y="18" width="164" height="344" rx="15" fill="url(#screenGrad)" />

    {/* Status Bar */}
    <rect x="18" y="18" width="164" height="25" fill="#1B5E20" />
    <text x="25" y="35" fontSize="10" fill="white" fontWeight="bold">
      9:41
    </text>

    {/* App Header */}
    <rect x="18" y="43" width="164" height="40" fill="#388E3C" />
    <text x="100" y="68" fontSize="14" fill="white" fontWeight="bold" textAnchor="middle">
      VillageOrbit
    </text>

    {/* App Content Area with animated icons */}
    <g className="animate-pulse">
      {/* Icon 1 */}
      <circle cx="55" cy="110" r="20" fill="white" opacity="0.9" />
      <text x="55" y="115" fontSize="18" textAnchor="middle" dominantBaseline="middle">
        📣
      </text>
      <text x="55" y="145" fontSize="8" textAnchor="middle" fill="white">
        समाचार
      </text>

      {/* Icon 2 */}
      <circle cx="145" cy="110" r="20" fill="white" opacity="0.9" />
      <text x="145" y="115" fontSize="18" textAnchor="middle" dominantBaseline="middle">
        🌱
      </text>
      <text x="145" y="145" fontSize="8" textAnchor="middle" fill="white">
        योजनाएं
      </text>

      {/* Icon 3 */}
      <circle cx="55" cy="190" r="20" fill="white" opacity="0.9" />
      <text x="55" y="195" fontSize="18" textAnchor="middle" dominantBaseline="middle">
        📚
      </text>
      <text x="55" y="220" fontSize="8" textAnchor="middle" fill="white">
        शिक्षा
      </text>

      {/* Icon 4 */}
      <circle cx="145" cy="190" r="20" fill="white" opacity="0.9" />
      <text x="145" y="195" fontSize="18" textAnchor="middle" dominantBaseline="middle">
        📞
      </text>
      <text x="145" y="220" fontSize="8" textAnchor="middle" fill="white">
        संपर्क
      </text>
    </g>

    {/* Bottom Nav */}
    <rect x="18" y="300" width="164" height="62" fill="#1B5E20" />
    <circle cx="50" cy="325" r="12" fill="white" opacity="0.8" />
    <circle cx="100" cy="325" r="12" fill="white" opacity="0.6" />
    <circle cx="150" cy="325" r="12" fill="white" opacity="0.6" />

    {/* Notch */}
    <ellipse cx="100" cy="20" rx="25" ry="8" fill="#000" />
  </svg>
);

export const AnimatedFeatureIcon: React.FC<{
  icon: string;
  label: string;
  className?: string;
}> = ({ icon, label, className = "" }) => (
  <svg
    viewBox="0 0 120 120"
    className={`w-full h-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Animated Circle Background */}
    <defs>
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating-circle {
          animation: rotate 20s linear infinite;
        }
      `}</style>
    </defs>

    <g className="rotating-circle" style={{ transformOrigin: "60px 60px" }}>
      <circle cx="60" cy="60" r="50" fill="none" stroke="#4CAF50" strokeWidth="2" opacity="0.3" />
      <circle cx="60" cy="60" r="55" fill="none" stroke="#81C784" strokeWidth="1" opacity="0.2" />
    </g>

    {/* Main Circle */}
    <circle cx="60" cy="60" r="45" fill="#4CAF50" />
    <circle cx="60" cy="60" r="40" fill="#66BB6A" />

    {/* Icon */}
    <text x="60" y="70" fontSize="40" textAnchor="middle" dominantBaseline="middle">
      {icon}
    </text>

    {/* Label */}
    <text x="60" y="105" fontSize="11" textAnchor="middle" fill="#333" fontWeight="bold">
      {label}
    </text>
  </svg>
);

export const AnimatedDots: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 100 20"
    className={`w-full h-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>{`
      @keyframes bounce-dots {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      .dot {
        animation: bounce-dots 1.4s infinite;
      }
      .dot1 { animation-delay: 0s; }
      .dot2 { animation-delay: 0.2s; }
      .dot3 { animation-delay: 0.4s; }
    `}</style>

    <circle cx="20" cy="10" r="4" fill="#4CAF50" className="dot dot1" />
    <circle cx="50" cy="10" r="4" fill="#4CAF50" className="dot dot2" />
    <circle cx="80" cy="10" r="4" fill="#4CAF50" className="dot dot3" />
  </svg>
);

export const FloatingElements: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 400 300"
    className={`w-full h-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-300px); opacity: 0; }
        }
        .floating-element {
          animation: float-up 3s ease-in infinite;
        }
      `}</style>
    </defs>

    {/* Floating Leaves */}
    <g className="floating-element" style={{ animationDelay: "0s" }}>
      <path d="M 50 300 Q 60 280 55 260" stroke="#66BB6A" strokeWidth="2" fill="none" />
      <ellipse cx="55" cy="250" rx="8" ry="12" fill="#81C784" transform="rotate(45 55 250)" />
    </g>

    <g className="floating-element" style={{ animationDelay: "1s" }}>
      <path d="M 150 300 Q 140 270 150 240" stroke="#66BB6A" strokeWidth="2" fill="none" />
      <ellipse cx="150" cy="230" rx="8" ry="12" fill="#81C784" transform="rotate(-30 150 230)" />
    </g>

    <g className="floating-element" style={{ animationDelay: "2s" }}>
      <path d="M 250 300 Q 260 275 255 245" stroke="#66BB6A" strokeWidth="2" fill="none" />
      <ellipse cx="255" cy="235" rx="8" ry="12" fill="#81C784" transform="rotate(20 255 235)" />
    </g>

    {/* Floating Particles */}
    <circle cx="100" cy="280" r="3" fill="#4CAF50" opacity="0.6" className="floating-element" />
    <circle cx="200" cy="290" r="2" fill="#66BB6A" opacity="0.6" className="floating-element" style={{ animationDelay: "0.5s" }} />
    <circle cx="300" cy="270" r="2.5" fill="#81C784" opacity="0.6" className="floating-element" style={{ animationDelay: "1.5s" }} />
  </svg>
);

export const StatisticCounter: React.FC<{
  number: string;
  label: string;
  className?: string;
}> = ({ number, label, className = "" }) => (
  <svg
    viewBox="0 0 120 120"
    className={`w-full h-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .counter-animation {
          animation: scaleIn 0.8s ease-out;
        }
      `}</style>
    </defs>

    {/* Background Circle */}
    <circle cx="60" cy="60" r="55" fill="white" />
    <circle cx="60" cy="60" r="52" fill="#E8F5E9" />

    {/* Border */}
    <circle cx="60" cy="60" r="55" fill="none" stroke="#4CAF50" strokeWidth="2" />

    {/* Number */}
    <text x="60" y="60" fontSize="28" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fill="#2E7D32" className="counter-animation">
      {number}
    </text>

    {/* Label */}
    <text x="60" y="95" fontSize="10" textAnchor="middle" fill="#555" fontWeight="600">
      {label}
    </text>
  </svg>
);
