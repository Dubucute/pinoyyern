import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }
      if (username.length < 3 || username.length > 20) {
        setError('Username must be between 3 and 20 characters');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
        if (onLoginSuccess) onLoginSuccess();
        if (onClose) onClose();
      } else {
        await signup(username.trim(), password);
        setSuccess('Account created! You can now log in.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="auth-modal">
        <button className="auth-close-btn" onClick={onClose}>✕</button>

        <div className="auth-icon">
          {mode === 'login' ? '🔐' : '📝'}
        </div>
        <h2 className="auth-title">
          {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Login to save your game to the cloud'
            : 'Create an account to save your progress'}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              maxLength={20}
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
            />
          </div>
          {mode === 'signup' && (
            <div className="auth-field">
              <label>CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password..."
              />
            </div>
          )}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={busy}
          >
            {busy ? 'PLEASE WAIT...' : mode === 'login' ? '▶ LOGIN' : '▶ CREATE ACCOUNT'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>No account? <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>Sign up here</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Log in here</button></>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-modal-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Press Start 2P', monospace;
          padding: 1rem;
        }
        .auth-modal {
          background: #3d4a35;
          border: 3px solid #8cb369;
          padding: 1.5rem;
          width: 100%; max-width: 380px;
          position: relative;
          color: #f5e6c8;
        }
        .auth-close-btn {
          position: absolute; top: 0.5rem; right: 0.5rem;
          background: none; border: none; color: #8a9a7a;
          font-size: 1.2rem; cursor: pointer; line-height: 1; padding: 0.25rem;
          font-family: inherit;
        }
        .auth-close-btn:hover { color: #fca5a5; }
        .auth-icon { text-align: center; font-size: 2.5rem; margin-bottom: 0.5rem; }
        .auth-title { text-align: center; color: #f0c05a; font-size: 0.9rem; margin-bottom: 0.3rem; }
        .auth-subtitle { text-align: center; color: #c4b49a; font-size: 0.5rem; margin-bottom: 1rem; line-height: 1.6; }
        .auth-error {
          background: #4a2a1a; border: 1px solid #fca5a5;
          color: #fecaca; padding: 0.6rem; font-size: 0.45rem;
          margin-bottom: 0.8rem; text-align: center;
        }
        .auth-success {
          background: #2a3d2b; border: 1px solid #8cb369;
          color: #c4d4b8; padding: 0.6rem; font-size: 0.45rem;
          margin-bottom: 0.8rem; text-align: center;
        }
        .auth-form { display: flex; flex-direction: column; gap: 0.8rem; }
        .auth-field label {
          display: block; font-size: 0.5rem; color: #c4b49a; margin-bottom: 0.35rem;
        }
        .auth-field input {
          width: 100%; padding: 0.7rem; background: #2a3d2b; border: 2px solid #5c7a3a;
          color: #f5e6c8; font-family: 'Press Start 2P', monospace; font-size: 0.5rem;
          outline: none; box-sizing: border-box;
        }
        .auth-field input:focus { border-color: #8cb369; }
        .auth-submit-btn {
          width: 100%; padding: 0.8rem; background: #8cb369; border: none;
          color: #2a3d2b; font-family: 'Press Start 2P', monospace; font-size: 0.55rem;
          cursor: pointer; margin-top: 0.5rem; transition: opacity 0.15s; min-height: 48px;
        }
        .auth-submit-btn:hover { opacity: 0.85; background: #8cb369; }
        .auth-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .auth-switch { text-align: center; margin-top: 1rem; font-size: 0.45rem; color: #c4b49a; line-height: 1.8; }
        .auth-switch button { background: none; border: none; color: #f0c05a; cursor: pointer; font-family: inherit; font-size: 0.45rem; text-decoration: underline; padding: 0; }
        .auth-switch button:hover { color: #f0d88a; }
        @media (max-width: 480px) {
          .auth-modal { padding: 1.2rem; }
          .auth-title { font-size: 0.75rem; }
          .auth-subtitle { font-size: 0.4rem; }
          .auth-field label { font-size: 0.4rem; }
          .auth-field input { padding: 0.6rem; font-size: 0.4rem; }
          .auth-submit-btn { padding: 0.7rem; font-size: 0.45rem; min-height: 44px; }
          .auth-switch { font-size: 0.38rem; }
          .auth-switch button { font-size: 0.38rem; }
        }
      `}</style>
    </div>
  );
}
