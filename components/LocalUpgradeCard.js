export default function LocalUpgradeCard({ upgrade, owned, canBuy, onBuy }) {
  return (
    <div className={`local-upgrade-card ${owned ? 'owned' : ''}`}>
      <div className="local-upgrade-info">
        <div className="local-upgrade-name">{upgrade.name}</div>
        <div className="local-upgrade-desc">{upgrade.description}</div>
        <div className="local-upgrade-cost">Cost: ₱{upgrade.cost.toLocaleString()}</div>
      </div>
      <button
        className={`buy-button ${owned || !canBuy ? 'disabled' : ''}`}
        onClick={onBuy}
        disabled={owned || !canBuy}
      >
        {owned ? 'OWNED' : 'BUY'}
      </button>
    </div>
  );
}
