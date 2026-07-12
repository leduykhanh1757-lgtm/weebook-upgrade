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
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  getAddresses: async () => {
    const response = await apiClient.get('/auth/addresses');
    return response.data.addresses;
  },
  addAddress: async (addressData) => {
    const response = await apiClient.post('/auth/addresses', addressData);
    return response.data;
  },
  updateAddress: async (id, addressData) => {
    const response = await apiClient.put(`/auth/addresses/${id}`, addressData);
    return response.data;
  },
  deleteAddress: async (id) => {
    const response = await apiClient.delete(`/auth/addresses/${id}`);
    return response.data;
  },
};

export const usersAPI = {
  getUserProfile: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }
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
  getReviews: async (bookId) => {
    const response = await apiClient.get(`/books/${bookId}/reviews`);
    return response.data;
  },
  addReview: async (bookId, reviewData) => {
    const response = await apiClient.post(`/books/${bookId}/reviews`, reviewData);
    return response.data;
  }
};

export const cartAPI = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },
  addToCart: async (bookId, quantity = 1) => {
    const response = await apiClient.post('/cart', { bookId, quantity });
    return response.data;
  },
  updateQuantity: async (bookId, quantity) => {
    const response = await apiClient.put('/cart', { bookId, quantity });
    return response.data;
  },
  removeFromCart: async (bookId) => {
    const response = await apiClient.delete(`/cart/${bookId}`);
    return response.data;
  }
};

export const adminAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
  getBooks: async () => {
    const response = await apiClient.get('/admin/books');
    return response.data.books;
  },
  addBook: async (bookData) => {
    const response = await apiClient.post('/admin/books', bookData);
    return response.data;
  },
  updateBook: async (id, bookData) => {
    const response = await apiClient.put(`/admin/books/${id}`, bookData);
    return response.data;
  },
  getOrders: async () => {
    const response = await apiClient.get('/admin/orders');
    return response.data.orders;
  },
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  getCategories: async () => {
    const response = await apiClient.get('/admin/categories');
    return response.data.categories;
  },
  addCategory: async (data) => {
    const response = await apiClient.post('/admin/categories', data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },
  getAuthors: async () => {
    const response = await apiClient.get('/admin/authors');
    return response.data.authors;
  },
  addAuthor: async (data) => {
    const response = await apiClient.post('/admin/authors', data);
    return response.data;
  },
  getPublishers: async () => {
    const response = await apiClient.get('/admin/publishers');
    return response.data.publishers;
  },
  addPublisher: async (data) => {
    const response = await apiClient.post('/admin/publishers', data);
    return response.data;
  },
  getReviews: async () => {
    const response = await apiClient.get('/admin/reviews');
    return response.data.reviews;
  },
  updateReviewStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/reviews/${id}/status`, { status });
    return response.data;
  }
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
  cancelOrder: async (orderId) => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export const wishlistAPI = {
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },
  addToWishlist: async (bookId) => {
    const response = await apiClient.post(`/wishlist/${bookId}`);
    return response.data;
  },
  removeFromWishlist: async (bookId) => {
    const response = await apiClient.delete(`/wishlist/${bookId}`);
    return response.data;
  },
};
