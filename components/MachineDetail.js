import PixelIcon from './PixelIcon';
import { useState } from 'react';
import { MACHINE_MAX_LEVEL, getMachineUpgradeCost, getMachineTotalUpgradeCost, getMachineSellValue, formatTimeAgo } from '../utils/helpers';
import { LOCATIONS } from '../config/gameData';

const LEVEL_COLORS = {
  1: '#06b6d4', 2: '#06b6d4', 3: '#22d3ee',
  4: '#3b82f6', 5: '#6366f1', 6: '#8b5cf6',
  7: '#f59e0b', 8: '#f97316', 9: '#ef4444',
  10: '#dc2626',
};

export default function MachineDetail({ machine, onClose, onSell, onRename, onUpgrade, spotLevels, pesos }) {
  if (!machine) return null;

  const location = LOCATIONS[machine.locationIndex];
  const locationName = location?.name || 'Unknown Location';

  const incomeContribution = machine.asset.baseIncome * machine.level;
  const totalUpgradeCost = getMachineTotalUpgradeCost(machine.asset, machine.level);
  const nextUpgradeCost = machine.level < MACHINE_MAX_LEVEL ? getMachineUpgradeCost(machine.asset, machine.level) : 0;
  const nextIncome = machine.level < MACHINE_MAX_LEVEL ? machine.asset.baseIncome * (machine.level + 1) : incomeContribution;
  const efficiency = totalUpgradeCost > 0 ? (incomeContribution / totalUpgradeCost).toFixed(3) : 'N/A';
  const sellValue = getMachineSellValue(machine, machine.asset);
  const isMaxLevel = machine.level >= MACHINE_MAX_LEVEL;
  const upgradeCost = getMachineUpgradeCost(machine.asset, machine.level);
  const canUpgrade = !isMaxLevel && (pesos || 0) >= upgradeCost;
  const [confirmSell, setConfirmSell] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(machine.customName || '');

  const displayName = machine.customName || `${machine.asset.name} #${machine.machineIndex + 1}`;
  const accentColor = location?.accentColor || '#3b82f6';

  const handleRename = () => {
    onRename(newName.trim() || null);
    setEditingName(false);
  };

  return (
    <div className="machine-detail-overlay" onClick={onClose}>
      <div className="machine-detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="machine-detail-header">
          <div className="machine-detail-title">MACHINE DETAILS</div>
          <button className="machine-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="machine-detail-main">
          <div className="machine-detail-icon">
            <PixelIcon type={machine.asset.id} size={48} />
          </div>
          <div className="machine-detail-id">
            {editingName ? (
              <div className="rename-input-group">
                <input
                  className="rename-input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setNewName(machine.customName || ''); setEditingName(false); } }}
                  placeholder="Name this machine..."
                  maxLength={24}
                  autoFocus
                />
                <button className="rename-confirm-btn" onClick={handleRename}>SAVE</button>
                <button className="rename-cancel-btn" onClick={() => { setNewName(machine.customName || ''); setEditingName(false); }}>✕</button>
              </div>
            ) : (
              <>
                <div className="machine-detail-name">
                  {displayName}
                  <button className="rename-trigger" onClick={() => setEditingName(true)}>
                    ✎
                  </button>
                </div>
                <div className="machine-detail-type">{machine.asset.name}</div>
              </>
            )}
          </div>
          <div className="machine-detail-lv" style={{ color: LEVEL_COLORS[machine.level] || '#3b82f6' }}>
            Lv.{machine.level}
          </div>
        </div>

        {/* Level bars */}
        <div className="machine-detail-bars">
          {Array.from({ length: MACHINE_MAX_LEVEL }, (_, i) => (
            <div
              key={i}
              className="machine-detail-bar"
              style={{
                backgroundColor: i < machine.level
                  ? LEVEL_COLORS[i + 1] || '#3b82f6'
                  : '#1e293b',
              }}
            />
          ))}
        </div>

        {location && (
            <div className="machine-detail-location" style={{ background: '#0f172a', border: '1px solid ' + accentColor, borderRadius: '8px', margin: '0 1.25rem 0.5rem', padding: '0.6rem' }}>
            <div className="detail-stat-label">📍 Located At</div>
            <div className="detail-stat-value income" style={{ fontSize: '0.6rem', color: accentColor }}>{locationName}</div>
          </div>
        )}
        <div className="machine-detail-stats-grid">
          <div className="detail-stat-box">
            <div className="detail-stat-label">Cumulative Earnings</div>
            <div className="detail-stat-value earnings">₱{Math.floor(machine.earnings).toLocaleString()}</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Time Owned</div>
            <div className="detail-stat-value time">{formatTimeAgo(machine.purchasedAt)}</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Current Income</div>
            <div className="detail-stat-value income">₱{incomeContribution}/sec</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Next Level</div>
            <div className="detail-stat-value next">₱{nextIncome}/sec</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Upgrade Cost</div>
            <div className="detail-stat-value cost">₱{nextUpgradeCost.toLocaleString()}</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Total Upgrade Cost</div>
            <div className="detail-stat-value spent">₱{totalUpgradeCost.toLocaleString()}</div>
          </div>
          <div className="detail-stat-box span-2">
            <div className="detail-stat-label">Efficiency (Income / Total Cost)</div>
            <div className="detail-stat-value eff">₱{efficiency}/sec per ₱ spent</div>
          </div>
        </div>

        <div className="machine-detail-actions">
          {!isMaxLevel ? (
            <button className={`detail-upgrade-btn ${!canUpgrade ? 'disabled' : ''}`} onClick={() => { if (canUpgrade) { onUpgrade(); onClose(); } }} disabled={!canUpgrade}>
              UPGRADE TO Lv.{machine.level + 1} — ₱{upgradeCost.toLocaleString()}
            </button>
          ) : (
            <div className="detail-max-badge">MAX LEVEL REACHED</div>
          )}
        </div>

        <div className="machine-detail-sell">
          {!confirmSell ? (
            <button className="sell-button" onClick={() => setConfirmSell(true)}>
              SELL MACHINE ₱{sellValue.toLocaleString()}
            </button>
          ) : (
            <div className="sell-confirm">
              <div className="sell-confirm-text">Sell for ₱{sellValue.toLocaleString()}?</div>
              <div className="sell-confirm-actions">
                <button className="sell-confirm-yes" onClick={onSell}>YES</button>
                <button className="sell-confirm-no" onClick={() => setConfirmSell(false)}>NO</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
