import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/constants';
import axios from 'axios';
import { getCsrfToken } from '../../utils/csrf';


export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken(); // <-- Await the promise
      console.log(`Using CSRF token: ${csrfToken}`);
      const response = await axios.get(`${API_URL}/api/cart`, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken }, // <-- Use correct header name
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken(); // <-- Await the promise
      console.log('csrfToken:', csrfToken);
      const response = await axios.post(
        `${API_URL}/api/cart/add`,
        { productId, quantity },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken, // <-- Use correct header name
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      await axios.delete(`${API_URL}/api/cart/${productId}`, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken }
      });
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.productId._id !== action.payload);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
