export const LOCATIONS = [
  {
    id: 'kanto',
    name: 'Kanto ng Barangay',
    subtitle: 'The Proving Grounds',
    description: 'Busy street corner with foot traffic',
    unlockCost: 0,
    bgColor: '#3d2b25',
    accentColor: '#f0b429',
    machine: {
      id: 'windowsillRouter',
      name: 'Taped Windowsill Router',
      baseCost: 50,
      baseIncome: 1,
      description: 'Router held together by packaging tape',
    },
    localUpgrades: [
      { id: 'cctvGuard', name: 'CCTV Marites Guard', description: 'Increases Kanto machine output by 50%', cost: 150, type: 'multiply', target: 'localIncome', value: 1.5 },
      { id: 'iceCandy', name: 'Ice Candy Combo', description: 'Boosts click values 2x while viewing this map', cost: 500, type: 'clickBoost', target: 'localClick', value: 2 },
    ],
  },
  {
    id: 'basketbolan',
    name: 'Basketbolan',
    subtitle: 'The Tournament Hub',
    description: 'Barangay covered basketball court',
    unlockCost: 1500,
    bgColor: '#2a3d2b',
    accentColor: '#a3b18a',
    machine: {
      id: 'ruggedCageBox',
      name: 'Rugged Cage Vending Box',
      baseCost: 600,
      baseIncome: 12,
      description: 'Tough metal box secured with a cage',
    },
    localUpgrades: [
      { id: 'ligaSponsorship', name: 'Liga Inter-Barangay Sponsorship', description: 'Multiplies Court passive yield by 2x', cost: 2500, type: 'multiply', target: 'localIncome', value: 2 },
      { id: 'monoblocSeating', name: 'Monobloc Seating Rows', description: 'Lowers scaling exponent of Court boxes to 1.12', cost: 6000, type: 'reduceScaling', target: 'localScaling', value: 1.12 },
    ],
  },
  {
    id: 'tricycleTerminal',
    name: 'Tricycle Terminal',
    subtitle: 'The Graveyard Shift',
    description: 'Tricycle waiting area with 24/7 foot traffic',
    unlockCost: 12000,
    bgColor: '#4a3528',
    accentColor: '#f59e0b',
    machine: {
      id: 'batteryHub',
      name: '12V Battery-Powered Hub',
      baseCost: 4000,
      baseIncome: 90,
      description: 'Runs on deep-cycle battery backup',
    },
    localUpgrades: [
      { id: 'overnightCargo', name: 'Overnight Cargo Delivery Link', description: 'Adds a flat +₱40/sec passive base to this zone', cost: 15000, type: 'flatIncome', target: 'localFlatIncome', value: 40 },
      { id: 'pisoKape', name: 'Piso Kape Vending Pairing', description: 'Increases Terminal machine income by 75%', cost: 35000, type: 'multiply', target: 'localIncome', value: 1.75 },
    ],
  },
  {
    id: 'palengke',
    name: 'Public Palengke',
    subtitle: 'The High-Capacity Market',
    description: 'Bustling public market with heavy traffic',
    unlockCost: 80000,
    bgColor: '#3d1f1a',
    accentColor: '#c2410c',
    machine: {
      id: 'dualAntenna',
      name: 'Heavy-Duty Dual Antenna Array',
      baseCost: 25000,
      baseIncome: 650,
      description: 'Powerful dual-band antenna setup',
    },
    localUpgrades: [
      { id: 'sukiToken', name: 'Suki Free-Trial Token', description: 'Increases machine outputs by 60%', cost: 90000, type: 'multiply', target: 'localIncome', value: 1.6 },
      { id: 'wetSectionWP', name: 'Wet Section Waterproofing', description: 'Lowers machine base costs by 25%', cost: 180000, type: 'reduceBaseCost', target: 'localCost', value: 0.75 },
    ],
  },
  {
    id: 'highSchool',
    name: 'High School Gate',
    subtitle: 'The Gaming & TikTok Capital',
    description: 'Near the school gate — prime gaming territory',
    unlockCost: 500000,
    bgColor: '#3d2438',
    accentColor: '#c084fc',
    machine: {
      id: 'gamingPriority',
      name: 'Low-Ping Gaming Priority Box',
      baseCost: 150000,
      baseIncome: 4800,
      description: 'Optimized for MLBB and TikTok traffic',
    },
    localUpgrades: [
      { id: 'mlbbTournament', name: 'MLBB Tournament Priority Bandwidth', description: 'Triples local high school generation rates', cost: 750000, type: 'multiply', target: 'localIncome', value: 3 },
      { id: 'pisonetDesktop', name: 'Pisonet Desktop Extension', description: 'Adds +₱2,500/sec flat passive base', cost: 2000000, type: 'flatIncome', target: 'localFlatIncome', value: 2500 },
    ],
  },
  {
    id: 'tabingDagat',
    name: 'Tabing-Dagat Port',
    subtitle: 'The Enterprise Sat-Link',
    description: 'Beach resort area with tourist traffic',
    unlockCost: 5000000,
    bgColor: '#1a2d3d',
    accentColor: '#67e8f9',
    machine: {
      id: 'satLink',
      name: 'Solar-Powered Sat-Link Terminal',
      baseCost: 1500000,
      baseIncome: 35000,
      description: 'Satellite-connected solar-powered terminal',
    },
    localUpgrades: [
      { id: 'touristPremium', name: 'Foreigner Tourist Premium Profile', description: 'Multiplies final Beach zone yield by 5x', cost: 10000000, type: 'multiply', target: 'localIncome', value: 5 },
      { id: 'islandMesh', name: 'Island-Wide Mesh Repeater', description: 'Boosts ALL locations worldwide by 2x', cost: 40000000, type: 'multiply', target: 'globalIncome', value: 2 },
    ],
  },
];

