import React, { useState, useEffect } from 'react';
import { Card, List, Button, Empty, message, Space, Typography } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { API_URL } from '../../config/constants';
import axios from 'axios';

const { Title } = Typography;

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wishlist`, { withCredentials: true });
      const data = response.data;
      setWishlistItems(data);
    } catch (error) {
      message.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>My Wishlist ({wishlistItems.length})</Title>
        {wishlistItems.length === 0 ? (
          <Empty description="Your wishlist is empty" />
        ) : (
          <List
            loading={loading}
            dataSource={wishlistItems}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button icon={<ShoppingCartOutlined />}>Add to Cart</Button>,
                  <Button icon={<DeleteOutlined />} danger>Remove</Button>
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={item.description}
                />
                <div>₹{item.price.toLocaleString()}</div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Wishlist;

