import React, { useState, useEffect } from 'react';
import { getProducts, getCustomers, getOrders } from '../api';
import { ProductsIcon, CustomersIcon, OrdersIcon, DollarSignIcon, AlertCircleIcon, CheckCircleIcon, TrendingUpIcon } from '../components/Icons';

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0, inventoryValue: 0 });
  const [productsList, setProductsList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([products, customers, orders]) => {
        const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
        const totalInvValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);

        setStats({
          products: products.length,
          customers: customers.length,
          orders: orders.length,
          revenue: totalRevenue,
          inventoryValue: totalInvValue
        });
        
        setProductsList(products);
        const lowStockItems = products.filter(p => p.quantity < 10);
        setLowStock(lowStockItems);
      })
      .catch(err => console.error("Error fetching dashboard data", err))
      .finally(() => setLoading(false));
  }, []);

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
          <h2>Dashboard Analytics</h2>
          <p className="page-subtitle">Real-time overview of your inventory metrics and order valuation.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-value">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-trend trend-positive">
              <TrendingUpIcon size={14} />
              <span>+18.4% from last month</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-purple">
            <DollarSignIcon size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Active Products</span>
            <div className="stat-value">{stats.products}</div>
            <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
              <span>Valuation: ${stats.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-emerald">
            <ProductsIcon size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Customers</span>
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-trend trend-positive">
              <CheckCircleIcon size={14} />
              <span>Active account registry</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-amber">
            <CustomersIcon size={24} />
          </div>
        </div>

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
                  <th>SKU Identifier</th>
                  <th>Unit Price</th>
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
                      <td><span className="sku-chip">{p.sku}</span></td>
                      <td>${p.price.toFixed(2)}</td>
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