export const DISKARTE_UPGRADES = [
  { id: 'longRangeAntenna', name: 'Long-Range Antenna', description: 'Doubles manual click values globally', cost: 150 },
  { id: 'maritesMarketing', name: 'Marites Marketing Crew', description: 'Multiplies overall passive income by 1.5x', cost: 1000 },
];

export const PACKAGE_UPGRADES = [
  { id: 'student', name: 'Student Package', clickValue: 5, cost: 500, description: 'Offer ₱5/30min package (+₱5 per click)' },
  { id: 'regular', name: 'Regular Package', clickValue: 10, cost: 2000, description: 'Offer ₱10/1hr package (+₱10 per click)' },
  { id: 'unlimited', name: 'Unlimited Package', clickValue: 20, cost: 10000, description: 'Offer ₱20/unlimited package (+₱20 per click)' },
];

export const NETWORK_SPEEDS = [
  { id: '3g', name: '3G Network', baseCost: 0, speedMultiplier: 1.0, description: 'Basic 3G connection' },
  { id: '4g', name: '4G LTE', baseCost: 10000, speedMultiplier: 1.5, description: 'Faster 4G LTE connection' },
  { id: '5g', name: '5G Network', baseCost: 50000, speedMultiplier: 2.0, description: 'Ultra-fast 5G connection' },
  { id: 'fiber', name: 'Fiber Optic', baseCost: 200000, speedMultiplier: 3.0, description: 'Lightning-fast fiber optic' },
];

