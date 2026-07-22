import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Automatically inject JWT bearer token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const triggerSeed = () => api.post('/seed').then(res => res.data);
export const resetDemoUsers = () => api.post('/auth/reset_demo').then(res => res.data);

export const getProducts = () => api.get('/products').then(res => res.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(res => res.data);
export const createProduct = (data) => api.post('/products', data).then(res => res.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then(res => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(res => res.data);

export const getCustomers = () => api.get('/customers').then(res => res.data);
export const getCustomer = (id) => api.get(`/customers/${id}`).then(res => res.data);
export const createCustomer = (data) => api.post('/customers', data).then(res => res.data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`).then(res => res.data);

export const getOrders = () => api.get('/orders').then(res => res.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then(res => res.data);
export const createOrder = (data) => api.post('/orders', data).then(res => res.data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`).then(res => res.data);

export default api;
