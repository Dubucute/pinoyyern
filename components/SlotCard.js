import { SLOT_LEVELS, SLOT_UNLOCK_COSTS, SLOT_UPGRADE_COSTS } from '../config/gameData';
import { SLOT_LEVEL_COLORS } from '../utils/helpers';

export default function SlotCard({ slotIndex, level, onUpgrade, pesos }) {
  const cost = level === 0 ? SLOT_UNLOCK_COSTS[slotIndex] : SLOT_UPGRADE_COSTS[level];
  const canAfford = pesos >= cost;
  const isMaxLevel = level >= 3;
  return (
    <div className={`slot-card level-${level}`}>
      <div className="slot-header">
        <span className="slot-number">SLOT {slotIndex + 1}</span>
        <span className="slot-level" style={{ color: SLOT_LEVEL_COLORS[level] }}>
          {SLOT_LEVELS[level]?.name?.toUpperCase() || 'LOCKED'}
        </span>
      </div>
      <div className="slot-bars">
        {[1, 2, 3].map(bl => (
          <div key={bl} className={`slot-bar ${bl <= level ? 'filled' : ''}`}
            style={{ backgroundColor: bl <= level ? SLOT_LEVEL_COLORS[bl] : '#2d3748' }} />
        ))}
      </div>
      <div className="slot-income">+₱{SLOT_LEVELS[level]?.income || 0}/sec</div>
      {!isMaxLevel && (
        <button className={`slot-button ${!canAfford ? 'disabled' : ''}`}
          onClick={() => onUpgrade(slotIndex)} disabled={!canAfford}>
          ₱{cost.toLocaleString()}
        </button>
      )}
      {isMaxLevel && <div className="slot-maxed">MAX</div>}
    </div>
  );
}
