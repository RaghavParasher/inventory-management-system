import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resetDemoUsers } from '../api';
import { SparklesIcon } from './Icons';

function LoginScreen() {
  const { login, quickDemoLogin, authError, setAuthError, loadingAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetting, setResetting] = useState(false);

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
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15), transparent 60%), #0b0f19',
      padding: '1.5rem',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background blur elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '350px', height: '350px', background: 'rgba(99, 102, 241, 0.12)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '15%', width: '350px', height: '350px', background: 'rgba(139, 92, 246, 0.12)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>

      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(129, 140, 248, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem 2.2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
        zIndex: 1
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)'
          }}>
            <SparklesIcon size={30} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.4rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Inventory.sys Portal
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Enterprise Role-Based Access Control (RBAC) System
          </p>
        </div>

        {authError && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{authError}</div>}

        {/* Quick Demo Access Section (Highlighted at Top) */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></span>
            <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.5px' }}>
              ⚡ ONE-CLICK DEMO ACCESS (NO TYPING)
            </span>
            <span style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <button
              type="button"
              className="btn"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25))',
                border: '1px solid rgba(129, 140, 248, 0.45)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.25rem',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 20px -6px rgba(99, 102, 241, 0.3)'
              }}
              onClick={() => handleQuick('admin')}
              disabled={loadingAuth || resetting}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
                  <span>👑 System Admin Access</span>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>Executive Mode</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.3rem' }}>
                  Full revenue valuation, catalog deletion & customer rights.
                </div>
              </div>
              <span style={{ fontSize: '1.3rem', color: '#a5b4fc' }}>➔</span>
            </button>

            <button
              type="button"
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.25rem',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleQuick('warehouse')}
              disabled={loadingAuth || resetting}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
                  <span>📦 Warehouse Staff Access</span>
                  <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>Logistics Mode</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Unit tracking & stock adjustments. Financials & deletion locked.
                </div>
              </div>
              <span style={{ fontSize: '1.3rem', color: 'var(--text-secondary)' }}>➔</span>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <span style={{ height: '1px', background: 'rgba(255,255,255,0.08)', flex: 1 }}></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            OR SIGN IN WITH CREDENTIALS
          </span>
          <span style={{ height: '1px', background: 'rgba(255,255,255,0.08)', flex: 1 }}></span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Username</label>
            <input
              required
              type="text"
              className="form-control"
              placeholder="admin or warehouse"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Password</label>
            <input
              required
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem' }}
            disabled={loadingAuth || resetting}
          >
            {loadingAuth ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            type="button"
            className="btn"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px' }}
            onClick={handleManualReset}
            disabled={resetting || loadingAuth}
          >
            {resetting ? "Force Resetting Demo Accounts..." : "🔄 Reset / Fix Demo Accounts on Cloud DB"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
