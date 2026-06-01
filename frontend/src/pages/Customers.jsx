import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone_number: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    getCustomers().then(setCustomers).catch(err => console.error(err));
  };

  const handleOpenModal = () => {
    setError(null);
    setFormData({ full_name: '', email: '', phone_number: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createCustomer(formData)
      .then(() => {
        setIsModalOpen(false);
        fetchCustomers();
      })
      .catch(err => {
        setError(err.response?.data?.detail || "An error occurred");
      });
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id).then(fetchCustomers).catch(err => console.error(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Customers Management</h2>
        <button className="btn btn-primary" onClick={handleOpenModal}>+ Add Customer</button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.full_name}</td>
                <td>{c.email}</td>
                <td>{c.phone_number || '-'}</td>
                <td>
                  <button className="btn btn-danger" style={{padding: '0.3rem 0.6rem'}} onClick={() => handleDelete(c.id)}>Delete</button>
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
              <h3 className="modal-title">New Customer</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input required type="text" className="form-control" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input required type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Number (optional)</label>
                <input type="text" className="form-control" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
