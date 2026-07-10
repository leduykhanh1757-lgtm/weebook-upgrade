import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, phone, password) => {
    const response = await apiClient.post('/auth/register', { name, email, phone, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },
};

export const booksAPI = {
  getBooks: async (params) => {
    const response = await apiClient.get('/books', { params });
    return response.data;
  },
  getBookById: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await apiClient.get('/books/categories');
    return response.data;
  },
};

export const cartAPI = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },
  addToCart: async (bookId, quantity) => {
    const response = await apiClient.post('/cart', { bookId, quantity });
    return response.data;
  },
  updateQuantity: async (bookId, quantity) => {
    const response = await apiClient.put(`/cart/${bookId}`, { quantity });
    return response.data;
  },
  removeFromCart: async (bookId) => {
    const response = await apiClient.delete(`/cart/${bookId}`);
    return response.data;
  },
};

export const ordersAPI = {
  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },
};

export const wishlistAPI = {
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },
  addToWishlist: async (bookId) => {
    const response = await apiClient.post('/wishlist', { bookId });
    return response.data;
  },
  removeFromWishlist: async (bookId) => {
    const response = await apiClient.delete(`/wishlist/${bookId}`);
    return response.data;
  },
};
