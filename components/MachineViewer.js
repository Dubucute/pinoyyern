import PixelIcon from './PixelIcon';
import { MACHINE_MAX_LEVEL, getMachineUpgradeCost } from '../utils/helpers';
import { SPOTS } from '../config/gameData';

const LEVEL_COLORS = {
  1: '#48bb78', 2: '#48bb78', 3: '#68d391',
  4: '#4299e1', 5: '#63b3ed', 6: '#90cdf4',
  7: '#ed8936', 8: '#f6ad55', 9: '#fbd38d',
  10: '#e53e3e',
};

const LEVEL_NAMES = {
  1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4', 5: 'Lv.5',
  6: 'Lv.6', 7: 'Lv.7', 8: 'Lv.8', 9: 'Lv.9', 10: 'MAX',
};

export default function MachineViewer({ allMachines, currentIndex, onPrev, onNext, onUpgrade, onMachineClick, pesos, spotLevels }) {
  if (!allMachines || allMachines.length === 0) {
    return (
      <div className="machine-viewer empty">
        <div className="machine-empty-text">NO MACHINES YET</div>
        <div className="machine-empty-hint">Buy assets from the shop!</div>
      </div>
    );
  }

  const machine = allMachines[currentIndex];
  if (!machine) return null;

  const isMaxLevel = machine.level >= MACHINE_MAX_LEVEL;
  const upgradeCost = isMaxLevel ? 0 : getMachineUpgradeCost(machine.asset, machine.level);
  const canUpgrade = !isMaxLevel && pesos >= upgradeCost;
  const spot = SPOTS[machine.spotIndex];
  const spotLevel = spotLevels?.[machine.spotIndex] || 0;
  const spotBonus = spot ? spotLevel * spot.bonusPerLevel : 0;
  const incomeContribution = machine.asset.baseIncome * machine.level;

  return (
    <div className="machine-viewer">
      <div className="machine-viewer-title">MACHINE UPGRADES</div>

      <div className="machine-main" onClick={onMachineClick} style={{ cursor: 'pointer' }}>
        <div className="machine-icon">
          <PixelIcon type={machine.asset.id} size={40} />
        </div>
        <div className="machine-details">
          <div className="machine-name">{machine.customName || machine.asset.name}</div>
          <div className="machine-number">{machine.customName ? `${machine.asset.name} #${machine.machineIndex + 1}` : `Machine #${machine.machineIndex + 1}`}</div>
          <div className="machine-spot">
            {spot ? (
              <>
                <span className="machine-spot-name">📍 {spot.name}</span>
                <span className="machine-spot-bonus" style={{ color: '#48bb78', fontSize: '0.4rem', marginLeft: '0.5rem' }}>+{(spotBonus * 100).toFixed(0)}%</span>
              </>
            ) : (
              <span className="machine-spot-name">📍 No spot</span>
            )}
          </div>
        </div>
        <div className="machine-level-badge" style={{ color: LEVEL_COLORS[machine.level] || '#48bb78' }}>
          {LEVEL_NAMES[machine.level] || `Lv.${machine.level}`}
        </div>
      </div>

      {/* Earnings indicator bar */}
      <div className="machine-earnings-bar-container">
        <div className="machine-earnings-label">
          <span>Earnings: ₱{Math.floor(machine.earnings).toLocaleString()}</span>
        </div>
        <div className="machine-earnings-bar-track">
          <div
            className="machine-earnings-bar-fill"
            style={{ width: `${Math.min(100, (Math.log10(Math.max(1, machine.earnings)) / 6) * 100)}%` }}
          />
        </div>
      </div>

      {/* Level progress bars */}
      <div className="machine-level-bars">
        {Array.from({ length: MACHINE_MAX_LEVEL }, (_, i) => (
          <div
            key={i}
            className={`machine-lvl-bar ${i < machine.level ? 'filled' : ''}`}
            style={{
              backgroundColor: i < machine.level
                ? LEVEL_COLORS[i + 1] || '#48bb78'
                : '#2d3748',
            }}
          />
        ))}
      </div>

      <div className="machine-stats">
        <div className="machine-stat">
          <span className="machine-stat-label">Income:</span>
          <span className="machine-stat-value">₱{incomeContribution}/sec</span>
        </div>
        <div className="machine-stat">
          <span className="machine-stat-label">Position:</span>
          <span className="machine-stat-value">{currentIndex + 1} / {allMachines.length}</span>
        </div>
      </div>

      <div className="machine-actions">
        <button
          className="machine-nav-btn"
          onClick={onPrev}
          disabled={currentIndex <= 0}
        >
          ◀ PREV
        </button>

        {isMaxLevel ? (
          <div className="machine-maxed">MAX LEVEL</div>
        ) : (
          <button
            className={`machine-upgrade-btn ${!canUpgrade ? 'disabled' : ''}`}
            onClick={onUpgrade}
            disabled={!canUpgrade}
          >
            UPGRADE ₱{upgradeCost.toLocaleString()}
          </button>
        )}

        <button
          className="machine-nav-btn"
          onClick={onNext}
          disabled={currentIndex >= allMachines.length - 1}
        >
          NEXT ▶
        </button>
      </div>
    </div>
  );
}
