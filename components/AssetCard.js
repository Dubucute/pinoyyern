import PixelIcon from './PixelIcon';

export default function AssetCard({ asset, owned, cost, onBuy, canBuy }) {
  return (
    <div className="asset-card bg-deep-slate border-2 border-cool-iron p-2 flex items-center gap-2">
      <div className="asset-icon w-9 h-9 flex items-center justify-center">
        <PixelIcon type={asset.id} size={32} />
      </div>
      <div className="asset-info flex-1 min-w-0">
        <div className="asset-name text-white text-sm text-shadow-pixel">{asset.name}</div>
        <div className="asset-desc text-gray-400 text-xs text-shadow-pixel">{asset.description}</div>
        <div className="asset-stats flex justify-between text-xs mt-1">
          <span className="text-neon-emerald text-shadow-pixel">+₱{asset.baseIncome}/sec</span>
          <span className="text-gray-400 text-shadow-pixel">Owned: {owned}</span>
        </div>
        <div className="asset-cost text-piso-orange text-xs text-shadow-pixel mt-1">Cost: ₱{cost}</div>
      </div>
      <button
        className={`buy-button button-crunch bg-piso-orange text-white border-b-4 border-piso-dark-orange text-xs text-shadow-pixel ${!canBuy ? 'disabled bg-muted-slate border-b-muted-slate' : ''}`}
        onClick={onBuy}
        disabled={!canBuy}
      >
        BUY
      </button>
    </div>
  );
}
