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
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Press Start 2P', monospace;
        }
        .auth-modal {
          background: #3d2b25;
          border: 4px solid #f0b429;
          padding: 1.5rem;
          width: 90%; max-width: 380px;
          position: relative;
          color: #fef3c7;
        }
        .auth-close-btn {
          position: absolute; top: 0.5rem; right: 0.5rem;
          background: none; border: none; color: #8a6b4a;
          font-size: 1rem; cursor: pointer;
          font-family: inherit;
        }
        .auth-close-btn:hover { color: #fca5a5; }
        .auth-icon { text-align: center; font-size: 2rem; margin-bottom: 0.5rem; }
        .auth-title { text-align: center; color: #f0b429; font-size: 0.9rem; margin-bottom: 0.3rem; }
        .auth-subtitle { text-align: center; color: #d4a574; font-size: 0.45rem; margin-bottom: 1rem; line-height: 1.6; }
        .auth-error {
          background: #4a1a1a; border: 1px solid #fca5a5;
          color: #fecaca; padding: 0.5rem; font-size: 0.4rem;
          margin-bottom: 0.8rem; text-align: center;
        }
        .auth-success {
          background: #2a3d2b; border: 1px solid #a3b18a;
          color: #c4d4b8; padding: 0.5rem; font-size: 0.4rem;
          margin-bottom: 0.8rem; text-align: center;
        }
        .auth-form { display: flex; flex-direction: column; gap: 0.8rem; }
        .auth-field label {
          display: block; font-size: 0.45rem; color: #d4a574; margin-bottom: 0.3rem;
        }
        .auth-field input {
          width: 100%; padding: 0.6rem; background: #2a1f1a; border: 2px solid #5c3d2e;
          color: #fef3c7; font-family: 'Press Start 2P', monospace; font-size: 0.45rem;
          outline: none; box-sizing: border-box;
        }
        .auth-field input:focus { border-color: #f0b429; }
        .auth-submit-btn {
          width: 100%; padding: 0.7rem; background: #f0b429; border: none;
          color: #2a1f1a; font-family: 'Press Start 2P', monospace; font-size: 0.5rem;
          cursor: pointer; margin-top: 0.5rem;
        }
        .auth-submit-btn:hover { background: #d97706; }
        .auth-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-switch { text-align: center; margin-top: 1rem; font-size: 0.4rem; color: #d4a574; }
        .auth-switch button { background: none; border: none; color: #f0b429; cursor: pointer; font-family: inherit; font-size: 0.4rem; text-decoration: underline; }
        .auth-switch button:hover { color: #fbbf24; }
      `}</style>
    </div>
  );
}
