import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Steps, Card, Radio, Space, 
  Typography, Divider, message, List
} from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { createRazorpayOrder } from '../../services/payment';
const { Title, Text } = Typography;
const { Step } = Steps;

const Checkout = () => {
  const [current, setCurrent] = useState(0);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
      setCart(response.data);
    } catch (error) {
      message.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.items.reduce(
      (total, item) => total + item.quantity * item.productId.price, 0
    );
  };

  const handleAddressSubmit = (values) => {
    setOrderDetails(prev => ({ ...prev, shippingAddress: values }));
    setCurrent(1);
  };

  const handlePaymentSubmit = (values) => {
    setOrderDetails(prev => ({ ...prev, paymentMode: values.paymentMode }));
    setCurrent(2);
  };

  const placeOrder = async () => {
    const transactionId = `trn-${Date.now()}`;
    const amount = calculateTotal();
    const shippingAddress = orderDetails.shippingAddress;

    const orderPayload = {
      amount,
      notes: {
        transaction_id: transactionId,
        name: shippingAddress?.fullName,
        address: shippingAddress?.address,
        phone: shippingAddress?.phone
      }
    };

    if (orderDetails.paymentMode === 'ONLINE') {
    try {
      const razorpayOrder = await createRazorpayOrder(amount, orderPayload.notes);

      openRazorpayCheckout(
        razorpayOrder,
        {
          name: shippingAddress?.fullName,
          email: 'test@gmail.com',
          phone: shippingAddress?.phone
        },
        {
          onSuccess: async (response) => {
            try {
              const finalOrder = {
                shippingAddress,
                paymentMode: 'ONLINE',
                items: cart.items.map(item => ({
                  productId: item.productId._id,
                  quantity: item.quantity,
                  price: item.productId.price
                })),
                totalAmount: amount,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                transactionId
              };

              const finalRes = await axios.post(`${API_URL}/api/orders`, finalOrder, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
              });

              if (finalRes.status === 201 || finalRes.status === 200) {
                message.success('Order placed successfully!');
                navigate('/orders');
              } else {
                throw new Error('Failed to confirm order');
              }
            } catch (err) {
              message.error('Failed to place order');
            }
          },
          onFailure: (err) => {
            message.error('Payment failed or cancelled');
          }
        }
      );
    } catch (err) {
      message.error('Failed to initiate payment');
    }
  }else {
      // COD Flow
      try {
        const codOrder = {
          shippingAddress,
          paymentMode: 'COD',
          items: cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price
          })),
          totalAmount: amount
        };

        const response = await axios.post(`${API_URL}/api/orders`, codOrder, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 201 || response.status === 200) {
          message.success('Order placed successfully!');
          navigate('/orders');
        } else {
          throw new Error('COD order failed');
        }
      } catch (error) {
        message.error('COD Order failed');
      }
    }
  };

  const steps = [
    {
      title: 'Shipping',
      content: (
        <Form layout="vertical" onFinish={handleAddressSubmit}>
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Delivery Address"
            rules={[{ required: true, message: 'Please enter your address' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Continue to Payment
          </Button>
        </Form>
      )
    },
    {
      title: 'Payment',
      content: (
        <Form layout="vertical" onFinish={handlePaymentSubmit}>
          <Form.Item
            name="paymentMode"
            label="Select Payment Method"
            rules={[{ required: true, message: 'Please select a payment method' }]}
          >
            <Radio.Group size="large">
              <Space direction="vertical">
                <Radio value="COD">Cash on Delivery</Radio>
                <Radio value="ONLINE">Online Payment</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Review Order
          </Button>
        </Form>
      )
    },
    {
      title: 'Review',
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card title="Order Summary">
            <List
              dataSource={cart.items}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.productId.name}
                    description={`Quantity: ${item.quantity}`}
                  />
                  <Text>₹{item.productId.price * item.quantity}</Text>
                </List.Item>
              )}
            />
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Title level={4}>Total: ₹{calculateTotal()}</Title>
            </div>
          </Card>

          <Card title="Delivery Details">
            <p><strong>Name:</strong> {orderDetails.shippingAddress?.fullName}</p>
            <p><strong>Address:</strong> {orderDetails.shippingAddress?.address}</p>
            <p><strong>Phone:</strong> {orderDetails.shippingAddress?.phone}</p>
            <p><strong>Payment:</strong> {orderDetails.paymentMode}</p>
          </Card>

          <Button type="primary" onClick={placeOrder} size="large" block>
            Place Order
          </Button>
        </Space>
      )
    }
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Steps current={current} style={{ marginBottom: 24 }}>
        {steps.map(item => <Step key={item.title} title={item.title} />)}
      </Steps>
      <Card>{steps[current].content}</Card>
    </div>
  );
};

export default Checkout;
