import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import { PlusIcon, EditIcon, TrashIcon, ProductsIcon } from '../components/Icons';

function Products() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    getProducts().then(setProducts).catch(err => console.error(err));
  };

  const handleOpenModal = (product = null) => {
    setError(null);
    if (product) {
      setEditId(product.id);
      setFormData({ name: product.name, sku: product.sku, price: product.price, quantity: product.quantity });
    } else {
      setEditId(null);
      setFormData({ name: '', sku: '', price: '', quantity: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    };

    const action = editId ? updateProduct(editId, data) : createProduct(data);
    action
      .then(() => {
        setIsModalOpen(false);
        fetchProducts();
      })
      .catch(err => {
        setError(err.response?.data?.detail || "An error occurred");
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product catalog item?")) {
      deleteProduct(id).then(fetchProducts).catch(err => console.error(err));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h2>Product Inventory Catalog</h2>
          <p className="page-subtitle">Manage SKU listings, unit pricing, and real-time stock thresholds.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <PlusIcon size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Filter Catalog:</span>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search products by name or exact SKU..." 
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> items
          </span>
        </div>
      </div>

      <div className="glass-card table-container" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU Identifier</th>
              <th>Unit Price</th>
              <th>Available Inventory</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const isLow = p.quantity < 10;
              const isOut = p.quantity === 0;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="stat-icon-wrapper icon-purple" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                        <ProductsIcon size={18} />
                      </div>
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="sku-chip">{p.sku}</span></td>
                  <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  <td>
                    {isOut ? (
                      <span className="badge badge-danger">
                        <span className="badge-dot"></span> Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="badge badge-warning">
                        <span className="badge-dot"></span> {p.quantity} Units (Low)
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        <span className="badge-dot"></span> {p.quantity} in Stock
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button className="action-icon-btn" title="Edit Product" onClick={() => handleOpenModal(p)}>
                        <EditIcon size={16} />
                      </button>
                      <button className="action-icon-btn danger" title="Delete Product" onClick={() => handleDelete(p.id)}>
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="empty-state">
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No matching products found</p>
                    <p>Try refining your search query or add a new item to the catalog.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Product Item' : 'Create Product Listing'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input required type="text" className="form-control" placeholder="e.g. Wireless Mechanical Keyboard" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SKU Identifier</label>
                <input required type="text" className="form-control" placeholder="e.g. SKU-KB-104" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Unit Price ($)</label>
                  <input required type="number" step="0.01" min="0" className="form-control" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Initial Quantity</label>
                  <input required type="number" min="0" className="form-control" placeholder="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Modifications' : 'Register Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
