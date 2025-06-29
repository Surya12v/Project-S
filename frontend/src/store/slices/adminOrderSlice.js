import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/constants';
import axios from 'axios';
import { getCsrfToken } from '../../utils/csrf';

// Fetch all orders (admin)
export const fetchAllOrders = createAsyncThunk(
  'adminOrders/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/all`, { withCredentials: true });
    //   console.log(`Fetched orders from ${API_URL}/api/orders/admin/all`, response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  'adminOrders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/orders/admin/${orderId}/status`,
        { status },
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

// Delete order (admin)
export const deleteOrder = createAsyncThunk(
  'adminOrders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      await axios.delete(`${API_URL}/api/orders/admin/${orderId}`, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken }
      });
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get single order details (admin)
export const fetchOrderDetails = createAsyncThunk(
  'adminOrders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/${orderId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const adminOrderSlice = createSlice({
  name: 'adminOrders',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedOrder: null,
    updating: false,
    deleting: false,
    orderDetails: null,
    detailsLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        // Update the order in items
        const idx = state.items.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter(o => o._id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      });
  }
});

export default adminOrderSlice.reducer;