export const ACHIEVEMENTS = [
  { id: 'earn100', name: 'First Hundred', description: 'Earn ₱100 total', icon: '💵', check: (s) => s.totalEarned >= 100 },
  { id: 'earn10k', name: 'Piso Wifi Starter', description: 'Earn ₱10,000 total', icon: '💰', check: (s) => s.totalEarned >= 10000 },
  { id: 'earn100k', name: 'Barangay Tycoon', description: 'Earn ₱100,000 total', icon: '🏦', check: (s) => s.totalEarned >= 100000 },
  { id: 'earn1m', name: 'Million Piso Dream', description: 'Earn ₱1,000,000 total', icon: '💎', check: (s) => s.totalEarned >= 1000000 },
  { id: 'earn10m', name: 'Piso Empire', description: 'Earn ₱10,000,000 total', icon: '👑', check: (s) => s.totalEarned >= 10000000 },
  { id: 'firstMachine', name: 'First Investment', description: 'Buy your first machine', icon: '📡', check: (s) => s.totalMachines >= 1 },
  { id: 'tenMachines', name: 'Growing Empire', description: 'Own 10 machines total', icon: '🌐', check: (s) => s.totalMachines >= 10 },
  { id: 'fiftyMachines', name: 'Network Mogul', description: 'Own 50 machines total', icon: '🏗️', check: (s) => s.totalMachines >= 50 },
  { id: 'allLocations', name: 'Empire Builder', description: 'Unlock all 6 locations', icon: '🗺️', check: (s) => s.unlockedCount >= 6 },
  { id: 'pps100', name: 'Making Moves', description: 'Reach ₱100/sec passive income', icon: '📈', check: (s) => s.currentPps >= 100 },
  { id: 'pps10k', name: 'Cash Flow King', description: 'Reach ₱10,000/sec passive income', icon: '💸', check: (s) => s.currentPps >= 10000 },
  { id: 'pps100k', name: 'Business Empire', description: 'Reach ₱100,000/sec passive income', icon: '🏭', check: (s) => s.currentPps >= 100000 },
  { id: 'click100', name: 'Dedicated Clicker', description: 'Click 100 times', icon: '🖱️', check: (s) => s.totalClicks >= 100 },
  { id: 'click1k', name: 'Rapid Fire', description: 'Click 1,000 times', icon: '⚡', check: (s) => s.totalClicks >= 1000 },
  { id: 'click10k', name: 'Human Machine', description: 'Click 10,000 times', icon: '🤖', check: (s) => s.totalClicks >= 10000 },
  { id: 'firstLocalUpgrade', name: 'Local Knowledge', description: 'Buy your first local upgrade', icon: '🧠', check: (s) => s.localUpgradeCount > 0 },
  { id: 'halfLocalUpgrades', name: 'Barangay Expert', description: 'Buy 6 local upgrades', icon: '📚', check: (s) => s.localUpgradeCount >= 6 },
  { id: 'allLocalUpgrades', name: 'Master of All Tracts', description: 'Buy all 12 local upgrades', icon: '🏆', check: (s) => s.localUpgradeCount >= 12 },
  { id: 'allDiskarte', name: 'Diskarte Master', description: 'Buy all Diskarte upgrades', icon: '🧠', check: (s) => s.allDiskarte },
  { id: 'allPackages', name: 'Full Service', description: 'Buy all package upgrades', icon: '📋', check: (s) => s.allPackages },
  { id: 'fiberSpeed', name: 'Light Speed', description: 'Upgrade to Fiber Optic', icon: '🚀', check: (s) => s.currentSpeed === 'fiber' },
];

export const PRESTIGE_UPGRADES = [
  { id: 'incomeBoost', name: 'Income Boost', description: 'Permanent +10% passive income per level', icon: '📈', baseCost: 3, costMultiplier: 2, maxLevel: 10, effect: (level) => 1 + level * 0.1 },
  { id: 'clickBoost', name: 'Click Power', description: 'Permanent +2 base click value per level', icon: '🖱️', baseCost: 2, costMultiplier: 2, maxLevel: 10, effect: (level) => level * 2 },
  { id: 'headStart', name: 'Head Start', description: 'Start each run with bonus ₱ per level', icon: '💵', baseCost: 3, costMultiplier: 2.5, maxLevel: 8, effect: (level) => Math.floor(100 * Math.pow(5, level)) },
  { id: 'speedBoost', name: 'Speed Demon', description: 'Permanent +0.1x network speed per level', icon: '🚀', baseCost: 5, costMultiplier: 2, maxLevel: 8, effect: (level) => 1 + level * 0.1 },
];
