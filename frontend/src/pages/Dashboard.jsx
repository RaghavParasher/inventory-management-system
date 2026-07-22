import React, { useState, useEffect } from 'react';
import { getProducts, getCustomers, getOrders, triggerSeed } from '../api';
import { ProductsIcon, CustomersIcon, OrdersIcon, DollarSignIcon, AlertCircleIcon, CheckCircleIcon, TrendingUpIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, isAdmin, isWarehouse } = useAuth();
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0, inventoryValue: 0, totalUnits: 0 });
  const [productsList, setProductsList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([products, customers, orders]) => {
        const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
        const totalInvValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);
        const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);

        setStats({
          products: products.length,
          customers: customers.length,
          orders: orders.length,
          revenue: totalRevenue,
          inventoryValue: totalInvValue,
          totalUnits: totalUnits
        });
        
        setProductsList(products);
        const lowStockItems = products.filter(p => p.quantity < 10);
        setLowStock(lowStockItems);
      })
      .catch(err => console.error("Error fetching dashboard data", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTriggerSeed = () => {
    setSeeding(true);
    setSeedMessage(null);
    triggerSeed()
      .then(() => {
        setSeedMessage("Successfully seeded 55+ products, 15 customers, and 32+ orders!");
        fetchDashboardData();
      })
      .catch(err => {
        setSeedMessage("Error seeding database. Verify API status.");
      })
      .finally(() => {
        setSeeding(false);
      });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="status-dot" style={{ display: 'inline-block', margin: '0 auto 1rem', width: '12px', height: '12px' }}></span>
          <p>Synchronizing real-time analytics...</p>
        </div>
      </div>
    );
  }

  const outOfStockCount = productsList.filter(p => p.quantity === 0).length;
  const lowStockCount = lowStock.length;
  const healthyStockCount = productsList.length - lowStockCount - outOfStockCount;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h2>Dashboard Analytics {isWarehouse && <span className="badge badge-warning" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>📦 Logistics Mode</span>}</h2>
          <p className="page-subtitle">
            {isWarehouse 
              ? "Real-time logistics tracking, unit thresholds, and physical warehouse distribution."
              : "Real-time overview of your inventory metrics and executive order valuation."}
          </p>
        </div>
        
        {productsList.length < 50 && (
          <button 
            className="btn btn-primary" 
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid #34d399' }}
            onClick={handleTriggerSeed}
            disabled={seeding}
          >
            <span>{seeding ? "Populating Database..." : "🌱 Auto-Seed 55+ Demo Products"}</span>
          </button>
        )}
      </div>

      {seedMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #34d399', color: '#fff' }}>
          {seedMessage}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Card 1: Revenue or Total Units */}
        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">{isWarehouse ? "Physical Inventory Units" : "Total Revenue"}</span>
            <div className="stat-value">
              {isWarehouse ? stats.totalUnits.toLocaleString() : `$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <div className="stat-trend trend-positive">
              <TrendingUpIcon size={14} />
              <span>{isWarehouse ? "Active warehouse capacity" : "+18.4% from last month"}</span>
            </div>
          </div>
          <div className={`stat-icon-wrapper ${isWarehouse ? 'icon-amber' : 'icon-purple'}`}>
            {isWarehouse ? <ProductsIcon size={24} /> : <DollarSignIcon size={24} />}
          </div>
        </div>

        {/* Card 2: Active Products */}
        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Active Products</span>
            <div className="stat-value">{stats.products}</div>
            <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
              <span>
                {isWarehouse ? "Registered SKU listings" : `Valuation: $${stats.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-emerald">
            <ProductsIcon size={24} />
          </div>
        </div>

        {/* Card 3: Customers or Active Suppliers */}
        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Customers</span>
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-trend trend-positive">
              <CheckCircleIcon size={14} />
              <span>{isWarehouse ? "Verified client accounts" : "Active account registry"}</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-amber">
            <CustomersIcon size={24} />
          </div>
        </div>

        {/* Card 4: Orders Placed */}
        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Orders Placed</span>
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-trend trend-positive">
              <TrendingUpIcon size={14} />
              <span>Fulfilled seamlessly</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-purple">
            <OrdersIcon size={24} />
          </div>
        </div>
      </div>

      {/* Inventory Health Bar */}
      <div className="glass-card" style={{ marginBottom: '2.2rem' }}>
        <div className="card-header">
          <div className="card-title">
            <ProductsIcon size={20} color="#818cf8" />
            <span>Inventory Health Distribution</span>
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
              <span className="badge-dot" style={{ backgroundColor: '#34d399' }}></span> Healthy ({healthyStockCount})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
              <span className="badge-dot" style={{ backgroundColor: '#fbbf24' }}></span> Low Stock ({lowStockCount})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}>
              <span className="badge-dot" style={{ backgroundColor: '#f87171' }}></span> Depleted ({outOfStockCount})
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', height: '12px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', gap: '2px' }}>
          {productsList.length > 0 && (
            <>
              <div style={{ width: `${(healthyStockCount / productsList.length) * 100}%`, backgroundColor: '#10b981', transition: 'width 0.5s' }}></div>
              <div style={{ width: `${(lowStockCount / productsList.length) * 100}%`, backgroundColor: '#f59e0b', transition: 'width 0.5s' }}></div>
              <div style={{ width: `${(outOfStockCount / productsList.length) * 100}%`, backgroundColor: '#ef4444', transition: 'width 0.5s' }}></div>
            </>
          )}
        </div>
      </div>

      {/* Low Stock Alert Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <AlertCircleIcon size={20} color="#f87171" />
            <span>Critical & Low Stock Notifications</span>
          </div>
          <span className="badge badge-danger">
            {lowStock.length} requiring attention
          </span>
        </div>
        {lowStock.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>SKU Identifier</th>
                  {!isWarehouse && <th>Unit Price</th>}
                  <th>Stock Status</th>
                  <th>Capacity Meter</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => {
                  const percent = Math.min(Math.max((p.quantity / 30) * 100, 5), 100);
                  const isDepleted = p.quantity === 0;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                      <td><span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>{p.category || 'General'}</span></td>
                      <td><span className="sku-chip">{p.sku}</span></td>
                      {!isWarehouse && <td>${p.price.toFixed(2)}</td>}
                      <td>
                        {isDepleted ? (
                          <span className="badge badge-danger">
                            <span className="badge-dot"></span> Out of Stock
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <span className="badge-dot"></span> {p.quantity} Units Left
                          </span>
                        )}
                      </td>
                      <td style={{ width: '220px' }}>
                        <div className="progress-container" style={{ margin: 0 }}>
                          <div 
                            className={`progress-bar ${isDepleted ? 'progress-danger' : 'progress-warning'}`} 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircleIcon size={38} color="#34d399" style={{ margin: '0 auto' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.8rem' }}>Optimal Inventory Levels</p>
            <p>All registered products currently maintain comfortable stock thresholds above 10 units.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
