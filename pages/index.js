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
import PixelScenery from '../components/PixelScenery';
import FloatingText from '../components/FloatingText';
import LocalUpgradeCard from '../components/LocalUpgradeCard';
import AchievementToast, { AchievementPanel } from '../components/AchievementToast';
import PrestigePanel from '../components/PrestigePanel';
import MachineDetail from '../components/MachineDetail';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import LeaderboardPanel from '../components/LeaderboardPanel';

const SAVE_VERSION = 3; // Bumped — new upgrade/package IDs
const LOCATION_ICONS = ['📍', '🏀', '🛺', '🛒', '🏫', '🏖️'];

export default function Home() {
  const { playClick, playBuy, playUpgrade, playSlotUpgrade, playLocationChange, setVolume: setSfxVolume } = useSound();
  const bgMusic = useBackgroundMusic();
  const [musicOn, setMusicOn] = useState(false);
  const firstInteractionRef = useRef(true);

  // ===== Core State =====
  const [pesos, setPesos] = useState(100); // Starting capital to buy first machine
  const [machinesByLocation, setMachinesByLocation] = useState(LOCATIONS.map(() => []));
  const [localUpgrades, setLocalUpgrades] = useState(LOCATIONS.map(() => ({})));
  const [unlockedLocations, setUnlockedLocations] = useState([0]);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [upgrades, setUpgrades] = useState({ reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false });
  const [packageUpgrades, setPackageUpgrades] = useState({ sukiLoad: false, regularPlan: false, unlimitedPlan: false });
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
  const [showControlHub, setShowControlHub] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  // ===== Save Refs (fixed interval, no re-creation on every tick) =====
  const saveStateRef = useRef(null);
  useEffect(() => {
    saveStateRef.current = {
      version: SAVE_VERSION, pesos, machinesByLocation, localUpgrades, unlockedLocations,
      currentLocation, upgrades, currentSpeed, packageUpgrades, unlockedAchievements,
      totalEarned, lifetimeEarned, prestigeCount, totalClicks, playTime, prestigePoints, prestigeUpgrades,
    };
  }); // runs on every render — no deps needed, just captures latest
  const clickAreaRef = useRef(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [lifetimeEarned, setLifetimeEarned] = useState(0);
  const [prestigeCount, setPrestigeCount] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [playTime, setPlayTime] = useState(0); // seconds
  const [achievementToast, setAchievementToast] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [detailMachineId, setDetailMachineId] = useState(null);
  const prevCheckStateRef = useRef('');
  const [showGlobalShop, setShowGlobalShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmPrestige, setConfirmPrestige] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [cloudToast, setCloudToast] = useState('');

  const showToast = useCallback((msg, duration = 3000) => {
    setCloudToast(msg);
    setTimeout(() => setCloudToast(''), duration);
  }, []);
  const [saving, setSaving] = useState(false);
  const { user, token, logout, saveToCloud, loadFromCloud } = useAuth();

  // ===== Session Management: one session per user =====
  useEffect(() => {
    if (!token || !user) return;
    const sessionId = localStorage.getItem('piso-session-id');
    if (!sessionId) {
      // New session — generate ID and store it
      const newId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('piso-session-id', newId);
    }
    // Listen for other tabs logging in/out
    const handleStorage = (e) => {
      if (e.key === 'piso-token' && !e.newValue) {
        // Another tab logged out — this session is dead
        setGameStarted(false);
        localStorage.removeItem('piso-wifi-empire-state');
        showToast('Logged out from another session', 3000);
      }
      if (e.key === 'piso-session-id' && e.newValue) {
        const mySession = localStorage.getItem('piso-session-id');
        if (e.newValue !== mySession) {
          // Another device/tab logged in — logout this session
          logout();
          setGameStarted(false);
          localStorage.removeItem('piso-wifi-empire-state');
          showToast('Session ended — logged in elsewhere', 3000);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [token, user, logout, showToast]);

  // ===== Prestige =====
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [prestigeUpgrades, setPrestigeUpgrades] = useState({});
  const prestigeIncomeMult = PRESTIGE_UPGRADES.find(u => u.id === 'incomeBoost')?.effect(prestigeUpgrades.incomeBoost || 0) || 1;
  const prestigeSpeedMult = PRESTIGE_UPGRADES.find(u => u.id === 'speedBoost')?.effect(prestigeUpgrades.speedBoost || 0) || 1;
  const prestigeStartingMoney = PRESTIGE_UPGRADES.find(u => u.id === 'headStart')?.effect(prestigeUpgrades.headStart || 0) || 0;

  // ===== Computed values =====
  const speedMultiplier = NETWORK_SPEEDS.find(s => s.id === currentSpeed)?.speedMultiplier || 1;
  const pps = calculatePps(machinesByLocation, localUpgrades, speedMultiplier, prestigeIncomeMult, prestigeSpeedMult, upgrades, packageUpgrades);
  const activeUsers = calculateActiveUsers(machinesByLocation);
  const currentClickValue = calculateClickValue(packageUpgrades, upgrades, localUpgrades, currentLocation);
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
          setUpgrades(data.upgrades || { reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false });
          setCurrentSpeed(data.currentSpeed || '3g');
          setPackageUpgrades(data.packageUpgrades || { sukiLoad: false, regularPlan: false, unlimitedPlan: false });
          setUnlockedAchievements(data.unlockedAchievements || []);
          setTotalEarned(data.totalEarned || 0);
          setLifetimeEarned(data.lifetimeEarned || 0);
          setPrestigeCount(data.prestigeCount || 0);
          setTotalClicks(data.totalClicks || 0);
          setPlayTime(data.playTime || 0);
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

  const dismissLoginPrompt = useCallback(() => {
    localStorage.setItem('piso-login-dismissed', 'true');
    setShowAuthModal(false);
  }, []);

  // Quick localStorage save every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      const state = saveStateRef.current;
      if (state) localStorage.setItem('piso-wifi-empire-state', JSON.stringify(state));
    }, 5000);
    return () => clearInterval(id);
  }, []); // Only on mount — reads from ref, never re-creates

  // Save to localStorage immediately when page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = saveStateRef.current;
      if (state) localStorage.setItem('piso-wifi-empire-state', JSON.stringify(state));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ===== Cloud Save (auto every 30s when logged in) =====
  useEffect(() => {
    if (!token || !user) return;
    const id = setInterval(async () => {
      const state = saveStateRef.current;
      if (!state) return;
      try {
        await saveToCloud(state);
        showToast('☁️ Auto-saved!');
      } catch (err) {
        showToast(`☁️ Auto-save failed: ${err.message}`, 5000);
      }
    }, 30000);
    return () => clearInterval(id);
  }, [token, user, saveToCloud]); // Only on auth change — reads from ref

  // ===== Cloud Load (when user logs in) =====
  useEffect(() => {
    if (!token || !user) return;
    let mounted = true;
    const loadCloud = async () => {
      try {
        const cloudState = await loadFromCloud();
        if (!mounted) return;
        if (!cloudState) {
          // No cloud save for this user -> start fresh and clear local storage
          localStorage.removeItem('piso-wifi-empire-state');
          // Reset game state to defaults
          setPesos(100); // starting capital as per line 33
          setMachinesByLocation(LOCATIONS.map(() => []));
          setLocalUpgrades(LOCATIONS.map(() => ({})));
          setUnlockedLocations([0]);
          setCurrentLocation(0);
          setUpgrades({ reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false });
          setCurrentSpeed('3g');
          setPackageUpgrades({ sukiLoad: false, regularPlan: false, unlimitedPlan: false });
          setUnlockedAchievements([]);
          setTotalEarned(0);
          setTotalClicks(0);
          setPlayTime(0);
          setPrestigePoints(0);
          setPrestigeUpgrades({});
          showToast('☁️ No cloud save found, starting fresh');
          return;
        }
        if (cloudState.version !== SAVE_VERSION) {
          // Version mismatch: treat as outdated, but we can still try to load compatible fields
          showToast('☁️ Save version mismatch, attempting to load compatible data');
          // We'll fallback to loading known fields, defaulting missing ones
        }
        // Merge cloud state into current game (with fallbacks)
        setPesos(cloudState.pesos ?? 100);
        setMachinesByLocation(cloudState.machinesByLocation ?? LOCATIONS.map(() => []));
        setLocalUpgrades(cloudState.localUpgrades ?? LOCATIONS.map(() => ({})));
        setUnlockedLocations(cloudState.unlockedLocations ?? [0]);
        setCurrentLocation(Math.min(cloudState.currentLocation ?? 0, LOCATIONS.length - 1));
        setUpgrades(cloudState.upgrades ?? { reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false });
        setCurrentSpeed(cloudState.currentSpeed ?? '3g');
        setPackageUpgrades(cloudState.packageUpgrades ?? { sukiLoad: false, regularPlan: false, unlimitedPlan: false });
        setUnlockedAchievements(cloudState.unlockedAchievements ?? []);
        setTotalEarned(cloudState.totalEarned ?? 0);
        setLifetimeEarned(cloudState.lifetimeEarned ?? 0);
        setPrestigeCount(cloudState.prestigeCount ?? 0);
        setTotalClicks(cloudState.totalClicks ?? 0);
        setPlayTime(cloudState.playTime ?? 0);
        setPrestigePoints(cloudState.prestigePoints ?? 0);
        setPrestigeUpgrades(cloudState.prestigeUpgrades ?? {});
        showToast('☁️ Loaded!');
      } catch (error) {
        if (!mounted) return;
        console.error('Load error:', error);
        showToast('☁️ Load failed', 2000);
      }
    };
    loadCloud();
    return () => { mounted = false; };
  }, [token, user, loadFromCloud]);

  // ===== Income Tick =====
  useEffect(() => {
    const tick = setInterval(() => {
      const tickIncome = pps / 10;
      if (tickIncome <= 0) return;
      setPesos((p) => p + tickIncome);
      setTotalEarned((t) => t + tickIncome);
      setLifetimeEarned((t) => t + tickIncome);
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

  // ===== Play Time Tracker =====
  useEffect(() => {
    const id = setInterval(() => {
      setPlayTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ===== Sync Volume =====
  useEffect(() => {
    bgMusic.setVolume(masterVolume);
    setSfxVolume(masterVolume);
  }, [masterVolume, bgMusic, setSfxVolume]);

  // ===== Achievement Check =====
  useEffect(() => {
    const state = {
      totalEarned, totalMachines,
      unlockedCount: unlockedLocations.length,
      currentPps: pps, currentSpeed,
      localUpgradeCount,
      allDiskarte: upgrades.reinforcedAntenna && upgrades.industrialCasing && upgrades.fiberCable && upgrades.backupPowerCell && upgrades.coolingSystem && upgrades.autoTuner && upgrades.signalBooster && upgrades.meshExtender,
      allPackages: packageUpgrades.sukiLoad && packageUpgrades.regularPlan && packageUpgrades.unlimitedPlan,
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
  }, [totalEarned, totalMachines, unlockedLocations, pps, currentSpeed, localUpgradeCount, upgrades, packageUpgrades, unlockedAchievements]);

  // ===== Click Handler =====
  const handleClick = (e) => {
    // iOS requires AudioContext to be created & resumed inside a user gesture
    if (firstInteractionRef.current) {
      firstInteractionRef.current = false;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          const tmp = new AC();
          if (tmp.state === 'suspended') tmp.resume().catch(() => {});
          tmp.close().catch(() => {});
        }
      } catch (_) {}
      bgMusic.start();
      setMusicOn(true);
    }
    setPesos((p) => p + currentClickValue);
    setTotalEarned((t) => t + currentClickValue);
    setLifetimeEarned((t) => t + currentClickValue);
    setTotalClicks((c) => c + 1);
    setIsPressed(true); playClick();
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
    setLifetimeEarned((t) => t + upgradeDef.cost);
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
        setLifetimeEarned((t) => t + cost);
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
    if (pesos >= cost) { setPesos((p) => p - cost); setTotalEarned((t) => t + cost); setLifetimeEarned((t) => t + cost); setUpgrades((u) => ({ ...u, [upgrade.id]: true })); playUpgrade(); }
  };
  const purchasePackage = (pkg) => {
    if (packageUpgrades[pkg.id]) return;
    if (pesos >= pkg.cost) { setPesos((p) => p - pkg.cost); setTotalEarned((t) => t + pkg.cost); setLifetimeEarned((t) => t + pkg.cost); setPackageUpgrades((u) => ({ ...u, [pkg.id]: true })); playUpgrade(); }
  };
  const purchaseSpeed = (speed) => {
    const currentSpd = NETWORK_SPEEDS.find(s => s.id === currentSpeed);
    const targetSpd = NETWORK_SPEEDS.find(s => s.id === speed.id);
    if (pesos >= targetSpd.baseCost && targetSpd.baseCost > currentSpd.baseCost) { setPesos((p) => p - targetSpd.baseCost); setTotalEarned((t) => t + targetSpd.baseCost); setLifetimeEarned((t) => t + targetSpd.baseCost); setCurrentSpeed(speed.id); playUpgrade(); }
  };

  // ===== Manual Cloud Save =====
  const handleManualSave = useCallback(async () => {
    if (!token || !user) return;
    setSaving(true);
    try {
      const state = {
        version: SAVE_VERSION, pesos, machinesByLocation, localUpgrades, unlockedLocations,
        currentLocation, upgrades, currentSpeed, packageUpgrades, unlockedAchievements,
        totalEarned, lifetimeEarned, prestigeCount, totalClicks, playTime, prestigePoints, prestigeUpgrades,
      };
      await saveToCloud(state);
      showToast('☁️ Saved!');
    } catch (err) {
      showToast(`☁️ Save failed: ${err.message}`, 5000);
    } finally {
      setSaving(false);
    }
  }, [token, user, pesos, machinesByLocation, localUpgrades, unlockedLocations, currentLocation, upgrades, currentSpeed, packageUpgrades, unlockedAchievements, totalEarned, lifetimeEarned, prestigeCount, totalClicks, playTime, prestigePoints, prestigeUpgrades, saveToCloud]);

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
      setLifetimeEarned((t) => t + cost);
      setLifetimeEarned((t) => t + cost);
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
    setConfirmPrestige(true);
  };

  const confirmDoPrestige = () => {
    setConfirmPrestige(false);
    const newPoints = availablePrestigePoints;
    setPesos(prestigeStartingMoney);
    setTotalEarned(0);
    setMachinesByLocation(LOCATIONS.map(() => []));
    setLocalUpgrades(LOCATIONS.map(() => ({})));
    setUnlockedLocations([0]);
    setCurrentLocation(0);
    setUpgrades({ reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false });
    setPackageUpgrades({ sukiLoad: false, regularPlan: false, unlimitedPlan: false });
    setCurrentSpeed('3g'); setAchievementToast(null);
    setPrestigePoints(newPoints);
    setPrestigeCount((c) => c + 1);
    setDetailMachineId(null);
    // Immediately save after prestige
    setTimeout(() => {
      const state = saveStateRef.current;
      if (state) {
        const saved = { ...state, prestigePoints: newPoints, prestigeCount: (state.prestigeCount || 0) + 1, pesos: prestigeStartingMoney, totalEarned: 0, totalClicks: state.totalClicks || 0, playTime: state.playTime || 0, machinesByLocation: LOCATIONS.map(() => []), localUpgrades: LOCATIONS.map(() => ({})), unlockedLocations: [0], currentLocation: 0, upgrades: { reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false }, packageUpgrades: { sukiLoad: false, regularPlan: false, unlimitedPlan: false }, currentSpeed: '3g' };
        localStorage.setItem('piso-wifi-empire-state', JSON.stringify(saved));
        if (token && user) {
          saveToCloud(saved).then(() => showToast('☁️ Rebirth saved!')).catch(() => showToast('☁️ Rebirth save failed', 5000));
        }
      }
    }, 100);
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
    setConfirmReset(true);
  };

  const confirmResetGame = () => {
    setConfirmReset(false);
    setPesos(0);
    setMachinesByLocation(LOCATIONS.map(() => []));
    setLocalUpgrades(LOCATIONS.map(() => ({})));
    setUnlockedLocations([0]);
    setCurrentLocation(0);
    setUpgrades({ reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false });
    setPackageUpgrades({ sukiLoad: false, regularPlan: false, unlimitedPlan: false });
    setCurrentSpeed('3g'); setUnlockedAchievements([]); setTotalEarned(0);
    setTotalClicks(0); setPlayTime(0);
    setAchievementToast(null); setPrestigePoints(0); setPrestigeUpgrades({}); setPrestigeCount(0); setLifetimeEarned(0); setDetailMachineId(null);
    localStorage.removeItem('piso-wifi-empire-state');
    // Save cleared state to cloud
    if (token && user) {
      const cleared = { version: SAVE_VERSION, pesos: 0, machinesByLocation: LOCATIONS.map(() => []), localUpgrades: LOCATIONS.map(() => ({})), unlockedLocations: [0], currentLocation: 0, upgrades: { reinforcedAntenna: false, industrialCasing: false, fiberCable: false, backupPowerCell: false, coolingSystem: false, autoTuner: false, signalBooster: false, meshExtender: false }, packageUpgrades: { sukiLoad: false, regularPlan: false, unlimitedPlan: false }, currentSpeed: '3g', unlockedAchievements: [], totalEarned: 0, lifetimeEarned: 0, prestigeCount: 0, totalClicks: 0, playTime: 0, prestigePoints: 0, prestigeUpgrades: {} };
      saveToCloud(cleared).then(() => showToast('☁️ Game reset & saved!')).catch(() => showToast('☁️ Reset save failed', 5000));
    }
  };

  // ===== Title Screen Handlers =====
  const handleStart = () => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    setGameStarted(true);
  };

  const handleAuthSuccess = () => {
    localStorage.removeItem('piso-login-dismissed');
    setShowAuthModal(false);
    setGameStarted(true);
  };

  // ===== Render =====
  return (
    <>
      <Head>
        <title>Piso Wifi Idle</title>
        <meta name="description" content="Strategic idle tycoon game — build your wifi empire!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2a3d2b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      {/* ===== TITLE SCREEN ===== */}
      {!gameStarted && (
        <div className="title-screen">
          <div className="title-scanlines" />
          <div className="title-content">
            <div className="title-logo">
              <div className="title-icon">📡</div>
              <h1 className="title-text">PISO WIFI</h1>
              <h2 className="title-subtext">IDLE EMPIRE</h2>
              <div className="title-tagline">Build your wifi vending empire!</div>
            </div>
            <div className="title-menu">
              <button className="title-button title-start" onClick={handleStart}>
                <span className="title-btn-icon">▶</span> START
              </button>
              <button className="title-button title-options" onClick={() => setShowSettings(true)}>
                <span className="title-btn-icon">⚙</span> OPTIONS
              </button>
            </div>
            {token && user && (
              <div className="title-save-info">Welcome back, {user.username}!</div>
            )}
            <div className="title-footer">v1.0 — Tap to earn!</div>
          </div>
          <div className="title-vendo-silhouette">
            <PixelIcon type="pisoWifiAntenna" size={200} />
          </div>

          {/* Settings from title screen */}
          {showSettings && (
            <div className="achievement-overlay" onClick={() => setShowSettings(false)}>
              <div className="achievement-panel" onClick={(e) => e.stopPropagation()} style={{maxWidth: '380px'}}>
                <div className="achievement-panel-header">
                  <h2 className="achievement-panel-title">OPTIONS</h2>
                  <button className="achievement-close" onClick={() => setShowSettings(false)}>✕</button>
                </div>
                <div className="achievement-panel-body">
                  <div className="prestige-upgrade-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div className="detail-stat-label" style={{fontSize: '0.45rem'}}>MUSIC</div>
                      <div className="detail-stat-value" style={{fontSize: '0.4rem', color: '#888'}}>Background music</div>
                    </div>
                    <button className="prestige-button" style={{width: 'auto', padding: '0.4rem 1rem', fontSize: '0.4rem', minWidth: '70px'}}
                      onClick={() => {
                        if (firstInteractionRef.current) { firstInteractionRef.current = false; bgMusic.start(); setMusicOn(true); }
                        else { const nowMuted = bgMusic.toggleMute(); setMusicOn(!nowMuted); }
                      }}>
                      {musicOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="prestige-upgrade-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem'}}>
                    <div>
                      <div className="detail-stat-label" style={{fontSize: '0.45rem'}}>SOUND EFFECTS</div>
                      <div className="detail-stat-value" style={{fontSize: '0.4rem', color: '#888'}}>Click, buy, upgrade sounds</div>
                    </div>
                    <button className="prestige-button" style={{width: 'auto', padding: '0.4rem 1rem', fontSize: '0.4rem', minWidth: '70px',
                      background: soundEnabled ? '#e89330' : '#2a2a2a', color: soundEnabled ? '#141414' : '#666'}}
                      onClick={() => setSoundEnabled(!soundEnabled)}>
                      {soundEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="prestige-upgrade-card" style={{marginTop: '0.4rem'}}>
                    <div className="detail-stat-label" style={{fontSize: '0.45rem'}}>VOLUME</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem'}}>
                      <span style={{color: '#666', fontSize: '0.35rem'}}>🔇</span>
                      <input type="range" min="0" max="1" step="0.05" value={masterVolume}
                        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                        style={{flex: 1, accentColor: '#e89330', height: '4px', cursor: 'pointer'}} />
                      <span style={{color: '#e89330', fontSize: '0.35rem'}}>🔊</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAuthModal && (
            <AuthModal onClose={() => setShowAuthModal(false)} onLoginSuccess={handleAuthSuccess} />
          )}
        </div>
      )}

      {/* ===== MAIN GAME ===== */}
      {gameStarted && (
      <main className="game-container">
        {/* ===== HEADER ===== */}
        <header className="game-header">
          <h1 className="game-title">PISO WIFI IDLE</h1>
          <span style={{flex:1, minWidth:'0.5rem'}} />
          <div className="header-buttons">
            <button className="auth-header-button" onClick={() => setShowLeaderboard(!showLeaderboard)}>
              LEADERBOARD
            </button>
            <button className="auth-header-button" onClick={() => setShowProfile(!showProfile)}>
              PROFILE
            </button>
            <button className="reset-button" onClick={() => setShowSettings(!showSettings)}>SETTINGS</button>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <div className="main-content">
          {/* Viewport — Live Monitor */}
          <section className="viewport" style={{ backgroundColor: loc?.bgColor || '#141414' }} onClick={() => showControlHub && setShowControlHub(false)}>
            {/* Pixel-art background scenery */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
              <PixelScenery locationId={loc?.id} accent={loc?.accentColor} />
            </div>

            {/* Description as background text */}
            <div className="viewport-desc-bg">{loc?.description || ''}</div>

            <div className="viewport-header">
              <div className="viewport-title-row">
                <div className="viewport-location-name" style={{ color: loc?.accentColor || '#e89330' }}>
                  <span className="loc-pin-icon">{LOCATION_ICONS[currentLocation]}</span> {loc?.name || 'Unknown'}
                </div>
              </div>
              <div className="viewport-location-subtitle">{loc?.subtitle || ''}</div>
              <div className="viewport-balance">
                <span className="balance-label">PERA</span>
                <span className="balance-amount"><span className="peso-sign">₱</span>{Math.floor(pesos).toLocaleString()}</span>
              </div>
            </div>

            {/* Live Console Monitor */}
            <div className="live-console">
              <div className="console-header">
                <span>NETWORK MONITOR v2.0</span>
                <span className="console-dot">●</span>
              </div>
              <div className="console-grid">
                <span className="console-label">STATUS</span>
                <span className="console-value amber">ONLINE</span>
                <span className="console-label">PESOS/SEC</span>
                <span className="console-value gold">₱{Math.round(pps).toLocaleString()}</span>
                <span className="console-label">ACTIVE USERS</span>
                <span className="console-value amber">{activeUsers}</span>
                <span className="console-label">VENDOS</span>
                <span className="console-value">{totalMachines}</span>
                {prestigeCount > 0 && (<>
                  <span className="console-label">REBIRTHS</span>
                  <span className="console-value gold">{prestigeCount}x</span>
                </>)}
                <div className="console-bar"><div className="console-bar-fill" style={{width: `${Math.min(pps / 100 * 100, 100)}%`}} /></div>
              </div>
            </div>

            {/* Clickable Machine */}
            <div className={`clickable-machine ${isPressed ? 'pressed' : ''}`} onClick={(e) => { e.stopPropagation(); handleClick(e); }} ref={clickAreaRef} style={{position:'relative'}}>
              <div className="machine-display-area">
                {loc && (
                  <>
                    <div className="machine-sizer">
                      <MachineDisplay type={loc.machine.id} size={120} parts={{
                        reinforcedAntenna: upgrades.reinforcedAntenna,
                        industrialCasing: upgrades.industrialCasing,
                        fiberCable: upgrades.fiberCable,
                        backupPowerCell: upgrades.backupPowerCell,
                        coolingSystem: upgrades.coolingSystem,
                        autoTuner: upgrades.autoTuner,
                        signalBooster: upgrades.signalBooster,
                        meshExtender: upgrades.meshExtender,
                      }} level={machineCount > 0 ? Math.max(...locationMachines.map(m => m.level || 1)) : 1} />
                    </div>
                    <div className="machine-glow-ring" style={{ borderColor: loc.accentColor }} />
                  </>
                )}
              </div>
              <div className="tap-hint">▶ TAP TO EARN ₱{currentClickValue}</div>

              {/* Floating click texts inside machine container */}
              {floatingTexts.map(text => (
                <FloatingText key={text.id} x={text.x} y={text.y} value={text.value} onAnimationEnd={() => removeFloatingText(text.id)} />
              ))}
            </div>

          </section>

          {/* Control Hub */}
          {showControlHub && (
          <aside className="control-hub">
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
                📋 VENDOS ({machineCount})
              </h3>
              {locationMachines.length === 0 ? (
                <div className="hub-empty">No vendos yet. Buy your first {loc?.machine.name || 'vendo'}!</div>
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
                            <span className="hmc-name">{m.name || `${loc?.machine.name || 'Vendo'} #${idx + 1}`}</span>
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
              {showGlobalShop ? '▼' : '▶'} VENDO UPGRADES
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
          )}
        </div>

        {/* ===== MENU TOGGLE BUTTON ===== */}
        <button className="menu-toggle-button" onClick={() => setShowControlHub(!showControlHub)}>
          {showControlHub ? '▼ HIDE MENU' : '▲ SHOW MENU'}
        </button>

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

        {/* ===== Cloud Toast Notification ===== */}
        {cloudToast && (
          <div className="cloud-toast">{cloudToast}</div>
        )}

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
        <PrestigePanel points={prestigePoints} rebirthCount={prestigeCount} upgrades={prestigeUpgrades} visible={showPrestige} onClose={() => setShowPrestige(false)} onPrestige={doPrestige} onBuyUpgrade={purchasePrestigeUpgrade} canPrestige={canPrestige} />
        <LeaderboardPanel visible={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
        {showAuthModal && (
          <AuthModal
            onClose={() => {
              dismissLoginPrompt();
            }}
            onLoginSuccess={() => {
              localStorage.removeItem('piso-login-dismissed');
              setShowAuthModal(false);
            }}
          />
        )}

        {/* ===== Profile Panel ===== */}
        {showProfile && (
          <div className="achievement-overlay" onClick={() => setShowProfile(false)}>
            <div className="achievement-panel" onClick={(e) => e.stopPropagation()} style={{maxWidth: '420px'}}>
              <div className="achievement-panel-header">
                <h2 className="achievement-panel-title">PROFILE</h2>
                <button className="achievement-close" onClick={() => setShowProfile(false)}>✕</button>
              </div>
              <div className="achievement-panel-body">
                {/* Achievements section */}
                <div className="prestige-upgrade-card" style={{cursor: 'pointer'}} onClick={() => { setShowProfile(false); setShowAchievements(true); }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div className="detail-stat-label">ACHIEVEMENTS</div>
                      <div className="detail-stat-value" style={{fontSize: '0.4rem', color: '#aaa'}}>{unlockedAchievements.length} / {ACHIEVEMENTS.length} unlocked</div>
                    </div>
                    <div className="achievement-progress-bar" style={{width: '100px', height: '6px', margin: 0}}>
                      <div className="achievement-progress-fill" style={{width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%`}} />
                    </div>
                  </div>
                </div>

                {/* Prestige section */}
                <div className="prestige-upgrade-card" style={{cursor: 'pointer', marginTop: '0.4rem'}} onClick={() => { setShowProfile(false); setShowPrestige(true); }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div className="detail-stat-label">PRESTIGE</div>
                      <div className="detail-stat-value" style={{fontSize: '0.4rem', color: '#e89330'}}>{prestigePoints} points</div>
                    </div>
                    <div style={{fontSize: '0.35rem', color: '#666'}}>VIEW →</div>
                  </div>
                </div>

                <hr style={{border: 'none', borderTop: '1px solid #222', margin: '0.6rem 0'}} />

                {/* User section */}
                {user ? (
                  <>
                    <div style={{textAlign: 'center', marginBottom: '0.6rem'}}>
                      <div style={{fontSize: '0.5rem', color: '#e89330'}}>{user.username}</div>
                    </div>
                    <div className="prestige-upgrade-card" style={{textAlign: 'left'}}>
                      <div className="detail-stat-label">TOTAL EARNED</div>
                      <div className="detail-stat-value earnings">₱{Math.floor(totalEarned).toLocaleString()}</div>
                    </div>
                    <div className="prestige-upgrade-card" style={{textAlign: 'left', marginTop: '0.3rem'}}>
                      <div className="detail-stat-label">VENDOS DEPLOYED</div>
                      <div className="detail-stat-value" style={{color: '#d4d0c8'}}>{totalMachines}</div>
                    </div>
                    <div className="prestige-upgrade-card" style={{textAlign: 'left', marginTop: '0.3rem'}}>
                      <div className="detail-stat-label">PASSIVE INCOME</div>
                      <div className="detail-stat-value" style={{color: '#22aa55'}}>₱{Math.round(pps).toLocaleString()}/sec</div>
                    </div>
                    <div style={{display: 'flex', gap: '0.3rem', marginTop: '0.6rem'}}>
                      <button className="prestige-buy-button" style={{flex: 1}} onClick={handleManualSave} disabled={saving}>
                        {saving ? 'SAVING...' : 'SAVE TO CLOUD'}
                      </button>
                      <button className="prestige-buy-button" style={{flex: 1, background: '#442211', color: '#aa6644'}}
                        onClick={() => { logout(); setShowProfile(false); localStorage.removeItem('piso-wifi-empire-state'); setGameStarted(false); showToast('☁️ Logged out', 2000); }}>
                        LOGOUT
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{textAlign: 'center', fontSize: '0.4rem', color: '#888', marginBottom: '0.6rem', lineHeight: 1.6}}>
                      Sign in to save your progress to the cloud
                    </div>
                    <button className="prestige-button" style={{width: '100%'}}
                      onClick={() => { setShowProfile(false); setShowAuthModal(true); }}>
                      SIGN IN / SIGN UP
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Settings Panel ===== */}
        {showSettings && (
          <div className="achievement-overlay" onClick={() => setShowSettings(false)}>
            <div className="achievement-panel" onClick={(e) => e.stopPropagation()} style={{maxWidth: '380px'}}>
              <div className="achievement-panel-header">
                <h2 className="achievement-panel-title">SETTINGS</h2>
                <button className="achievement-close" onClick={() => setShowSettings(false)}>✕</button>
              </div>
              <div className="achievement-panel-body">
                <div className="prestige-upgrade-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div className="detail-stat-label" style={{fontSize: '0.45rem'}}>MUSIC</div>
                    <div className="detail-stat-value" style={{fontSize: '0.4rem', color: '#888'}}>Background music</div>
                  </div>
                  <button
                    className="prestige-button"
                    style={{width: 'auto', padding: '0.4rem 1rem', fontSize: '0.4rem', minWidth: '70px'}}
                    onClick={() => {
                      if (firstInteractionRef.current) { firstInteractionRef.current = false; bgMusic.start(); setMusicOn(true); }
                      else { const nowMuted = bgMusic.toggleMute(); setMusicOn(!nowMuted); }
                    }}
                  >
                    {musicOn ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="prestige-upgrade-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem'}}>
                  <div>
                    <div className="detail-stat-label" style={{fontSize: '0.45rem'}}>SOUND EFFECTS</div>
                    <div className="detail-stat-value" style={{fontSize: '0.4rem', color: '#888'}}>Click, buy, upgrade sounds</div>
                  </div>
                  <button
                    className="prestige-button"
                    style={{width: 'auto', padding: '0.4rem 1rem', fontSize: '0.4rem', minWidth: '70px',
                      background: soundEnabled ? '#e89330' : '#2a2a2a', color: soundEnabled ? '#141414' : '#666'}}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="prestige-upgrade-card" style={{marginTop: '0.4rem'}}>
                  <div className="detail-stat-label" style={{fontSize: '0.45rem'}}>VOLUME</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem'}}>
                    <span style={{color: '#666', fontSize: '0.35rem'}}>🔇</span>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={masterVolume}
                      onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                      style={{flex: 1, accentColor: '#e89330', height: '4px', cursor: 'pointer'}}
                    />
                    <span style={{color: '#e89330', fontSize: '0.35rem'}}>🔊</span>
                  </div>
                </div>
                <div className="prestige-upgrade-card" style={{marginTop: '0.4rem', textAlign: 'left'}}>
                  <div className="detail-stat-label" style={{fontSize: '0.4rem'}}>RESET GAME</div>
                  <div className="detail-stat-value" style={{fontSize: '0.35rem', color: '#884433', marginTop: '0.3rem'}}>
                    This will erase all progress permanently
                  </div>
                  <button
                    className="prestige-button"
                    style={{marginTop: '0.5rem', width: '100%', background: '#442211', color: '#aa6644'}}
                    onClick={resetGame}
                  >
                    RESET EVERYTHING
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Rebirth Modal */}
        {confirmPrestige && (
          <div className="achievement-overlay" onClick={() => setConfirmPrestige(false)}>
            <div className="achievement-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="achievement-panel-header">
                <h2 className="achievement-panel-title">⭐ CONFIRM REBIRTH</h2>
                <button className="achievement-close" onClick={() => setConfirmPrestige(false)}>✕</button>
              </div>
              <div className="achievement-panel-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.45rem', color: '#d4d0c8', marginBottom: '0.8rem', lineHeight: 1.8 }}>
                  You will reset all your progress and earn <strong style={{ color: '#e89330' }}>{availablePrestigePoints} barangay tokens</strong>.
                  <br /><br />Rebirth #{prestigeCount + 1} — This cannot be undone!
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="prestige-button" style={{ flex: 1, background: '#e89330' }}
                    onClick={confirmDoPrestige}>
                    ⭐ YES, REBIRTH
                  </button>
                  <button className="prestige-button" style={{ flex: 1, background: '#333', color: '#888' }}
                    onClick={() => setConfirmPrestige(false)}>
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Reset Modal */}
        {confirmReset && (
          <div className="achievement-overlay" onClick={() => setConfirmReset(false)}>
            <div className="achievement-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="achievement-panel-header">
                <h2 className="achievement-panel-title">⚠️ CONFIRM RESET</h2>
                <button className="achievement-close" onClick={() => setConfirmReset(false)}>✕</button>
              </div>
              <div className="achievement-panel-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.45rem', color: '#d4d0c8', marginBottom: '0.8rem', lineHeight: 1.8 }}>
                  This will <strong style={{ color: '#cc4444' }}>erase ALL progress</strong> including:
                  <br /><br />
                  ₱ Pesos • Vendos • Upgrades • Tokens • Achievements
                  <br /><br />
                  This cannot be undone!
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="prestige-button" style={{ flex: 1, background: '#663322', color: '#d4c0b0' }}
                    onClick={confirmResetGame}>
                    🗑️ YES, RESET
                  </button>
                  <button className="prestige-button" style={{ flex: 1, background: '#333', color: '#888' }}
                    onClick={() => setConfirmReset(false)}>
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      )}

      <style jsx global>{`
        /* ===========================================
           TITLE SCREEN
           =========================================== */
        .title-screen {
          position: fixed; inset: 0; z-index: 500;
          background: #0a0a0a;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Press Start 2P', cursive;
          overflow: hidden;
        }
        .title-scanlines {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px);
        }
        .title-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 2rem; padding: 1.5rem; text-align: center;
        }
        .title-logo { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
        .title-icon { font-size: 3rem; margin-bottom: 0.5rem; animation: titlePulse 2s ease-in-out infinite; }
        @keyframes titlePulse { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(232,147,48,0.3)); } 50% { transform: scale(1.05); filter: drop-shadow(0 0 16px rgba(232,147,48,0.6)); } }
        .title-text {
          color: #e89330; font-size: 1.8rem; letter-spacing: 4px;
          text-shadow: 0 0 20px rgba(232,147,48,0.4), 0 4px 0 #8b5a1a;
          line-height: 1.2;
        }
        .title-subtext {
          color: #d4d0c8; font-size: 0.9rem; letter-spacing: 6px;
          text-shadow: 0 0 10px rgba(212,208,200,0.2);
        }
        .title-tagline {
          color: #666; font-size: 0.35rem; margin-top: 0.5rem;
          letter-spacing: 2px; text-transform: uppercase;
        }
        .title-menu {
          display: flex; flex-direction: column; gap: 0.8rem;
          align-items: center; width: 100%; max-width: 280px;
        }
        .title-button {
          font-family: 'Press Start 2P', cursive;
          width: 100%; padding: 0.8rem 1.2rem;
          font-size: 0.7rem; cursor: pointer;
          border: 2px solid; border-radius: 4px;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          transition: all 0.15s; letter-spacing: 2px;
          min-height: 52px;
        }
        .title-btn-icon { font-size: 0.6rem; }
        .title-start {
          background: #e89330; color: #0a0a0a; border-color: #e89330;
          box-shadow: 0 0 20px rgba(232,147,48,0.3), inset 0 -3px 0 #8b5a1a;
        }
        .title-start:hover { filter: brightness(1.15); transform: scale(1.02); box-shadow: 0 0 30px rgba(232,147,48,0.5); }
        .title-start:active { transform: scale(0.98); }
        .title-options {
          background: transparent; color: #888; border-color: #333;
          box-shadow: inset 0 -2px 0 #222;
        }
        .title-options:hover { color: #d4d0c8; border-color: #555; background: #1a1a1a; }
        .title-save-info {
          color: #22aa55; font-size: 0.35rem; margin-top: 0.5rem;
          letter-spacing: 1px; animation: titleFadeIn 0.5s ease-out;
        }
        @keyframes titleFadeIn { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
        .title-footer { color: #333; font-size: 0.25rem; margin-top: 1rem; letter-spacing: 2px; }
        .title-vendo-silhouette {
          position: absolute; bottom: -30px; right: -20px; z-index: 1;
          opacity: 0.06; pointer-events: none;
        }
        @media (max-width: 480px) {
          .title-text { font-size: 1.2rem; }
          .title-subtext { font-size: 0.6rem; letter-spacing: 4px; }
          .title-button { font-size: 0.55rem; padding: 0.7rem 1rem; min-height: 46px; }
          .title-icon { font-size: 2.2rem; }
        }

        /* ===========================================
           STREET THEME — Manila Urban Concrete
           =========================================== */

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Press Start 2P', cursive;
          background: #141414;
          color: #d4d0c8;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.008) 2px,
              rgba(255,255,255,0.008) 4px
            );
          pointer-events: none;
          z-index: 9999;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #141414; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        .game-container { height: 100dvh; display: flex; flex-direction: column; overflow: hidden; background: #141414; user-select: none; -webkit-user-select: none; }

        /* ===== HEADER — Street Signage ===== */
        .game-header {
          display: flex; align-items: center; padding: 0.4rem 0 0.4rem 0.6rem;
          background: #1c1c1c;
          border-bottom: 1px solid #333;
          gap: 0; flex-shrink: 0; min-height: 42px;
        }
        .header-left { flex-shrink: 0; }
        .game-title {
          color: #e89330; font-size: 0.6rem; white-space: nowrap;
          letter-spacing: 0.5px;
        }

        .header-buttons { display: flex; gap: 0.3rem; align-items: center; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

        .auth-header-button, .achievements-button, .prestige-header-button, .reset-button, .music-button {
          font-family: 'Press Start 2P', cursive;
          padding: 0.4rem 0.5rem; font-size: 0.38rem; cursor: pointer; white-space: nowrap;
          min-height: 36px; border: 1px solid #333; border-radius: 4px;
          background: transparent; color: #aaa;
          transition: all 0.15s; -webkit-tap-highlight-color: transparent;
          user-select: none; -webkit-user-select: none;
        }
        .auth-header-button:hover, .achievements-button:hover, .prestige-header-button:hover, .reset-button:hover, .music-button:hover {
          background: #222; color: #d4d0c8;
        }
        .auth-header-button.logged-in { color: #e89330; border-color: #555; }
        .auth-header-button.save-button { color: #aaa; border-color: #444; }
        .auth-header-button.save-button:disabled { opacity: 0.4; cursor: not-allowed; }
        .reset-button { color: #aaa; border-color: #444; }
        .reset-button:hover { background: #222; color: #d4d0c8; }
        .music-button.on { color: #e89330; border-color: #555; }
        .music-button.off { color: #554433; border-color: #332211; }
        .cloud-toast {
          position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%);
          background: #1c1c1c; border: 1px solid #333; border-radius: 6px;
          padding: 0.5rem 1rem; font-size: 0.35rem; color: #e89330;
          z-index: 9999; white-space: nowrap;
          animation: toastFade 0.3s ease-out;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        }
        @keyframes toastFade { 0% { opacity: 0; transform: translateX(-50%) translateY(10px); } 100% { opacity: 1; transform: translateX(-50%) translateY(0); } }

        /* ===== MAIN CONTENT ===== */
        .main-content { display: flex; flex: 1; min-height: 0; position: relative; }

        /* ===== VIEWPORT — Street Monitor ===== */
        .viewport {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; border-right: 1px solid #333;
          transition: background-color 0.5s; padding: 1rem;
          background-image: 
            radial-gradient(ellipse at 20% 80%, rgba(232,147,48,0.03) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 50%);
        }
        .viewport-header { margin-bottom: 0.3rem; width: 100%; max-width: 340px; text-align: center; }
        .viewport-title-row { display: flex; justify-content: center; align-items: center; width: 100%; }
        .viewport-location-name { font-size: 0.55rem; font-weight: bold; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
        .loc-pin-icon { font-size: 0.75rem; flex-shrink: 0; }
        .viewport-balance { margin-top: 0.3rem; background: #0d0d0d; border: 1px solid #333; border-radius: 4px; padding: 0.3rem 0.6rem; text-align: center; display: inline-flex; flex-direction: column; align-items: center; gap: 0.1rem; }
        .balance-label { font-size: 0.35rem; color: #666; font-family: 'Press Start 2P', monospace; letter-spacing: 1px; }
        .balance-amount { font-size: 0.6rem; font-weight: bold; color: #e89330; font-family: 'Press Start 2P', monospace; white-space: nowrap; line-height: 1; }
        .peso-sign { font-family: Arial, Helvetica, sans-serif; }
        .viewport-location-subtitle { color: #888; font-size: 0.35rem; text-align: center; margin-top: 0.15rem; }
        .viewport-desc-bg { position: absolute; bottom: 0.5rem; left: 50%; transform: translateX(-50%); color: #555; font-size: 0.3rem; text-align: center; line-height: 1.4; opacity: 0.4; pointer-events: none; white-space: nowrap; z-index: 1; max-width: 90%; overflow: hidden; text-overflow: ellipsis; }

        /* ── Live Console Monitor ── */
        .live-console {
          background: #0d0d0d; border: 1px solid #2a2a2a;
          border-radius: 4px; padding: 0.75rem; width: 100%; max-width: 320px;
          font-family: 'Press Start 2P', monospace; position: relative;
        }
        .console-header {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 0.5rem; margin-bottom: 0.5rem;
          border-bottom: 1px solid #222;
          font-size: 0.38rem; color: #888;
        }
        .console-dot { color: #22aa55; font-size: 0.5rem; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .console-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.35rem; }
        .console-label { color: #666; }
        .console-value { color: #d4d0c8; text-align: right; }
        .console-value.gold { color: #e89330; }
        .console-value.amber { color: #f0b040; }
        .console-bar { grid-column: span 2; height: 3px; background: #222; border-radius: 2px; margin: 0.2rem 0; overflow: hidden; }
        .console-bar-fill { height: 100%; background: #e89330; border-radius: 2px; transition: width 0.5s; }

        /* ── Clickable Machine ── */
        .clickable-machine {
          cursor: pointer; position: relative; z-index: 5;
          display: flex; flex-direction: column; align-items: center;
          touch-action: manipulation; -webkit-tap-highlight-color: transparent;
          user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;
          transition: transform 0.1s ease;
        }
        .machine-sizer {
          width: 180px; height: 180px;
          transition: all 0.3s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .machine-sizer svg {
          width: 180px !important; height: 180px !important;
        }
        @media (min-width: 900px) {
          .machine-sizer { width: 280px; height: 280px; }
          .machine-sizer svg { width: 280px !important; height: 280px !important; }
        }
        .clickable-machine:hover { filter: brightness(1.2); }
        .clickable-machine.pressed { transform: scale(0.92); }

        .tap-hint {
          color: #e89330; font-size: 0.38rem; margin-top: 0.3rem;
          animation: blink 1.5s step-end infinite; text-align: center;
          user-select: none; -webkit-user-select: none;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }

        /* ── Floating Text ── */
        .floating-text {
          position: absolute; color: #e89330; font-size: 0.9rem; font-weight: bold;
          text-shadow: 0 0 12px rgba(232,147,48,0.4);
          pointer-events: none; animation: floatUp 0.9s ease-out forwards;
          z-index: 10;
        }
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-50px); } }

        /* ── Machine Display (colorful) ── */
        .machine-display-area {
          display: flex; flex-direction: column; align-items: center;
          margin-top: 0.5rem; position: relative;
        }
        .machine-glow-ring {
          position: absolute; inset: 8px; border: 1px solid;
          border-radius: 50%; opacity: 0.2;
          animation: ringPulse 2s ease-in-out infinite; pointer-events: none;
        }
        @keyframes ringPulse { 0%,100% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(1.05); opacity: 0.35; } }



        /* ===== MENU TOGGLE BUTTON ===== */
        .menu-toggle-button {
          font-family: 'Press Start 2P', cursive; font-size: 0.4rem;
          padding: 0.45rem 0.8rem; background: #1a1a1a; color: #e89330;
          border: 1px solid #333; border-top: none; border-radius: 0 0 6px 6px;
          cursor: pointer; width: 100%; text-align: center;
          transition: background 0.15s; min-height: 38px;
        }
        .menu-toggle-button:hover { background: #222; }

        /* ===== CONTROL HUB — Concrete Panel ===== */
        .control-hub {
          width: 380px; background: #1a1a1a;
          overflow-y: auto; padding: 0.75rem;
          display: flex; flex-direction: column; gap: 0.5rem;
          height: 100%;
        }
        .hub-stats-row { display: flex; gap: 0.35rem; }
        .hub-stat {
          flex: 1; background: #141414; border: 1px solid #2a2a2a;
          padding: 0.4rem; text-align: center; border-radius: 4px;
        }
        .hub-stat-label { display: block; color: #666; font-size: 0.4rem; margin-bottom: 0.2rem; }
        .hub-stat-value { display: block; color: #d4d0c8; font-size: 0.55rem; font-weight: bold; }
        .hub-stat-value.click { color: #e89330; }
        .hub-section {
          background: #141414; border: 1px solid #2a2a2a;
          padding: 0.5rem; border-radius: 4px;
        }
        .hub-section-title {
          color: #e89330; font-size: 0.45rem; margin-bottom: 0.4rem;
          padding-bottom: 0.3rem; border-bottom: 1px solid #2a2a2a;
          display: flex; align-items: center; gap: 0.3rem;
        }
        .hub-purchase-card { display: flex; align-items: center; gap: 0.5rem; }
        .purchase-info { flex: 1; min-width: 0; }
        .purchase-owned { display: block; color: #d4d0c8; font-size: 0.42rem; margin-bottom: 0.15rem; }
        .purchase-income { display: block; color: #aaa; font-size: 0.38rem; margin-bottom: 0.15rem; }
        .purchase-cost { display: block; color: #e89330; font-size: 0.38rem; }
        .buy-button {
          font-family: 'Press Start 2P', cursive;
          background: #e89330; color: #141414;
          border: none; padding: 0.5rem 0.7rem; border-radius: 4px;
          font-size: 0.5rem; cursor: pointer; flex-shrink: 0; min-width: 70px; min-height: 40px;
          transition: all 0.15s; font-weight: bold;
          user-select: none; -webkit-user-select: none;
        }
        .buy-button:hover:not(.disabled) { filter: brightness(1.15); }
        .buy-button.disabled { background: #2a2a2a; color: #555; cursor: not-allowed; filter: none; }
        .buy-button-small {
          font-family: 'Press Start 2P', cursive;
          background: #e89330; color: #141414;
          border: none; padding: 0.45rem 0.55rem; border-radius: 4px;
          font-size: 0.38rem; cursor: pointer; flex-shrink: 0; min-width: 60px; min-height: 36px;
          transition: all 0.15s; font-weight: bold;
        }
        .buy-button-small:hover:not(.disabled) { filter: brightness(1.15); }
        .buy-button-small.disabled { background: #2a2a2a; color: #555; cursor: not-allowed; filter: none; }

        /* Local Upgrades */
        .hub-local-upgrades { display: flex; flex-direction: column; gap: 0.3rem; }
        .local-upgrade-card {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 4px;
        }
        .local-upgrade-card.owned { border-color: #555; opacity: 0.7; }
        .local-upgrade-info { flex: 1; min-width: 0; }
        .local-upgrade-name { color: #d4d0c8; font-size: 0.42rem; margin-bottom: 0.15rem; }
        .local-upgrade-desc { color: #888; font-size: 0.35rem; line-height: 1.4; }
        .local-upgrade-cost { color: #e89330; font-size: 0.38rem; }

        /* Machine List */
        .hub-empty { color: #555; font-size: 0.38rem; text-align: center; padding: 0.5rem; }
        .hub-machine-list { display: flex; flex-direction: column; gap: 0.2rem; max-height: 180px; overflow-y: auto; }
        .hub-machine-card {
          display: flex; align-items: center; gap: 0.3rem; padding: 0.3rem;
          background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 4px;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .hub-machine-card:hover { border-color: #555; background: #222; }
        .hub-machine-card.selected { border-color: #e89330; background: #1e1e1e; }
        .hmc-badge {
          width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
          font-size: 0.4rem; color: #141414; font-weight: bold; flex-shrink: 0;
          border-radius: 3px;
        }
        .hmc-info { flex: 1; min-width: 0; }
        .hmc-name-row { display: flex; justify-content: space-between; align-items: center; gap: 0.2rem; }
        .hmc-name { color: #d4d0c8; font-size: 0.38rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hmc-level { font-size: 0.38rem; flex-shrink: 0; }
        .hmc-details { display: flex; justify-content: space-between; margin-top: 0.1rem; }
        .hmc-details span { color: #888; font-size: 0.32rem; }

        /* Global Shop */
        .global-shop-toggle {
          font-family: 'Press Start 2P', cursive;
          background: transparent; color: #aaa;
          border: 1px solid #333; border-radius: 4px; padding: 0.4rem;
          font-size: 0.4rem; cursor: pointer; text-align: left; min-height: 36px;
          transition: all 0.15s;
        }
        .global-shop-toggle:hover { background: #222; color: #d4d0c8; }
        .hub-global-shop { display: flex; flex-direction: column; gap: 0.4rem; }
        .global-upgrade-card {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 4px;
        }
        .global-upgrade-card.owned { border-color: #555; opacity: 0.7; }
        .global-upgrade-card.current { border-color: #555; }
        .global-upgrade-info { flex: 1; min-width: 0; }
        .global-upgrade-name { color: #d4d0c8; font-size: 0.42rem; margin-bottom: 0.15rem; }
        .global-upgrade-desc { color: #888; font-size: 0.35rem; line-height: 1.4; }
        .global-upgrade-cost { color: #e89330; font-size: 0.38rem; }
        .current-badge-small {
          font-family: 'Press Start 2P', cursive;
          background: #e89330; color: #141414;
          padding: 0.3rem 0.4rem; font-size: 0.38rem; border-radius: 3px;
          flex-shrink: 0; min-height: 36px; display: flex; align-items: center; font-weight: bold;
        }

        /* ===== FOOTER — Location Tabs ===== */
        .location-tabs {
          display: flex; border-top: 1px solid #333;
          background: #1c1c1c; flex-shrink: 0;
          overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .location-tabs::-webkit-scrollbar { display: none; }
        .location-tab {
          flex: 1; font-family: 'Press Start 2P', cursive;
          background: transparent; color: #666;
          border: none; border-right: 1px solid #2a2a2a;
          border-bottom: 2px solid transparent;
          padding: 0.5rem 0.25rem; cursor: pointer; min-height: 56px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;
          transition: all 0.15s;
        }
        .location-tab:last-child { border-right: none; }
        .location-tab:hover { background: #222; color: #aaa; }
        .location-tab.active { background: #1a1a1a; border-bottom-color: #e89330; color: #e89330; }
        .location-tab.locked { opacity: 0.4; }
        .location-tab.can-unlock { opacity: 1; color: #e89330; }
        .loc-tab-icon { font-size: 0.9rem; }
        .loc-tab-name { font-size: 0.4rem; }
        .loc-tab-cost { font-size: 0.32rem; color: #e89330; }

        /* ===== Modals (achievement, prestige, machine detail) ===== */
        .achievement-toast {
          position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 0.8rem;
          background: #1c1c1c; border: 1px solid #e89330; border-radius: 8px;
          padding: 0.8rem 1.2rem; z-index: 100;
          animation: slideUpToast 0.3s ease-out; cursor: pointer; max-width: 90vw;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        @keyframes slideUpToast { 0% { transform: translateX(-50%) translateY(100px); opacity: 0; } 100% { transform: translateX(-50%) translateY(0); opacity: 1; } }
        .toast-icon { font-size: 1.5rem; } .toast-text { flex: 1; }
        .toast-title { color: #e89330; font-size: 0.4rem; margin-bottom: 0.2rem; }
        .toast-name { color: #e89330; font-size: 0.5rem; margin-bottom: 0.15rem; }
        .toast-desc { color: #888; font-size: 0.35rem; }

        .achievement-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
        .achievement-panel { background: #1c1c1c; border: 1px solid #333; border-radius: 8px; width: 95%; max-width: 520px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        .achievement-panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid #333; }
        .achievement-panel-title { color: #e89330; font-size: 0.6rem; }
        .achievement-close { font-family: 'Press Start 2P', cursive; background: transparent; color: #666; border: 1px solid #333; border-radius: 4px; padding: 0.25rem 0.4rem; font-size: 0.45rem; cursor: pointer; }
        .achievement-close:hover { background: #333; color: #d4d0c8; }
        .achievement-panel-body { padding: 1rem; overflow-y: auto; }
        .achievement-count { color: #888; font-size: 0.4rem; text-align: center; margin-bottom: 0.5rem; }
        .achievement-progress-bar { width: 100%; height: 8px; background: #2a2a2a; border-radius: 4px; margin-bottom: 1.2rem; overflow: hidden; }
        .achievement-progress-fill { height: 100%; background: #e89330; border-radius: 4px; transition: width 0.5s; }
        .achievement-list { display: flex; flex-direction: column; gap: 0.4rem; }
        .achievement-card { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem; background: #141414; border: 1px solid #2a2a2a; border-radius: 6px; }
        .achievement-card.unlocked { border-color: #555; }
        .achievement-card.locked { opacity: 0.5; }
        .achievement-card-icon { font-size: 1.2rem; flex-shrink: 0; }
        .achievement-card-info { flex: 1; }
        .achievement-card-name { color: #e89330; font-size: 0.45rem; margin-bottom: 0.2rem; }
        .achievement-card-desc { color: #888; font-size: 0.35rem; }

        .prestige-panel { background: #1c1c1c; border: 1px solid #333; border-radius: 8px; width: 95%; max-width: 520px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        .prestige-panel-title { color: #e89330; font-size: 0.6rem; }
        .prestige-info { text-align: center; padding-bottom: 0.8rem; border-bottom: 1px solid #333; margin-bottom: 0.8rem; }
        .prestige-points-display { display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-bottom: 0.8rem; }
        .prestige-points-icon { font-size: 1.5rem; }
        .prestige-points-value { color: #e89330; font-size: 1.2rem; }
        .prestige-points-label { color: #888; font-size: 0.35rem; }
        .prestige-desc { color: #888; font-size: 0.35rem; margin-bottom: 0.8rem; line-height: 1.6; }
        .prestige-button { font-family: 'Press Start 2P', cursive; background: #e89330; color: #141414; border: none; border-radius: 6px; padding: 0.6rem 1.2rem; font-size: 0.4rem; cursor: pointer; transition: all 0.15s; font-weight: bold; }
        .prestige-button:hover:not(.disabled) { filter: brightness(1.15); }
        .prestige-button.disabled { background: #2a2a2a; color: #555; cursor: not-allowed; }
        .prestige-upgrades-title { color: #e89330; font-size: 0.5rem; margin-bottom: 0.8rem; }
        .prestige-upgrades-list { display: flex; flex-direction: column; gap: 0.4rem; }
        .prestige-upgrade-card { background: #141414; border: 1px solid #2a2a2a; border-radius: 6px; padding: 0.6rem; }
        .prestige-upgrade-card.maxed { border-color: #555; }
        .prestige-upgrade-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
        .prestige-upgrade-icon { font-size: 1.2rem; flex-shrink: 0; }
        .prestige-upgrade-info { flex: 1; }
        .prestige-upgrade-name { color: #e89330; font-size: 0.4rem; margin-bottom: 0.2rem; }
        .prestige-upgrade-desc { color: #888; font-size: 0.35rem; }
        .prestige-upgrade-level { color: #e89330; font-size: 0.35rem; flex-shrink: 0; }
        .prestige-upgrade-bar { width: 100%; height: 5px; background: #2a2a2a; border-radius: 3px; margin-bottom: 0.4rem; overflow: hidden; }
        .prestige-upgrade-fill { height: 100%; background: #e89330; border-radius: 3px; transition: width 0.3s; }
        .prestige-buy-button { font-family: 'Press Start 2P', cursive; background: #e89330; color: #141414; border: none; border-radius: 4px; padding: 0.3rem 0.5rem; font-size: 0.35rem; cursor: pointer; width: 100%; font-weight: bold; }
        .prestige-buy-button:hover:not(.disabled) { filter: brightness(1.15); }
        .prestige-buy-button.disabled { background: #2a2a2a; color: #555; cursor: not-allowed; }
        .prestige-maxed-badge { font-family: 'Press Start 2P', cursive; background: #555; color: #d4d0c8; padding: 0.25rem 0.4rem; font-size: 0.35rem; text-align: center; border-radius: 4px; }

        .machine-detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 1rem; }
        .machine-detail-panel { background: #1c1c1c; border: 1px solid #333; border-radius: 8px; width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        .machine-detail-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid #333; }
        .machine-detail-title { color: #e89330; font-size: 0.5rem; }
        .machine-detail-close { font-family: 'Press Start 2P', cursive; background: transparent; color: #666; border: 1px solid #333; border-radius: 4px; padding: 0.25rem 0.4rem; font-size: 0.45rem; cursor: pointer; }
        .machine-detail-close:hover { background: #333; }
        .machine-detail-main { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem 0.4rem; }
        .machine-detail-icon { flex-shrink: 0; }
        .machine-detail-id { flex: 1; min-width: 0; }
        .machine-detail-name { color: #e89330; font-size: 0.5rem; margin-bottom: 0.2rem; word-break: break-word; }
        .machine-detail-type { color: #888; font-size: 0.38rem; }
        .machine-detail-lv { font-size: 0.7rem; font-weight: bold; flex-shrink: 0; }
        .machine-detail-bars { display: flex; gap: 2px; padding: 0 1rem 0.5rem; justify-content: center; flex-wrap: wrap; }
        .machine-detail-bar { width: 16px; height: 8px; border-radius: 2px; }
        .machine-detail-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; padding: 0 1rem 0.8rem; }
        .detail-stat-box { background: #141414; border: 1px solid #2a2a2a; border-radius: 4px; padding: 0.5rem; }
        .detail-stat-box.span-2 { grid-column: span 2; }
        .detail-stat-label { color: #666; font-size: 0.35rem; margin-bottom: 0.25rem; }
        .detail-stat-value { font-size: 0.45rem; font-weight: bold; word-break: break-word; color: #d4d0c8; }
        .detail-stat-value.earnings { color: #e89330; }
        .detail-stat-value.time { color: #aaa; }
        .detail-stat-value.income { color: #e89330; }
        .detail-stat-value.next { color: #e89330; }
        .detail-stat-value.cost { color: #e89330; }
        .detail-stat-value.spent { color: #aa5544; }
        .detail-stat-value.eff { color: #e89330; }
        .rename-trigger { font-family: 'Press Start 2P', cursive; background: none; color: #555; border: none; cursor: pointer; font-size: 0.45rem; margin-left: 0.2rem; vertical-align: middle; }
        .rename-trigger:hover { color: #888; }
        .rename-input-group { display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
        .rename-input { font-family: 'Press Start 2P', cursive; background: #141414; color: #e89330; border: 1px solid #333; border-radius: 4px; padding: 0.35rem; font-size: 0.38rem; width: 100%; outline: none; }
        .rename-input:focus { border-color: #e89330; }
        .rename-confirm-btn { font-family: 'Press Start 2P', cursive; background: #e89330; color: #141414; border: none; border-radius: 4px; padding: 0.3rem 0.4rem; font-size: 0.35rem; cursor: pointer; flex-shrink: 0; font-weight: bold; }
        .rename-cancel-btn { font-family: 'Press Start 2P', cursive; background: transparent; color: #666; border: 1px solid #333; border-radius: 4px; padding: 0.3rem 0.4rem; font-size: 0.35rem; cursor: pointer; flex-shrink: 0; }
        .rename-cancel-btn:hover { background: #333; }
        .machine-detail-actions { padding: 0 1rem 0.4rem; }
        .detail-upgrade-btn { font-family: 'Press Start 2P', cursive; width: 100%; background: #e89330; color: #141414; border: none; border-radius: 6px; padding: 0.6rem; font-size: 0.4rem; cursor: pointer; font-weight: bold; transition: all 0.15s; }
        .detail-upgrade-btn:hover { filter: brightness(1.15); }
        .detail-upgrade-btn.disabled { background: #2a2a2a; color: #555; cursor: not-allowed; }
        .detail-max-badge { font-family: 'Press Start 2P', cursive; width: 100%; background: #555; color: #d4d0c8; border-radius: 6px; padding: 0.6rem; font-size: 0.4rem; text-align: center; }
        .machine-detail-sell { padding: 0 1rem 1rem; }
        .sell-button { font-family: 'Press Start 2P', cursive; width: 100%; background: #663322; color: #d4c0b0; border: none; border-radius: 6px; padding: 0.5rem; font-size: 0.4rem; cursor: pointer; transition: all 0.15s; }
        .sell-button:hover { background: #884433; }
        .sell-confirm { text-align: center; }
        .sell-confirm-text { color: #e89330; font-size: 0.45rem; margin-bottom: 0.4rem; }
        .sell-confirm-actions { display: flex; gap: 0.5rem; justify-content: center; }
        .sell-confirm-yes { font-family: 'Press Start 2P', cursive; background: #663322; color: #d4c0b0; border: none; border-radius: 4px; padding: 0.4rem 0.8rem; font-size: 0.45rem; cursor: pointer; flex: 1; }
        .sell-confirm-yes:hover { background: #884433; }
        .sell-confirm-no { font-family: 'Press Start 2P', cursive; background: #333; color: #888; border: none; border-radius: 4px; padding: 0.4rem 0.8rem; font-size: 0.45rem; cursor: pointer; flex: 1; }
        .sell-confirm-no:hover { background: #444; }

        /* ===== Desktop: Bigger Text for Large Screens ===== */
        @media (min-width: 901px) {
          /* Title Screen */
          .title-text { font-size: 2.2rem; }
          .title-subtext { font-size: 1.1rem; }
          .title-button { font-size: 0.85rem; min-height: 58px; }
          .title-tagline { font-size: 0.45rem; }
          .title-save-info { font-size: 0.45rem; }

          /* Header */
          .game-title { font-size: 0.75rem; }
          .auth-header-button, .achievements-button, .prestige-header-button, .reset-button, .music-button {
            font-size: 0.5rem; padding: 0.5rem 0.65rem;
          }

          /* Viewport */
          .viewport-location-name { font-size: 0.7rem; }
          .loc-pin-icon { font-size: 0.9rem; }
          .viewport-balance { padding: 0.35rem 0.7rem; }
          .balance-label { font-size: 0.45rem; }
          .balance-amount { font-size: 0.75rem; }
          .viewport-location-subtitle { font-size: 0.45rem; }
          .viewport-desc-bg { font-size: 0.4rem; }

          /* Console */
          .console-header { font-size: 0.5rem; }
          .console-grid { font-size: 0.45rem; }

          /* Control Hub */
          .hub-stat-label { font-size: 0.5rem; }
          .hub-stat-value { font-size: 0.7rem; }
          .hub-section-title { font-size: 0.55rem; }
          .purchase-owned { font-size: 0.55rem; }
          .purchase-income, .purchase-cost { font-size: 0.48rem; }
          .buy-button { font-size: 0.6rem; padding: 0.55rem 0.8rem; min-height: 46px; }
          .buy-button-small { font-size: 0.48rem; padding: 0.5rem 0.65rem; min-height: 42px; }
          .local-upgrade-name { font-size: 0.55rem; }
          .local-upgrade-desc { font-size: 0.45rem; }
          .local-upgrade-cost { font-size: 0.48rem; }
          .global-upgrade-name { font-size: 0.55rem; }
          .global-upgrade-desc { font-size: 0.45rem; }
          .global-upgrade-cost { font-size: 0.48rem; }
          .global-shop-toggle { font-size: 0.5rem; padding: 0.5rem; min-height: 44px; }
          .hub-empty { font-size: 0.48rem; }
          .hmc-name { font-size: 0.48rem; }
          .hmc-level { font-size: 0.48rem; }
          .hmc-details span { font-size: 0.4rem; }
          .hmc-badge { font-size: 0.5rem; }

          /* Location Tabs */
          .loc-tab-icon { font-size: 1.1rem; }
          .loc-tab-name { font-size: 0.5rem; }
          .loc-tab-cost { font-size: 0.4rem; }
          .location-tab { padding: 0.6rem 0.3rem; min-height: 64px; }

          /* Menu Toggle */
          .menu-toggle-button { font-size: 0.5rem; padding: 0.55rem 1rem; min-height: 44px; }

          /* Tap Hint */
          .tap-hint { font-size: 0.48rem; }

          /* Toast */
          .toast-title { font-size: 0.5rem; }
          .toast-name { font-size: 0.6rem; }
          .toast-desc { font-size: 0.45rem; }

          /* Achievement Panel */
          .achievement-panel-title { font-size: 0.75rem; }
          .achievement-close { font-size: 0.55rem; }
          .achievement-count { font-size: 0.5rem; }
          .achievement-card-name { font-size: 0.55rem; }
          .achievement-card-desc { font-size: 0.45rem; }

          /* Prestige Panel */
          .prestige-panel-title { font-size: 0.75rem; }
          .prestige-points-value { font-size: 1.4rem; }
          .prestige-points-label { font-size: 0.45rem; }
          .prestige-desc { font-size: 0.45rem; }
          .prestige-button { font-size: 0.5rem; padding: 0.7rem 1.4rem; }
          .prestige-upgrades-title { font-size: 0.6rem; }
          .prestige-upgrade-name { font-size: 0.5rem; }
          .prestige-upgrade-desc { font-size: 0.45rem; }
          .prestige-upgrade-level { font-size: 0.45rem; }
          .prestige-buy-button { font-size: 0.45rem; }
          .prestige-maxed-badge { font-size: 0.45rem; }

          /* Machine Detail Panel */
          .machine-detail-title { font-size: 0.6rem; }
          .machine-detail-close { font-size: 0.55rem; }
          .machine-detail-name { font-size: 0.6rem; }
          .machine-detail-type { font-size: 0.48rem; }
          .machine-detail-lv { font-size: 0.85rem; }
          .detail-stat-label { font-size: 0.45rem; }
          .detail-stat-value { font-size: 0.55rem; }
          .rename-trigger { font-size: 0.55rem; }
          .rename-input { font-size: 0.48rem; }
          .rename-confirm-btn, .rename-cancel-btn { font-size: 0.45rem; }
          .detail-upgrade-btn { font-size: 0.5rem; }
          .detail-max-badge { font-size: 0.5rem; }
          .sell-button { font-size: 0.5rem; }
          .sell-confirm-text { font-size: 0.55rem; }
          .sell-confirm-yes, .sell-confirm-no { font-size: 0.55rem; }
        }

        /* ===== Responsive: Tablet & Mobile ===== */
        @media (max-width: 900px) {
          .main-content { position: relative; }
          .viewport { border-right: none; min-height: auto; justify-content: space-between; padding: 0.8rem 0.8rem 0.3rem; width: 100%; max-width: 100%; }
          .control-hub {
            position: absolute; top: 0; right: 0; bottom: 0;
            width: 320px; max-width: 85vw; max-height: 100%;
            z-index: 50; border-left: 1px solid #333;
            box-shadow: -4px 0 20px rgba(0,0,0,0.5);
          }
        }
        @media (max-width: 768px) {
          .game-header { flex-wrap: wrap; padding: 0.5rem 0.6rem; gap: 0.3rem; }
          .game-title { font-size: 0.6rem; }
          .header-buttons { gap: 4px; }
          .auth-header-button, .reset-button { padding: 0.5rem 0.7rem; font-size: 0.42rem; min-height: 44px; }
          .viewport { border-right: none; padding: 0.6rem 0.6rem 0.3rem; justify-content: center; width: 100%; max-width: 100%; }
          .viewport-header { margin-bottom: 0.3rem; max-width: 100%; }
          .viewport-location-name { font-size: 0.75rem; }
          .viewport-location-subtitle { font-size: 0.45rem; }
          .viewport-balance { padding: 0.25rem 0.5rem; }
          .balance-amount { font-size: 0.65rem; }
          .control-hub { width: 300px; max-width: 80vw; }
          .menu-toggle-button { font-size: 0.42rem; padding: 0.5rem; min-height: 42px; }
          .machine-sizer { width: 240px; height: 240px; }
          .machine-sizer svg { width: 240px !important; height: 240px !important; }
          .machine-display-area { margin-top: 0.3rem; }
          .buy-button { padding: 0.6rem 0.9rem; font-size: 0.6rem; min-height: 52px; min-width: 90px; }
          .buy-button-small { padding: 0.55rem 0.75rem; font-size: 0.5rem; min-height: 46px; min-width: 80px; }
          .current-badge-small { padding: 0.4rem 0.6rem; font-size: 0.45rem; min-height: 46px; }
          .hub-stat-label { font-size: 0.5rem; }
          .hub-stat-value { font-size: 0.65rem; }
          .hub-stats-row { gap: 0.5rem; }
          .hub-section-title { font-size: 0.55rem; }
          .hub-section { padding: 0.6rem; }
          .purchase-owned { font-size: 0.5rem; }
          .purchase-income, .purchase-cost { font-size: 0.45rem; }
          .global-upgrade-name { font-size: 0.5rem; }
          .global-upgrade-desc { font-size: 0.4rem; }
          .global-upgrade-cost { font-size: 0.45rem; }
          .local-upgrade-name { font-size: 0.5rem; }
          .local-upgrade-desc { font-size: 0.4rem; }
          .local-upgrade-cost { font-size: 0.45rem; }
          .global-shop-toggle { font-size: 0.5rem; padding: 0.5rem; min-height: 44px; }
          .hub-stat { padding: 0.5rem; }
          .tap-hint { font-size: 0.45rem; margin-top: 0.25rem; }
          .location-tab { padding: 0.5rem 0.3rem; min-height: 60px; }
          .loc-tab-icon { font-size: 1rem; }
          .loc-tab-name { font-size: 0.45rem; }
          .loc-tab-cost { font-size: 0.35rem; }
          .hub-machine-list { max-height: 180px; }
          .hmc-name { font-size: 0.45rem; }
          .hmc-level { font-size: 0.45rem; }
          .hmc-details span { font-size: 0.38rem; }
        }
        @media (max-width: 480px) {
          body { overflow-y: auto; }
          .game-container { height: 100dvh; }
          .main-content { align-items: stretch; }
          .game-header { padding: 0.35rem 0.45rem; gap: 0.2rem; }
          .game-title { font-size: 0.45rem; }
          .header-buttons { gap: 3px; }
          .auth-header-button, .reset-button { padding: 0.4rem 0.5rem; font-size: 0.38rem; min-height: 40px; border-radius: 3px; }
          .viewport { padding: 0.6rem 0.6rem 0.2rem; min-height: 260px; max-width: 100%; justify-content: center; }
          .viewport-location-name { font-size: 0.6rem; }
          .viewport-location-subtitle { font-size: 0.38rem; }
          .viewport-balance { padding: 0.2rem 0.4rem; }
          .balance-amount { font-size: 0.55rem; }
          .balance-label { font-size: 0.3rem; }

          .live-console { padding: 0.55rem; max-width: 100%; }
          .console-header { font-size: 0.38rem; }
          .console-grid { font-size: 0.35rem; gap: 0.25rem; }
          .control-hub { width: 280px; max-width: 78vw; padding: 0.4rem; max-height: 100%; }
          .menu-toggle-button { font-size: 0.38rem; padding: 0.45rem; min-height: 38px; }
          .hub-stat { padding: 0.35rem; }
          .hub-stat-label { font-size: 0.38rem; }
          .hub-stat-value { font-size: 0.5rem; }
          .hub-section { padding: 0.45rem; }
          .hub-section-title { font-size: 0.45rem; }
          .purchase-owned, .purchase-income, .purchase-cost { font-size: 0.4rem; }
          .buy-button { padding: 0.45rem 0.6rem; font-size: 0.5rem; min-width: auto; min-height: 42px; }
          .buy-button-small { padding: 0.4rem 0.55rem; font-size: 0.42rem; min-height: 38px; min-width: 64px; }
          .local-upgrade-name { font-size: 0.4rem; }
          .local-upgrade-desc { font-size: 0.35rem; }
          .local-upgrade-cost { font-size: 0.38rem; }
          .global-upgrade-name { font-size: 0.4rem; }
          .global-upgrade-desc { font-size: 0.35rem; }
          .global-upgrade-cost { font-size: 0.38rem; }
          .global-shop-toggle { font-size: 0.4rem; padding: 0.4rem; min-height: 38px; }
          .hmc-name { font-size: 0.38rem; }
          .hmc-level { font-size: 0.38rem; }
          .hmc-details span { font-size: 0.32rem; }
          .hmc-badge { width: 26px; height: 26px; font-size: 0.4rem; }
          .hub-machine-card { padding: 0.3rem; }
          .loc-tab-icon { font-size: 0.8rem; }
          .loc-tab-name { font-size: 0.38rem; }
          .loc-tab-cost { font-size: 0.3rem; }
          .location-tab { padding: 0.4rem 0.2rem; min-height: 52px; }
          .machine-detail-panel { max-width: 100%; }
          .machine-detail-header { padding: 0.6rem; }
          .machine-detail-title { font-size: 0.42rem; }
          .machine-detail-main { padding: 0.6rem 0.6rem 0.3rem; gap: 0.6rem; }
          .machine-detail-name { font-size: 0.42rem; }
          .detail-stat-label { font-size: 0.32rem; }
          .detail-stat-value { font-size: 0.38rem; }
          .detail-stat-box { padding: 0.35rem; }
          .detail-upgrade-btn { padding: 0.5rem; font-size: 0.38rem; }
          .sell-button { padding: 0.5rem; font-size: 0.38rem; }
          .hub-machine-list { max-height: 120px; }
          .machine-sizer { width: 200px; height: 200px; }
          .machine-sizer svg { width: 200px !important; height: 200px !important; }
        }
      `}</style>
    </>
  );
}
