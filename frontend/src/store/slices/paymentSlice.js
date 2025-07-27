import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/constants';
import axios from 'axios';

export const fetchPaymentsByOrder = createAsyncThunk(
  'payments/fetchByOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/payment/order/${orderId}`, { withCredentials: true });
      return Array.isArray(res.data) ? res.data : [res.data];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPaymentsByOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentsByOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPaymentsByOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default paymentSlice.reducer;
