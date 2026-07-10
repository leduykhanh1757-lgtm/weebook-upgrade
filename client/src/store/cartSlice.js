import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { getState }) => {
  if (getState().auth.isAuthenticated) {
    const data = await cartAPI.getCart();
    return data.items || [];
  }
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  return localCart;
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ bookId, quantity, book }, { getState }) => {
  if (getState().auth.isAuthenticated) {
    await cartAPI.addToCart(bookId, quantity);
    const data = await cartAPI.getCart();
    return data.items || [];
  }
  
  // Local cart fallback
  let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = localCart.find(item => item.book_id === bookId || item.id === bookId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    localCart.push({ 
      id: bookId, 
      book_id: bookId, 
      quantity, 
      title: book?.title, 
      price: book?.price, 
      images: book?.images 
    });
  }
  localStorage.setItem('cart', JSON.stringify(localCart));
  return localCart;
});

export const updateCartQuantity = createAsyncThunk('cart/updateQuantity', async ({ bookId, quantity }, { getState }) => {
  if (getState().auth.isAuthenticated) {
    await cartAPI.updateQuantity(bookId, quantity);
    const data = await cartAPI.getCart();
    return data.items || [];
  }
  
  let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = localCart.find(item => item.book_id === bookId || item.id === bookId);
  if (existing) {
    existing.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(localCart));
  }
  return localCart;
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (bookId, { getState }) => {
  if (getState().auth.isAuthenticated) {
    await cartAPI.removeFromCart(bookId);
    const data = await cartAPI.getCart();
    return data.items || [];
  }
  
  let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  localCart = localCart.filter(item => String(item.book_id) !== String(bookId) && String(item.id) !== String(bookId));
  localStorage.setItem('cart', JSON.stringify(localCart));
  return localCart;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
