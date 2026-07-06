import PixelIcon from './PixelIcon';

export default function AssetCard({ asset, owned, cost, onBuy, canBuy }) {
  return (
    <div className="asset-card">
      <div className="asset-icon"><PixelIcon type={asset.id} size={32} /></div>
      <div className="asset-info">
        <div className="asset-name">{asset.name}</div>
        <div className="asset-desc">{asset.description}</div>
        <div className="asset-stats"><span>+₱{asset.baseIncome}/sec</span><span>Owned: {owned}</span></div>
        <div className="asset-cost">Cost: ₱{cost}</div>
      </div>
      <button className={`buy-button ${!canBuy ? 'disabled' : ''}`} onClick={onBuy} disabled={!canBuy}>BUY</button>
    </div>
  );
}
