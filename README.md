# 📡 Piso Wifi Tycoon

A **retro pixel-art idle clicker game** built with Next.js. Build your very own piso wifi empire in the barangay!

## 🎮 Overview

Become a piso wifi entrepreneur! Click the vending machine to earn pesos (₱), invest in network equipment, upgrade your location, and build a passive income empire. Unlock achievements, expand your network, and become the barangay's internet tycoon.

## ✨ Features

### Core Gameplay
- **💰 Idle Clicker** — Click the vintage Piso Wifi vending machine to earn ₱ per click
- **📈 Passive Income** — Buy assets that generate ₱/sec automatically
- **💾 Auto-Save** — Progress is saved to your browser every 10 seconds

### Assets & Upgrades
| Asset | Base Cost | Income | Description |
|-------|-----------|--------|-------------|
| Kapitbahay Router | ₱50 | ₱1/sec | Router with blinking green pixels |
| Piso Wifi Box | ₱300 | ₱8/sec | Classic orange metal box |
| Fiber Line Upgrade | ₱2,000 | ₱60/sec | Glowing blue internet cable |
| Barangay Repeater Tower | ₱15,000 | ₱450/sec | Tall red and white radio tower |

### Diskarte Upgrades
- **Long-Range Antenna** (₱150) — Doubles manual click value
- **Marites Marketing Crew** (₱1,000) — 1.5x passive income multiplier

### Package Upgrades
| Package | Cost | Click Value |
|---------|------|-------------|
| Student Package (₱5/30min) | ₱500 | +₱5/click |
| Regular Package (₱10/1hr) | ₱2,000 | +₱10/click |
| Unlimited Package (₱20/unli) | ₱10,000 | +₱20/click |

### Location System
Move your business to better locations for traffic bonuses:
| Location | Cost | Traffic Bonus |
|----------|------|---------------|
| Kanto (Corner) | Free | 0% |
| Tricycle Terminal | ₱5,000 | +20% |
| Sari-Sari Store | ₱15,000 | +35% |
| Near School | ₱50,000 | +50% |

Each location dynamically changes the game background color!

### Slot System
Each location has **6 upgradeable slots**:
- **Locked** (level 0) — ₱0/sec, must unlock first
- **Basic** (level 1) — ₱2/sec
- **Advanced** (level 2) — ₱8/sec
- **Premium** (level 3) — ₱25/sec

Slot unlock/upgrade costs vary by slot position and level.

### Network Speed Upgrades
| Speed | Cost | Multiplier |
|-------|------|------------|
| 3G Network | Free | 1.0x |
| 4G LTE | ₱10,000 | 1.5x |
| 5G Network | ₱50,000 | 2.0x |
| Fiber Optic | ₱200,000 | 3.0x |

### 🏆 Achievements (20 total)
- **Financial**: First Hundred → Piso Empire (₱10M)
- **Assets**: First Investment, Full Network, Router Army, Signal King
- **PPS**: Making Moves (₱100/sec), Cash Flow King (₱10K/sec)
- **Clicks**: Dedicated Clicker, Rapid Fire, Human Machine
- **Slots**: Slot Machine, Full House, Premium Connection
- **Upgrades**: Diskarte Master, Full Service
- **Location/Speed**: On the Move, Light Speed

### 🎵 Retro Sound Effects
Chiptune-style sound effects using the Web Audio API:
- Coin drop beep when clicking
- Cash register ding when buying
- Power-up jingle for upgrades
- Metallic unlock sound for slots
- Fanfare sweep when changing locations

### 🎨 Visual Style
- Pixel-art styled UI with retro color palette
- Animated floating "+₱" text on click
- Dynamic location-based backgrounds
- Responsive design (desktop & mobile)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm, pnpm, or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack
- **Framework**: Next.js 13.5
- **UI Library**: React 18
- **Styling**: CSS-in-JS (styled-jsx)
- **Font**: Press Start 2P (Google Fonts)
- **Sound**: Web Audio API (no external files)
- **Persistence**: localStorage

## 📁 Project Structure
```
├── config/
│   └── gameData.js        # Game constants: assets, upgrades, locations, achievements
├── utils/
│   └── helpers.js          # Pure calculation functions (PPS, costs, etc.)
├── hooks/
│   └── useSound.js         # Web Audio API retro sound effects hook
├── components/
│   ├── PixelIcon.js        # SVG pixel-art icons
│   ├── AssetCard.js        # Buyable asset card component
│   ├── DiskarteCard.js     # Diskarte/package upgrade card component
│   ├── SlotCard.js         # Location slot upgrade component
│   ├── AchievementToast.js # Unlock notification + achievement viewer panel
│   ├── PrestigePanel.js    # Prestige system overlay panel
│   └── FloatingText.js     # Animated floating text (+₱ popup)
├── pages/
│   └── index.js            # Main game page (state, handlers, render)
├── package.json
├── next.config.js
├── README.md
└── CHANGELOG.md
```

## 🎯 How to Play
1. **Click the vending machine** to earn ₱
2. **Buy assets** (routers, wifi boxes, fiber, towers) for passive income
3. **Purchase upgrades** to boost your earnings
4. **Move to better locations** for traffic bonuses
5. **Upgrade slots** at each location for extra income
6. **Upgrade network speed** for income multipliers
7. **Unlock achievements** as you grow your empire
8. **Reset** to start over (your progress will be lost)

## 🔄 State Persistence
Game progress is automatically saved to browser localStorage every 10 seconds. Refreshing the page will restore your game state. Reset button clears all progress.

## 📱 Mobile Support
Responsive layout adapts to mobile screens with a stacked panel design.

## 📄 License
Private project — all rights reserved.
