export const LOCATIONS = [
  {
    id: 'kanto',
    name: 'Kanto ng Barangay',
    subtitle: 'The Proving Grounds',
    description: 'Dito tambay ang mga tao — maraming naghihintay, nagkukuwentuhan, at dumadaan araw-araw',
    unlockCost: 0,
    bgColor: '#1a1a1a',
    accentColor: '#e89330',
    machine: {
      id: 'windowsillRouter',
      name: 'Taped Windowsill Router',
      baseCost: 250,
      baseIncome: 0.5,
      description: 'Router held together by packaging tape',
    },
    localUpgrades: [
      { id: 'cctvGuard', name: 'CCTV Marites Guard', description: 'Boosts Kanto machine output by 1.5x', cost: 300, type: 'multiply', target: 'localIncome', value: 1.5 },
      { id: 'iceCandy', name: 'Ice Candy Combo', description: 'Boosts click values 1.5x while viewing this map', cost: 800, type: 'clickBoost', target: 'localClick', value: 1.5 },
      { id: 'sukiTawad', name: 'Suki Tawad Promo', description: 'Boosts click values 1.5x in this zone', cost: 1500, type: 'clickBoost', target: 'localClick', value: 1.5 },
    ],
  },
  {
    id: 'basketbolan',
    name: 'Basketbolan',
    subtitle: 'The Tournament Hub',
    description: 'Laging may naglalaro sa covered court — liga tuwing weekend, tambay sa gabi',
    unlockCost: 7500,
    bgColor: '#1c1c1c',
    accentColor: '#d4952a',
    machine: {
      id: 'ruggedCageBox',
      name: 'Rugged Cage Vending Box',
      baseCost: 3000,
      baseIncome: 6,
      description: 'Tough metal box secured with a cage',
    },
    localUpgrades: [
      { id: 'ligaSponsorship', name: 'Liga Inter-Barangay Sponsorship', description: 'Multiplies Court income by 1.75x', cost: 5000, type: 'multiply', target: 'localIncome', value: 1.75 },
      { id: 'monoblocSeating', name: 'Monobloc Seating Rows', description: 'Lowers scaling exponent of Court boxes to 1.06', cost: 6000, type: 'reduceScaling', target: 'localScaling', value: 1.06 },
      { id: 'talakayan', name: 'Talakayan Huddle Zone', description: 'Boosts click values 1.75x in Basketbolan', cost: 6000, type: 'clickBoost', target: 'localClick', value: 1.75 },
    ],
  },
  {
    id: 'tricycleTerminal',
    name: 'Tricycle Terminal',
    subtitle: 'The Graveyard Shift',
    description: '24/7 ang byahe — naghihintay ng pasahero ang mga tricycle kahit madaling araw',
    unlockCost: 60000,
    bgColor: '#1e1e1e',
    accentColor: '#c4842a',
    machine: {
      id: 'batteryHub',
      name: '12V Battery-Powered Hub',
      baseCost: 20000,
      baseIncome: 45,
      description: 'Runs on deep-cycle battery backup',
    },
    localUpgrades: [
      { id: 'overnightCargo', name: 'Overnight Cargo Delivery Link', description: 'Adds a flat +₱100/sec passive base to this zone', cost: 20000, type: 'flatIncome', target: 'localFlatIncome', value: 100 },
      { id: 'pisoKape', name: 'Piso Kape Vending Pairing', description: 'Multiplies Terminal machine income by 1.75x', cost: 50000, type: 'multiply', target: 'localIncome', value: 1.75 },
      { id: 'manongDriver', name: 'Manong Driver Discount', description: 'Boosts click values 2x at the Terminal', cost: 30000, type: 'clickBoost', target: 'localClick', value: 2 },
    ],
  },
  {
    id: 'palengke',
    name: 'Public Palengke',
    subtitle: 'The High-Capacity Market',
    description: 'Maingay at matao sa palengke — mga vendor, mamimili, at araw-araw na tawaran',
    unlockCost: 400000,
    bgColor: '#1b1b1b',
    accentColor: '#b07830',
    machine: {
      id: 'dualAntenna',
      name: 'Heavy-Duty Dual Antenna Array',
      baseCost: 125000,
      baseIncome: 325,
      description: 'Powerful dual-band antenna setup',
    },
    localUpgrades: [
      { id: 'sukiToken', name: 'Suki Free-Trial Token', description: 'Multiplies Palengke machine output by 1.75x', cost: 120000, type: 'multiply', target: 'localIncome', value: 1.75 },
      { id: 'wetSectionWP', name: 'Wet Section Waterproofing', description: 'Reduces machine base costs to 85%', cost: 250000, type: 'reduceBaseCost', target: 'localCost', value: 0.85 },
      { id: 'tawadPalengke', name: 'Tawad sa Palengke', description: 'Boosts click values 2.5x at the market', cost: 200000, type: 'clickBoost', target: 'localClick', value: 2.5 },
    ],
  },
  {
    id: 'highSchool',
    name: 'High School Gate',
    subtitle: 'The Gaming & TikTok Capital',
    description: 'Tambayan ng mga estudyante pagkatapos ng klase — malamig na soda at mobile legends',
    unlockCost: 2500000,
    bgColor: '#181818',
    accentColor: '#d4902a',
    machine: {
      id: 'gamingPriority',
      name: 'Low-Ping Gaming Priority Box',
      baseCost: 750000,
      baseIncome: 2400,
      description: 'Optimized for MLBB and TikTok traffic',
    },
    localUpgrades: [
      { id: 'mlbbTournament', name: 'MLBB Tournament Priority Bandwidth', description: 'Multiplies High School income by 2.5x', cost: 1000000, type: 'multiply', target: 'localIncome', value: 2.5 },
      { id: 'pisonetDesktop', name: 'Pisonet Desktop Extension', description: 'Adds +₱5,000/sec flat passive base', cost: 2000000, type: 'flatIncome', target: 'localFlatIncome', value: 5000 },
      { id: 'mlbbSkin', name: 'MLBB Skin Tournament', description: 'Boosts click values 2.5x near the school', cost: 1500000, type: 'clickBoost', target: 'localClick', value: 2.5 },
    ],
  },
  {
    id: 'tabingDagat',
    name: 'Tabing-Dagat Port',
    subtitle: 'The Enterprise Sat-Link',
    description: 'Tahimik na tabing-dagat — pumupunta rito ang mga turista at lokal para mag-relax',
    unlockCost: 25000000,
    bgColor: '#16181c',
    accentColor: '#d48020',
    machine: {
      id: 'satLink',
      name: 'Solar-Powered Sat-Link Terminal',
      baseCost: 7500000,
      baseIncome: 17500,
      description: 'Satellite-connected solar-powered terminal',
    },
    localUpgrades: [
      { id: 'touristPremium', name: 'Foreigner Tourist Premium Profile', description: 'Multiplies Beach zone yield by 3.5x', cost: 15000000, type: 'multiply', target: 'localIncome', value: 3.5 },
      { id: 'islandMesh', name: 'Island-Wide Mesh Repeater', description: 'Boosts ALL locations worldwide by 1.5x', cost: 40000000, type: 'multiply', target: 'globalIncome', value: 1.5 },
      { id: 'turistaClick', name: 'Turista Selfie Spot', description: 'Boosts click values 3.5x at the beach', cost: 12000000, type: 'clickBoost', target: 'localClick', value: 3.5 },
    ],
  },
];

