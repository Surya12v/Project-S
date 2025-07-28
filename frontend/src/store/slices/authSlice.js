import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/constants';
import axios from 'axios';
import { getCsrfToken } from '../../utils/csrf';

// Check authentication/session
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/auth/check-session`, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = response.data;
      if (!data.authenticated) throw new Error('Not authenticated');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      await axios.get(`${API_URL}/auth/logout`, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken }
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Login thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password, remember }, { rejectWithValue }) => {
    
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password, remember },
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken }
        }
      );
    
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Signup thunk
export const signupThunk = createAsyncThunk(
  'auth/signup',
  async ({ firstName, lastName, email, password }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { firstName, lastName, email, password },
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken }
        }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Forgot password thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        { email },
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/auth/reset-password/${token}`,
        { password },
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    forgotPasswordSuccess: false,
    resetPasswordSuccess: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.forgotPasswordSuccess = false;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.forgotPasswordSuccess = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.resetPasswordSuccess = false;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.resetPasswordSuccess = false;
        state.error = action.payload;
      });
  }
});

export default authSlice.reducer;

