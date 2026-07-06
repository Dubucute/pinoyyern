import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';

// ---- Game Configuration ----------------------------------------------------
const ASSETS = [
  {
    id: 'router',
    name: 'Kapitbahay Router',
    baseCost: 50,
    baseIncome: 2,
    description: 'Basic router taped to a window.',
  },
  {
    id: 'wifiBox',
    name: 'Piso Wifi Metal Box',
    baseCost: 300,
    baseIncome: 15,
    description: 'Classic orange outdoor box.',
  },
  {
    id: 'fiberLine',
    name: 'Fiber Line Upgrade',
    baseCost: 2000,
    baseIncome: 90,
    description: 'High‑speed connection for heavy downloaders.',
  },
  {
    id: 'repeaterTower',
    name: 'Barangay Repeater Tower',
    baseCost: 15000,
    baseIncome: 600,
    description: 'Beams wifi across three neighboring streets.',
  },
];

const UPGRADES = [
  {
    id: 'antennaBoost',
    name: 'Antenna Boost',
    description: '+100% Click Value (manual coin drops)',
    apply: (state) => ({ ...state, clickValue: state.clickValue * 2, upgrades: { ...state.upgrades, antennaBoost: true } }),
  },
  {
    id: 'tiktokBoost',
    name: 'Youtube/TikTok Optimization',
    description: '+50% Tier 2 Passive Income',
    apply: (state) => ({ ...state, upgrades: { ...state.upgrades, tiktokBoost: true } }),
  },
  {
    id: 'antayBarya',
    name: 'Antay‑Barya Extension',
    description: '+20% Overall Income',
    apply: (state) => ({ ...state, upgrades: { ...state.upgrades, antayBarya: true } }),
  },
];

// ---- Helper Functions ------------------------------------------------------
const getAssetCost = (baseCost, owned) => Math.floor(baseCost * Math.pow(1.15, owned));

const calculatePps = (inventory, upgrades) => {
  let total = 0;
  inventory && Object.entries(inventory).forEach(([id, qty]) => {
    const asset = ASSETS.find((a) => a.id === id);
    if (!asset) return;
    let income = asset.baseIncome * qty;
    // Apply tier‑specific upgrades
    if (id === 'wifiBox' && upgrades.tiktokBoost) {
      income *= 1.5; // +50% for Tier 2
    }
    total += income;
  });
  // Apply overall multiplier
  if (upgrades.antayBarya) total *= 1.2;
  return total;
};

