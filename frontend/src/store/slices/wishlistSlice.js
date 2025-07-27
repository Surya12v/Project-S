import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/constants';
import axios from 'axios';
import { getCsrfToken } from '../../utils/csrf';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/wishlist`, { withCredentials: true });
      console.log(`Fetched wishlist from ${API_URL}/api/wishlist`, response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/wishlist/add`,
        { productId },
        { withCredentials: true, headers: { 'X-CSRF-Token': csrfToken } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      await axios.post(
        `${API_URL}/api/wishlist/remove`,
        { productId },
        { withCredentials: true, headers: { 'X-CSRF-Token': csrfToken } }
      );
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        // Optionally push only if not already present
        if (!state.items.find(item => item._id === action.payload._id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  }
});

export default wishlistSlice.reducer;
