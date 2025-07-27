import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/constants";
import axios from "axios";
import { getCsrfToken } from "../../utils/csrf";

export const fetchAdminUsers = createAsyncThunk(
  "users/fetchAdminUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        withCredentials: true,
      });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const csrfToken = await getCsrfToken();
      const user = getState().users.items.find((u) => u._id === userId);
      if (!user) throw new Error("User not found");
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { isActive: !user.isActive },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );
      console.log("api path:", `${API_URL}/api/admin/users/${userId}/status`);
      console.log("Toggle user status response:", response.data);
      return { userId, isActive: response.data.isActive };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      console.log("Fetching user by ID:", userId);
      console.log("API URL:", `${API_URL}/api/admin/users/${userId}`);
      const response = await axios.get(`${API_URL}/api/admin/users/${userId}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      console.log("User details response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const fetchUserByIdAccount = createAsyncThunk(
  "users/fetchUserByIdAccount",
  async (userId, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      console.log("Fetching user by ID:", userId);
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      console.log("User details response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/role`,
        { role },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );
      return { userId, role: response.data.role };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { isActive },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );
      return { userId, isActive: response.data.isActive };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      // Fix: Use correct RESTful route (no /user/ in path)
      const response = await axios.put(
        `${API_URL}/api/users/${userId}`,
        userData,
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response.data:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const userSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedUser: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload;
        const user = state.items.find((u) => u._id === userId);
        if (user) user.isActive = isActive;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        // Flatten the structure for UI convenience
        if (action.payload && action.payload.user) {
          const { user, activity } = action.payload;
          state.selectedUser = {
            ...user,
            orders: activity?.orders || [],
            cart: activity?.cart?.items || [],
            wishlist: activity?.wishlist?.products || [],
            orderCount: activity?.stats?.orderCount || 0,
            cartCount: activity?.stats?.cartCount || 0,
            wishlistCount: activity?.stats?.wishlistCount || 0,
            totalSpent: activity?.stats?.totalSpent || 0,
          };
        } else {
          state.selectedUser = action.payload;
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedUser = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, role } = action.payload;
        const user = state.items.find((u) => u._id === userId);
        if (user) user.role = role;
        if (
          state.selectedUser &&
          state.selectedUser.user &&
          state.selectedUser.user._id === userId
        ) {
          state.selectedUser.user.role = role;
        }
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload;
        const user = state.items.find((u) => u._id === userId);
        if (user) user.isActive = isActive;
        if (
          state.selectedUser &&
          state.selectedUser.user &&
          state.selectedUser.user._id === userId
        ) {
          state.selectedUser.user.isActive = isActive;
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        // Update the user in items and selectedUser if present
        const updatedUser = action.payload;
        const idx = state.items.findIndex((u) => u._id === updatedUser._id);
        if (idx !== -1) state.items[idx] = updatedUser;
        if (state.selectedUser && state.selectedUser._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(fetchUserByIdAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserByIdAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserByIdAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedUser = null;
      });
  },
});

export default userSlice.reducer;
