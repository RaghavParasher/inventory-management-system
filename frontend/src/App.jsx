import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import { DashboardIcon, ProductsIcon, CustomersIcon, OrdersIcon, SparklesIcon } from './components/Icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import LoginScreen from './components/LoginScreen';
import './App.css';

function Sidebar() {
  const { user, isAdmin, setIsLoginModalOpen, logout, quickDemoLogin } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-section">
          <div className="brand-logo">
            <SparklesIcon size={22} />
          </div>
          <span className="brand-title">Inventory.sys</span>
        </div>
        
        <nav className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <DashboardIcon size={19} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <ProductsIcon size={19} />
            <span>Products</span>
          </NavLink>
          <NavLink to="/customers" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <CustomersIcon size={19} />
            <span>Customers</span>
          </NavLink>
          <NavLink to="/orders" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <OrdersIcon size={19} />
            <span>Orders</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        {/* Role & Auth Status Widget */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
          {user ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isAdmin ? '👑 System Admin' : '📦 Warehouse Staff'}
                </span>
                <span className={`badge ${isAdmin ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                  Active
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, padding: '0.3rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)' }}
                  onClick={() => quickDemoLogin(isAdmin ? 'warehouse' : 'admin')}
                  title="Switch Demo Role"
                >
                  Switch to {isAdmin ? '📦 Staff' : '👑 Admin'}
                </button>
                <button 
                  className="btn" 
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                  onClick={logout}
                  title="Sign Out"
                >
                  Exit
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Sign in to unlock RBAC privileges & one-click roles.
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onClick={() => setIsLoginModalOpen(true)}
              >
                <span>🔐 Portal Sign In</span>
              </button>
            </div>
          )}
        </div>

        <div className="status-widget">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>API Connected</span>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>v2.0 RBAC</span>
        </div>
      </div>
    </aside>
  );
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
        <LoginModal />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
