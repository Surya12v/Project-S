import React, { useEffect, useState } from 'react';
import {
  Card, List, Button, InputNumber, Typography, Space,
  Empty, Divider, Modal, message, Tag, Input, Row, Col
} from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, HeartOutlined, GiftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  removeFromCart,
  clearCart,
  addToCart
} from '../../store/slices/cartSlice';
import { addToWishlist } from '../../store/slices/wishlistSlice';
import NavBar from '../../components/NavBar/NavBar';
import { calculateFinalPrice } from '../../utils/priceUtils';

const { Title, Text } = Typography;

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_CHARGE = 50;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems = [], loading = false } = useSelector(state => state.cart) || {};
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Update quantity handler
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await dispatch(addToCart({ productId, quantity })).unwrap();
      message.success('Quantity updated');
    } catch {
      message.error('Failed to update quantity');
    }
  };

  // Remove item handler
  const removeItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  // Move to wishlist handler
  const moveToWishlist = async (item) => {
    try {
      await dispatch(addToWishlist(item.productId._id)).unwrap();
      dispatch(removeFromCart(item.productId._id));
      message.success('Moved to wishlist');
    } catch {
      message.error('Failed to move to wishlist');
    }
  };

  // Clear cart handler
  const handleClearCart = () => {
    Modal.confirm({
      title: 'Clear Cart',
      content: 'Are you sure you want to remove all items from your cart?',
      okText: 'Clear',
      okType: 'danger',
      onOk: () => dispatch(clearCart())
    });
  };

  // Coupon apply handler (simulate backend validation)
  const handleApplyCoupon = async () => {
    setApplyingCoupon(true);
    setTimeout(() => {
      if (coupon === 'DISCOUNT10') {
        setAppliedCoupon({ code: 'DISCOUNT10', discount: 0.1 }); // 10% off
        message.success('Coupon applied!');
      } else {
        setAppliedCoupon(null);
        message.error('Invalid coupon code');
      }
      setApplyingCoupon(false);
    }, 800);
  };

  // Price calculations using priceUtils
  let subtotal = 0;
  cartItems.forEach(item => {
    const product = item.productId;
    if (!product || typeof product.price !== 'number') return;
    // Use util to get final price (handles tax inclusive/exclusive)
    const { finalPrice } = calculateFinalPrice({
      price: product.price,
      taxClass: product.taxClass,
      taxRate: product.taxRate,
      isTaxInclusive: product.isTaxInclusive
    });
    subtotal += finalPrice * item.quantity;
  });

  // For display, show tax and shipping breakdown
  const tax = cartItems.reduce((total, item) => {
    const product = item.productId;
    if (!product || typeof product.price !== 'number') return total;
    const { finalPrice, priceAfterTax } = calculateFinalPrice({
      price: product.price,
      taxClass: product.taxClass,
      taxRate: product.taxRate,
      isTaxInclusive: product.isTaxInclusive
    });
    // Tax is difference between finalPrice and priceAfterTax, times quantity
    return total + ((finalPrice - priceAfterTax) * item.quantity);
  }, 0);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_CHARGE;
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const total = subtotal + shipping - discount;

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <NavBar />
      <ShoppingCartOutlined style={{ fontSize: 24, marginBottom: 16 }} />
      <Text strong style={{ fontSize: 24 }}>My Cart ({cartItems.length})</Text>
      
      {cartItems.length === 0 ? (
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
            dataSource={cartItems}
            renderItem={item => {
              const product = item.productId;
              const { finalPrice, priceAfterTax } = calculateFinalPrice({
                price: product?.price,
                taxClass: product?.taxClass,
                taxRate: product?.taxRate,
                isTaxInclusive: product?.isTaxInclusive
              });
              return (
                <Card style={{ marginBottom: 16 }}>
                  <List.Item
                    actions={[
                      <Button
                        icon={<HeartOutlined />}
                        onClick={() => moveToWishlist(item)}
                      >
                        Save for Later
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(product._id)}
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <img
                          src={product?.images?.[0] || "https://via.placeholder.com/50"}
                          alt={product?.name || "Product"}
                          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                        />
                      }
                      title={
                        <Space direction="vertical" size={0}>
                          <span style={{ fontWeight: 600 }}>{product?.name}</span>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            SKU: {product?.sku}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Brand: {product?.brand}
                          </Text>
                        </Space>
                      }
                      description={
                        <>
                          <div style={{ fontSize: 13 }}>{product?.description}</div>
                          {product?.color && <Tag color="default">Color: {product.color}</Tag>}
                          {product?.material && <Tag color="default">Material: {product.material}</Tag>}
                          {product?.specifications && product.specifications.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              {product.specifications.map(spec => (
                                <Tag key={spec.key} color="blue" style={{ marginBottom: 2 }}>
                                  {spec.key}: {spec.value}
                                </Tag>
                              ))}
                            </div>
                          )}
                          {product?.keyFeatures && product.keyFeatures.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              {product.keyFeatures.map((feature, idx) => (
                                <Tag key={idx} color="success" style={{ marginBottom: 2 }}>
                                  {feature}
                                </Tag>
                              ))}
                            </div>
                          )}
                        </>
                      }
                    />
                    <Space direction="vertical" align="end">
                      <Space>
                        <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                          ₹{finalPrice?.toLocaleString()}
                        </Text>
                        {product?.originalPrice && product.originalPrice > product.price && (
                          <Text delete type="secondary" style={{ fontSize: 13 }}>
                            ₹{product.originalPrice.toLocaleString()}
                          </Text>
                        )}
                        {product?.originalPrice && product.originalPrice > product.price && (
                          <Tag color="red" style={{ marginLeft: 4 }}>
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </Tag>
                        )}
                      </Space>
                      <InputNumber
                        min={1}
                        max={product?.maxOrderQuantity || product?.stockQuantity}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(product._id, value)}
                        style={{ width: 80 }}
                      />
                      <Text type="secondary">
                        Subtotal: ₹{(finalPrice * item.quantity).toFixed(2)}
                      </Text>
                      <Text type={product?.stockQuantity > 0 ? "success" : "danger"}>
                        {product?.stockQuantity > 0
                          ? `In Stock (${product.stockQuantity})`
                          : "Out of Stock"}
                      </Text>
                    </Space>
                  </List.Item>
                </Card>
              );
            }}
          />

          <Divider />

          {/* Coupon / Promo Code */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                disabled={!!appliedCoupon}
                prefix={<GiftOutlined />}
              />
            </Col>
            <Col>
              <Button
                type="primary"
                loading={applyingCoupon}
                disabled={!!appliedCoupon}
                onClick={handleApplyCoupon}
              >
                Apply Coupon
              </Button>
              {appliedCoupon && (
                <Button
                  style={{ marginLeft: 8 }}
                  icon={<ReloadOutlined />}
                  onClick={() => { setAppliedCoupon(null); setCoupon(''); }}
                >
                  Remove Coupon
                </Button>
              )}
            </Col>
          </Row>

          {/* Cart Totals */}
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row>
                <Col flex="auto"><Text>Subtotal</Text></Col>
                <Col><Text>₹{subtotal.toFixed(2)}</Text></Col>
              </Row>
              <Row>
                <Col flex="auto"><Text>Tax (included/excluded)</Text></Col>
                <Col><Text>₹{tax.toFixed(2)}</Text></Col>
              </Row>
              <Row>
                <Col flex="auto">
                  <Text>Shipping</Text>
                  {shipping === 0 && subtotal > 0 && (
                    <Tag color="green" style={{ marginLeft: 8 }}>Free</Tag>
                  )}
                </Col>
                <Col><Text>₹{shipping.toFixed(2)}</Text></Col>
              </Row>
              {appliedCoupon && (
                <Row>
                  <Col flex="auto"><Text type="success">Discount ({appliedCoupon.code})</Text></Col>
                  <Col><Text type="success">-₹{discount.toFixed(2)}</Text></Col>
                </Row>
              )}
              <Divider />
              <Row>
                <Col flex="auto"><Text strong>Total</Text></Col>
                <Col><Text strong style={{ fontSize: 18 }}>₹{total.toFixed(2)}</Text></Col>
              </Row>
            </Space>
          </Card>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space direction="vertical" size="large">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/checkout')}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
              <Button
                type="default"
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
              >
                Clear Cart
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