export const DISKARTE_UPGRADES = [
  { id: 'reinforcedAntenna', name: 'Reinforced Antenna', description: 'Boosts passive income by 12.5%', cost: 150, incomeMult: 1.12 },
  { id: 'industrialCasing', name: 'Industrial Casing', description: 'Boosts passive income by 15%', cost: 800, incomeMult: 1.15 },
  { id: 'fiberCable', name: 'Fiber Optic Cable', description: 'Boosts passive income by 18%', cost: 1500, incomeMult: 1.18 },
  { id: 'backupPowerCell', name: 'Backup Power Cell', description: 'Boosts passive income by 20%', cost: 3000, incomeMult: 1.20 },
  { id: 'coolingSystem', name: 'Cooling System', description: 'Boosts passive income by 18% and click value by +1', cost: 5000, incomeMult: 1.18, clickBonus: 1 },
  { id: 'autoTuner', name: 'Auto-Tune Module', description: 'Boosts passive income by 22%', cost: 6000, incomeMult: 1.22 },
  { id: 'signalBooster', name: 'Signal Booster', description: 'Boosts passive income by 25%', cost: 12000, incomeMult: 1.25 },
  { id: 'meshExtender', name: 'Mesh Extender', description: 'Boosts passive income by 35%', cost: 25000, incomeMult: 1.35 },
];

export const PACKAGE_UPGRADES = [
  { id: 'sukiLoad', name: 'Suki Load 10', cost: 500, incomeMult: 0.125, description: 'Caters to budget users with micro-burst data allocations.' },
  { id: 'regularPlan', name: 'SME Dedicated Data Pipe', cost: 2500, incomeMult: 0.25, description: 'High-throughput commercial data lines.' },
  { id: 'unlimitedPlan', name: 'Corporate MPLS Trunk Line', cost: 15000, incomeMult: 0.50, description: 'Enterprise-grade traffic distribution.' },
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
  { id: 'firstLocalUpgrade', name: 'Local Knowledge', description: 'Buy your first local upgrade', icon: '🧠', check: (s) => s.localUpgradeCount > 0 },
  { id: 'halfLocalUpgrades', name: 'Barangay Expert', description: 'Buy 6 local upgrades', icon: '📚', check: (s) => s.localUpgradeCount >= 6 },
  { id: 'allLocalUpgrades', name: 'Master of All Tracts', description: 'Buy all 12 local upgrades', icon: '🏆', check: (s) => s.localUpgradeCount >= 12 },
  { id: 'allDiskarte', name: 'Parts Master', description: 'Buy all hardware parts', icon: '🔧', check: (s) => s.allDiskarte },
  { id: 'allPackages', name: 'Full Service', description: 'Buy all service plans', icon: '📋', check: (s) => s.allPackages },
  { id: 'fiberSpeed', name: 'Light Speed', description: 'Upgrade to Fiber Optic', icon: '🚀', check: (s) => s.currentSpeed === 'fiber' },
];

export const PRESTIGE_UPGRADES = [
  {
    id: 'incomeBoost',
    name: 'Income Boost',
    description: 'Permanent +5% passive income per level',
    icon: '📈',
    baseCost: 3,
    costMultiplier: 2,
    maxLevel: 10,
    effect: (level) => 1 + level * 0.05
  },
  {
    id: 'headStart',
    name: 'Head Start',
    description: 'Start each run with bonus ₱ per level',
    icon: '💵',
    baseCost: 3,
    costMultiplier: 2.5,
    maxLevel: 8,
    effect: (level) => Math.floor(50 * Math.pow(3, level))
  },
  {
    id: 'speedBoost',
    name: 'Speed Demon',
    description: 'Permanent +0.05x network speed per level',
    icon: '🚀',
    baseCost: 5,
    costMultiplier: 2,
    maxLevel: 8,
    effect: (level) => 1 + level * 0.05
  },
];