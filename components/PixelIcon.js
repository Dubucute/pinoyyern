const ICON_COLORS = {
  windowsillRouter: { body: '#5c7a3a', accent: '#8cb369', detail: '#3d4a35', light: '#c4d4a8' },
  ruggedCageBox:   { body: '#6b4a3a', accent: '#c4a265', detail: '#4a3528', light: '#d4b87a' },
  batteryHub:      { body: '#2a3d2b', accent: '#7ab8c9', detail: '#1a2d1a', light: '#b0d4e0' },
  dualAntenna:     { body: '#4a3d2e', accent: '#c4956a', detail: '#2d2a1a', light: '#d4b49a' },
  gamingPriority:  { body: '#3d2e1f', accent: '#f0c05a', detail: '#2a1f0a', light: '#f5d88a' },
  satLink:         { body: '#1a2d3d', accent: '#7ab8c9', detail: '#0f1a2d', light: '#b0d4e0' },
};

function MachineSvg({ type, size, viewBox = '0 0 64 64' }) {
  const c = ICON_COLORS[type] || ICON_COLORS.windowsillRouter;
  switch (type) {
    case 'windowsillRouter':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Window frame */}
          <rect x="8" y="4" width="48" height="24" fill={c.detail} />
          <rect x="10" y="6" width="20" height="20" fill="#2a3d2b" />
          <rect x="34" y="6" width="20" height="20" fill="#2a3d2b" />
          <rect x="10" y="14" width="44" height="4" fill={c.detail} />
          <rect x="30" y="6" width="4" height="20" fill={c.detail} />
          {/* Router body */}
          <rect x="16" y="28" width="32" height="20" fill={c.body} />
          <rect x="18" y="30" width="28" height="8" fill={c.detail} />
          <rect x="22" y="32" width="4" height="4" fill={c.light} />
          <rect x="30" y="32" width="4" height="4" fill={c.light} />
          <rect x="38" y="32" width="4" height="4" fill={c.light} />
          <rect x="20" y="40" width="24" height="4" fill={c.accent} />
          {/* Antenna */}
          <rect x="40" y="20" width="4" height="10" fill={c.detail} />
          <rect x="38" y="18" width="8" height="2" fill={c.accent} />
          {/* Base */}
          <rect x="14" y="48" width="36" height="6" fill={c.detail} />
          <rect x="26" y="54" width="12" height="4" fill={c.detail} />
        </svg>
      );
    case 'ruggedCageBox':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Cage box body */}
          <rect x="8" y="8" width="48" height="44" fill={c.body} />
          <rect x="10" y="10" width="44" height="40" fill={c.detail} />
          {/* Vending window */}
          <rect x="16" y="14" width="32" height="16" fill="#2a3d2b" />
          <rect x="18" y="16" width="28" height="12" fill={c.body} />
          <rect x="22" y="18" width="8" height="8" fill={c.accent} />
          <rect x="34" y="18" width="8" height="8" fill={c.accent} />
          {/* Cage bars */}
          <rect x="14" y="14" width="2" height="36" fill={c.light} />
          <rect x="48" y="14" width="2" height="36" fill={c.light} />
          <rect x="16" y="14" width="32" height="2" fill={c.light} />
          <rect x="16" y="28" width="32" height="2" fill={c.light} />
          {/* Keypad */}
          <rect x="20" y="34" width="24" height="6" fill={c.detail} />
          <rect x="22" y="36" width="4" height="2" fill={c.accent} />
          <rect x="28" y="36" width="4" height="2" fill={c.accent} />
          <rect x="34" y="36" width="4" height="2" fill={c.accent} />
          <rect x="40" y="36" width="4" height="2" fill={c.accent} />
          {/* Base */}
          <rect x="14" y="50" width="36" height="4" fill={c.detail} />
        </svg>
      );
    case 'batteryHub':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Battery unit */}
          <rect x="12" y="10" width="40" height="36" fill={c.body} />
          <rect x="14" y="12" width="36" height="32" fill={c.detail} />
          {/* Battery indicator */}
          <rect x="18" y="16" width="28" height="6" fill={c.accent} />
          <rect x="18" y="24" width="20" height="6" fill={c.accent} />
          <rect x="18" y="32" width="12" height="6" fill={c.accent} />
          {/* Antenna */}
          <rect x="28" y="2" width="8" height="10" fill={c.detail} />
          <rect x="26" y="0" width="12" height="2" fill={c.accent} />
          <rect x="24" y="2" width="16" height="2" fill={c.accent} />
          {/* Status LED */}
          <rect x="46" y="16" width="4" height="4" fill={c.light} />
          {/* Base */}
          <rect x="16" y="46" width="32" height="4" fill={c.detail} />
        </svg>
      );
    case 'dualAntenna':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Main body */}
          <rect x="10" y="16" width="44" height="36" fill={c.body} />
          <rect x="12" y="18" width="40" height="32" fill={c.detail} />
          {/* Display panel */}
          <rect x="16" y="20" width="32" height="16" fill="#2a3d2b" />
          <rect x="18" y="22" width="28" height="4" fill={c.accent} />
          <rect x="18" y="28" width="16" height="4" fill={c.accent} />
          <rect x="18" y="34" width="8" height="4" fill={c.accent} />
          {/* Antenna left */}
          <rect x="18" y="4" width="4" height="14" fill={c.detail} />
          <rect x="14" y="2" width="12" height="2" fill={c.accent} />
          <rect x="16" y="4" width="8" height="2" fill={c.light} />
          {/* Antenna right */}
          <rect x="42" y="4" width="4" height="14" fill={c.detail} />
          <rect x="38" y="2" width="12" height="2" fill={c.accent} />
          <rect x="40" y="4" width="8" height="2" fill={c.light} />
          {/* Base */}
          <rect x="14" y="50" width="36" height="4" fill={c.detail} />
        </svg>
      );
    case 'gamingPriority':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Gaming box */}
          <rect x="10" y="12" width="44" height="40" fill={c.body} />
          <rect x="12" y="14" width="40" height="36" fill={c.detail} />
          {/* RGB strip top */}
          <rect x="16" y="14" width="32" height="4" fill={c.light} />
          {/* Screen */}
          <rect x="18" y="20" width="28" height="14" fill="#2a3d2b" />
          <rect x="22" y="24" width="8" height="6" fill={c.accent} />
          <rect x="34" y="24" width="8" height="6" fill={c.light} />
          {/* Controller dpad */}
          <rect x="20" y="36" width="24" height="8" fill={c.body} />
          <rect x="28" y="38" width="8" height="4" fill={c.accent} />
          <rect x="24" y="38" width="4" height="4" fill={c.light} />
          <rect x="36" y="38" width="4" height="4" fill={c.light} />
          {/* RGB strip bottom */}
          <rect x="16" y="48" width="32" height="2" fill={c.light} />
          {/* Base */}
          <rect x="14" y="50" width="36" height="4" fill={c.detail} />
        </svg>
      );
    case 'satLink':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Solar panel base */}
          <rect x="6" y="36" width="52" height="16" fill={c.body} />
          <rect x="8" y="38" width="22" height="12" fill={c.detail} />
          <rect x="34" y="38" width="22" height="12" fill={c.detail} />
          {/* Solar grid lines */}
          <rect x="8" y="42" width="22" height="2" fill={c.accent} />
          <rect x="34" y="42" width="22" height="2" fill={c.accent} />
          <rect x="18" y="38" width="2" height="12" fill={c.accent} />
          <rect x="44" y="38" width="2" height="12" fill={c.accent} />
          {/* Satellite dish */}
          <rect x="28" y="12" width="8" height="16" fill={c.detail} />
          <rect x="18" y="20" width="28" height="10" fill={c.body} />
          <rect x="20" y="22" width="24" height="6" fill={c.detail} />
          <rect x="30" y="22" width="4" height="6" fill={c.accent} />
          {/* Dish curve */}
          <rect x="16" y="24" width="4" height="2" fill={c.light} />
          <rect x="44" y="24" width="4" height="2" fill={c.light} />
          {/* Receiver arm */}
          <rect x="30" y="8" width="4" height="4" fill={c.detail} />
          <rect x="28" y="6" width="8" height="2" fill={c.accent} />
          {/* Base stand */}
          <rect x="26" y="50" width="12" height="4" fill={c.detail} />
          <rect x="22" y="52" width="20" height="4" fill={c.detail} />
        </svg>
      );
    default:
      return <svg width={size} height={size} viewBox={viewBox}><rect x="8" y="8" width="48" height="48" fill="#4a5568" /></svg>;
  }
}

