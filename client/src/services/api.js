import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5007/api';
const UPLOADS_URL = import.meta.env.VITE_BACKEND_URL ? 
  import.meta.env.VITE_BACKEND_URL.replace('/api', '/uploads') : 
  'http://localhost:5007/uploads';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  if (imagePath.startsWith('http')) return imagePath;
  return `${UPLOADS_URL}/${imagePath}`;
};

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
  deleteImage: (id, imageName) => api.delete(`/product/${id}/image`, { data: { imageName } }),
};

// Coupon APIs
export const couponAPI = {
  getAll: () => api.get('/coupon'),
  create: (data) => api.post('/coupon', data),
  update: (id, data) => api.put(`/coupon/${id}`, data),
  apply: (data) => api.post('/coupon/apply', data),
  validate: (data) => api.post('/coupon/validate', data),
  applyMultiple: (data) => api.post('/coupon/apply-multiple', data),
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
  checkout: (formData) => api.post('/order/checkout', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getOrders: () => api.get('/order'),
  getStats: () => api.get('/order/stats'),
  getAllOrders: () => api.get('/order/all'),
  updateStatus: (orderId, data) => api.put(`/order/status/${orderId}`, data),
  deleteReceipt: (orderId) => api.delete(`/order/receipt/${orderId}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/auth/users'),
  getAllOrders: () => api.get('/order/all'),
  updateOrderStatus: (orderId, data) => api.put(`/order/status/${orderId}`, data),
};

export default api;
