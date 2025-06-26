export const openRazorpayCheckout = (
  order,
  user,
  { onSuccess, onFailure }
) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'Your Store Name',
    description: 'Order Payment',
    order_id: order.id,
    handler: function (response) {
      onSuccess(response); // Call the passed onSuccess handler
    },
    prefill: {
      name: user?.name,
      email: user?.email,
      contact: user?.phone,
    },
    notes: order.notes,
    theme: { color: '#1890ff' },
  };
  console.log('Razorpay options:', options);
  if (!window.Razorpay) { 
    console.error('Razorpay is not available');
    return;
  }
  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    onFailure(response); // Call the passed onFailure handler
  });
  rzp.open();
};