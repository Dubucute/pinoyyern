import React from 'react';

export default function PixelScenery({ locationId, accent }) {
  const color = accent || '#555';

  const scenery = {
    kanto: (
      <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{imageRendering:'pixelated'}}>
        {/* Sky */}
        <rect x="0" y="0" width="120" height="30" fill="#1a1a2e" />
        {/* Building left */}
        <rect x="0" y="10" width="35" height="40" fill="#2a2a2a" />
        <rect x="2" y="14" width="8" height="8" fill="#e89330" opacity="0.4" />
        <rect x="14" y="14" width="8" height="8" fill="#e89330" opacity="0.4" />
        <rect x="26" y="14" width="6" height="8" fill="#e89330" opacity="0.4" />
        <rect x="2" y="28" width="8" height="8" fill="#e89330" opacity="0.4" />
        <rect x="14" y="28" width="8" height="8" fill="#e89330" opacity="0.3" />
        <rect x="26" y="28" width="6" height="8" fill="#e89330" opacity="0.4" />
        {/* Building right */}
        <rect x="80" y="5" width="40" height="45" fill="#222" />
        <rect x="84" y="10" width="8" height="8" fill="#e89330" opacity="0.3" />
        <rect x="96" y="10" width="8" height="8" fill="#e89330" opacity="0.4" />
        <rect x="108" y="10" width="8" height="8" fill="#e89330" opacity="0.3" />
        <rect x="84" y="24" width="8" height="8" fill="#e89330" opacity="0.4" />
        <rect x="96" y="24" width="8" height="8" fill="#e89330" opacity="0.3" />
        <rect x="108" y="24" width="8" height="8" fill="#e89330" opacity="0.4" />
        {/* Street */}
        <rect x="0" y="50" width="120" height="30" fill="#2a2a2a" />
        {/* Road lines */}
        <rect x="0" y="64" width="12" height="2" fill="#444" />
        <rect x="18" y="64" width="12" height="2" fill="#444" />
        <rect x="36" y="64" width="12" height="2" fill="#444" />
        <rect x="54" y="64" width="12" height="2" fill="#444" />
        <rect x="72" y="64" width="12" height="2" fill="#444" />
        <rect x="90" y="64" width="12" height="2" fill="#444" />
        <rect x="108" y="64" width="12" height="2" fill="#444" />
        {/* Lamp post */}
        <rect x="55" y="20" width="2" height="30" fill="#555" />
        <rect x="50" y="18" width="12" height="3" fill="#666" />
        <rect x="52" y="16" width="3" height="3" fill="#e89330" opacity="0.6" />
        {/* Sidewalk */}
        <rect x="0" y="50" width="120" height="4" fill="#333" />
      </svg>
    ),
    basketbolan: (
      <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{imageRendering:'pixelated'}}>
        {/* Sky */}
        <rect x="0" y="0" width="120" height="25" fill="#1a1a2e" />
        {/* Court floor */}
        <rect x="0" y="25" width="120" height="40" fill="#2c2418" />
        {/* Court lines */}
        <rect x="5" y="30" width="110" height="30" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
        <rect x="55" y="25" width="10" height="40" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
        <circle cx="60" cy="45" r="6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
        {/* Hoop left */}
        <rect x="10" y="15" width="2" height="30" fill="#555" />
        <rect x="6" y="14" width="10" height="2" fill="#666" />
        <rect x="6" y="16" width="2" height="2" fill="#cc4444" />
        {/* Hoop right */}
        <rect x="108" y="15" width="2" height="30" fill="#555" />
        <rect x="104" y="14" width="10" height="2" fill="#666" />
        <rect x="112" y="16" width="2" height="2" fill="#cc4444" />
        {/* Fence */}
        <rect x="0" y="0" width="2" height="80" fill="#444" opacity="0.4" />
        <rect x="118" y="0" width="2" height="80" fill="#444" opacity="0.4" />
        {/* Ground */}
        <rect x="0" y="65" width="120" height="15" fill="#222" />
      </svg>
    ),
    tricycleTerminal: (
      <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{imageRendering:'pixelated'}}>
        {/* Sky */}
        <rect x="0" y="0" width="120" height="20" fill="#1a1a2e" />
        {/* Terminal roof */}
        <rect x="5" y="8" width="110" height="4" fill="#333" />
        <rect x="5" y="12" width="2" height="20" fill="#444" />
        <rect x="113" y="12" width="2" height="20" fill="#444" />
        <rect x="50" y="12" width="2" height="20" fill="#444" />
        {/* Tricycle 1 */}
        <rect x="10" y="30" width="20" height="12" fill="#cc5533" />
        <rect x="8" y="28" width="4" height="4" fill="#cc5533" />
        <circle cx="14" cy="44" r="3" fill="#333" />
        <circle cx="26" cy="44" r="3" fill="#333" />
        <rect x="30" y="34" width="8" height="6" fill="#555" />
        <circle cx="36" cy="44" r="3" fill="#333" />
        {/* Tricycle 2 */}
        <rect x="45" y="32" width="20" height="12" fill="#3377cc" />
        <rect x="43" y="30" width="4" height="4" fill="#3377cc" />
        <circle cx="49" cy="46" r="3" fill="#333" />
        <circle cx="61" cy="46" r="3" fill="#333" />
        <rect x="65" y="36" width="8" height="6" fill="#555" />
        <circle cx="71" cy="46" r="3" fill="#333" />
        {/* Tricycle 3 */}
        <rect x="85" y="34" width="20" height="10" fill="#33aa55" />
        <rect x="83" y="32" width="4" height="4" fill="#33aa55" />
        <circle cx="89" cy="46" r="3" fill="#333" />
        <circle cx="101" cy="46" r="3" fill="#333" />
        {/* Ground */}
        <rect x="0" y="50" width="120" height="30" fill="#2a2a2a" />
        {/* Signage */}
        <rect x="40" y="2" width="40" height="6" fill="#e89330" opacity="0.8" />
        <rect x="42" y="3" width="36" height="4" fill="#1a1a1a" />
      </svg>
    ),
    palengke: (
      <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{imageRendering:'pixelated'}}>
        {/* Sky */}
        <rect x="0" y="0" width="120" height="15" fill="#1a1a2e" />
        {/* Market roof */}
        <rect x="0" y="8" width="120" height="6" fill="#3a3a2a" />
        {/* Stalls */}
        <rect x="4" y="16" width="22" height="28" fill="#2a2a1a" />
        <rect x="6" y="18" width="8" height="10" fill="#e89330" opacity="0.5" />
        <rect x="16" y="18" width="8" height="10" fill="#cc5533" opacity="0.5" />
        <rect x="30" y="16" width="22" height="28" fill="#2a2a1a" />
        <rect x="32" y="18" width="8" height="10" fill="#33aa55" opacity="0.5" />
        <rect x="42" y="18" width="8" height="10" fill="#e89330" opacity="0.5" />
        <rect x="56" y="16" width="22" height="28" fill="#2a2a1a" />
        <rect x="58" y="18" width="8" height="10" fill="#cc5533" opacity="0.5" />
        <rect x="68" y="18" width="8" height="10" fill="#3377cc" opacity="0.5" />
        <rect x="82" y="16" width="22" height="28" fill="#2a2a1a" />
        <rect x="84" y="18" width="8" height="10" fill="#e89330" opacity="0.5" />
        <rect x="94" y="18" width="8" height="10" fill="#33aa55" opacity="0.5" />
        {/* People dots */}
        <circle cx="10" cy="50" r="2" fill="#aaa" opacity="0.5" />
        <circle cx="28" cy="52" r="2" fill="#aaa" opacity="0.5" />
        <circle cx="42" cy="48" r="2" fill="#aaa" opacity="0.5" />
        <circle cx="60" cy="50" r="2" fill="#aaa" opacity="0.5" />
        <circle cx="78" cy="48" r="2" fill="#aaa" opacity="0.5" />
        <circle cx="90" cy="52" r="2" fill="#aaa" opacity="0.5" />
        <circle cx="110" cy="50" r="2" fill="#aaa" opacity="0.5" />
        {/* Ground */}
        <rect x="0" y="48" width="120" height="32" fill="#2a2a2a" />
      </svg>
    ),
    highSchool: (
      <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{imageRendering:'pixelated'}}>
        {/* Sky */}
        <rect x="0" y="0" width="120" height="25" fill="#1a1a2e" />
        {/* School building */}
        <rect x="20" y="8" width="80" height="35" fill="#2a2a2a" />
        <rect x="22" y="10" width="12" height="10" fill="#444" />
        <rect x="38" y="10" width="12" height="10" fill="#444" />
        <rect x="54" y="10" width="12" height="10" fill="#444" />
        <rect x="70" y="10" width="12" height="10" fill="#444" />
        <rect x="86" y="10" width="12" height="10" fill="#444" />
        <rect x="22" y="24" width="12" height="10" fill="#444" />
        <rect x="38" y="24" width="12" height="10" fill="#444" />
        <rect x="54" y="24" width="12" height="10" fill="#444" />
        <rect x="70" y="24" width="12" height="10" fill="#444" />
        <rect x="86" y="24" width="12" height="10" fill="#444" />
        {/* Door */}
        <rect x="52" y="30" width="16" height="13" fill="#1a1a1a" />
        {/* Roof */}
        <rect x="15" y="6" width="90" height="3" fill="#444" />
        {/* Gate */}
        <rect x="0" y="35" width="4" height="20" fill="#555" />
        <rect x="116" y="35" width="4" height="20" fill="#555" />
        <rect x="4" y="43" width="112" height="2" fill="#555" />
        {/* School sign */}
        <rect x="40" y="36" width="40" height="5" fill="#e89330" opacity="0.7" />
        {/* Ground */}
        <rect x="0" y="50" width="120" height="30" fill="#2a2a2a" />
      </svg>
    ),
    tabingDagat: (
      <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{imageRendering:'pixelated'}}>
        {/* Night sky */}
        <rect x="0" y="0" width="120" height="25" fill="#0d0d1a" />
        {/* Stars */}
        <rect x="10" y="4" width="1" height="1" fill="#fff" opacity="0.6" />
        <rect x="30" y="8" width="1" height="1" fill="#fff" opacity="0.4" />
        <rect x="55" y="3" width="1" height="1" fill="#fff" opacity="0.7" />
        <rect x="80" y="6" width="1" height="1" fill="#fff" opacity="0.5" />
        <rect x="100" y="2" width="1" height="1" fill="#fff" opacity="0.6" />
        <rect x="70" y="12" width="1" height="1" fill="#fff" opacity="0.4" />
        {/* Moon */}
        <rect x="95" y="4" width="6" height="6" fill="#e8d0a0" opacity="0.6" />
        {/* Ocean */}
        <rect x="0" y="25" width="120" height="35" fill="#0d1a2a" />
        {/* Waves */}
        <rect x="0" y="30" width="120" height="1" fill="#1a3a5a" opacity="0.5" />
        <rect x="10" y="35" width="15" height="1" fill="#1a3a5a" opacity="0.4" />
        <rect x="50" y="40" width="20" height="1" fill="#1a3a5a" opacity="0.4" />
        <rect x="80" y="33" width="12" height="1" fill="#1a3a5a" opacity="0.5" />
        {/* Boat */}
        <rect x="20" y="42" width="15" height="6" fill="#3a2a1a" />
        <rect x="22" y="38" width="2" height="6" fill="#555" />
        <rect x="25" y="36" width="6" height="3" fill="#ddd" opacity="0.3" />
        {/* Palm tree */}
        <rect x="105" y="15" width="2" height="35" fill="#3a2a1a" />
        <rect x="96" y="12" width="20" height="4" fill="#1a4a2a" />
        <rect x="98" y="8" width="16" height="5" fill="#1a5a3a" />
        {/* Shore */}
        <rect x="0" y="60" width="120" height="20" fill="#2a2a1a" />
        {/* Port structure */}
        <rect x="4" y="48" width="4" height="20" fill="#555" />
        <rect x="4" y="46" width="20" height="3" fill="#666" />
      </svg>
    ),
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}>
      {scenery[locationId] || (
        <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{imageRendering:'pixelated'}}>
          <rect x="0" y="0" width="120" height="80" fill="#1a1a1a" />
        </svg>
      )}
    </div>
  );
}
