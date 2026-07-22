import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import { DashboardIcon, ProductsIcon, CustomersIcon, OrdersIcon, SparklesIcon } from './components/Icons';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
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
            <div className="status-widget">
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span>API Connected</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>v1.2</span>
            </div>
          </div>
        </aside>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
