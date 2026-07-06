import { SLOT_LEVELS, SLOT_UNLOCK_COSTS, SLOT_UPGRADE_COSTS } from '../config/gameData';

export default function SlotCard({ slotIndex, level, onUpgrade, pesos }) {
  const cost = level === 0 ? SLOT_UNLOCK_COSTS[slotIndex] : SLOT_UPGRADE_COSTS[level];
  const canAfford = pesos >= cost;
  const isMaxLevel = level >= 3;
  return (
    <div className={`slot-card level-${level} bg-deep-slate border-2 border-cool-iron p-2`}>
      <div className="slot-header flex justify-between items-center">
        <span className="slot-number text-white text-xs text-shadow-pixel">SLOT {slotIndex + 1}</span>
        <span className={`slot-level text-xs font-bold text-shadow-pixel ${level === 0 ? 'text-muted-slate' : 'text-piso-orange'}`}>
          {SLOT_LEVELS[level]?.name?.toUpperCase() || 'LOCKED'}
        </span>
      </div>
      <div className="slot-bars flex gap-1 mt-1">
        {[1, 2, 3].map(bl => (
          <div
            key={bl}
            className={`slot-bar flex-1 h-2 border-2 border-cool-iron ${bl <= level ? 'bg-piso-orange' : 'bg-deep-slate'}`}
          />
        ))}
      </div>
      <div className="slot-income text-neon-emerald text-xs mt-1 text-shadow-pixel">
        +₱{SLOT_LEVELS[level]?.income || 0}/sec
      </div>
      {!isMaxLevel && (
        <button
          className={`slot-button button-crunch mt-1 w-full bg-piso-orange text-white border-b-4 border-piso-dark-orange text-xs text-shadow-pixel ${!canAfford ? 'disabled bg-muted-slate border-b-muted-slate' : ''}`}
          onClick={() => onUpgrade(slotIndex)}
          disabled={!canAfford}
        >
          ₱{cost.toLocaleString()}
        </button>
      )}
      {isMaxLevel && (
        <div className="slot-maxed bg-neon-emerald text-black px-2 py-1 text-xs border-b-2 border-green-800 text-shadow-none mt-1 text-center">
          MAX
        </div>
      )}
    </div>
  );
}
