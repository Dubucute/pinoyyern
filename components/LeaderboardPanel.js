import { useState, useEffect } from 'react';

function formatPlayTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function LeaderboardPanel({ visible, onClose }) {
  const [tab, setTab] = useState('money');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch('/api/leaderboard', { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('');
        setData({ topMoney: null, topClicks: null, topTime: null });
        setLoading(false);
      })
      .finally(() => clearTimeout(timeout));
  }, [visible]);

  if (!visible) return null;

  const list = (data && (tab === 'money' ? data.topMoney : tab === 'clicks' ? data.topClicks : data.topTime)) || [];
  const tabLabel = tab === 'money' ? '💰 TOP MONEY' : tab === 'clicks' ? '👆 TOP CLICKS' : '⏱️ TOP TIME';

  return (
    <div className="achievement-overlay" onClick={onClose}>
      <div className="achievement-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="achievement-panel-header">
          <h2 className="achievement-panel-title">🏆 LEADERBOARD</h2>
          <button className="achievement-close" onClick={onClose}>✕</button>
        </div>

        <div className="achievement-panel-body">
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem' }}>
            <button
              className={`leaderboard-tab ${tab === 'money' ? 'active' : ''}`}
              onClick={() => setTab('money')}
            >
              💰 MONEY
            </button>
            <button
              className={`leaderboard-tab ${tab === 'clicks' ? 'active' : ''}`}
              onClick={() => setTab('clicks')}
            >
              👆 CLICKS
            </button>
            <button
              className={`leaderboard-tab ${tab === 'time' ? 'active' : ''}`}
              onClick={() => setTab('time')}
            >
              ⏱️ TIME
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.4rem', padding: '1rem' }}>
              Loading...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', color: '#aa6644', fontSize: '0.35rem', padding: '0.5rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ color: '#e89330', fontSize: '0.5rem', marginBottom: '0.5rem' }}>☁️</div>
              <div style={{ color: '#888', fontSize: '0.38rem', lineHeight: 1.8 }}>
                Leaderboard is only available on the<br />
                <strong style={{ color: '#e89330' }}>Vercel deployment</strong> with MongoDB.<br /><br />
                Play on the live site to compete!
              </div>
            </div>
          )}

          {!loading && list.length > 0 && (
            <div className="leaderboard-list">
              <div className="leaderboard-header">
                <span className="lb-rank">#</span>
                <span className="lb-name">PLAYER</span>
                <span className="lb-stat">{tabLabel.split(' ').slice(1).join(' ')}</span>
              </div>
              {list.map((entry, i) => (
                <div key={entry.username} className={`leaderboard-row ${i < 3 ? 'top' : ''}`}>
                  <span className="lb-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className="lb-name">{entry.username}</span>
                  <span className="lb-stat">
                    {tab === 'money'
                      ? `₱${Math.floor(entry.totalEarned || 0).toLocaleString()}`
                      : tab === 'clicks'
                        ? (entry.totalClicks || 0).toLocaleString()
                        : formatPlayTime(entry.playTime || 0)
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .leaderboard-tab {
            flex: 1; font-family: 'Press Start 2P', cursive;
            background: transparent; color: #888;
            border: 1px solid #333; border-radius: 4px;
            padding: 0.4rem 0.3rem; font-size: 0.35rem; cursor: pointer;
            transition: all 0.15s;
          }
          .leaderboard-tab.active { background: #e89330; color: #141414; border-color: #e89330; font-weight: bold; }
          .leaderboard-tab:hover:not(.active) { background: #222; color: #d4d0c8; }
          .leaderboard-list { display: flex; flex-direction: column; gap: 0.25rem; }
          .leaderboard-header, .leaderboard-row {
            display: flex; align-items: center; gap: 0.3rem;
            padding: 0.35rem 0.4rem; border-radius: 4px;
          }
          .leaderboard-header { background: #141414; color: #666; font-size: 0.3rem; border-bottom: 1px solid #2a2a2a; }
          .leaderboard-row { background: #1a1a1a; border: 1px solid #2a2a2a; font-size: 0.35rem; }
          .leaderboard-row.top { border-color: #443311; }
          .lb-rank { width: 2rem; flex-shrink: 0; text-align: center; color: #d4d0c8; }
          .lb-name { flex: 1; color: #e89330; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .lb-stat { text-align: right; color: #d4d0c8; flex-shrink: 0; min-width: 5rem; }
          @media (max-width: 480px) {
            .leaderboard-tab { font-size: 0.3rem; padding: 0.35rem 0.2rem; }
            .leaderboard-row { font-size: 0.3rem; }
            .lb-stat { min-width: 4rem; font-size: 0.28rem; }
          }
        `}</style>
      </div>
    </div>
  );
}
