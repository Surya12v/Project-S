import axios from 'axios';
import { API_URL } from '../config/constants';
import { getCsrfToken } from '../utils/csrf';

export const createRazorpayOrder = async (amount, notes = {}) => {
  const amountInPaise = Math.round(Number(amount) * 100);
  const csrfToken = await getCsrfToken();
  const response = await axios.post(
    `${API_URL}/api/payment/create-order`,
    { amount: amountInPaise, notes },
    {
      withCredentials: true,
      headers: {
        'X-CSRF-Token': csrfToken
      }
    }
  );
  console.log('Razorpay order created:', response.data);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  return response.data.order;
};