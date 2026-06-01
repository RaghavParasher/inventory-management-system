import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div>
            <h1>Inventory.sys</h1>
            <nav className="nav-links">
              <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
              <NavLink to="/products" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Products</NavLink>
              <NavLink to="/customers" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Customers</NavLink>
              <NavLink to="/orders" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Orders</NavLink>
            </nav>
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
