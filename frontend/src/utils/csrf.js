import axios from "axios";
import { API_URL } from "../config/constants";

export const getCsrfToken = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/csrf-token`, {
      withCredentials: true,
    });

    const csrfToken = res.data.csrfToken;

    // ✅ Set it globally for all future axios requests
    axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;

    return csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw error;
  }
};