export function MachineDisplay({ type, size = 120, showLabel }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <MachineSvg type={type} size={size} viewBox="0 0 64 64" />
    </div>
  );
}

export default function PixelIcon({ type, size = 32 }) {
  const icons = {
    antenna: (
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
        <rect x="14" y="2" width="4" height="8" fill="#8cb369" />
        <rect x="10" y="4" width="12" height="2" fill="#7a9c4a" />
        <rect x="6" y="6" width="20" height="2" fill="#7a9c4a" />
        <rect x="12" y="10" width="8" height="4" fill="#5c7a3a" />
        <rect x="10" y="14" width="12" height="4" fill="#3d4a35" />
        <rect x="8" y="18" width="16" height="4" fill="#3d4a35" />
        <rect x="12" y="22" width="8" height="8" fill="#5c7a3a" />
      </svg>
    ),
    marketing: (
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="8" width="24" height="16" fill="#8cb369" />
        <rect x="6" y="10" width="20" height="12" fill="#6b8f3e" />
        <rect x="8" y="12" width="8" height="8" fill="#a4c639" />
        <rect x="18" y="12" width="8" height="8" fill="#a4c639" />
        <rect x="10" y="14" width="4" height="4" fill="#7a9c4a" />
        <rect x="20" y="14" width="4" height="4" fill="#7a9c4a" />
        <rect x="12" y="24" width="8" height="4" fill="#3d4a35" />
      </svg>
    ),
  };
  // Machine type icons (32px for shop display)
  const machineIcons = {
    windowsillRouter: <MachineSvg type="windowsillRouter" size={size} viewBox="0 0 64 64" />,
    ruggedCageBox: <MachineSvg type="ruggedCageBox" size={size} viewBox="0 0 64 64" />,
    batteryHub: <MachineSvg type="batteryHub" size={size} viewBox="0 0 64 64" />,
    dualAntenna: <MachineSvg type="dualAntenna" size={size} viewBox="0 0 64 64" />,
    gamingPriority: <MachineSvg type="gamingPriority" size={size} viewBox="0 0 64 64" />,
    satLink: <MachineSvg type="satLink" size={size} viewBox="0 0 64 64" />,
  };
  return icons[type] || machineIcons[type] || null;
}
