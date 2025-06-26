import React from 'react';
import { openRazorpayCheckout } from '../utils/razorpay';

// Example Razorpay order response (replace with your actual response)
const exampleOrder = {
  id: "order_Ql5ZUGTfV3PReF",
  amount: 8999999,
  currency: "INR",
  notes: {
    transaction_id: "trn-1750780257152",
    name: "SURYA VELRAJ SURYA VELRAJ",
    phone: "09994615264",
    address: "3rd cross street, Tirumalai nagar\npn road"
  },
  status: "created"
};

// Example user object (replace with your actual user data)
const exampleUser = {
  name: "SURYA VELRAJ SURYA VELRAJ",
  email: "surya@example.com",
  phone: "09994615264"
};

export default function RazorpayTestButton() {
  const handlePayNow = () => {
    openRazorpayCheckout(exampleOrder, exampleUser);
  };

  return (
    <button onClick={handlePayNow}>
      Pay Now
    </button>
  );
}
