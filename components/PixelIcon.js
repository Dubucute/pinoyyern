const ICON_COLORS = {
  windowsillRouter: { body: '#c4956a', accent: '#a0522d', detail: '#6b3a1f', light: '#deb887' },
  ruggedCageBox:   { body: '#b8866a', accent: '#d4a050', detail: '#6b4a2a', light: '#e8c89a' },
  batteryHub:      { body: '#9a8a7a', accent: '#8b6b4a', detail: '#4a3a2a', light: '#c4b49a' },
  dualAntenna:     { body: '#c4a070', accent: '#b8860b', detail: '#6b5020', light: '#e8d0a0' },
  gamingPriority:  { body: '#b89a6a', accent: '#c4953a', detail: '#5a4020', light: '#e0c080' },
  satLink:         { body: '#8a9aaa', accent: '#7a8a9a', detail: '#3a4a5a', light: '#b0c0d0' },
};

function MachineSvg({ type, size, viewBox = '0 0 64 64', partCount = 0 }) {
  const c = ICON_COLORS[type] || ICON_COLORS.windowsillRouter;
  const tier = partCount >= 6 ? 3 : partCount >= 3 ? 2 : partCount >= 1 ? 1 : 0;
  const hasAccent = tier >= 1;
  const hasExtraLEDs = tier >= 2;
  const hasFullUpgrade = tier >= 3;
  const accentGlow = hasFullUpgrade ? c.accent : hasAccent ? c.light : c.detail;
  switch (type) {
    case 'windowsillRouter':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Window frame */}
          <rect x="8" y="4" width="48" height="24" fill={c.detail} />
          <rect x="10" y="6" width="20" height="20" fill="#0f172a" />
          <rect x="34" y="6" width="20" height="20" fill="#0f172a" />
          <rect x="10" y="14" width="44" height="4" fill={c.detail} />
          <rect x="30" y="6" width="4" height="20" fill={c.detail} />
          {/* Router body */}
          <rect x="16" y="28" width="32" height="20" fill={c.body} />
          <rect x="18" y="30" width="28" height="8" fill={c.detail} />
          {/* Status LEDs - more with upgrades */}
          <rect x="22" y="32" width="4" height="4" fill={c.light} />
          {hasExtraLEDs && <rect x="26" y="32" width="2" height="4" fill={accentGlow} />}
          <rect x="30" y="32" width="4" height="4" fill={c.light} />
          {hasExtraLEDs && <rect x="34" y="32" width="2" height="4" fill={accentGlow} />}
          <rect x="38" y="32" width="4" height="4" fill={c.light} />
          {/* Accent bar - brighter with upgrades */}
          <rect x="20" y="40" width="24" height="4" fill={hasFullUpgrade ? accentGlow : c.accent} />
          {/* Extra accent line for upgraded */}
          {hasAccent && <rect x="20" y="44" width="24" height="1" fill={c.light} />}
          {/* Antenna - taller with upgrades */}
          <rect x="40" y={20 - tier * 2} width="4" height={10 + tier * 2} fill={c.detail} />
          <rect x="38" y={18 - tier * 2} width="8" height="2" fill={hasFullUpgrade ? accentGlow : c.accent} />
          {/* Extra antenna for fully upgraded */}
          {hasFullUpgrade && <rect x="30" y="24" width="3" height="6" fill={c.detail} />}
          {hasFullUpgrade && <rect x="29" y="22" width="5" height="2" fill={accentGlow} />}
          {/* Base */}
          <rect x="14" y="48" width="36" height="6" fill={c.detail} />
          <rect x="26" y="54" width="12" height="4" fill={c.detail} />
          {/* Reinforced base for fully upgraded */}
          {hasFullUpgrade && <rect x="22" y="56" width="20" height="2" fill={c.accent} />}
        </svg>
      );
    case 'ruggedCageBox':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Cage box body */}
          <rect x="8" y="8" width="48" height="44" fill={c.body} />
          <rect x="10" y="10" width="44" height="40" fill={c.detail} />
          {/* Vending window */}
          <rect x="16" y="14" width="32" height="16" fill="#0f172a" />
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
          <rect x="16" y="20" width="32" height="16" fill="#0f172a" />
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
          <rect x="18" y="20" width="28" height="14" fill="#0f172a" />
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

export function MachineDisplay({ type, size = 120, showLabel, partCount = 0 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <MachineSvg type={type} size={size} viewBox="0 0 64 64" partCount={partCount} />
      {partCount > 0 && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          background: '#e89330', color: '#141414',
          fontSize: '0.35rem', padding: '1px 3px',
          borderRadius: '2px', fontFamily: "'Press Start 2P', monospace",
          lineHeight: '1', fontWeight: 'bold'
        }}>
          +{partCount}
        </div>
      )}
    </div>
  );
}

export default function PixelIcon({ type, size = 32 }) {
  const icons = {
    antenna: (
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
        <rect x="14" y="2" width="4" height="8" fill="#3b82f6" />
        <rect x="10" y="4" width="12" height="2" fill="#2563eb" />
        <rect x="6" y="6" width="20" height="2" fill="#2563eb" />
        <rect x="12" y="10" width="8" height="4" fill="#1e293b" />
        <rect x="10" y="14" width="12" height="4" fill="#0f172a" />
        <rect x="8" y="18" width="16" height="4" fill="#0f172a" />
        <rect x="12" y="22" width="8" height="8" fill="#1e293b" />
      </svg>
    ),
    marketing: (
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="8" width="24" height="16" fill="#3b82f6" />
        <rect x="6" y="10" width="20" height="12" fill="#1e293b" />
        <rect x="8" y="12" width="8" height="8" fill="#93c5fd" />
        <rect x="18" y="12" width="8" height="8" fill="#93c5fd" />
        <rect x="10" y="14" width="4" height="4" fill="#3b82f6" />
        <rect x="20" y="14" width="4" height="4" fill="#3b82f6" />
        <rect x="12" y="24" width="8" height="4" fill="#0f172a" />
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