// ---- Main Component --------------------------------------------------------
export default function Home() {
  // ---- Persistent State ---------------------------------------------------
  const [pesos, setPesos] = useState(0);
  const [clickValue, setClickValue] = useState(5);
  const [inventory, setInventory] = useState({ router: 0, wifiBox: 0, fiberLine: 0, repeaterTower: 0 });
  const [upgrades, setUpgrades] = useState({ antennaBoost: false, tiktokBoost: false, antayBarya: false });

  // Load saved state once on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pinoyyern-state') : null;
    if (saved) {
      try {
        const { pesos, clickValue, inventory, upgrades } = JSON.parse(saved);
        setPesos(pesos);
        setClickValue(clickValue);
        setInventory(inventory);
        setUpgrades(upgrades);
      } catch (_) {}
    }
  }, []);

  // Save state periodically (every 10 seconds)
  useEffect(() => {
    const id = setInterval(() => {
      const state = { pesos, clickValue, inventory, upgrades };
      localStorage.setItem('pinoyyern-state', JSON.stringify(state));
    }, 10000);
    return () => clearInterval(id);
  }, [pesos, clickValue, inventory, upgrades]);

  // ---- Game Loop (passive income) ----------------------------------------
  const pps = calculatePps(inventory, upgrades);
  useEffect(() => {
    // Run every 100 ms for smoother UI: add (pps/10) each tick
    const tick = setInterval(() => {
      setPesos((p) => p + pps / 10);
    }, 100);
    return () => clearInterval(tick);
  }, [pps]);

  // ---- Audio Cues ----------------------------------------------------------
  const clickAudio = useCallback(() => {
    const audio = new Audio('https://www.soundjay.com/button/sounds/button-16.mp3');
    audio.play();
  }, []);

  const errorAudio = useCallback(() => {
    const audio = new Audio('https://www.soundjay.com/button/sounds/button-10.mp3');
    audio.play();
  }, []);

  // ---- Interaction Handlers ------------------------------------------------
  const handleClick = () => {
    setPesos((p) => p + clickValue);
    clickAudio();
  };

  const purchaseAsset = (asset) => {
    const owned = inventory[asset.id] ?? 0;
    const cost = getAssetCost(asset.baseCost, owned);
    if (pesos >= cost) {
      setPesos((p) => p - cost);
      setInventory((inv) => ({ ...inv, [asset.id]: (inv[asset.id] ?? 0) + 1 }));
      clickAudio();
    } else {
      errorAudio();
    }
  };

  const purchaseUpgrade = (upgrade) => {
    if (upgrades[upgrade.id]) return; // already owned
    // Upgrades are free in this demo; you could add a cost if desired
    if (upgrade.id === 'antennaBoost') setClickValue((c) => c * 2);
    setUpgrades((u) => ({ ...u, [upgrade.id]: true }));
    clickAudio();
  };

  // ---- Social Share --------------------------------------------------------
  const copySummary = () => {
    const totalAssets = Object.values(inventory).reduce((a, b) => a + b, 0);
    const summary = `📡 PINOY YERN TYCOON\n🪙 Income: ₱${Math.round(pps)}/sec\n🗼 Network: ${inventory.repeaterTower} Barangay Tower(s) deployed!\nCan you beat my network?`;
    navigator.clipboard.writeText(summary).then(() => {
      alert('Summary copied to clipboard!');
    });
  };

  // ---- Render --------------------------------------------------------------
  return (
    <>
      <Head>
        <title>Pinoy Yern Tycoon</title>
        <meta name="description" content="Idle game for Filipino users" />
      </Head>
      <main style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        {/* Left column – click action */}
        <section style={{ flex: 1, padding: '2rem', textAlign: 'center' }}>
          <h1>Insert ₱5 Coin</h1>
          <button
            onClick={handleClick}
            style={{ fontSize: '2rem', padding: '1rem 2rem', margin: '1rem 0' }}
          >
            +{clickValue} ₱
          </button>
          <p>Balance: ₱{Math.floor(pesos)}</p>
          <p>PPS: ₱{Math.round(pps)}/sec</p>
          <button onClick={copySummary} style={{ marginTop: '1rem' }}>
            Share My Tycoon 📋
          </button>
        </section>
        {/* Right column – assets & upgrades */}
        <aside style={{ width: '350px', padding: '2rem', background: '#f9f9f9' }}>
          <h2>Assets</h2>
          {ASSETS.map((asset) => {
            const owned = inventory[asset.id] ?? 0;
            const cost = getAssetCost(asset.baseCost, owned);
            return (
              <div key={asset.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
                <strong>{asset.name}</strong> – {asset.description}<br />
                Income: +₱{asset.baseIncome}/sec each<br />
                Owned: {owned}<br />
                Cost: ₱{cost}<br />
                <button onClick={() => purchaseAsset(asset)} style={{ marginTop: '0.5rem' }}>
                  Buy
                </button>
              </div>
            );
          })}
          <h2 style={{ marginTop: '2rem' }}>Upgrades</h2>
          {UPGRADES.map((up) => (
            <div key={up.id} style={{ marginBottom: '1rem' }}>
              <strong>{up.name}</strong> – {up.description}<br />
              <button
                onClick={() => purchaseUpgrade(up)}
                disabled={upgrades[up.id]}
                style={{ marginTop: '0.5rem' }}
              >
                {upgrades[up.id] ? 'Owned' : 'Buy'}
              </button>
            </div>
          ))}
        </aside>
      </main>
    </>
  );
}
