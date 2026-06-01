import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
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
      setError("Please select a customer");
      return;
    }
    
    // Filter out invalid items
    const validItems = orderItems
      .filter(item => item.product_id !== '' && parseInt(item.quantity) > 0)
      .map(item => ({ product_id: parseInt(item.product_id), quantity: parseInt(item.quantity) }));

    if (validItems.length === 0) {
      setError("Please add at least one valid product");
      return;
    }

    const data = {
      customer_id: parseInt(selectedCustomer),
      items: validItems
    };

    createOrder(data)
      .then(() => {
        setIsModalOpen(false);
        fetchData(); // refresh all to get updated inventory
      })
      .catch(err => {
        setError(err.response?.data?.detail || "An error occurred");
      });
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to cancel this order?")) {
      deleteOrder(id).then(fetchData).catch(err => console.error(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Orders Management</h2>
        <button className="btn btn-primary" onClick={handleOpenModal}>+ Create Order</button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Items count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const cust = customers.find(c => c.id === o.customer_id);
              return (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{cust ? cust.full_name : 'Unknown'}</td>
                  <td>${o.total_amount.toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td>{o.items.length}</td>
                  <td>
                    <button className="btn btn-danger" style={{padding: '0.3rem 0.6rem'}} onClick={() => handleDelete(o.id)}>Cancel</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3 className="modal-title">New Order</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Customer</label>
                <select required className="form-control" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{marginTop: '1.5rem', marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>Order Items</label>
                {orderItems.map((item, idx) => (
                  <div key={idx} style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                    <select required className="form-control" style={{flex: 2}} value={item.product_id} onChange={e => handleItemChange(idx, 'product_id', e.target.value)}>
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                          {p.name} (${p.price.toFixed(2)}) - Stock: {p.quantity}
                        </option>
                      ))}
                    </select>
                    <input required type="number" min="1" className="form-control" style={{flex: 1}} value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
                    {orderItems.length > 1 && (
                      <button type="button" className="btn btn-danger" onClick={() => handleRemoveItem(idx)}>X</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn" style={{marginTop: '0.5rem'}} onClick={handleAddItem}>+ Add Another Item</button>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
