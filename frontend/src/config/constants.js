export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const VITE_URL= import.meta.env.VITE_URL || 'http://localhost:5173';
export const AUTH_ROUTES = {
  GOOGLE: `${API_URL}/auth/google`,
  CALLBACK: import.meta.env.VITE_AUTH_CALLBACK_URL,
  LOGOUT: `${API_URL}/auth/logout`
}

export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token'
};

export const AUTH_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending'
};

export const handleAuthResponse = (response) => {
  if (response?.user) {
    // Do NOT store user in localStorage for authentication
    return { status: AUTH_STATUS.SUCCESS, user: response.user };
  }
  return { status: AUTH_STATUS.ERROR, error: 'Authentication failed' };
};

export const logout = () => {
  window.location.href = AUTH_ROUTES.LOGOUT;
};

// No changes needed for redirect_uri_mismatch error.
