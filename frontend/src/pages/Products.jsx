import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

function Products() {
  const [products, setProducts] = useState([]);
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
    if(window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id).then(fetchProducts).catch(err => console.error(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Products Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add Product</button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>
                  <span className={p.quantity < 10 ? "badge badge-danger" : "badge badge-success"}>
                    {p.quantity}
                  </span>
                </td>
                <td>
                  <button className="btn" style={{marginRight: '0.5rem', padding: '0.3rem 0.6rem'}} onClick={() => handleOpenModal(p)}>Edit</button>
                  <button className="btn btn-danger" style={{padding: '0.3rem 0.6rem'}} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Product' : 'New Product'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input required type="text" className="form-control" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input required type="number" step="0.01" min="0" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input required type="number" min="0" className="form-control" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
