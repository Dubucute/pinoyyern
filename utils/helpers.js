import { LOCATIONS, PRESTIGE_UPGRADES } from '../config/gameData';

export const MACHINE_MAX_LEVEL = 10;
export const MACHINE_SELL_REFUND = 0.5;

export const getAssetCost = (baseCost, owned, exponent = 1.15) =>
  Math.floor(baseCost * Math.pow(exponent, owned));

export const createMachineId = (locationIndex, machineIndex, purchasedAt) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `loc${locationIndex}-m${machineIndex}-${purchasedAt || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getLocationMachineCost = (locationIndex, currentCount, localUpgradesForLoc) => {
  const location = LOCATIONS[locationIndex];
  if (!location) return Infinity;
  let baseCost = location.machine.baseCost;
  let exponent = 1.15;
  const upgrades = localUpgradesForLoc || {};
  // Wet Section Waterproofing: lower base cost by 25%
  if (upgrades.wetSectionWP) baseCost = Math.floor(baseCost * 0.75);
  // Monobloc Seating: lower scaling exponent
  if (upgrades.monoblocSeating) exponent = 1.12;
  return Math.floor(baseCost * Math.pow(exponent, currentCount));
};

export const getMachineUpgradeCost = (asset, currentLevel, localUpgradesForLoc) => {
  let exponent = 1.5;
  const upgrades = localUpgradesForLoc || {};
  if (upgrades.monoblocSeating) exponent = 1.12;
  return Math.floor(asset.baseCost * Math.pow(exponent, currentLevel - 1));
};

export const getMachineTotalUpgradeCost = (asset, level, localUpgradesForLoc) => {
  let total = 0;
  for (let i = 1; i < level; i++) total += getMachineUpgradeCost(asset, i, localUpgradesForLoc);
  return total;
};

export const getMachineSellValue = (entry, asset) => {
  const purchaseCost = entry.purchaseCost || asset.baseCost;
  const upgradeCost = getMachineTotalUpgradeCost(asset, entry.level || 1);
  return Math.floor((purchaseCost + upgradeCost) * MACHINE_SELL_REFUND);
};

export const calculatePps = (machinesByLocation, localUpgrades, speedMultiplier, prestigeIncomeMult, prestigeSpeedMult, diskarteUpgrades = {}, packageUpgrades = {}) => {
  let globalTotal = 0.5; // Base passive income even with no machines
  let globalMeshMult = 1;

  // Check if Island-Wide Mesh is active (location index 5)
  const meshUpgrades = localUpgrades?.[5] || {};
  if (meshUpgrades.islandMesh) globalMeshMult = 2;

  LOCATIONS.forEach((location, locIdx) => {
    const machines = machinesByLocation?.[locIdx] || [];
    if (machines.length === 0) return;
    const upgrades = localUpgrades?.[locIdx] || {};
    let locTotal = 0;

    // Base income from machines
    machines.forEach(m => {
      locTotal += location.machine.baseIncome * (m.level || 1);
    });

    // Flat income boost (e.g. Overnight Cargo, Pisonet Desktop)
    Object.entries(upgrades).forEach(([upId, bought]) => {
      if (!bought) return;
      const def = location.localUpgrades.find(u => u.id === upId);
      if (def && def.type === 'flatIncome') locTotal += def.value;
    });

    // Local multiplier upgrades
    Object.entries(upgrades).forEach(([upId, bought]) => {
      if (!bought) return;
      const def = location.localUpgrades.find(u => u.id === upId);
      if (def && def.type === 'multiply' && def.target === 'localIncome') locTotal *= def.value;
    });

    globalTotal += locTotal;
  });

  // Global part upgrades (DISKARTE)
  if (diskarteUpgrades.reinforcedAntenna) globalTotal *= 1.25;
  if (diskarteUpgrades.industrialCasing) globalTotal *= 1.30;
  if (diskarteUpgrades.fiberCable) globalTotal *= 1.35;
  if (diskarteUpgrades.backupPowerCell) globalTotal *= 1.40;
  if (diskarteUpgrades.coolingSystem) globalTotal *= 1.35;
  if (diskarteUpgrades.autoTuner) globalTotal *= 1.45;
  if (diskarteUpgrades.signalBooster) globalTotal *= 1.50;
  if (diskarteUpgrades.meshExtender) globalTotal *= 1.70;

  // Package/service plan multipliers
  let packageMult = 1;
  if (packageUpgrades.unlimitedPlan) packageMult += 1.00;
  else if (packageUpgrades.regularPlan) packageMult += 0.50;
  else if (packageUpgrades.sukiLoad) packageMult += 0.25;

  // Global multipliers
  globalTotal *= globalMeshMult;
  globalTotal *= speedMultiplier || 1;
  globalTotal *= prestigeIncomeMult || 1;
  globalTotal *= prestigeSpeedMult || 1;
  globalTotal *= packageMult;

  return globalTotal;
};

export const calculateActiveUsers = (machinesByLocation) => {
  let total = 0;
  if (!machinesByLocation) return total;
  machinesByLocation.forEach((machines, locIdx) => {
    const count = machines.length;
    if (locIdx === 0) total += count * 10;
    else if (locIdx === 1) total += count * 30;
    else if (locIdx === 2) total += count * 80;
    else if (locIdx === 3) total += count * 200;
    else if (locIdx === 4) total += count * 500;
    else if (locIdx === 5) total += count * 1500;
  });
  return total;
};

export const calculateClickValue = (packageUpgrades, diskarteUpgrades, localUpgrades, currentLocation) => {
  let value = 1;
  // Package upgrades add flat click bonus
  if (packageUpgrades.unlimitedPlan) value = 20;
  else if (packageUpgrades.regularPlan) value = 10;
  else if (packageUpgrades.sukiLoad) value = 5;
  // Part upgrades that boost click
  if (diskarteUpgrades.coolingSystem) value += 2;
  if (diskarteUpgrades.signalBooster) value += 3;
  if (diskarteUpgrades.meshExtender) value += 5;
  // Local click boost upgrades (e.g. Ice Candy Combo)
  const locUpgrades = localUpgrades?.[currentLocation] || {};
  LOCATIONS.forEach((loc, idx) => {
    if (idx !== currentLocation) return;
    loc.localUpgrades.forEach(def => {
      if (def.type === 'clickBoost' && locUpgrades[def.id]) {
        value = Math.floor(value * def.value);
      }
    });
  });
  // Soft cap to prevent click value explosion
  const SOFT_CAP = 100; // 100x base click value is the "soft limit"
  if (value > SOFT_CAP) {
    // Apply logarithmic dampening beyond the soft cap
    return SOFT_CAP + Math.log10(value / SOFT_CAP) * SOFT_CAP;
  }
  return value;
};

export const getPrestigeCost = (upgrade, level) => Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));

export const calculatePrestigePoints = (totalEarned, currentPoints) =>
  Math.max(currentPoints, Math.floor(Math.sqrt(Math.max(0, totalEarned) / 10000)));

export const getAllMachinesFlat = (machinesByLocation) => {
  const result = [];
  if (!machinesByLocation) return result;
  machinesByLocation.forEach((entries, locIdx) => {
    const location = LOCATIONS[locIdx];
    if (!location) return;
    entries.forEach((entry, idx) => {
      result.push({
        id: entry.id,
        locationIndex: locIdx,
        machineIndex: idx,
        level: entry.level || 1,
        earnings: entry.earnings || 0,
        purchasedAt: entry.purchasedAt || Date.now(),
        purchaseCost: entry.purchaseCost,
        customName: entry.name || null,
        asset: location.machine,
      });
    });
  });
  return result;
};

export const getDerivedTotalMachines = (machinesByLocation) => {
  if (!machinesByLocation) return 0;
  return machinesByLocation.reduce((sum, arr) => sum + arr.length, 0);
};

export const getLocalUpgradeCount = (localUpgrades) => {
  if (!localUpgrades) return 0;
  return localUpgrades.reduce((sum, loc) => sum + Object.values(loc).filter(Boolean).length, 0);
};

export const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ago`;
};