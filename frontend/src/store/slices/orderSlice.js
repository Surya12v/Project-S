import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/constants';
import axios from 'axios';
import { getCsrfToken } from '../../utils/csrf';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/my-orders`, { withCredentials: true });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add placeOrder thunk with CSRF token
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderPayload, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/orders`,
        orderPayload,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Pay EMI installment thunk
export const payEmiInstallment = createAsyncThunk(
  'orders/payEmiInstallment',
  async ({ orderId, userId, installmentNumber, paymentDetails }, { rejectWithValue }) => {
    console.log("Paying EMI installment for order:", orderId, "installment:", installmentNumber);
    try {
      const csrfToken = await getCsrfToken();
      console.log("api", API_URL);
      console.log("Payment details:", paymentDetails);
      const response = await axios.post(
        `${API_URL}/api/orders/emi/pay`,
        { orderId, userId, installmentNumber, paymentDetails },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
    placing: false,
    placeOrderSuccess: false,
    emiPaymentLoading: false,
    emiPaymentSuccess: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.placing = true;
        state.placeOrderSuccess = false;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.placing = false;
        state.placeOrderSuccess = true;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = false;
        state.placeOrderSuccess = false;
        state.error = action.payload;
      })
      // Pay EMI installment
      .addCase(payEmiInstallment.pending, (state) => {
        state.emiPaymentLoading = true;
        state.emiPaymentSuccess = false;
        state.error = null;
      })
      .addCase(payEmiInstallment.fulfilled, (state) => {
        state.emiPaymentLoading = false;
        state.emiPaymentSuccess = true;
      })
      .addCase(payEmiInstallment.rejected, (state, action) => {
        state.emiPaymentLoading = false;
        state.emiPaymentSuccess = false;
        state.error = action.payload;
      });
  }
});

export default orderSlice.reducer;
