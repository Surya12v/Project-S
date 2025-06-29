import React, { useEffect } from 'react';
import { Card, List, Button, Empty, message, Space, Typography } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import NavBar from '../../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistState = useSelector(state => state.wishlist) || {};
  const { items: wishlistItems = [], loading = false, error = null } = wishlistState;

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Add to cart handler
  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      message.success('Added to cart');
    } catch {
      message.error('Failed to add to cart');
    }
  };

  // Remove from wishlist handler
  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      message.success('Removed from wishlist');
    } catch {
      message.error('Failed to remove from wishlist');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <NavBar />
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
                  <Button icon={<ShoppingCartOutlined />} onClick={() => handleAddToCart(item._id)}>Add to Cart</Button>,
                  <Button icon={<DeleteOutlined />} danger onClick={() => handleRemove(item._id)}>Remove</Button>
                ]}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <List.Item.Meta
                  title={item.name}
                  description={item.description}
                />
                <div>₹{(item?.price ?? 0).toLocaleString()}</div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Wishlist;


