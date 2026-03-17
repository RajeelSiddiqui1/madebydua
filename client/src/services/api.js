import axios from 'axios';

const API_URL = 'http://localhost:5007/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/category'),
  create: (data) => api.post('/category', data),
  update: (id, data) => api.put(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
};

// Product APIs
export const productAPI = {
  getAll: () => api.get('/product'),
  create: (formData) => api.post('/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/product/${id}`),
};

// Coupon APIs
export const couponAPI = {
  getAll: () => api.get('/coupon'),
  create: (data) => api.post('/coupon', data),
  apply: (data) => api.post('/coupon/apply', data),
  delete: (id) => api.delete(`/coupon/${id}`),
};

export default api;
