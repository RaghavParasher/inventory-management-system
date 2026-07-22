import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resetDemoUsers } from '../api';
import { SparklesIcon } from './Icons';

function LoginModal() {
  const { login, quickDemoLogin, isLoginModalOpen, setIsLoginModalOpen, authError, setAuthError, loadingAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password).catch(() => {});
  };

  const handleQuick = async (role) => {
    try {
      await quickDemoLogin(role);
    } catch (err) {
      // Auto-heal: If demo account hash is mismatched on cloud DB, reset automatically and retry once!
      setResetting(true);
      try {
        await resetDemoUsers();
        await quickDemoLogin(role);
      } catch (retryErr) {
        // Fallback error displayed
      } finally {
        setResetting(false);
      }
    }
  };

  const handleManualReset = async () => {
    setResetting(true);
    setAuthError(null);
    try {
      await resetDemoUsers();
      alert("Demo accounts have been forcefully reset and verified on the cloud database! Click System Admin Access to enter.");
    } catch (err) {
      setAuthError("Failed to reset credentials. Check API connection.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px', border: '1px solid rgba(129, 140, 248, 0.4)' }}>
        <div className="modal-header" style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-logo" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
              <SparklesIcon size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0 }}>Inventory.sys Portal</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role-Based Access Control (RBAC)</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsLoginModalOpen(false)}>&times;</button>
        </div>

        {authError && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{authError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              required 
              type="text" 
              className="form-control" 
              placeholder="e.g. admin or warehouse" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              required 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loadingAuth}>
            {loadingAuth ? 'Verifying Credentials...' : 'Sign In with Credentials'}
          </button>
        </form>

        <div style={{ margin: '1.75rem 0 1.25rem', position: 'relative', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          <span style={{ position: 'relative', background: '#0f172a', padding: '0 0.8rem', fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600, borderRadius: '4px' }}>
            ⚡ QUICK DEMO ACCESS (NO TYPING)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            type="button" 
            className="btn" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))', 
              border: '1px solid rgba(129, 140, 248, 0.3)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem'
            }}
            onClick={() => handleQuick('admin')}
            disabled={loadingAuth}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👑 System Admin Access</span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Executive</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Full revenue valuation, catalog deletion & customer rights.
              </div>
            </div>
            <span style={{ fontSize: '1.1rem' }}>➔</span>
          </button>

          <button 
            type="button" 
            className="btn" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.04)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem'
            }}
            onClick={() => handleQuick('warehouse')}
            disabled={loadingAuth || resetting}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📦 Warehouse Staff Access</span>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Logistics</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Unit tracking & stock adjustments. Financials & deletion locked.
              </div>
            </div>
            <span style={{ fontSize: '1.1rem' }}>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
