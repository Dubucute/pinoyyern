import Head from 'next/head';
import { useState, useEffect, useRef, useCallback } from 'react';
import { LOCATIONS, DISKARTE_UPGRADES, PACKAGE_UPGRADES, NETWORK_SPEEDS, ACHIEVEMENTS, PRESTIGE_UPGRADES } from '../config/gameData';
import {
  createMachineId, getLocationMachineCost, getMachineUpgradeCost, getMachineSellValue,
  MACHINE_MAX_LEVEL, calculatePps, calculateActiveUsers, calculateClickValue,
  calculatePrestigePoints, getAllMachinesFlat, getDerivedTotalMachines,
  getLocalUpgradeCount, formatTimeAgo,
} from '../utils/helpers';
import useSound from '../hooks/useSound';
import useBackgroundMusic from '../hooks/useBackgroundMusic';
import PixelIcon, { MachineDisplay } from '../components/PixelIcon';
import FloatingText from '../components/FloatingText';
import LocalUpgradeCard from '../components/LocalUpgradeCard';
import AchievementToast, { AchievementPanel } from '../components/AchievementToast';
import PrestigePanel from '../components/PrestigePanel';
import MachineDetail from '../components/MachineDetail';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

const SAVE_VERSION = 2;
const LOCATION_ICONS = ['📍', '🏀', '🛺', '🛒', '🏫', '🏖️'];

