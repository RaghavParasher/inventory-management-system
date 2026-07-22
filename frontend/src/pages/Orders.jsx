import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../api';
import { PlusIcon, TrashIcon, OrdersIcon, DollarSignIcon } from '../components/Icons';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    getOrders().then(setOrders).catch(console.error);
    getCustomers().then(setCustomers).catch(console.error);
    getProducts().then(setProducts).catch(console.error);
  };

  const handleOpenModal = () => {
    setError(null);
    setSelectedCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError("Please select a valid customer from the directory");
      return;
    }
    
    const validItems = orderItems
      .filter(item => item.product_id !== '' && parseInt(item.quantity) > 0)
      .map(item => ({ product_id: parseInt(item.product_id), quantity: parseInt(item.quantity) }));

    if (validItems.length === 0) {
      setError("Please add at least one valid product item to the order");
      return;
    }

    const data = {
      customer_id: parseInt(selectedCustomer),
      items: validItems
    };

    createOrder(data)
      .then(() => {
        setIsModalOpen(false);
        fetchData();
      })
      .catch(err => {
        setError(err.response?.data?.detail || "An error occurred while placing order");
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel and remove this order? Inventory will be restored automatically.")) {
      deleteOrder(id).then(fetchData).catch(err => console.error(err));
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Calculate live modal total
  const estimatedTotal = orderItems.reduce((sum, item) => {
    if (!item.product_id) return sum;
    const prod = products.find(p => p.id === parseInt(item.product_id));
    return sum + (prod ? prod.price * parseInt(item.quantity || 0) : 0);
  }, 0);

  const filteredOrders = orders.filter(o => {
    const cust = customers.find(c => c.id === o.customer_id);
    const custName = cust ? cust.full_name.toLowerCase() : '';
    return `order #${o.id}`.includes(searchQuery.toLowerCase()) || 
           `#${o.id}`.includes(searchQuery.toLowerCase()) ||
           custName.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h2>Order Fulfillment & Transactions</h2>
          <p className="page-subtitle">Track orders, calculate revenue, and manage automated stock deductions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <PlusIcon size={18} />
          <span>Create New Order</span>
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Filter Orders:</span>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by order ID (#1) or customer name..." 
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> transactions
          </span>
        </div>
      </div>

      <div className="glass-card table-container" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Information</th>
              <th>Total Valuation</th>
              <th>Order Date & Time</th>
              <th>Items Included</th>
              <th>Fulfillment Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => {
              const cust = customers.find(c => c.id === o.customer_id);
              return (
                <tr key={o.id}>
                  <td>
                    <span className="sku-chip" style={{ color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.3)' }}>
                      ORD-#{o.id}
                    </span>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="avatar-ring">{cust ? getInitials(cust.full_name) : '??'}</div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {cust ? cust.full_name : 'Customer Not Found'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '1.05rem', color: '#34d399' }}>
                    ${o.total_amount.toFixed(2)}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(o.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {o.items.length} Product {o.items.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      <span className="badge-dot"></span> Fulfilled
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button className="action-icon-btn danger" title="Cancel & Refund Order" onClick={() => handleDelete(o.id)}>
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="empty-state">
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No active orders found</p>
                    <p>Place your first order transaction to deduct inventory automatically.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Place New Order Transaction</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Customer Account</label>
                <select required className="form-control" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                  <option value="">-- Choose Registered Client --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginTop: '1.8rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>Order Line Items</label>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                    Live Valuation: ${estimatedTotal.toFixed(2)}
                  </span>
                </div>

                {orderItems.map((item, idx) => {
                  const selectedProd = products.find(p => p.id === parseInt(item.product_id));
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <select required className="form-control" style={{ flex: 3 }} value={item.product_id} onChange={e => handleItemChange(idx, 'product_id', e.target.value)}>
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                            {p.name} (${p.price.toFixed(2)}) • Stock: {p.quantity}
                          </option>
                        ))}
                      </select>
                      <input 
                        required 
                        type="number" 
                        min="1" 
                        max={selectedProd ? selectedProd.quantity : 999}
                        className="form-control" 
                        style={{ flex: 1, textAlign: 'center' }} 
                        placeholder="Qty"
                        value={item.quantity} 
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)} 
                      />
                      {orderItems.length > 1 && (
                        <button type="button" className="action-icon-btn danger" style={{ flexShrink: 0 }} onClick={() => handleRemoveItem(idx)}>
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
                <button type="button" className="btn" style={{ marginTop: '0.75rem', width: '100%', borderStyle: 'dashed' }} onClick={handleAddItem}>
                  <PlusIcon size={16} />
                  <span>Add Another Line Item</span>
                </button>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <DollarSignIcon size={18} />
                  <span>Confirm & Place Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
