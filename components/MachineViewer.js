import PixelIcon from './PixelIcon';
import { MACHINE_MAX_LEVEL, getMachineUpgradeCost } from '../utils/helpers';
import { SPOTS } from '../config/gameData';

const LEVEL_NAMES = {
  1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4', 5: 'Lv.5',
  6: 'Lv.6', 7: 'Lv.7', 8: 'Lv.8', 9: 'Lv.9', 10: 'MAX',
};

export default function MachineViewer({ allMachines, currentIndex, onPrev, onNext, onUpgrade, onMachineClick, pesos, spotLevels }) {
  if (!allMachines || allMachines.length === 0) {
    return (
      <div className="machine-viewer empty bg-deep-slate border-2 border-cool-iron p-4 text-center">
        <div className="machine-empty-text text-piso-orange text-shadow-pixel">NO MACHINES YET</div>
        <div className="machine-empty-hint text-gray-400 text-sm text-shadow-pixel">Buy assets from the shop!</div>
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
    <div className="machine-viewer bg-deep-slate border-2 border-cool-iron p-2">
      <div className="machine-viewer-title text-piso-orange text-sm border-b-2 border-cool-iron pb-1 text-shadow-pixel">
        MACHINE UPGRADES
      </div>

      <div
        className="machine-main flex items-center gap-2 p-2 cursor-pointer bg-cool-iron border-2 border-cool-iron hover:border-piso-orange"
        onClick={onMachineClick}
      >
        <div className="machine-icon">
          <PixelIcon type={machine.asset.id} size={40} />
        </div>
        <div className="machine-details flex-1 min-w-0">
          <div className="machine-name text-white text-sm text-shadow-pixel overflow-hidden text-ellipsis whitespace-nowrap">
            {machine.customName || machine.asset.name}
          </div>
          <div className="machine-number text-gray-400 text-xs text-shadow-pixel">
            {machine.customName ? `${machine.asset.name} #${machine.machineIndex + 1}` : `Machine #${machine.machineIndex + 1}`}
          </div>
          <div className="machine-spot text-xs text-shadow-pixel">
            {spot ? (
              <>
                <span className="machine-spot-name text-gray-400">📍 {spot.name}</span>
                <span className="machine-spot-bonus text-neon-emerald ml-2">+{(spotBonus * 100).toFixed(0)}%</span>
              </>
            ) : (
              <span className="machine-spot-name text-gray-400">📍 No spot</span>
            )}
          </div>
        </div>
        <div className="machine-level-badge text-piso-orange text-xs font-bold text-shadow-pixel">
          {LEVEL_NAMES[machine.level] || `Lv.${machine.level}`}
        </div>
      </div>

      {/* Earnings indicator bar */}
      <div className="machine-earnings-bar-container mt-2">
        <div className="machine-earnings-label text-white text-xs text-shadow-pixel">
          <span>Earnings: ₱{Math.floor(machine.earnings).toLocaleString()}</span>
        </div>
        <div className="machine-earnings-bar-track bg-deep-slate border-2 border-cool-iron mt-1 h-3">
          <div
            className="machine-earnings-bar-fill bg-piso-orange h-full"
            style={{ width: `${Math.min(100, (Math.log10(Math.max(1, machine.earnings)) / 6) * 100)}%` }}
          />
        </div>
      </div>

      {/* Level progress bars */}
      <div className="machine-level-bars flex gap-1 mt-2">
        {Array.from({ length: MACHINE_MAX_LEVEL }, (_, i) => (
          <div
            key={i}
            className={`machine-lvl-bar flex-1 h-2 border-2 border-cool-iron ${i < machine.level ? 'bg-piso-orange' : 'bg-deep-slate'}`}
          />
        ))}
      </div>

      <div className="machine-stats flex justify-between mt-2 text-xs">
        <div className="machine-stat">
          <span className="machine-stat-label text-gray-400 text-shadow-pixel">Income:</span>
          <span className="machine-stat-value text-neon-emerald text-shadow-pixel">₱{incomeContribution}/sec</span>
        </div>
        <div className="machine-stat">
          <span className="machine-stat-label text-gray-400 text-shadow-pixel">Position:</span>
          <span className="machine-stat-value text-white text-shadow-pixel">{currentIndex + 1} / {allMachines.length}</span>
        </div>
      </div>

      <div className="machine-actions flex justify-between mt-2 gap-1">
        <button
          className={`machine-nav-btn button-crunch bg-piso-orange text-white border-b-4 border-piso-dark-orange text-xs text-shadow-pixel ${currentIndex <= 0 ? 'disabled bg-muted-slate border-b-muted-slate' : ''}`}
          onClick={onPrev}
          disabled={currentIndex <= 0}
        >
          ◀ PREV
        </button>

        {isMaxLevel ? (
          <div className="machine-maxed bg-neon-emerald text-black px-2 py-1 text-xs border-b-2 border-green-800 text-shadow-none flex items-center justify-center">
            MAX LEVEL
          </div>
        ) : (
          <button
            className={`machine-upgrade-btn button-crunch flex-1 bg-piso-orange text-white border-b-4 border-piso-dark-orange text-xs text-shadow-pixel ${!canUpgrade ? 'disabled bg-muted-slate border-b-muted-slate' : ''}`}
            onClick={onUpgrade}
            disabled={!canUpgrade}
          >
            UPGRADE ₱{upgradeCost.toLocaleString()}
          </button>
        )}

        <button
          className={`machine-nav-btn button-crunch bg-piso-orange text-white border-b-4 border-piso-dark-orange text-xs text-shadow-pixel ${currentIndex >= allMachines.length - 1 ? 'disabled bg-muted-slate border-b-muted-slate' : ''}`}
          onClick={onNext}
          disabled={currentIndex >= allMachines.length - 1}
        >
          NEXT ▶
        </button>
      </div>
    </div>
  );
}
