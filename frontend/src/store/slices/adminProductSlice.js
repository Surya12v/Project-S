import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/constants";
import axios from "axios";
import { getCsrfToken } from "../../utils/csrf";

export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log(`Fetching admin products from ${API_URL}/api/admin/products`);
      const response = await axios.get(`${API_URL}/api/admin/products`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

export const addAdminProduct = createAsyncThunk(
  "adminProducts/add",
  async (product, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/admin/products`,
        product,
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add product");
    }
  }
);

export const updateAdminProduct = createAsyncThunk(
  "adminProducts/update",
  async ({ id, product }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/admin/products/${id}`,
        product,
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update product");
    }
  }
);

export const deleteAdminProduct = createAsyncThunk(
  "adminProducts/delete",
  async (id, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      await axios.delete(`${API_URL}/api/admin/products/${id}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete product");
    }
  }
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAdminProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export default adminProductSlice.reducer;
