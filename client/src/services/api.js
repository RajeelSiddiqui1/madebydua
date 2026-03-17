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
  create: (formData) => api.post('/category', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/category/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/category/${id}`),
};

// Product APIs
export const productAPI = {
  getAll: () => api.get('/product'),
  getById: (id) => api.get(`/product/${id}`),
  getFeatured: () => api.get('/product/featured'),
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

// Wishlist APIs
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/add/${productId}`),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
};

// Rating APIs
export const ratingAPI = {
  getProductRatings: (productId) => api.get(`/rating/${productId}`),
  rateProduct: (productId, data) => api.post(`/rating/${productId}`, data),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  updateCartItem: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
};

// Order APIs
export const orderAPI = {
  checkout: (shippingAddress) => api.post('/order/checkout', { shippingAddress }),
  getOrders: () => api.get('/order'),
  getAllOrders: () => api.get('/order/all'),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/auth/users'),
  getAllOrders: () => api.get('/order/all'),
  updateOrderStatus: (orderId, status) => api.put(`/order/status/${orderId}`, { status }),
};

export default api;
