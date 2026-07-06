import PixelIcon from './PixelIcon';
import { SPOTS } from '../config/gameData';

const MACHINE_COLORS = [
  '#48bb78', '#4299e1', '#ed8936', '#e53e3e', '#9f7aea',
  '#f6e05e', '#38b2ac', '#fc8181', '#68d391', '#63b3ed',
];

const getMachineColor = (index) => MACHINE_COLORS[index % MACHINE_COLORS.length];

const LEVEL_NAMES = {
  1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4', 5: 'Lv.5',
  6: 'Lv.6', 7: 'Lv.7', 8: 'Lv.8', 9: 'Lv.9', 10: 'MAX',
};

export default function MachineList({ allMachines, currentIndex, onSelectMachine, spotLevels }) {
  if (!allMachines || allMachines.length === 0) {
    return (
      <div className="machine-list empty">
        <div className="machine-list-empty-text">NO MACHINES YET</div>
        <div className="machine-list-empty-hint">Buy assets from the shop!</div>
      </div>
    );
  }

  return (
    <div className="machine-list">
      <div className="machine-list-header">
        YOUR MACHINES ({allMachines.length})
      </div>
      <div className="machine-list-scroll">
        {allMachines.map((machine, idx) => {
          const color = getMachineColor(idx);
          const isSelected = idx === currentIndex;
          const spot = SPOTS[machine.spotIndex];
          const spotLevel = spotLevels?.[machine.spotIndex] || 0;
          const spotBonus = spot ? spotLevel * spot.bonusPerLevel : 0;
          const income = machine.asset.baseIncome * machine.level;

          return (
            <div
              key={machine.id || `${machine.assetId}-${machine.machineIndex}`}
              className={`machine-list-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectMachine(idx)}
              style={{ borderLeftColor: color }}
            >
              <div className="mlc-badge" style={{ backgroundColor: color }}>
                <span className="mlc-badge-number">{idx + 1}</span>
              </div>
              <div className="mlc-info">
                <div className="mlc-name-row">
                  <span className="mlc-name">{machine.customName || machine.asset.name}</span>
                  <span className="mlc-level" style={{ color }}>{LEVEL_NAMES[machine.level] || `Lv.${machine.level}`}</span>
                </div>
                <div className="mlc-details">
                  <span className="mlc-spot">{spot ? spot.name : 'No spot'}</span>
                  <span className="mlc-income">₱{income}/sec</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
