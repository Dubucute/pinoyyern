import { ACHIEVEMENTS } from '../config/gameData';

export default function AchievementToast({ achievement, onDismiss }) {
  if (!achievement) return null;
  return (
    <div className="achievement-toast" onClick={onDismiss}>
      <div className="toast-icon">{achievement.icon}</div>
      <div className="toast-text">
        <div className="toast-title">ACHIEVEMENT UNLOCKED!</div>
        <div className="toast-name">{achievement.name}</div>
        <div className="toast-desc">{achievement.description}</div>
      </div>
    </div>
  );
}

export function AchievementPanel({ unlocked, visible, onClose }) {
  if (!visible) return null;
  return (
    <div className="achievement-overlay" onClick={onClose}>
      <div className="achievement-panel" onClick={(e) => e.stopPropagation()}>
        <div className="achievement-panel-header">
          <h2 className="achievement-panel-title">🏆 ACHIEVEMENTS</h2>
          <button className="achievement-close" onClick={onClose}>✕</button>
        </div>
        <div className="achievement-panel-body">
          <div className="achievement-count">{unlocked.length} / {ACHIEVEMENTS.length} UNLOCKED</div>
          <div className="achievement-progress-bar">
            <div className="achievement-progress-fill" style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }} />
          </div>
          <div className="achievement-list">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = unlocked.includes(ach.id);
              return (
                <div key={ach.id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-card-icon">{isUnlocked ? ach.icon : '🔒'}</div>
                  <div className="achievement-card-info">
                    <div className="achievement-card-name">{isUnlocked ? ach.name : '???'}</div>
                    <div className="achievement-card-desc">{isUnlocked ? ach.description : 'Keep playing to discover...'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
