const ICON_COLORS = {
  windowsillRouter: { body: '#c4956a', accent: '#a0522d', detail: '#6b3a1f', light: '#deb887' },
  ruggedCageBox:   { body: '#b8866a', accent: '#d4a050', detail: '#6b4a2a', light: '#e8c89a' },
  batteryHub:      { body: '#9a8a7a', accent: '#8b6b4a', detail: '#4a3a2a', light: '#c4b49a' },
  dualAntenna:     { body: '#c4a070', accent: '#b8860b', detail: '#6b5020', light: '#e8d0a0' },
  gamingPriority:  { body: '#b89a6a', accent: '#c4953a', detail: '#5a4020', light: '#e0c080' },
  satLink:         { body: '#8a9aaa', accent: '#7a8a9a', detail: '#3a4a5a', light: '#b0c0d0' },
};

function MachineSvg({ type, size, viewBox = '0 0 64 64', parts = {} }) {
  const c = ICON_COLORS[type] || ICON_COLORS.windowsillRouter;
  const {
    reinforcedAntenna, industrialCasing, fiberCable, backupPowerCell,
    coolingSystem, autoTuner, signalBooster, meshExtender
  } = parts;
  const partCount = [reinforcedAntenna, industrialCasing, fiberCable, backupPowerCell,
    coolingSystem, autoTuner, signalBooster, meshExtender].filter(Boolean).length;
  switch (type) {
    case 'windowsillRouter':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Industrial Casing - thicker frame */}
          <rect x={industrialCasing ? "6" : "8"} y={industrialCasing ? "2" : "4"} width={industrialCasing ? "52" : "48"} height={industrialCasing ? "26" : "24"} fill={c.detail} />
          {industrialCasing && <rect x="4" y="0" width="56" height="28" fill="none" stroke={c.accent} strokeWidth="1" />}
          {/* Window frame */}
          <rect x="10" y="6" width="20" height="20" fill="#0f172a" />
          <rect x="34" y="6" width="20" height="20" fill="#0f172a" />
          <rect x="10" y="14" width="44" height="4" fill={c.detail} />
          <rect x="30" y="6" width="4" height="20" fill={c.detail} />
          {/* Router body - wider with casing */}
          <rect x={industrialCasing ? "14" : "16"} y="28" width={industrialCasing ? "36" : "32"} height="20" fill={c.body} />
          <rect x={industrialCasing ? "16" : "18"} y="30" width={industrialCasing ? "32" : "28"} height="8" fill={c.detail} />
          {/* Fiber Cable - glowing line across */}
          {fiberCable && <rect x="16" y="32" width="32" height="2" fill="#00d4ff" opacity="0.8" />}
          {/* Status LEDs */}
          <rect x="22" y="32" width="4" height="4" fill={c.light} />
          {autoTuner && <rect x="26" y="32" width="2" height="4" fill="#e89330" />}
          <rect x="30" y="32" width="4" height="4" fill={c.light} />
          {signalBooster && <rect x="34" y="32" width="2" height="4" fill="#22cc66" />}
          <rect x="38" y="32" width="4" height="4" fill={c.light} />
          {/* Accent bar */}
          <rect x="20" y="40" width="24" height="4" fill={c.accent} />
          {/* Cooling System - fan vents */}
          {coolingSystem && (
            <>
              <rect x="28" y="41" width="8" height="2" fill={c.detail} />
              <rect x="30" y="40" width="4" height="4" fill="#4a6a8a" rx="1" />
            </>
          )}
          {/* Auto-Tuner - tuning knob/screen */}
          {autoTuner && (
            <>
              <rect x="44" y="36" width="6" height="8" fill={c.detail} />
              <rect x="46" y="38" width="2" height="4" fill="#00ff88" opacity="0.7" />
            </>
          )}
          {/* Reinforced Antenna - main antenna on top */}
          <rect x="40" y={reinforcedAntenna ? "16" : "20"} width="4" height={reinforcedAntenna ? "14" : "10"} fill={c.detail} />
          <rect x="38" y={reinforcedAntenna ? "14" : "18"} width="8" height="2" fill={reinforcedAntenna ? '#e89330' : c.accent} />
          {/* Signal Booster - extra antenna */}
          {signalBooster && (
            <>
              <rect x="22" y="18" width="3" height="12" fill={c.detail} />
              <rect x="20" y="16" width="7" height="2" fill="#22cc66" />
            </>
          )}
          {/* Mesh Extender - dish on the side */}
          {meshExtender && (
            <>
              <rect x="8" y="30" width="6" height="10" fill={c.detail} />
              <rect x="6" y="28" width="10" height="4" fill={c.accent} />
              <rect x="10" y="32" width="2" height="6" fill={c.light} />
            </>
          )}
          {/* Backup Power Cell - battery pack on side */}
          {backupPowerCell && (
            <>
              <rect x="48" y="28" width="8" height="12" fill={c.detail} />
              <rect x="50" y="30" width="4" height="4" fill="#22aa55" />
              <rect x="50" y="34" width="4" height="4" fill="#22aa55" />
              <rect x="52" y="26" width="2" height="2" fill={c.accent} />
            </>
          )}
          {/* Base */}
          <rect x={industrialCasing ? "12" : "14"} y="48" width={industrialCasing ? "40" : "36"} height="6" fill={c.detail} />
          <rect x={industrialCasing ? "24" : "26"} y="54" width={industrialCasing ? "16" : "12"} height="4" fill={c.detail} />
        </svg>
      );
    case 'ruggedCageBox':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Industrial Casing - thicker walls */}
          <rect x={industrialCasing ? "6" : "8"} y={industrialCasing ? "6" : "8"} width={industrialCasing ? "52" : "48"} height={industrialCasing ? "48" : "44"} fill={c.body} />
          {industrialCasing && <rect x="4" y="4" width="56" height="52" fill="none" stroke={c.accent} strokeWidth="1" />}
          <rect x="10" y="10" width="44" height="40" fill={c.detail} />
          {/* Vending window */}
          <rect x="16" y="14" width="32" height="16" fill="#0f172a" />
          <rect x="18" y="16" width="28" height="12" fill={c.body} />
          <rect x="22" y="18" width="8" height="8" fill={c.accent} />
          <rect x="34" y="18" width="8" height="8" fill={c.accent} />
          {/* Fiber Cable - glowing line */}
          {fiberCable && <rect x="16" y="26" width="32" height="2" fill="#00d4ff" opacity="0.8" />}
          {/* Cage bars */}
          <rect x="14" y="14" width="2" height="36" fill={c.light} />
          <rect x="48" y="14" width="2" height="36" fill={c.light} />
          <rect x="16" y="14" width="32" height="2" fill={c.light} />
          <rect x="16" y="28" width="32" height="2" fill={c.light} />
          {/* Reinforced Antenna on top */}
          <rect x="28" y={reinforcedAntenna ? "0" : "4"} width="8" height={reinforcedAntenna ? "8" : "6"} fill={c.detail} />
          <rect x="26" y={reinforcedAntenna ? "-2" : "2"} width="12" height="2" fill={reinforcedAntenna ? '#e89330' : c.accent} />
          {/* Signal Booster - extra antenna */}
          {signalBooster && <rect x="44" y="8" width="3" height="8" fill={c.detail} />}
          {signalBooster && <rect x="42" y="6" width="7" height="2" fill="#22cc66" />}
          {/* Keypad */}
          <rect x="20" y="34" width="24" height="6" fill={c.detail} />
          <rect x="22" y="36" width="4" height="2" fill={c.accent} />
          <rect x="28" y="36" width="4" height="2" fill={c.accent} />
          <rect x="34" y="36" width="4" height="2" fill={c.accent} />
          <rect x="40" y="36" width="4" height="2" fill={c.accent} />
          {/* Cooling System - fan vent */}
          {coolingSystem && <rect x="24" y="44" width="16" height="4" fill={c.detail} />}
          {coolingSystem && <rect x="26" y="46" width="12" height="2" fill="#4a6a8a" />}
          {/* Auto-Tuner - display screen */}
          {autoTuner && <rect x="30" y="34" width="4" height="4" fill="#00ff88" opacity="0.7" />}
          {/* Mesh Extender - side dish */}
          {meshExtender && <rect x="8" y="36" width="4" height="8" fill={c.detail} />}
          {meshExtender && <rect x="6" y="34" width="6" height="3" fill={c.accent} />}
          {/* Backup Power Cell */}
          {backupPowerCell && <rect x="50" y="30" width="6" height="12" fill={c.detail} />}
          {backupPowerCell && <rect x="52" y="32" width="2" height="3" fill="#22aa55" />}
          {backupPowerCell && <rect x="52" y="36" width="2" height="3" fill="#22aa55" />}
          {/* Base */}
          <rect x={industrialCasing ? "12" : "14"} y="50" width={industrialCasing ? "40" : "36"} height="4" fill={c.detail} />
        </svg>
      );
    case 'batteryHub':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Industrial Casing - thicker shell */}
          {industrialCasing && <rect x="10" y="8" width="44" height="40" fill="none" stroke={c.accent} strokeWidth="1" />}
          {/* Battery unit */}
          <rect x={industrialCasing ? "11" : "12"} y={industrialCasing ? "9" : "10"} width={industrialCasing ? "42" : "40"} height={industrialCasing ? "38" : "36"} fill={c.body} />
          <rect x="14" y="12" width="36" height="32" fill={c.detail} />
          {/* Battery indicator */}
          <rect x="18" y="16" width="28" height="6" fill={c.accent} />
          <rect x="18" y="24" width="20" height="6" fill={c.accent} />
          <rect x="18" y="32" width="12" height="6" fill={c.accent} />
          {/* Fiber Cable - power line */}
          {fiberCable && <rect x="42" y="24" width="6" height="2" fill="#00d4ff" opacity="0.8" />}
          {/* Reinforced Antenna - taller */}
          <rect x="28" y={reinforcedAntenna ? "0" : "2"} width="8" height={reinforcedAntenna ? "12" : "10"} fill={c.detail} />
          <rect x="26" y={reinforcedAntenna ? "-2" : "0"} width="12" height="2" fill={reinforcedAntenna ? '#e89330' : c.accent} />
          <rect x="24" y="2" width="16" height="2" fill={c.accent} />
          {/* Signal Booster - extra antenna */}
          {signalBooster && <rect x="16" y="8" width="3" height="6" fill={c.detail} />}
          {signalBooster && <rect x="14" y="6" width="7" height="2" fill="#22cc66" />}
          {/* Status LEDs */}
          <rect x="46" y="16" width="4" height="4" fill={c.light} />
          {autoTuner && <rect x="46" y="22" width="4" height="2" fill="#00ff88" opacity="0.7" />}
          {/* Cooling System - vent */}
          {coolingSystem && <rect x="26" y="40" width="12" height="3" fill={c.detail} />}
          {coolingSystem && <rect x="28" y="41" width="8" height="1" fill="#4a6a8a" />}
          {/* Mesh Extender */}
          {meshExtender && <rect x="10" y="30" width="3" height="8" fill={c.detail} />}
          {meshExtender && <rect x="8" y="28" width="5" height="3" fill={c.accent} />}
          {/* Backup Power Cell - extra battery */}
          {backupPowerCell && <rect x="48" y="32" width="8" height="10" fill={c.detail} />}
          {backupPowerCell && <rect x="50" y="34" width="4" height="2" fill="#22aa55" />}
          {backupPowerCell && <rect x="52" y="30" width="2" height="2" fill={c.accent} />}
          {/* Base */}
          <rect x="16" y="46" width="32" height="4" fill={c.detail} />
        </svg>
      );
    case 'dualAntenna':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Industrial Casing - thicker frame */}
          {industrialCasing && <rect x="8" y="14" width="48" height="40" fill="none" stroke={c.accent} strokeWidth="1" />}
          {/* Main body */}
          <rect x={industrialCasing ? "9" : "10"} y={industrialCasing ? "15" : "16"} width={industrialCasing ? "46" : "44"} height={industrialCasing ? "38" : "36"} fill={c.body} />
          <rect x="12" y="18" width="40" height="32" fill={c.detail} />
          {/* Display panel */}
          <rect x="16" y="20" width="32" height="16" fill="#0f172a" />
          <rect x="18" y="22" width="28" height="4" fill={c.accent} />
          <rect x="18" y="28" width="16" height="4" fill={c.accent} />
          <rect x="18" y="34" width="8" height="4" fill={c.accent} />
          {/* Fiber Cable - data line */}
          {fiberCable && <rect x="22" y="30" width="8" height="2" fill="#00d4ff" opacity="0.8" />}
          {/* Antenna left - taller with upgrade */}
          <rect x="18" y={reinforcedAntenna ? "2" : "4"} width="4" height={reinforcedAntenna ? "16" : "14"} fill={c.detail} />
          <rect x="14" y={reinforcedAntenna ? "0" : "2"} width="12" height="2" fill={reinforcedAntenna ? '#e89330' : c.accent} />
          <rect x="16" y="4" width="8" height="2" fill={c.light} />
          {/* Antenna right - taller with upgrade */}
          <rect x="42" y={reinforcedAntenna ? "2" : "4"} width="4" height={reinforcedAntenna ? "16" : "14"} fill={c.detail} />
          <rect x="38" y={reinforcedAntenna ? "0" : "2"} width="12" height="2" fill={reinforcedAntenna ? '#e89330' : c.accent} />
          <rect x="40" y="4" width="8" height="2" fill={c.light} />
          {/* Signal Booster - extra antenna */}
          {signalBooster && <rect x="30" y="8" width="3" height="10" fill={c.detail} />}
          {signalBooster && <rect x="28" y="6" width="7" height="2" fill="#22cc66" />}
          {/* Cooling System - fan */}
          {coolingSystem && <rect x="28" y="40" width="8" height="4" fill={c.detail} />}
          {coolingSystem && <rect x="30" y="41" width="4" height="2" fill="#4a6a8a" />}
          {/* Auto-Tuner - extra display */}
          {autoTuner && <rect x="36" y="28" width="6" height="4" fill={c.detail} />}
          {autoTuner && <rect x="38" y="30" width="2" height="2" fill="#00ff88" opacity="0.7" />}
          {/* Mesh Extender - side dish */}
          {meshExtender && <rect x="8" y="34" width="3" height="8" fill={c.detail} />}
          {meshExtender && <rect x="6" y="32" width="4" height="3" fill={c.accent} />}
          {/* Backup Power Cell */}
          {backupPowerCell && <rect x="50" y="32" width="6" height="10" fill={c.detail} />}
          {backupPowerCell && <rect x="52" y="34" width="2" height="3" fill="#22aa55" />}
          {/* Base */}
          <rect x="14" y="50" width="36" height="4" fill={c.detail} />
        </svg>
      );
    case 'gamingPriority':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Industrial Casing - RGB armor */}
          {industrialCasing && <rect x="8" y="10" width="48" height="44" fill="none" stroke={c.accent} strokeWidth="1" />}
          {/* Gaming box */}
          <rect x={industrialCasing ? "9" : "10"} y={industrialCasing ? "11" : "12"} width={industrialCasing ? "46" : "44"} height={industrialCasing ? "42" : "40"} fill={c.body} />
          <rect x="12" y="14" width="40" height="36" fill={c.detail} />
          {/* RGB strip top */}
          <rect x="16" y="14" width="32" height="4" fill={c.light} />
          {/* Fiber Cable - glowing RGB */}
          {fiberCable && <rect x="16" y="18" width="32" height="2" fill="#00d4ff" opacity="0.8" />}
          {/* Screen */}
          <rect x="18" y="20" width="28" height="14" fill="#0f172a" />
          <rect x="22" y="24" width="8" height="6" fill={c.accent} />
          <rect x="34" y="24" width="8" height="6" fill={c.light} />
          {/* Reinforced Antenna - gaming antenna */}
          <rect x="28" y={reinforcedAntenna ? "4" : "8"} width="8" height={reinforcedAntenna ? "10" : "6"} fill={c.detail} />
          <rect x="26" y={reinforcedAntenna ? "2" : "6"} width="12" height="2" fill={reinforcedAntenna ? '#e89330' : c.accent} />
          {/* Signal Booster - WiFi bars */}
          {signalBooster && <rect x="44" y="20" width="3" height="6" fill={c.detail} />}
          {signalBooster && <rect x="42" y="18" width="7" height="2" fill="#22cc66" />}
          {/* Cooling System - RGB fan */}
          {coolingSystem && <rect x="36" y="36" width="8" height="6" fill={c.detail} />}
          {coolingSystem && <rect x="38" y="38" width="4" height="2" fill="#4a6a8a" />}
          {/* Controller dpad */}
          <rect x="20" y="36" width="24" height="8" fill={c.body} />
          <rect x="28" y="38" width="8" height="4" fill={c.accent} />
          <rect x="24" y="38" width="4" height="4" fill={c.light} />
          <rect x="36" y="38" width="4" height="4" fill={c.light} />
          {/* Auto-Tuner - tuning display */}
          {autoTuner && <rect x="18" y="38" width="4" height="4" fill="#00ff88" opacity="0.7" />}
          {/* Mesh Extender */}
          {meshExtender && <rect x="8" y="36" width="4" height="8" fill={c.detail} />}
          {meshExtender && <rect x="6" y="34" width="4" height="3" fill={c.accent} />}
          {/* Backup Power Cell */}
          {backupPowerCell && <rect x="50" y="34" width="6" height="10" fill={c.detail} />}
          {backupPowerCell && <rect x="52" y="36" width="2" height="3" fill="#22aa55" />}
          {/* RGB strip bottom */}
          <rect x="16" y="48" width="32" height="2" fill={c.light} />
          {/* Base */}
          <rect x="14" y="50" width="36" height="4" fill={c.detail} />
        </svg>
      );
    case 'satLink':
      return (
        <svg width={size} height={size} viewBox={viewBox} style={{ imageRendering: 'pixelated' }}>
          {/* Industrial Casing - reinforced panels */}
          {industrialCasing && <rect x="4" y="34" width="56" height="20" fill="none" stroke={c.accent} strokeWidth="1" />}
          {/* Solar panel base */}
          <rect x="6" y="36" width="52" height="16" fill={c.body} />
          <rect x="8" y="38" width="22" height="12" fill={c.detail} />
          <rect x="34" y="38" width="22" height="12" fill={c.detail} />
          {/* Solar grid lines */}
          <rect x="8" y="42" width="22" height="2" fill={c.accent} />
          <rect x="34" y="42" width="22" height="2" fill={c.accent} />
          <rect x="18" y="38" width="2" height="12" fill={c.accent} />
          <rect x="44" y="38" width="2" height="12" fill={c.accent} />
          {/* Fiber Cable - data link */}
          {fiberCable && <rect x="26" y="44" width="12" height="2" fill="#00d4ff" opacity="0.8" />}
          {/* Satellite dish */}
          <rect x="28" y="12" width="8" height="16" fill={c.detail} />
          <rect x="18" y="20" width="28" height="10" fill={c.body} />
          <rect x="20" y="22" width="24" height="6" fill={c.detail} />
          <rect x="30" y="22" width="4" height="6" fill={c.accent} />
          {/* Reinforced Antenna - taller dish */}
          <rect x="28" y={reinforcedAntenna ? "8" : "12"} width="8" height={reinforcedAntenna ? "20" : "16"} fill={c.detail} />
          <rect x="18" y={reinforcedAntenna ? "18" : "20"} width="28" height="10" fill={c.body} />
          {/* Dish curve */}
          <rect x="16" y="24" width="4" height="2" fill={c.light} />
          <rect x="44" y="24" width="4" height="2" fill={c.light} />
          {/* Signal Booster - extra receiver */}
          {signalBooster && <rect x="10" y="24" width="4" height="6" fill={c.detail} />}
          {signalBooster && <rect x="8" y="22" width="8" height="2" fill="#22cc66" />}
          {/* Receiver arm */}
          <rect x="30" y="8" width="4" height="4" fill={c.detail} />
          <rect x="28" y="6" width="8" height="2" fill={c.accent} />
          {/* Cooling System - heat vents */}
          {coolingSystem && <rect x="20" y="48" width="24" height="3" fill={c.detail} />}
          {coolingSystem && <rect x="22" y="49" width="20" height="1" fill="#4a6a8a" />}
          {/* Auto-Tuner - signal meter */}
          {autoTuner && <rect x="22" y="20" width="4" height="4" fill={c.detail} />}
          {autoTuner && <rect x="24" y="22" width="2" height="2" fill="#00ff88" opacity="0.7" />}
          {/* Mesh Extender - extra dish */}
          {meshExtender && <rect x="46" y="30" width="8" height="6" fill={c.detail} />}
          {meshExtender && <rect x="44" y="28" width="10" height="2" fill={c.accent} />}
          {/* Backup Power Cell */}
          {backupPowerCell && <rect x="50" y="14" width="6" height="10" fill={c.detail} />}
          {backupPowerCell && <rect x="52" y="16" width="2" height="3" fill="#22aa55" />}
          {/* Base stand */}
          <rect x="26" y="50" width="12" height="4" fill={c.detail} />
          <rect x="22" y="52" width="20" height="4" fill={c.detail} />
        </svg>
      );
    default:
      return <svg width={size} height={size} viewBox={viewBox}><rect x="8" y="8" width="48" height="48" fill="#4a5568" /></svg>;
  }
}

export function MachineDisplay({ type, size = 120, showLabel, parts = {}, level = 1, maxLevel = 10 }) {
  const partCount = Object.values(parts).filter(Boolean).length;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <MachineSvg type={type} size={size} viewBox="0 0 64 64" parts={parts} />
      {/* Level bars */}
      <div style={{
        position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '2px', alignItems: 'flex-end',
      }}>
        {Array.from({ length: Math.min(level, 10) }, (_, i) => (
          <div key={i} style={{
            width: '6px', height: `${3 + i * 1.5}px`,
            background: i < 3 ? '#8cb369' : i < 6 ? '#e89330' : i < 9 ? '#ed8936' : '#e53e3e',
            borderRadius: '1px', opacity: 0.9,
          }} />
        ))}
      </div>
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
