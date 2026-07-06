import PixelIcon from './PixelIcon';

export default function DiskarteCard({ upgrade, owned, canBuy, onBuy }) {
  const iconType = upgrade.id === 'longRangeAntenna' ? 'antenna' : 'marketing';
  return (
    <div className="diskarte-card">
      <div className="diskarte-icon"><PixelIcon type={iconType} size={32} /></div>
      <div className="diskarte-info">
        <div className="diskarte-name">{upgrade.name}</div>
        <div className="diskarte-desc">{upgrade.description}</div>
        <div className="diskarte-cost">Cost: ₱{upgrade.cost}</div>
      </div>
      <button className={`buy-button ${owned || !canBuy ? 'disabled' : ''}`} onClick={onBuy} disabled={owned || !canBuy}>
        {owned ? 'OWNED' : 'BUY'}
      </button>
    </div>
  );
}
