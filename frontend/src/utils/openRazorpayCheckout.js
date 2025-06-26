export const openRazorpayCheckout = (order, user, { onSuccess, onFailure } = {}) => {
  // Provide default no-op functions if not supplied
  const handleSuccess = typeof onSuccess === 'function' ? onSuccess : () => {};
  const handleFailure = typeof onFailure === 'function' ? onFailure : () => {};

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "Your Store",
    description: "Product Payment",
    order_id: order.id,
    prefill: {
      name: order.notes?.name || user?.name || '',
      email: user?.email || '',
      contact: order.notes?.phone || '',
    },
    notes: order.notes,
    handler: function (response) {
      handleSuccess(response);
    },
    theme: {
      color: "#0d6efd",
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (response) => {
    handleFailure(response.error);
  });

  rzp.open();
};
