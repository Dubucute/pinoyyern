import PixelIcon from './PixelIcon';
import { SPOTS } from '../config/gameData';

const LEVEL_NAMES = {
  1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4', 5: 'Lv.5',
  6: 'Lv.6', 7: 'Lv.7', 8: 'Lv.8', 9: 'Lv.9', 10: 'MAX',
};

export default function MachineList({ allMachines, currentIndex, onSelectMachine, spotLevels }) {
  if (!allMachines || allMachines.length === 0) {
    return (
      <div className="machine-list empty bg-deep-slate border-2 border-cool-iron p-4 text-center">
        <div className="machine-list-empty-text text-piso-orange text-shadow-pixel">NO MACHINES YET</div>
        <div className="machine-list-empty-hint text-gray-400 text-sm text-shadow-pixel">Buy assets from the shop!</div>
      </div>
    );
  }

  return (
    <div className="machine-list bg-deep-slate border-2 border-cool-iron">
      <div className="machine-list-header text-piso-orange text-sm border-b-2 border-cool-iron p-2 text-shadow-pixel">
        YOUR MACHINES ({allMachines.length})
      </div>
      <div className="machine-list-scroll overflow-y-auto max-h-64">
        {allMachines.map((machine, idx) => {
          const isSelected = idx === currentIndex;
          const spot = SPOTS[machine.spotIndex];
          const spotLevel = spotLevels?.[machine.spotIndex] || 0;
          const spotBonus = spot ? spotLevel * spot.bonusPerLevel : 0;
          const income = machine.asset.baseIncome * machine.level;

          return (
            <div
              key={machine.id || `${machine.assetId}-${machine.machineIndex}`}
              className={`machine-list-card cursor-pointer p-2 ${isSelected ? 'selected bg-cool-iron border-2 border-piso-orange' : 'border-b-2 border-cool-iron'}`}
              onClick={() => onSelectMachine(idx)}
            >
              <div className="mlc-badge bg-piso-orange border-2 border-black">
                <span className="mlc-badge-number text-black font-bold text-xs">{idx + 1}</span>
              </div>
              <div className="mlc-info flex-1 min-w-0">
                <div className="mlc-name-row flex justify-between items-center">
                  <span className="mlc-name text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap text-shadow-pixel">
                    {machine.customName || machine.asset.name}
                  </span>
                  <span className="mlc-level text-piso-orange text-xs text-shadow-pixel">
                    {LEVEL_NAMES[machine.level] || `Lv.${machine.level}`}
                  </span>
                </div>
                <div className="mlc-details flex justify-between mt-1">
                  <span className="mlc-spot text-gray-400 text-xs text-shadow-pixel">
                    {spot ? spot.name : 'No spot'}
                  </span>
                  <span className="mlc-income text-neon-emerald text-xs text-shadow-pixel">
                    ₱{income}/sec
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
