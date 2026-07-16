import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect if not already on the auth page, to allow auth errors to be handled normally
      if (!window.location.pathname.includes('/auth')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

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
  resetPassword: async (email, code, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { email, code, newPassword });
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
    const response = await apiClient.put(`/cart/${bookId}`, { quantity });
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
  getOrderDetails: async (id) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data.users;
  },
  getUserDetails: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },
  updateUserStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },
  getCoupons: async () => {
    const response = await apiClient.get('/admin/coupons');
    return response.data.coupons;
  },
  createCoupon: async (data) => {
    const response = await apiClient.post('/admin/coupons', data);
    return response.data;
  },
  updateCoupon: async (id, data) => {
    const response = await apiClient.put(`/admin/coupons/${id}`, data);
    return response.data;
  },
  updateCouponStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/coupons/${id}/status`, { status });
    return response.data;
  },
  deleteCoupon: async (id) => {
    const response = await apiClient.delete(`/admin/coupons/${id}`);
    return response.data;
  },
  getBanners: async () => {
    const response = await apiClient.get('/admin/banners');
    return response.data.banners;
  },
  createBanner: async (data) => {
    const response = await apiClient.post('/admin/banners', data);
    return response.data;
  },
  updateBannerStatus: async (id, is_active) => {
    const response = await apiClient.put(`/admin/banners/${id}/status`, { is_active });
    return response.data;
  },
  deleteBanner: async (id) => {
    const response = await apiClient.delete(`/admin/banners/${id}`);
    return response.data;
  },

  // Settings endpoints
  getSettings: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },
  updateSettings: async (settingsData) => {
    const response = await apiClient.put('/admin/settings', settingsData);
    return response.data;
  },

  // Staff endpoints
  getStaff: async () => {
    const response = await apiClient.get('/admin/staff');
    return response.data;
  },
  addStaff: async (staffData) => {
    const response = await apiClient.post('/admin/staff', staffData);
    return response.data;
  },
  updateStaff: async (id, staffData) => {
    const response = await apiClient.put(`/admin/staff/${id}`, staffData);
    return response.data;
  },
  deleteStaff: async (id) => {
    const response = await apiClient.delete(`/admin/staff/${id}`);
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

export const marketingAPI = {
  getBanners: async () => {
    const response = await apiClient.get('/marketing/banners');
    return response.data.banners;
  },
  getActiveCoupons: async (email) => {
    const response = await apiClient.get('/marketing/coupons', { params: { email } });
    return response.data.coupons;
  },
  validateCoupon: async (code, subtotal, email) => {
    const response = await apiClient.post('/marketing/coupon/validate', { code, subtotal, email });
    return response.data;
  },
  subscribeNewsletter: async (email) => {
    const response = await apiClient.post('/marketing/subscribe', { email });
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
