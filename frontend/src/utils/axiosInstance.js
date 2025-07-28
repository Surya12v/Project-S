// utils/axiosInstance.js
import axios from 'axios';
import { API_URL } from '../config/constants';
import { getCsrfToken } from '../utils/csrf';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add interceptor to auto-fetch CSRF
axiosInstance.interceptors.request.use(async (config) => {
  const csrfToken = await getCsrfToken();
  config.headers['X-CSRF-Token'] = csrfToken;
  return config;
});

export default axiosInstance;
