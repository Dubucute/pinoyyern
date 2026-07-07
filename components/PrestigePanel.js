import { PRESTIGE_UPGRADES } from '../config/gameData';
import { getPrestigeCost } from '../utils/helpers';

export default function PrestigePanel({ points, rebirthCount, upgrades, visible, onClose, onPrestige, onBuyUpgrade, canPrestige }) {
  if (!visible) return null;
  return (
    <div className="achievement-overlay" onClick={onClose}>
      <div className="prestige-panel" onClick={(e) => e.stopPropagation()}>
        <div className="achievement-panel-header">
          <h2 className="prestige-panel-title">🔄 REBIRTH</h2>
          <button className="achievement-close" onClick={onClose}>✕</button>
        </div>
        <div className="achievement-panel-body">
          <div className="prestige-info">
            <div className="prestige-points-display">
              <span className="prestige-points-icon">⭐</span>
              <span className="prestige-points-value">{points}</span>
              <span className="prestige-points-label">BARANGAY TOKENS</span>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontSize: '0.35rem' }}>REBIRTHS: </span>
              <span style={{ color: '#e89330', fontSize: '0.5rem', fontWeight: 'bold' }}>{rebirthCount || 0}</span>
            </div>
            <div className="prestige-desc">
              Reset your progress to earn permanent bonuses. Each run earns more tokens based on total earnings.
            </div>
            <button className={`prestige-button ${!canPrestige ? 'disabled' : ''}`}
              onClick={onPrestige} disabled={!canPrestige}>
              {canPrestige ? '⭐ REBIRTH NOW' : 'MORE EARNINGS NEEDED'}
            </button>
          </div>
          <h3 className="prestige-upgrades-title">PERMANENT UPGRADES</h3>
          <div className="prestige-upgrades-list">
            {PRESTIGE_UPGRADES.map((upgrade) => {
              const cl = upgrades[upgrade.id] || 0;
              const isMaxed = cl >= upgrade.maxLevel;
              const cost = getPrestigeCost(upgrade, cl);
              const canAfford = points >= cost;
              return (
                <div key={upgrade.id} className={`prestige-upgrade-card ${isMaxed ? 'maxed' : ''}`}>
                  <div className="prestige-upgrade-header">
                    <span className="prestige-upgrade-icon">{upgrade.icon}</span>
                    <div className="prestige-upgrade-info">
                      <div className="prestige-upgrade-name">{upgrade.name}</div>
                      <div className="prestige-upgrade-desc">{upgrade.description}</div>
                    </div>
                    <div className="prestige-upgrade-level">LV {cl}/{upgrade.maxLevel}</div>
                  </div>
                  <div className="prestige-upgrade-bar">
                    <div className="prestige-upgrade-fill" style={{ width: `${(cl / upgrade.maxLevel) * 100}%` }} />
                  </div>
                  {!isMaxed && (
                    <button className={`prestige-buy-button ${!canAfford ? 'disabled' : ''}`}
                      onClick={() => onBuyUpgrade(upgrade.id)} disabled={!canAfford}>
                      ⭐ {cost} TOKENS
                    </button>
                  )}
                  {isMaxed && <div className="prestige-maxed-badge">MAXED</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
