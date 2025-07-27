import axios from 'axios';
import { API_URL } from '../config/constants';

export const getCsrfToken = async () => {
  const res = await axios.get(`${API_URL}/api/csrf-token`, { withCredentials: true });
  return res.data.csrfToken;
};