export default function Home() {
  const { playClick, playBuy, playUpgrade, playSlotUpgrade, playLocationChange } = useSound();
  const bgMusic = useBackgroundMusic();
  const [musicOn, setMusicOn] = useState(false);
  const firstInteractionRef = useRef(true);

  // ===== Core State =====
  const [pesos, setPesos] = useState(0);
  const [machinesByLocation, setMachinesByLocation] = useState(LOCATIONS.map(() => []));
  const [localUpgrades, setLocalUpgrades] = useState(LOCATIONS.map(() => ({})));
  const [unlockedLocations, setUnlockedLocations] = useState([0]);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [upgrades, setUpgrades] = useState({ longRangeAntenna: false, maritesMarketing: false });
  const [packageUpgrades, setPackageUpgrades] = useState({ student: false, regular: false, unlimited: false });
  const [currentSpeed, setCurrentSpeed] = useState('3g');

  // ===== Derived =====
  const allMachines = getAllMachinesFlat(machinesByLocation);
  const totalMachines = getDerivedTotalMachines(machinesByLocation);
  const loc = LOCATIONS[currentLocation];
  const locationMachines = machinesByLocation[currentLocation] || [];
  const machineCount = locationMachines.length;

  // ===== UI State =====
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [isPressed, setIsPressed] = useState(false);
  const clickAreaRef = useRef(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [achievementToast, setAchievementToast] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [detailMachineId, setDetailMachineId] = useState(null);
  const prevCheckStateRef = useRef('');
  const [showGlobalShop, setShowGlobalShop] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('');
  const { user, token, logout, saveToCloud, loadFromCloud } = useAuth();

  // ===== Prestige =====
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [prestigeUpgrades, setPrestigeUpgrades] = useState({});
  const prestigeIncomeMult = PRESTIGE_UPGRADES.find(u => u.id === 'incomeBoost')?.effect(prestigeUpgrades.incomeBoost || 0) || 1;
  const prestigeClickBonus = PRESTIGE_UPGRADES.find(u => u.id === 'clickBoost')?.effect(prestigeUpgrades.clickBoost || 0) || 0;
  const prestigeSpeedMult = PRESTIGE_UPGRADES.find(u => u.id === 'speedBoost')?.effect(prestigeUpgrades.speedBoost || 0) || 1;
  const prestigeStartingMoney = PRESTIGE_UPGRADES.find(u => u.id === 'headStart')?.effect(prestigeUpgrades.headStart || 0) || 0;

  // ===== Computed values =====
  const speedMultiplier = NETWORK_SPEEDS.find(s => s.id === currentSpeed)?.speedMultiplier || 1;
  const pps = calculatePps(machinesByLocation, localUpgrades, speedMultiplier, prestigeIncomeMult, prestigeSpeedMult);
  const activeUsers = calculateActiveUsers(machinesByLocation);
  const currentClickValue = calculateClickValue(packageUpgrades, upgrades, localUpgrades, currentLocation) + prestigeClickBonus;
  const localUpgradeCount = getLocalUpgradeCount(localUpgrades);

  // Location machine cost
  const nextMachineCost = getLocationMachineCost(currentLocation, machineCount, localUpgrades[currentLocation]);
  const canBuyMachine = pesos >= nextMachineCost;

  // ===== Save / Load =====
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('piso-wifi-empire-state') : null;
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.version === SAVE_VERSION) {
          setPesos(data.pesos || 0);
          if (data.machinesByLocation) setMachinesByLocation(data.machinesByLocation);
          if (data.localUpgrades) setLocalUpgrades(data.localUpgrades);
          if (data.unlockedLocations) setUnlockedLocations(data.unlockedLocations);
          setCurrentLocation(Math.min(data.currentLocation || 0, LOCATIONS.length - 1));
          setUpgrades(data.upgrades || { longRangeAntenna: false, maritesMarketing: false });
          setCurrentSpeed(data.currentSpeed || '3g');
          setPackageUpgrades(data.packageUpgrades || { student: false, regular: false, unlimited: false });
          setUnlockedAchievements(data.unlockedAchievements || []);
          setTotalEarned(data.totalEarned || 0);
          setTotalClicks(data.totalClicks || 0);
          setPrestigePoints(data.prestigePoints || 0);
          setPrestigeUpgrades(data.prestigeUpgrades || {});
          if (!data.pesos || data.pesos === 0) {
            const hs = data.prestigeUpgrades?.headStart || 0;
            if (hs > 0) setPesos(PRESTIGE_UPGRADES.find(u => u.id === 'headStart').effect(hs));
          }
        }
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const state = {
        version: SAVE_VERSION, pesos, machinesByLocation, localUpgrades, unlockedLocations,
        currentLocation, upgrades, currentSpeed, packageUpgrades, unlockedAchievements,
        totalEarned, totalClicks, prestigePoints, prestigeUpgrades,
      };
      localStorage.setItem('piso-wifi-empire-state', JSON.stringify(state));
    }, 10000);
    return () => clearInterval(id);
  }, [pesos, machinesByLocation, localUpgrades, unlockedLocations, currentLocation, upgrades, currentSpeed, packageUpgrades, unlockedAchievements, totalEarned, totalClicks, prestigePoints, prestigeUpgrades]);

  // ===== Cloud Save (auto every 30s when logged in) =====
  useEffect(() => {
    if (!token || !user) return;
    const id = setInterval(async () => {
      const state = {
        version: SAVE_VERSION, pesos, machinesByLocation, localUpgrades, unlockedLocations,
        currentLocation, upgrades, currentSpeed, packageUpgrades, unlockedAchievements,
        totalEarned, totalClicks, prestigePoints, prestigeUpgrades,
      };
      try {
        await saveToCloud(state);
        setCloudStatus('☁️');
        setTimeout(() => setCloudStatus(''), 3000);
      } catch (_) {}
    }, 30000);
    return () => clearInterval(id);
  }, [token, user, pesos, machinesByLocation, localUpgrades, unlockedLocations, currentLocation, upgrades, currentSpeed, packageUpgrades, unlockedAchievements, totalEarned, totalClicks, prestigePoints, prestigeUpgrades, saveToCloud]);

  // ===== Income Tick =====
  useEffect(() => {
    const tick = setInterval(() => {
      const tickIncome = pps / 10;
      if (tickIncome <= 0) return;
      setPesos((p) => p + tickIncome);
      setTotalEarned((t) => t + tickIncome);
      setMachinesByLocation((prev) => {
        const totalWeight = prev.reduce((sum, machines, locIdx) => {
          const location = LOCATIONS[locIdx];
          if (!location) return sum;
          return sum + machines.reduce((s, m) => s + location.machine.baseIncome * (m.level || 1), 0);
        }, 0);
        if (totalWeight <= 0) return prev;
        return prev.map((machines, locIdx) => {
          const location = LOCATIONS[locIdx];
          if (!location) return machines;
          return machines.map(m => ({
            ...m,
            earnings: m.earnings + (tickIncome * (location.machine.baseIncome * (m.level || 1)) / totalWeight),
          }));
        });
      });
    }, 100);
    return () => clearInterval(tick);
  }, [pps]);

  // ===== Achievement Check =====
  useEffect(() => {
    const state = {
      totalEarned, totalClicks, totalMachines,
      unlockedCount: unlockedLocations.length,
      currentPps: pps, currentSpeed,
      localUpgradeCount,
      allDiskarte: upgrades.longRangeAntenna && upgrades.maritesMarketing,
      allPackages: packageUpgrades.student && packageUpgrades.regular && packageUpgrades.unlimited,
    };
    const snapshot = JSON.stringify(state);
    if (snapshot === prevCheckStateRef.current) return;
    prevCheckStateRef.current = snapshot;
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedAchievements.includes(ach.id) && ach.check(state)) newlyUnlocked.push(ach.id);
    });
    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...new Set([...prev, ...newlyUnlocked])]);
      const firstNew = ACHIEVEMENTS.find(a => a.id === newlyUnlocked[0]);
      if (firstNew) { setAchievementToast(firstNew); setTimeout(() => setAchievementToast(null), 4000); }
    }
  }, [totalEarned, totalClicks, totalMachines, unlockedLocations, pps, currentSpeed, localUpgradeCount, upgrades, packageUpgrades, unlockedAchievements]);

  // ===== Event Handlers =====
  const handleClick = (e) => {
    setPesos((p) => p + currentClickValue);
    setTotalEarned((t) => t + currentClickValue);
    setTotalClicks((c) => c + 1);
    setIsPressed(true); playClick();
    if (firstInteractionRef.current) {
      firstInteractionRef.current = false;
      bgMusic.start();
      setMusicOn(true);
    }
    setTimeout(() => setIsPressed(false), 100);
    if (clickAreaRef.current) {
      const rect = clickAreaRef.current.getBoundingClientRect();
      const id = Date.now();
      setFloatingTexts(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, value: currentClickValue }]);
    }
  };
  const removeFloatingText = (id) => setFloatingTexts(prev => prev.filter(t => t.id !== id));

  const purchaseMachine = () => {
    if (!canBuyMachine) return;
    const cost = nextMachineCost;
    setPesos((p) => p - cost);
    setTotalEarned((t) => t + cost);
    const newMachine = {
      id: createMachineId(currentLocation, machineCount, Date.now()),
      level: 1,
      earnings: 0,
      purchasedAt: Date.now(),
      purchaseCost: cost,
      name: null,
    };
    setMachinesByLocation((prev) => {
      const next = [...prev];
      next[currentLocation] = [...next[currentLocation], newMachine];
      return next;
    });
    playBuy();
  };

  const purchaseLocalUpgrade = (upgradeId) => {
    const upgradeDef = loc.localUpgrades.find(u => u.id === upgradeId);
    if (!upgradeDef) return;
    if (localUpgrades[currentLocation]?.[upgradeId]) return;
    if (pesos < upgradeDef.cost) return;
    setPesos((p) => p - upgradeDef.cost);
    setTotalEarned((t) => t + upgradeDef.cost);
    setLocalUpgrades((prev) => {
      const next = [...prev];
      next[currentLocation] = { ...next[currentLocation], [upgradeId]: true };
      return next;
    });
    playUpgrade();
  };

  const handleLocationClick = (idx) => {
    if (idx === currentLocation) return;
    // If locked
    if (!unlockedLocations.includes(idx)) {
      const cost = LOCATIONS[idx].unlockCost;
      if (pesos >= cost) {
        setPesos((p) => p - cost);
        setTotalEarned((t) => t + cost);
        setUnlockedLocations((prev) => [...prev, idx]);
        setCurrentLocation(idx);
        playLocationChange();
      }
      return;
    }
    setCurrentLocation(idx);
    setDetailMachineId(null);
    playLocationChange();
  };

  const purchaseUpgrade = (upgrade) => {
    if (upgrades[upgrade.id]) return;
    const cost = upgrade.cost ?? 0;
    if (pesos >= cost) { setPesos((p) => p - cost); setTotalEarned((t) => t + cost); setUpgrades((u) => ({ ...u, [upgrade.id]: true })); playUpgrade(); }
  };
  const purchasePackage = (pkg) => {
    if (packageUpgrades[pkg.id]) return;
    if (pesos >= pkg.cost) { setPesos((p) => p - pkg.cost); setTotalEarned((t) => t + pkg.cost); setPackageUpgrades((u) => ({ ...u, [pkg.id]: true })); playUpgrade(); }
  };
  const purchaseSpeed = (speed) => {
    const currentSpd = NETWORK_SPEEDS.find(s => s.id === currentSpeed);
    const targetSpd = NETWORK_SPEEDS.find(s => s.id === speed.id);
    if (pesos >= targetSpd.baseCost && targetSpd.baseCost > currentSpd.baseCost) { setPesos((p) => p - targetSpd.baseCost); setTotalEarned((t) => t + targetSpd.baseCost); setCurrentSpeed(speed.id); playUpgrade(); }
  };

  // ===== Cloud Load (after login) =====
  const handleCloudLoad = useCallback(async () => {
    try {
      const cloudState = await loadFromCloud();
      if (!cloudState) {
        setCloudStatus('☁️ No cloud save');
        setTimeout(() => setCloudStatus(''), 2000);
        return;
      }
      // Merge cloud state into current game
      setPesos(cloudState.pesos || 0);
      if (cloudState.machinesByLocation) setMachinesByLocation(cloudState.machinesByLocation);
      if (cloudState.localUpgrades) setLocalUpgrades(cloudState.localUpgrades);
      if (cloudState.unlockedLocations) setUnlockedLocations(cloudState.unlockedLocations);
      setCurrentLocation(Math.min(cloudState.currentLocation || 0, LOCATIONS.length - 1));
      setUpgrades(cloudState.upgrades || { longRangeAntenna: false, maritesMarketing: false });
      setCurrentSpeed(cloudState.currentSpeed || '3g');
      setPackageUpgrades(cloudState.packageUpgrades || { student: false, regular: false, unlimited: false });
      setUnlockedAchievements(cloudState.unlockedAchievements || []);
      setTotalEarned(cloudState.totalEarned || 0);
      setTotalClicks(cloudState.totalClicks || 0);
      setPrestigePoints(cloudState.prestigePoints || 0);
      setPrestigeUpgrades(cloudState.prestigeUpgrades || {});
      setCloudStatus('☁️ Loaded!');
      setTimeout(() => setCloudStatus(''), 3000);
    } catch (_) {
      setCloudStatus('☁️ Load failed');
      setTimeout(() => setCloudStatus(''), 2000);
    }
  }, [loadFromCloud]);

  // Machine detail callbacks
  const detailMachine = detailMachineId ? allMachines.find(m => m.id === detailMachineId) : null;

  const upgradeMachineById = useCallback((machineId) => {
    const flat = getAllMachinesFlat(machinesByLocation);
    const machine = flat.find(m => m.id === machineId);
    if (!machine || machine.level >= MACHINE_MAX_LEVEL) return;
    const cost = getMachineUpgradeCost(machine.asset, machine.level, localUpgrades[machine.locationIndex]);
    if (pesos >= cost) {
      setPesos((p) => p - cost);
      setTotalEarned((t) => t + cost);
      setMachinesByLocation((prev) => {
        const next = [...prev];
        next[machine.locationIndex] = next[machine.locationIndex].map(m =>
          m.id === machineId ? { ...m, level: (m.level || 1) + 1 } : m
        );
        return next;
      });
      playSlotUpgrade();
    }
  }, [machinesByLocation, pesos, localUpgrades, playSlotUpgrade]);

  const renameMachineById = useCallback((machineId, newName) => {
    setMachinesByLocation((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        const idx = next[i].findIndex(m => m.id === machineId);
        if (idx !== -1) {
          next[i] = [...next[i]];
          next[i][idx] = { ...next[i][idx], name: newName };
          break;
        }
      }
      return next;
    });
    playSlotUpgrade();
  }, [playSlotUpgrade]);

  const sellMachineById = useCallback((machineId) => {
    const flat = getAllMachinesFlat(machinesByLocation);
    const machine = flat.find(m => m.id === machineId);
    if (!machine) return;
    const sellValue = getMachineSellValue(machine, machine.asset);
    setPesos((p) => p + sellValue);
    setMachinesByLocation((prev) => {
      const next = [...prev];
      next[machine.locationIndex] = next[machine.locationIndex].filter(m => m.id !== machineId);
      return next;
    });
    setDetailMachineId(null);
    playBuy();
  }, [machinesByLocation, playBuy]);

  const closeMachineDetail = () => setDetailMachineId(null);

  // ===== Prestige =====
  const availablePrestigePoints = calculatePrestigePoints(totalEarned, prestigePoints);
  const canPrestige = availablePrestigePoints > prestigePoints;

  const doPrestige = () => {
    if (!canPrestige) return;
    const newPoints = availablePrestigePoints;
    setPesos(prestigeStartingMoney);
    setTotalEarned(0); setTotalClicks(0);
    setMachinesByLocation(LOCATIONS.map(() => []));
    setLocalUpgrades(LOCATIONS.map(() => ({})));
    setUnlockedLocations([0]);
    setCurrentLocation(0);
    setUpgrades({ longRangeAntenna: false, maritesMarketing: false });
    setPackageUpgrades({ student: false, regular: false, unlimited: false });
    setCurrentSpeed('3g'); setAchievementToast(null);
    setPrestigePoints(newPoints);
    setDetailMachineId(null);
  };

  const purchasePrestigeUpgrade = (upgradeId) => {
    const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const currentLevel = prestigeUpgrades[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) return;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    if (prestigePoints < cost) return;
    setPrestigePoints((p) => p - cost);
    setPrestigeUpgrades((prev) => ({ ...prev, [upgradeId]: (prev[upgradeId] || 0) + 1 }));
  };

  const resetGame = () => {
    setPesos(0);
    setMachinesByLocation(LOCATIONS.map(() => []));
    setLocalUpgrades(LOCATIONS.map(() => ({})));
    setUnlockedLocations([0]);
    setCurrentLocation(0);
    setUpgrades({ longRangeAntenna: false, maritesMarketing: false });
    setPackageUpgrades({ student: false, regular: false, unlimited: false });
    setCurrentSpeed('3g'); setUnlockedAchievements([]); setTotalEarned(0); setTotalClicks(0);
    setAchievementToast(null); setPrestigePoints(0); setPrestigeUpgrades({}); setDetailMachineId(null);
    if (typeof window !== 'undefined') localStorage.removeItem('piso-wifi-empire-state');
  };

  // ===== Render =====
  return (
    <>
      <Head>
        <title>Piso Wifi Barangay Empire</title>
        <meta name="description" content="Retro pixel-art idle tycoon game — build your barangay wifi empire!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2a3d2b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </Head>
      <main className="game-container">
        {/* ===== HEADER ===== */}
        <header className="game-header">
          <div className="header-left">
            <h1 className="game-title">PISO WIFI BARANGAY EMPIRE</h1>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-label">KITA:</span>
              <span className="header-stat-value money">₱{Math.floor(pesos).toLocaleString()}</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-label">TOTAL INLINE SPEED:</span>
              <span className="header-stat-value speed">{Math.round(pps).toLocaleString()} Mbps</span>
            </div>
          </div>
          <div className="header-buttons">
            <button className="achievements-button" onClick={() => setShowAchievements(true)}>🏆 {unlockedAchievements.length}/{ACHIEVEMENTS.length}</button>
            <button className="prestige-header-button" onClick={() => setShowPrestige(true)}>⭐ {prestigePoints}</button>
            {user ? (
              <button className="auth-header-button logged-in" onClick={() => { logout(); setCloudStatus('☁️ Logged out'); setTimeout(() => setCloudStatus(''), 2000); }}>
                👤 {user.username}
              </button>
            ) : (
              <button className="auth-header-button" onClick={() => setShowAuthModal(true)}>
                🔐 LOGIN
              </button>
            )}
            <span className="cloud-status">{cloudStatus}</span>
            <button className={`music-button ${musicOn ? 'on' : 'off'}`} onClick={() => {
              if (firstInteractionRef.current) { firstInteractionRef.current = false; bgMusic.start(); setMusicOn(true); }
              else { const nowMuted = bgMusic.toggleMute(); setMusicOn(!nowMuted); }
            }}>{musicOn ? '♪' : '✕'}</button>
            <button className="reset-button" onClick={resetGame}>RESET</button>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <div className="main-content">
          {/* Viewport */}
          <section className="viewport" ref={clickAreaRef} style={{ backgroundColor: loc?.bgColor || '#2a3d2b' }}>
            <div className="viewport-header">
              <div className="viewport-location-name" style={{ color: loc?.accentColor || '#8cb369' }}>
                {LOCATION_ICONS[currentLocation]} {loc?.name || 'Unknown'}
              </div>
              <div className="viewport-location-subtitle">{loc?.subtitle || ''}</div>
            </div>
            <div className="viewport-machine-area">
              <div className={`clickable-machine ${isPressed ? 'pressed' : ''}`} onClick={handleClick}>
                {loc && (
                  <div className="machine-svg-wrapper">
                    <MachineDisplay type={loc.machine.id} size={140} />
                    {/* Level indicator dots */}
                    <div className="machine-pulse-ring" style={{ borderColor: loc.accentColor }} />
                  </div>
                )}
              </div>
              <div className="viewport-click-hint">
                CLICK TO EARN ₱{currentClickValue}
              </div>
            </div>
            {/* Location background decoration */}
            <div className="viewport-decor">
              <div className="deco-line" style={{ background: loc?.accentColor || '#8cb369' }} />
              <div className="viewport-desc">{loc?.description || ''}</div>
              <div className="deco-line" style={{ background: loc?.accentColor || '#8cb369' }} />
            </div>
            {floatingTexts.map(text => (
              <FloatingText key={text.id} x={text.x} y={text.y} value={text.value} onAnimationEnd={() => removeFloatingText(text.id)} />
            ))}
          </section>

          {/* Control Hub */}
          <aside className="control-hub">
            {/* Stats row */}
            <div className="hub-stats-row">
              <div className="hub-stat"><span className="hub-stat-label">ACTIVE USERS</span><span className="hub-stat-value">{activeUsers}</span></div>
              <div className="hub-stat"><span className="hub-stat-label">CLICK VALUE</span><span className="hub-stat-value click">₱{currentClickValue}</span></div>
              <div className="hub-stat"><span className="hub-stat-label">TOTAL MACHINES</span><span className="hub-stat-value">{totalMachines}</span></div>
            </div>

            {/* Machine Purchase */}
            <div className="hub-section">
              <h3 className="hub-section-title" style={{ borderColor: loc?.accentColor || '#8cb369' }}>
                <PixelIcon type={loc?.machine.id} size={20} /> {loc?.machine.name || ''}
              </h3>
              <div className="hub-purchase-card">
                <div className="purchase-info">
                  <span className="purchase-owned">Owned: <strong>{machineCount}</strong></span>
                  <span className="purchase-income">+₱{loc?.machine.baseIncome || 0}/sec each</span>
                  <span className="purchase-cost">Cost: ₱{nextMachineCost.toLocaleString()}</span>
                </div>
                <button className={`buy-button ${!canBuyMachine ? 'disabled' : ''}`} onClick={purchaseMachine} disabled={!canBuyMachine}>
                  BUY
                </button>
              </div>
            </div>

            {/* Local Upgrades */}
            {loc && loc.localUpgrades.length > 0 && (
              <div className="hub-section">
                <h3 className="hub-section-title" style={{ borderColor: loc?.accentColor || '#8cb369' }}>
                  🏗️ LOCAL UPGRADES
                </h3>
                <div className="hub-local-upgrades">
                  {loc.localUpgrades.map(up => (
                    <LocalUpgradeCard
                      key={up.id}
                      upgrade={up}
                      owned={localUpgrades[currentLocation]?.[up.id] || false}
                      canBuy={pesos >= up.cost && !localUpgrades[currentLocation]?.[up.id]}
                      onBuy={() => purchaseLocalUpgrade(up.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Machine List */}
            <div className="hub-section">
              <h3 className="hub-section-title" style={{ borderColor: loc?.accentColor || '#8cb369' }}>
                📋 MACHINES ({machineCount})
              </h3>
              {locationMachines.length === 0 ? (
                <div className="hub-empty">No machines yet. Buy your first {loc?.machine.name || 'machine'}!</div>
              ) : (
                <div className="hub-machine-list">
                  {locationMachines.map((m, idx) => {
                    const income = (loc?.machine.baseIncome || 0) * (m.level || 1);
                    return (
                      <div key={m.id} className={`hub-machine-card ${detailMachineId === m.id ? 'selected' : ''}`}
                        onClick={() => setDetailMachineId(m.id)}
                      >
                        <div className="hmc-badge" style={{ background: loc?.accentColor || '#8cb369' }}>{idx + 1}</div>
                        <div className="hmc-info">
                          <div className="hmc-name-row">
                            <span className="hmc-name">{m.name || `${loc?.machine.name || 'Machine'} #${idx + 1}`}</span>
                            <span className="hmc-level" style={{ color: loc?.accentColor || '#8cb369' }}>Lv.{m.level || 1}</span>
                          </div>
                          <div className="hmc-details">
                            <span>₱{income}/sec</span>
                            <span>₱{Math.floor(m.earnings || 0).toLocaleString()} earned</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Global Shop Toggle */}
            <button className="global-shop-toggle" onClick={() => setShowGlobalShop(!showGlobalShop)}>
              {showGlobalShop ? '▼' : '▶'} GLOBAL UPGRADES
            </button>

            {showGlobalShop && (
              <div className="hub-global-shop">
                {/* Diskarte Upgrades */}
                <div className="hub-section">
                  <h3 className="hub-section-title" style={{ borderColor: '#ed8936' }}>📡 DISKARTE UPGRADES</h3>
                  {DISKARTE_UPGRADES.map(up => (
                    <div key={up.id} className={`global-upgrade-card ${upgrades[up.id] ? 'owned' : ''}`}>
                      <div className="global-upgrade-info">
                        <div className="global-upgrade-name">{up.name}</div>
                        <div className="global-upgrade-desc">{up.description}</div>
                        <div className="global-upgrade-cost">Cost: ₱{up.cost}</div>
                      </div>
                      <button className={`buy-button-small ${upgrades[up.id] || pesos < up.cost ? 'disabled' : ''}`}
                        onClick={() => purchaseUpgrade(up)} disabled={upgrades[up.id] || pesos < up.cost}>
                        {upgrades[up.id] ? 'OWNED' : 'BUY'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Package Upgrades */}
                <div className="hub-section">
                  <h3 className="hub-section-title" style={{ borderColor: '#ed8936' }}>📦 PACKAGE UPGRADES</h3>
                  {PACKAGE_UPGRADES.map(pkg => (
                    <div key={pkg.id} className={`global-upgrade-card ${packageUpgrades[pkg.id] ? 'owned' : ''}`}>
                      <div className="global-upgrade-info">
                        <div className="global-upgrade-name">{pkg.name}</div>
                        <div className="global-upgrade-desc">{pkg.description}</div>
                        <div className="global-upgrade-cost">Cost: ₱{pkg.cost.toLocaleString()}</div>
                      </div>
                      <button className={`buy-button-small ${packageUpgrades[pkg.id] || pesos < pkg.cost ? 'disabled' : ''}`}
                        onClick={() => purchasePackage(pkg)} disabled={packageUpgrades[pkg.id] || pesos < pkg.cost}>
                        {packageUpgrades[pkg.id] ? 'OWNED' : 'BUY'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Network Speed */}
                <div className="hub-section">
                  <h3 className="hub-section-title" style={{ borderColor: '#ed8936' }}>🚀 NETWORK SPEED</h3>
                  {NETWORK_SPEEDS.map(speed => {
                    const isCurrent = currentSpeed === speed.id;
                    const currentSpd = NETWORK_SPEEDS.find(s => s.id === currentSpeed);
                    const canBuy = pesos >= speed.baseCost && speed.baseCost > (currentSpd?.baseCost || 0);
                    return (
                      <div key={speed.id} className={`global-upgrade-card ${isCurrent ? 'current' : ''}`}>
                        <div className="global-upgrade-info">
                          <div className="global-upgrade-name">{speed.name}</div>
                          <div className="global-upgrade-desc">{speed.description}</div>
                          <div className="global-upgrade-cost">{speed.speedMultiplier}x Speed</div>
                        </div>
                        {isCurrent ? (
                          <div className="current-badge-small">CURRENT</div>
                        ) : (
                          <button className={`buy-button-small ${!canBuy ? 'disabled' : ''}`}
                            onClick={() => purchaseSpeed(speed)} disabled={!canBuy}>
                            ₱{speed.baseCost.toLocaleString()}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* ===== FOOTER — Location Tabs ===== */}
        <nav className="location-tabs">
          {LOCATIONS.map((location, idx) => {
            const isUnlocked = unlockedLocations.includes(idx);
            const isActive = idx === currentLocation;
            const canAfford = pesos >= location.unlockCost;
            return (
              <button
                key={location.id}
                className={`location-tab ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''} ${!isUnlocked && canAfford ? 'can-unlock' : ''}`}
                onClick={() => handleLocationClick(idx)}
                style={isActive ? { borderColor: location.accentColor, color: location.accentColor } : {}}
              >
                <span className="loc-tab-icon">{isUnlocked ? LOCATION_ICONS[idx] : '🔒'}</span>
                <span className="loc-tab-name">{location.name.split(' ')[0]}</span>
                {!isUnlocked && (
                  <span className="loc-tab-cost">₱{location.unlockCost.toLocaleString()}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ===== Achievement Toast ===== */}
        <AchievementToast achievement={achievementToast} onDismiss={() => setAchievementToast(null)} />

        {/* ===== Modals ===== */}
        {detailMachine && (
          <MachineDetail
            machine={detailMachine}
            onClose={closeMachineDetail}
            onSell={() => sellMachineById(detailMachine.id)}
            onRename={(name) => renameMachineById(detailMachine.id, name)}
            onUpgrade={() => { upgradeMachineById(detailMachine.id); closeMachineDetail(); }}
            spotLevels={[]}
            pesos={pesos}
          />
        )}
        <AchievementPanel unlocked={unlockedAchievements} visible={showAchievements} onClose={() => setShowAchievements(false)} />
        <PrestigePanel points={prestigePoints} upgrades={prestigeUpgrades} visible={showPrestige} onClose={() => setShowPrestige(false)} onPrestige={doPrestige} onBuyUpgrade={purchasePrestigeUpgrade} canPrestige={canPrestige} />
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={() => {
              setShowAuthModal(false);
              // Load cloud save after login
              setTimeout(() => handleCloudLoad(), 500);
            }}
          />
        )}
      </main>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Press Start 2P', cursive;
          background-color: #2a3d2b;
          color: #f5e6c8;
          image-rendering: pixelated;
          overflow: hidden;
        }
        .game-container { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #3d4a35; }
        ::-webkit-scrollbar-thumb { background: #5c7a3a; border: 2px solid #3d4a35; }

        /* ===== HEADER = cozy signage ===== */
        .game-header {
          display: flex; align-items: center; padding: 0.6rem 1rem;
          background: #3d4a35;
          border-bottom: 3px solid #8cb369;
          gap: 0.8rem; flex-shrink: 0;
        }
        .header-left { flex-shrink: 0; }
        .game-title {
          color: #f0c05a; font-size: 0.8rem;
          text-shadow: 2px 2px 0 #2a3d2b, 0 0 12px rgba(240, 192, 90, 0.2);
          white-space: nowrap;
        }
        .header-stats { display: flex; gap: 1.5rem; flex: 1; justify-content: center; }
        .header-stat { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
        .header-stat-label { color: #c4b49a; font-size: 0.5rem; }
        .header-stat-value { font-size: 0.7rem; }
        .header-stat-value.money { color: #f0c05a; text-shadow: 0 0 8px rgba(240, 192, 90, 0.3); }
        .header-stat-value.speed { color: #7ab8c9; text-shadow: 0 0 8px rgba(122, 184, 201, 0.2); }
        .header-buttons { display: flex; gap: 0.35rem; align-items: center; flex-shrink: 0; }
        .auth-header-button {
          font-family: 'Press Start 2P', cursive;
          background: transparent; color: #f0c05a;
          border: 2px solid #8cb369; padding: 0.5rem 0.6rem;
          font-size: 0.5rem; cursor: pointer; white-space: nowrap; min-height: 44px;
          transition: background 0.15s;
        }
        .auth-header-button:hover { background: rgba(140, 179, 105, 0.15); }
        .auth-header-button.logged-in { color: #f0c05a; border-color: #f0c05a; font-size: 0.45rem; }
        .cloud-status { color: #f0c05a; font-size: 0.3rem; min-width: 1.2rem; text-align: center; }
        .reset-button {
          font-family: 'Press Start 2P', cursive;
          background: transparent; color: #fca5a5;
          border: 2px solid #b91c1c; padding: 0.5rem 0.6rem;
          font-size: 0.5rem; cursor: pointer; min-height: 44px;
          transition: background 0.15s;
        }
        .reset-button:hover { background: rgba(185, 28, 28, 0.15); }
        .achievements-button {
          font-family: 'Press Start 2P', cursive;
          background: transparent; color: #f0c05a;
          border: 2px solid #8cb369; padding: 0.5rem 0.6rem;
          font-size: 0.5rem; cursor: pointer; white-space: nowrap; min-height: 44px;
          transition: background 0.15s;
        }
        .achievements-button:hover { background: rgba(140, 179, 105, 0.15); }
        .prestige-header-button {
          font-family: 'Press Start 2P', cursive;
          background: transparent; color: #f0c05a;
          border: 2px solid #8cb369; padding: 0.5rem 0.6rem;
          font-size: 0.5rem; cursor: pointer; white-space: nowrap; min-height: 44px;
          transition: background 0.15s;
        }
        .prestige-header-button:hover { background: rgba(140, 179, 105, 0.15); }
        .music-button {
          font-family: 'Press Start 2P', cursive;
          background: transparent; border: 2px solid #6b4a3a;
          padding: 0.5rem 0.5rem; font-size: 0.6rem; cursor: pointer; min-height: 44px; min-width: 44px;
          transition: background 0.15s;
        }
        .music-button:hover { background: rgba(255,255,255,0.05); }
        .music-button.on { color: #8cb369; border-color: #8cb369; }
        .music-button.off { color: #b91c1c; border-color: #b91c1c; }

        /* ===== MAIN CONTENT ===== */
        .main-content { display: flex; flex: 1; min-height: 0; }

        /* Viewport — cozy window */
        .viewport {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative;
          border-right: 4px solid #8cb369;
          transition: background-color 0.5s;
          padding: 1rem; overflow: hidden;
        }
        .viewport-header { text-align: center; margin-bottom: 0.5rem; }
        .viewport-location-name {
          font-size: 0.9rem; margin-bottom: 0.25rem;
          text-shadow: 2px 2px 0 #2a3d2b;
        }
        .viewport-location-subtitle {
          color: #c4b49a; font-size: 0.5rem;
          text-shadow: 1px 1px 0 #2a3d2b;
        }
        .viewport-machine-area { display: flex; flex-direction: column; align-items: center; position: relative; }
        .clickable-machine { cursor: pointer; transition: transform 0.1s; position: relative; padding: 0.5rem; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        .clickable-machine.pressed { transform: scale(0.92); }
        .clickable-machine:hover { filter: brightness(1.25) drop-shadow(0 0 12px rgba(140, 179, 105, 0.3)); }
        .machine-svg-wrapper { position: relative; }
        .machine-pulse-ring { position: absolute; inset: -8px; border: 2px solid; border-radius: 0; opacity: 0.3; animation: pulseRing 2s ease-in-out infinite; pointer-events: none; }
        @keyframes pulseRing { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.05); opacity: 0.6; } }
        .viewport-click-hint {
          color: #f0c05a; font-size: 0.55rem; margin-top: 0.6rem;
          text-shadow: 1px 1px 0 #2a3d2b;
          animation: blink 1.5s step-end infinite;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .viewport-decor { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; width: 80%; max-width: 400px; }
        .deco-line { height: 2px; flex: 1; opacity: 0.4; }
        .viewport-desc { color: #c4b49a; font-size: 0.45rem; text-align: center; opacity: 0.7; white-space: nowrap; }
        .floating-text {
          position: absolute; color: #f0c05a; font-size: 1.2rem; font-weight: bold;
          text-shadow: 2px 2px 0 #2a3d2b, 0 0 16px rgba(240, 192, 90, 0.5);
          pointer-events: none; animation: floatUp 1s ease-out forwards;
        }
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-60px); } }

        /* Control Hub — cozy nook */
        .control-hub {
          width: 380px; background: #3d4a35;
          overflow-y: auto; padding: 0.75rem;
          display: flex; flex-direction: column; gap: 0.6rem;
        }
        .hub-stats-row { display: flex; gap: 0.35rem; }
        .hub-stat {
          flex: 1; background: #2a3d2b; border: 1px solid #5c7a3a;
          padding: 0.5rem; text-align: center;
        }
        .hub-stat-label { display: block; color: #c4b49a; font-size: 0.45rem; margin-bottom: 0.25rem; }
        .hub-stat-value { display: block; color: #f0c05a; font-size: 0.6rem; }
        .hub-stat-value.click { color: #f0c05a; }
        .hub-section {
          background: #2a3d2b; border: 1px solid #5c7a3a;
          padding: 0.6rem;
        }
        .hub-section-title {
          color: #f5e6c8; font-size: 0.55rem; margin-bottom: 0.5rem;
          padding-bottom: 0.35rem; border-bottom: 2px solid;
          display: flex; align-items: center; gap: 0.3rem;
        }
        .hub-purchase-card { display: flex; align-items: center; gap: 0.5rem; }
        .purchase-info { flex: 1; min-width: 0; }
        .purchase-owned { display: block; color: #f5e6c8; font-size: 0.5rem; margin-bottom: 0.2rem; }
        .purchase-income { display: block; color: #f0c05a; font-size: 0.5rem; margin-bottom: 0.2rem; }
        .purchase-cost { display: block; color: #f0c05a; font-size: 0.5rem; }
        .buy-button {
          font-family: 'Press Start 2P', cursive;
          background: #8cb369; color: #2a3d2b;
          border: none; padding: 0.6rem 0.9rem;
          font-size: 0.6rem; cursor: pointer; flex-shrink: 0; min-width: 80px; min-height: 44px;
          transition: opacity 0.15s;
        }
        .buy-button:hover:not(.disabled) { opacity: 0.85; }
        .buy-button.disabled { background: #5c7a3a; color: #8a9a7a; cursor: not-allowed; opacity: 0.7; }
        .buy-button-small {
          font-family: 'Press Start 2P', cursive;
          background: #8cb369; color: #2a3d2b;
          border: none; padding: 0.4rem 0.6rem;
          font-size: 0.45rem; cursor: pointer; flex-shrink: 0; min-height: 44px;
          transition: opacity 0.15s;
        }
        .buy-button-small:hover:not(.disabled) { opacity: 0.85; }
        .buy-button-small.disabled { background: #5c7a3a; color: #8a9a7a; cursor: not-allowed; opacity: 0.7; }

        /* Local Upgrades */
        .hub-local-upgrades { display: flex; flex-direction: column; gap: 0.35rem; }
        .local-upgrade-card {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem; background: #3d4a35; border: 1px solid #5c7a3a;
        }
        .local-upgrade-card.owned { border-color: #8cb369; opacity: 0.8; }
        .local-upgrade-info { flex: 1; min-width: 0; }
        .local-upgrade-name { color: #f0c05a; font-size: 0.5rem; margin-bottom: 0.2rem; }
        .local-upgrade-desc { color: #c4b49a; font-size: 0.38rem; margin-bottom: 0.2rem; line-height: 1.4; }
        .local-upgrade-cost { color: #f0c05a; font-size: 0.45rem; }

        /* Machine List in Hub */
        .hub-empty { color: #8a7a6a; font-size: 0.45rem; text-align: center; padding: 0.7rem; }
        .hub-machine-list { display: flex; flex-direction: column; gap: 0.25rem; max-height: 200px; overflow-y: auto; }
        .hub-machine-card {
          display: flex; align-items: center; gap: 0.3rem; padding: 0.35rem;
          background: #3d4a35; border: 1px solid #5c7a3a;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .hub-machine-card:hover { border-color: #8cb369; background: #4a5c3d; }
        .hub-machine-card.selected { border-color: #8cb369; background: #2a3d2b; }
        .hmc-badge {
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          font-size: 0.5rem; color: #2a3d2b; font-weight: bold; flex-shrink: 0;
          border: 2px solid #2a3d2b;
        }
        .hmc-info { flex: 1; min-width: 0; }
        .hmc-name-row { display: flex; justify-content: space-between; align-items: center; gap: 0.2rem; }
        .hmc-name { color: #f5e6c8; font-size: 0.45rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hmc-level { font-size: 0.45rem; flex-shrink: 0; }
        .hmc-details { display: flex; justify-content: space-between; margin-top: 0.1rem; }
        .hmc-details span { color: #c4b49a; font-size: 0.38rem; }

        /* Global Shop Toggle */
        .global-shop-toggle {
          font-family: 'Press Start 2P', cursive;
          background: transparent; color: #f0c05a;
          border: 2px solid #5c7a3a; padding: 0.5rem;
          font-size: 0.5rem; cursor: pointer; text-align: left; min-height: 44px;
          transition: background 0.15s;
        }
        .global-shop-toggle:hover { background: rgba(255,255,255,0.05); }
        .hub-global-shop { display: flex; flex-direction: column; gap: 0.5rem; }
        .global-upgrade-card {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem; background: #3d4a35; border: 1px solid #5c7a3a;
        }
        .global-upgrade-card.owned { border-color: #8cb369; opacity: 0.8; }
        .global-upgrade-card.current { border-color: #8cb369; background: #3d4a35; }
        .global-upgrade-info { flex: 1; min-width: 0; }
        .global-upgrade-name { color: #f0c05a; font-size: 0.5rem; margin-bottom: 0.15rem; }
        .global-upgrade-desc { color: #c4b49a; font-size: 0.38rem; margin-bottom: 0.15rem; line-height: 1.4; }
        .global-upgrade-cost { color: #f0c05a; font-size: 0.45rem; }
        .current-badge-small {
          font-family: 'Press Start 2P', cursive;
          background: #8cb369; color: #2a3d2b;
          padding: 0.35rem 0.5rem; font-size: 0.45rem;
          flex-shrink: 0; min-height: 44px; display: flex; align-items: center;
        }

        /* ===== FOOTER — Location Tabs = cozy row ===== */
        .location-tabs {
          display: flex;
          border-top: 3px solid #8cb369;
          background: #2a3d2b;
          flex-shrink: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .location-tabs::-webkit-scrollbar { display: none; }
        .location-tab {
          flex: 1; font-family: 'Press Start 2P', cursive;
          background: #3d4a35; color: #c4b49a;
          border: none; border-right: 2px solid #2a3d2b;
          border-bottom: 3px solid transparent;
          padding: 0.5rem 0.25rem; cursor: pointer; min-height: 56px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .location-tab:last-child { border-right: none; }
        .location-tab:hover { background: #5c7a3a; color: #f5e6c8; }
        .location-tab.active { background: #2a3d2b; border-bottom-width: 3px; border-bottom-style: solid; }
        .location-tab.locked { opacity: 0.6; }
        .location-tab.can-unlock { opacity: 1; border-color: #8cb369; color: #f0c05a; }
        .loc-tab-icon { font-size: 0.9rem; }
        .loc-tab-name { font-size: 0.45rem; }
        .loc-tab-cost { font-size: 0.35rem; color: #f0c05a; }

        /* ===== Shared / Modal styles (cozy version) ===== */
        .achievement-toast {
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 1rem;
          background: #3d4a35; border: 4px solid #f0c05a;
          padding: 1rem 1.5rem; z-index: 100;
          animation: slideUpToast 0.3s ease-out; cursor: pointer; max-width: 90vw;
          box-shadow: 0 0 30px rgba(240, 192, 90, 0.15);
        }
        @keyframes slideUpToast { 0% { transform: translateX(-50%) translateY(100px); opacity: 0; } 100% { transform: translateX(-50%) translateY(0); opacity: 1; } }
        .toast-icon { font-size: 2rem; } .toast-text { flex: 1; }
        .toast-title { color: #f0c05a; font-size: 0.5rem; margin-bottom: 0.3rem; }
        .toast-name { color: #f0c05a; font-size: 0.7rem; margin-bottom: 0.3rem; }
        .toast-desc { color: #c4b49a; font-size: 0.4rem; }
        .achievement-overlay { position: fixed; inset: 0; background: rgba(42, 61, 43, 0.9); display: flex; align-items: center; justify-content: center; z-index: 200; }
        .achievement-panel { background: #3d4a35; border: 3px solid #8cb369; width: 95%; max-width: 520px; max-height: 85vh; display: flex; flex-direction: column; }
        .achievement-panel-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 3px solid #8cb369; }
        .achievement-panel-title { color: #f0c05a; font-size: 0.8rem; }
        .achievement-close { font-family: 'Press Start 2P', cursive; background: none; color: #f5e6c8; border: 1px solid #5c7a3a; padding: 0.3rem 0.5rem; font-size: 0.6rem; cursor: pointer; }
        .achievement-close:hover { background: rgba(255,255,255,0.05); }
        .achievement-panel-body { padding: 1rem; overflow-y: auto; }
        .achievement-count { color: #c4b49a; font-size: 0.5rem; text-align: center; margin-bottom: 0.5rem; }
        .achievement-progress-bar { width: 100%; height: 12px; background: #2a3d2b; border: 1px solid #5c7a3a; margin-bottom: 1.5rem; }
        .achievement-progress-fill { height: 100%; background: #8cb369; transition: width 0.5s; }
        .achievement-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .achievement-card { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem; background: #2a3d2b; border: 1px solid #5c7a3a; }
        .achievement-card.unlocked { border-color: #8cb369; }
        .achievement-card.locked { opacity: 0.6; }
        .achievement-card-icon { font-size: 1.5rem; flex-shrink: 0; }
        .achievement-card-info { flex: 1; }
        .achievement-card-name { color: #f0c05a; font-size: 0.6rem; margin-bottom: 0.3rem; }
        .achievement-card-desc { color: #c4b49a; font-size: 0.4rem; }
        .prestige-panel { background: #3d4a35; border: 3px solid #8cb369; width: 95%; max-width: 520px; max-height: 85vh; display: flex; flex-direction: column; }
        .prestige-panel-title { color: #f0c05a; font-size: 0.8rem; }
        .prestige-info { text-align: center; padding-bottom: 1rem; border-bottom: 1px solid #5c7a3a; margin-bottom: 1rem; }
        .prestige-points-display { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
        .prestige-points-icon { font-size: 2rem; }
        .prestige-points-value { color: #f0c05a; font-size: 1.5rem; text-shadow: 2px 2px 0 #2a3d2b; }
        .prestige-points-label { color: #c4b49a; font-size: 0.4rem; }
        .prestige-desc { color: #c4b49a; font-size: 0.4rem; margin-bottom: 1rem; line-height: 1.6; }
        .prestige-button { font-family: 'Press Start 2P', cursive; background: #8cb369; color: #2a3d2b; border: none; padding: 0.8rem 1.5rem; font-size: 0.5rem; cursor: pointer; transition: opacity 0.15s; }
        .prestige-button:hover:not(.disabled) { opacity: 0.85; }
        .prestige-button.disabled { background: #5c7a3a; color: #8a9a7a; cursor: not-allowed; }
        .prestige-upgrades-title { color: #f0c05a; font-size: 0.6rem; margin-bottom: 1rem; }
        .prestige-upgrades-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .prestige-upgrade-card { background: #2a3d2b; border: 1px solid #5c7a3a; padding: 0.8rem; }
        .prestige-upgrade-card.maxed { border-color: #8cb369; }
        .prestige-upgrade-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.5rem; }
        .prestige-upgrade-icon { font-size: 1.5rem; flex-shrink: 0; }
        .prestige-upgrade-info { flex: 1; }
        .prestige-upgrade-name { color: #f0c05a; font-size: 0.5rem; margin-bottom: 0.3rem; }
        .prestige-upgrade-desc { color: #c4b49a; font-size: 0.4rem; }
        .prestige-upgrade-level { color: #f0c05a; font-size: 0.4rem; flex-shrink: 0; }
        .prestige-upgrade-bar { width: 100%; height: 8px; background: #3d4a35; border: 2px solid #5c7a3a; margin-bottom: 0.5rem; }
        .prestige-upgrade-fill { height: 100%; background: #8cb369; transition: width 0.3s; }
        .prestige-buy-button { font-family: 'Press Start 2P', cursive; background: #8cb369; color: #2a3d2b; border: none; padding: 0.3rem 0.5rem; font-size: 0.4rem; cursor: pointer; width: 100%; transition: opacity 0.15s; }
        .prestige-buy-button:hover:not(.disabled) { opacity: 0.85; }
        .prestige-buy-button.disabled { background: #5c7a3a; color: #8a9a7a; cursor: not-allowed; }
        .prestige-maxed-badge { font-family: 'Press Start 2P', cursive; background: #8cb369; color: #2a3d2b; padding: 0.3rem 0.5rem; font-size: 0.4rem; text-align: center; }
        .machine-detail-overlay { position: fixed; inset: 0; background: rgba(42, 61, 43, 0.9); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 1rem; }
        .machine-detail-panel { background: #3d4a35; border: 4px solid #8cb369; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 30px rgba(140, 179, 105, 0.15); }
        .machine-detail-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 4px solid #8cb369; }
        .machine-detail-title { color: #f0c05a; font-size: 0.65rem; }
        .machine-detail-close { font-family: 'Press Start 2P', cursive; background: none; color: #c4b49a; border: 3px solid #5c7a3a; padding: 0.3rem 0.5rem; font-size: 0.55rem; cursor: pointer; }
        .machine-detail-close:hover { background: #5c7a3a; }
        .machine-detail-main { display: flex; align-items: center; gap: 1rem; padding: 1rem 1rem 0.5rem; }
        .machine-detail-icon { flex-shrink: 0; }
        .machine-detail-id { flex: 1; min-width: 0; }
        .machine-detail-name { color: #f0c05a; font-size: 0.6rem; margin-bottom: 0.3rem; word-break: break-word; }
        .machine-detail-type { color: #8a7a6a; font-size: 0.45rem; margin-top: 0.2rem; }
        .machine-detail-lv { font-size: 0.9rem; font-weight: bold; text-shadow: 2px 2px 0 #2a3d2b; flex-shrink: 0; }
        .machine-detail-bars { display: flex; gap: 3px; padding: 0 1rem 1rem; justify-content: center; flex-wrap: wrap; }
        .machine-detail-bar { width: 20px; height: 10px; border: 1px solid #2a3d2b; }
        .machine-detail-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; padding: 0 1rem 1rem; }
        .detail-stat-box { background: #2a3d2b; border: 1px solid #5c7a3a; padding: 0.7rem; }
        .detail-stat-box.span-2 { grid-column: span 2; }
        .detail-stat-label { color: #c4b49a; font-size: 0.4rem; margin-bottom: 0.4rem; }
        .detail-stat-value { font-size: 0.55rem; font-weight: bold; word-break: break-word; }
        .detail-stat-value.earnings { color: #f0c05a; }
        .detail-stat-value.time { color: #7ab8c9; }
        .detail-stat-value.income { color: #f0c05a; }
        .detail-stat-value.next { color: #f0c05a; }
        .detail-stat-value.cost { color: #f0c05a; }
        .detail-stat-value.spent { color: #fca5a5; }
        .detail-stat-value.eff { color: #f0c05a; }
        .rename-trigger { font-family: 'Press Start 2P', cursive; background: none; color: #8a7a6a; border: none; cursor: pointer; font-size: 0.55rem; margin-left: 0.3rem; vertical-align: middle; }
        .rename-trigger:hover { color: #c4b49a; }
        .rename-input-group { display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
        .rename-input { font-family: 'Press Start 2P', cursive; background: #2a3d2b; color: #f0c05a; border: 1px solid #5c7a3a; padding: 0.4rem; font-size: 0.45rem; width: 100%; outline: none; }
        .rename-input:focus { border-color: #8cb369; }
        .rename-confirm-btn { font-family: 'Press Start 2P', cursive; background: #8cb369; color: #2a3d2b; border: none; padding: 0.35rem 0.5rem; font-size: 0.4rem; cursor: pointer; flex-shrink: 0; }
        .rename-confirm-btn:hover { background: #9cc47a; }
        .rename-cancel-btn { font-family: 'Press Start 2P', cursive; background: none; color: #c4b49a; border: 1px solid #5c7a3a; padding: 0.35rem 0.5rem; font-size: 0.4rem; cursor: pointer; flex-shrink: 0; }
        .rename-cancel-btn:hover { background: #5c7a3a; }
        .machine-detail-actions { padding: 0 1rem 0.5rem; }
        .detail-upgrade-btn { font-family: 'Press Start 2P', cursive; width: 100%; background: #8cb369; color: #2a3d2b; border: none; padding: 0.8rem; font-size: 0.5rem; cursor: pointer; transition: opacity 0.15s; }
        .detail-upgrade-btn:hover { opacity: 0.85; }
        .detail-upgrade-btn.disabled { background: #5c7a3a; color: #8a9a7a; cursor: not-allowed; }
        .detail-max-badge { font-family: 'Press Start 2P', cursive; width: 100%; background: #8cb369; color: #2a3d2b; padding: 0.8rem; font-size: 0.5rem; text-align: center; }
        .machine-detail-sell { padding: 0 1rem 1rem; }
        .sell-button { font-family: 'Press Start 2P', cursive; width: 100%; background: #b8432f; color: #f5e6c8; border: none; padding: 0.7rem; font-size: 0.5rem; cursor: pointer; transition: opacity 0.15s; }
        .sell-button:hover { background: #dc2626; }
        .sell-confirm { text-align: center; }
        .sell-confirm-text { color: #f0c05a; font-size: 0.55rem; margin-bottom: 0.5rem; }
        .sell-confirm-actions { display: flex; gap: 0.5rem; justify-content: center; }
        .sell-confirm-yes { font-family: 'Press Start 2P', cursive; background: #b8432f; color: #f5e6c8; border: none; padding: 0.6rem 1rem; font-size: 0.55rem; cursor: pointer; flex: 1; }
        .sell-confirm-yes:hover { background: #dc2626; }
        .sell-confirm-no { font-family: 'Press Start 2P', cursive; background: #5c7a3a; color: #c4b49a; border: none; padding: 0.6rem 1rem; font-size: 0.55rem; cursor: pointer; flex: 1; }
        .sell-confirm-no:hover { background: #6b8f3e; }

        /* ===== Responsive: Tablet & Mobile ===== */
        @media (max-width: 900px) {
          .main-content { flex-direction: column; }
          .viewport { border-right: none; border-bottom: 4px solid #8cb369; min-height: 260px; }
          .control-hub { width: 100%; max-height: 55vh; }
        }
        @media (max-width: 768px) {
          .game-header { flex-wrap: wrap; padding: 0.4rem; gap: 0.4rem; }
          .game-title { font-size: 0.65rem; }
          .header-stats { order: 3; width: 100%; justify-content: space-around; gap: 0.25rem; }
          .header-stat-value { font-size: 0.6rem; }
          .header-stat-label { font-size: 0.4rem; }
          .header-buttons { gap: 0.25rem; }
          .main-content { flex-direction: column; }
          .viewport { border-right: none; border-bottom: 4px solid #8cb369; min-height: 260px; }
          .control-hub { width: 100%; max-height: 55vh; }
          .location-tab { padding: 0.35rem 0.15rem; min-height: 48px; }
          .loc-tab-icon { font-size: 0.7rem; }
          .loc-tab-name { font-size: 0.35rem; }
          .loc-tab-cost { font-size: 0.25rem; }
          .viewport-location-name { font-size: 0.7rem; }
          .hub-machine-list { max-height: 160px; }
        }
        @media (max-width: 480px) {
          body { overflow-y: auto; }
          .game-container { height: 100dvh; }
          .game-header { padding: 0.3rem; gap: 0.3rem; }
          .header-left { width: 100%; text-align: center; }
          .game-title { font-size: 0.55rem; }
          .header-stats { order: 2; gap: 0.15rem; }
          .header-stat-value { font-size: 0.5rem; }
          .header-stat-label { font-size: 0.35rem; }
          .header-buttons { order: 3; width: 100%; justify-content: center; flex-wrap: wrap; gap: 0.2rem; }
          .auth-header-button,
          .achievements-button,
          .prestige-header-button,
          .reset-button,
          .music-button { padding: 0.35rem 0.4rem; font-size: 0.4rem; min-height: 36px; }
          .viewport { padding: 0.5rem; min-height: 200px; }
          .viewport-location-name { font-size: 0.6rem; }
          .viewport-location-subtitle { font-size: 0.4rem; }
          .viewport-click-hint { font-size: 0.45rem; }
          .viewport-desc { font-size: 0.35rem; }
          .control-hub { padding: 0.5rem; max-height: 50vh; }
          .hub-stat { padding: 0.3rem; }
          .hub-stat-label { font-size: 0.35rem; }
          .hub-stat-value { font-size: 0.5rem; }
          .hub-section { padding: 0.35rem; }
          .hub-section-title { font-size: 0.45rem; }
          .purchase-owned,
          .purchase-income,
          .purchase-cost { font-size: 0.4rem; }
          .buy-button { padding: 0.4rem 0.6rem; font-size: 0.5rem; min-width: auto; }
          .buy-button-small { padding: 0.3rem 0.4rem; font-size: 0.38rem; min-height: 36px; }
          .local-upgrade-name { font-size: 0.4rem; }
          .local-upgrade-desc { font-size: 0.32rem; }
          .local-upgrade-cost { font-size: 0.38rem; }
          .global-upgrade-name { font-size: 0.4rem; }
          .global-upgrade-desc { font-size: 0.32rem; }
          .global-upgrade-cost { font-size: 0.38rem; }
          .global-shop-toggle { font-size: 0.4rem; padding: 0.35rem; min-height: 36px; }
          .hmc-name { font-size: 0.38rem; }
          .hmc-level { font-size: 0.38rem; }
          .hmc-details span { font-size: 0.32rem; }
          .hmc-badge { width: 24px; height: 24px; font-size: 0.4rem; }
          .hub-machine-card { padding: 0.25rem; }
          .loc-tab-icon { font-size: 0.6rem; }
          .loc-tab-name { font-size: 0.3rem; }
          .loc-tab-cost { font-size: 0.2rem; }
          .location-tab { padding: 0.25rem 0.1rem; min-height: 42px; }
          .floating-text { font-size: 1rem; }
          .machine-detail-panel { max-width: 100%; border-width: 3px; }
          .machine-detail-header { padding: 0.7rem; }
          .machine-detail-title { font-size: 0.5rem; }
          .machine-detail-main { padding: 0.7rem 0.7rem 0.3rem; gap: 0.7rem; }
          .machine-detail-name { font-size: 0.5rem; }
          .detail-stat-label { font-size: 0.35rem; }
          .detail-stat-value { font-size: 0.45rem; }
          .detail-stat-box { padding: 0.5rem; }
          .detail-upgrade-btn { padding: 0.6rem; font-size: 0.4rem; }
          .sell-button { padding: 0.6rem; font-size: 0.4rem; }
          .hub-machine-list { max-height: 140px; }
        }
        @media (max-width: 360px) {
          .game-title { font-size: 0.45rem; }
          .header-stat-value { font-size: 0.4rem; }
          .header-stat-label { font-size: 0.3rem; }
          .viewport-location-name { font-size: 0.5rem; }
          .loc-tab-icon { font-size: 0.5rem; }
          .loc-tab-name { font-size: 0.25rem; }
          .loc-tab-cost { font-size: 0.18rem; }
        }
      `}</style>
    </>
  );
}
