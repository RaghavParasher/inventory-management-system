import React, { useState, useEffect } from 'react';
import { getProducts, getCustomers, getOrders } from '../api';

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([products, customers, orders]) => {
        setStats({
          products: products.length,
          customers: customers.length,
          orders: orders.length
        });
        
        const lowStockItems = products.filter(p => p.quantity < 10);
        setLowStock(lowStockItems);
      })
      .catch(err => console.error("Error fetching dashboard data", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard Overview</h2>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <h3>Total Products</h3>
          <div className="value">{stats.products}</div>
        </div>
        <div className="glass-card stat-card">
          <h3>Total Customers</h3>
          <div className="value">{stats.customers}</div>
        </div>
        <div className="glass-card stat-card">
          <h3>Total Orders</h3>
          <div className="value">{stats.orders}</div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Low Stock Alert</h3>
        {lowStock.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity Left</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td><span className="badge badge-danger">{p.quantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No low stock items currently.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
