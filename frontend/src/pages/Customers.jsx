import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';
import { PlusIcon, TrashIcon, CustomersIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

function Customers() {
  const { isAdmin, isWarehouse, setIsLoginModalOpen } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (isWarehouse && !isAdmin) {
      alert("Executive Admin authorization required to register client accounts. Please switch to Admin role.");
      setIsLoginModalOpen(true);
      return;
    }
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
    if (!isAdmin) {
      alert("Executive Admin authorization required to delete customer profiles.");
      setIsLoginModalOpen(true);
      return;
    }
    if (window.confirm("Are you sure you want to delete this customer record?")) {
      deleteCustomer(id).then(fetchCustomers).catch(err => {
        alert(err.response?.data?.detail || "Permission denied deleting customer.");
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const maskEmail = (email) => {
    if (!email || isAdmin) return email;
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    return `${parts[0].substring(0, 2)}••••@${parts[1]}`;
  };

  const maskPhone = (phone) => {
    if (!phone || isAdmin) return phone;
    return `+1 (•••) •••-${phone.slice(-4)}`;
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h2>Customer Directory {isWarehouse && <span className="badge badge-warning" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>🔒 PII Masked</span>}</h2>
          <p className="page-subtitle">Maintain client records, email registries, and contact details.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleOpenModal}
          style={isWarehouse && !isAdmin ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' } : {}}
        >
          <PlusIcon size={18} />
          <span>{isWarehouse && !isAdmin ? "Add Customer (🔒 Admin)" : "Add Customer"}</span>
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Search Directory:</span>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by full name or email address..." 
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> clients
          </span>
        </div>
      </div>

      <div className="glass-card table-container" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Client Profile</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Account Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="user-info">
                    <div className="avatar-ring">{getInitials(c.full_name)}</div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.full_name}</span>
                  </div>
                </td>
                <td>
                  <span style={{ color: '#a5b4fc' }}>{maskEmail(c.email)}</span>
                </td>
                <td>{c.phone_number ? maskPhone(c.phone_number) : <span style={{ color: 'var(--text-tertiary)' }}>Not provided</span>}</td>
                <td>
                  <span className="badge badge-success">
                    <span className="badge-dot"></span> Verified
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                    <button 
                      className="action-icon-btn danger" 
                      title={isAdmin ? "Delete Customer" : "🔒 Executive Admin Required to Delete"}
                      style={!isAdmin ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                      onClick={() => handleDelete(c.id)}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="empty-state">
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No customer profiles found</p>
                    <p>Register a new customer or adjust your directory search query.</p>
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
              <h3 className="modal-title">Register New Client</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Legal Name</label>
                <input required type="text" className="form-control" placeholder="e.g. Jane Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email Address (Must be unique)</label>
                <input required type="email" className="form-control" placeholder="e.g. jane.doe@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Contact (Optional)</label>
                <input type="text" className="form-control" placeholder="e.g. +1 (555) 019-2831" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
