import React, { useState, useEffect } from 'react';
import { 
  Card, List, Button, InputNumber, Typography, Space, 
  Empty, Modal, message, Divider 
} from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/constants';
import axios from 'axios';

const { Title, Text } = Typography;

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
      const data = response.data;
      setCart(data);
    } catch (error) {
      message.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put(`${API_URL}/api/cart/update`, { productId, quantity }, { withCredentials: true });
      fetchCart();
    } catch (error) {
      message.error('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${productId}`, { withCredentials: true });
      fetchCart();
      message.success('Item removed from cart');
    } catch (error) {
      message.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>Shopping Cart</Title>
      
      {cart.items.length === 0 ? (
        <Empty
          description="Your cart is empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </Empty>
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={cart.items}
            renderItem={item => (
              <Card style={{ marginBottom: 16 }}>
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(item.productId._id)}
                    >
                      Remove
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.productId.name}
                    description={item.productId.description}
                  />
                  <Space direction="vertical" align="end">
                    <Text strong>₹{item.productId.price}</Text>
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.productId._id, value)}
                    />
                    <Text type="secondary">
                      Subtotal: ₹{(item.productId.price * item.quantity).toFixed(2)}
                    </Text>
                  </Space>
                </List.Item>
              </Card>
            )}
          />

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="large" style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 18 }}>
                Total: ₹{calculateTotal().toFixed(2)}
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
        