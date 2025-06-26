import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export const productService = {
  getAllProducts: async () => {
    const { data } = await axios.get(`${API_URL}/api/products`);
    return data;
  },

  getProduct: async (id) => {
    const { data } = await axios.get(`${API_URL}/api/products/${id}`);
    return data;
  },

  createProduct: async (product) => {
    const { data } = await axios.post(`${API_URL}/api/admin/products`, product, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    return data;
  },

  updateProduct: async (id, product) => {
    const { data } = await axios.put(`${API_URL}/api/admin/products/${id}`, product, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await axios.delete(`${API_URL}/api/admin/products/${id}`, {
      withCredentials: true
    });
    return data;
  }
};

export const orderService = {
  // Similar methods for orders
};
