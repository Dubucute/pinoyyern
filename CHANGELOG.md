# 📋 Changelog — Piso Wifi Tycoon

All notable changes to this project are documented here.

---

## [Unreleased]

### Planned / Ideas
- Prestige system with permanent bonuses
- Leaderboard / social sharing
- More achievements (100 routers, ₱1M/sec PPS, etc.)
- Ambient background music
- Sound mute/unmute toggle
- Refactor into multiple files

---

## [1.0.0] — 2026-07-06

### Initial Release — Full Game Implementation

#### 🎮 Core Gameplay
- Idle clicker mechanic: click the Piso Wifi vending machine to earn ₱
- Passive income system with 4 asset types (Router, WiFi Box, Fiber Line, Repeater Tower)
- Auto-save to browser localStorage every 10 seconds
- Smooth passive income tick every 100ms

#### 💰 Economy
- Progressive cost scaling: `cost = baseCost × 1.15^owned`
- 4 assets with increasing tiers of income
- PPS (Pesos Per Second) display

#### 🏪 Upgrades & Packages
- **Diskarte Upgrades**: Long-Range Antenna (2x click value), Marites Marketing Crew (1.5x income)
- **Package Upgrades**: Student (₱5/click), Regular (₱10/click), Unlimited (₱20/click)

#### 📍 Location System
- 4 locations: Kanto, Tricycle Terminal, Sari-Sari Store, Near School
- Traffic bonuses from +0% to +50%
- Dynamic background color changes per location

#### 🔌 Slot System
- 6 upgradeable slots per location
- 4 slot levels: Locked → Basic → Advanced → Premium
- Slot unlock costs vary by position (₱100–₱2,500)
- Slot upgrade costs by level (₱200–₱3,000)
- Visual bar indicators for slot levels

#### 🌐 Network Speed
- 4 speed tiers: 3G (1x), 4G LTE (1.5x), 5G (2x), Fiber Optic (3x)
- Income multipliers applied globally

#### 🏆 Achievements (20 total)
- 5 financial milestones (₱100 → ₱10M)
- 4 asset milestones
- 2 PPS milestones
- 3 click milestones
- 3 slot milestones
- 2 upgrade milestones
- 2 location/speed milestones
- Toast notification on unlock
- Achievement panel with progress bar
- Locked achievements hidden (🔒)

#### 🎵 Sound Effects
- Retro chiptune sounds via Web Audio API
- Click beep, buy ding, upgrade jingle, slot unlock, location fanfare
- No external audio files needed

#### 🎨 Visual Design
- Retro pixel-art aesthetic
- Press Start 2P font
- Pixelated SVG icons for all assets and upgrades
- Animated floating "+₱" text on click
- Vending machine SVG with dynamic upgrade indicators
- Responsive layout (desktop/mobile)

#### ⚙️ Technical
- Built with Next.js 13.5 + React 18
- styled-jsx for component-scoped CSS
- localStorage persistence
- Web Audio API for sound generation
- Static site generation (SSG)

---

## [0.1.0] — Initial Setup

### Added
- Next.js project scaffold
- Tailwind CSS configuration
- Basic page structure
- Package.json with dependencies
