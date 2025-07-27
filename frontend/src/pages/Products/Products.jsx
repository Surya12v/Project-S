import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Button, Space, Input, 
  Select, Badge, Rate, Modal, message, Drawer,
  InputNumber, Tag, Divider, Carousel, Image,
  Tabs, List, Collapse, Avatar, Progress,
  Tooltip, Breadcrumb, Affix
} from 'antd';
import { 
  ShoppingCartOutlined, FilterOutlined, 
  HeartOutlined, ShoppingOutlined, StarOutlined,
  EyeOutlined, ShareAltOutlined, SwapOutlined,
  TruckOutlined, SafetyCertificateOutlined,
  GiftOutlined, PercentageOutlined, ThunderboltOutlined,
  CheckCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/constants';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import NavBar from '../../components/NavBar/NavBar';
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Meta } = Card;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector(state => state.products);
  const { items: wishlist = [] } = useSelector(state => state.wishlist) || {};
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [compareList, setCompareList] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    sortBy: 'name',
    rating: 'all',
    discount: 'all'
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    dispatch(fetchProducts());
    dispatch(fetchWishlist());
    // eslint-disable-next-line
  }, [dispatch]);

  // Add to cart function
  const addToCartHandler = async (productId, quantity) => {
    try {
      console.log('Adding to cart:', productId, quantity);
      await dispatch(addToCart({ productId, quantity })).unwrap();
      console.log('Product added to cart successfully');
      message.success('Added to cart successfully');
      setDrawerVisible(false);
    } catch (error) {
      message.error('Failed to add to cart');
    }
  };

  // Add/remove from wishlist using redux slice
  const toggleWishlist = async (productId) => {
    try {
      if (wishlist.some(item => item._id === productId)) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        message.success('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        message.success('Added to wishlist');
      }
    } catch (error) {
      message.error('Failed to update wishlist');
    }
  };

  // Add to compare
  const toggleCompare = (productId) => {
    if (compareList.length >= 4 && !compareList.includes(productId)) {
      message.warning('You can compare maximum 4 products');
      return;
    }
    setCompareList(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const showProductDetails = (product) => {
    navigate(`/product/${product._id}`);
  };

  const goToCart = () => {
    navigate('/cart');
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, sellingPrice) => {
    return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
  };

  // Get delivery info
  const getDeliveryInfo = () => ({
    freeDelivery: true,
    deliveryBy: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    fastDelivery: true
  });

  // Container variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const handleBuyNow = async (product, qty = 1) => {
    try {
      await addToCart(product._id, qty);
      navigate('/checkout');
    } catch (error) {
      message.error('Failed to process order');
    }
  };

  const handleCardClick = (e, product) => {
    // Prevent click if clicking buttons
    if (e.target.tagName === 'BUTTON' || 
        e.target.closest('button') || 
        e.target.closest('.ant-btn')) {
      return;
    }
    navigate(`/product/${product._id}`);
  };

  const ProductCard = ({ product }) => {
    const deliveryInfo = getDeliveryInfo();
    const discount = product.originalPrice ? getDiscountPercentage(product.originalPrice, product.price) : 0;
    const isWishlisted = wishlist.some(item => item._id === product._id);
    const isInCompare = compareList.includes(product._id);

    return (
      <motion.div variants={itemVariants} data-aos="fade-up">
        <Card
          hoverable
          className="product-card"
          onClick={(e) => handleCardClick(e, product)}
          style={{ 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          cover={
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img 
                alt={product.name}
                src={product.images?.[0] || 'https://via.placeholder.com/300'}
                style={{ 
                  height: 250, 
                  width: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
              
              {/* Badges */}
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {discount > 0 && (
                  <Badge count={`${discount}% OFF`} style={{ backgroundColor: '#ff4d4f' }} />
                )}
                {product.isNew && (
                  <Badge count="NEW" style={{ backgroundColor: '#52c41a' }} />
                )}
                {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                  <Badge count="Low Stock" style={{ backgroundColor: '#fa8c16' }} />
                )}
              </div>

              {/* Action buttons */}
              <div style={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 4 
              }}>
                <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                  <Button
                    type="text"
                    icon={<HeartOutlined />}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: isWishlisted ? '#ff4d4f' : '#666'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product._id);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Quick View">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      showProductDetails(product);
                    }}
                  />
                </Tooltip>
                <Tooltip title={isInCompare ? "Remove from Compare" : "Add to Compare"}>
                  <Button
                    type="text"
                    icon={<SwapOutlined />}
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: isInCompare ? '#1890ff' : '#666'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(product._id);
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          }
          extra={
            <Tag color={
              product.status === 'active' ? 'success' :
              product.status === 'inactive' ? 'error' :
              product.status === 'draft' ? 'warning' : 'processing'
            }>
              {product.status?.toUpperCase() || 'ACTIVE'}
            </Tag>
          }
        >
          <div style={{ padding: '0 8px' }}>
            {/* Brand */}
            {product.brand && (
              <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                {product.brand}
              </Text>
            )}
            
            {/* Product Name */}
            <Title 
              level={5} 
              style={{ 
                margin: '4px 0 8px 0', 
                fontSize: '14px',
                lineHeight: '1.4',
                height: '40px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {product.name}
            </Title>

            {/* Rating */}
            {product.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <Rate 
                  disabled 
                  defaultValue={product.rating} 
                  style={{ fontSize: '12px' }}
                />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  ({product.reviewCount || 0})
                </Text>
              </div>
            )}

            {/* Price Section */}
            <div style={{ marginBottom: '12px' }}>
              <Space align="baseline">
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  ₹{product.price.toLocaleString()}
                </Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text delete style={{ fontSize: '14px', color: '#999' }}>
                    ₹{product.originalPrice.toLocaleString()}
                  </Text>
                )}
              </Space>
            </div>

            {/* Key Features */}
            {product.keyFeatures && (
              <div style={{ marginBottom: '12px' }}>
                {product.keyFeatures.slice(0, 2).map((feature, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text style={{ fontSize: '12px', color: '#666' }}>{feature}</Text>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery Info */}
            {deliveryInfo.freeDelivery && (
              <div style={{ marginBottom: '12px' }}>
                <Space>
                  <TruckOutlined style={{ color: '#52c41a' }} />
                  <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                    Free Delivery by {deliveryInfo.deliveryBy}
                  </Text>
                </Space>
              </div>
            )}

            {/* Stock Status */}
            <div style={{ marginBottom: '12px' }}>
              {product.stockQuantity > 0 ? (
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                  <CheckCircleOutlined /> In Stock
                </Text>
              ) : (
                <Text style={{ fontSize: '12px', color: '#ff4d4f' }}>
                  Out of Stock
                </Text>
              )}
            </div>

            {/* Action Buttons */}
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Button 
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCartHandler(product._id, 1);
                }}
                block
                disabled={product.stockQuantity === 0}
              >
                Add to Cart
              </Button>
              <Button 
                type="default"
                icon={<ThunderboltOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBuyNow(product);
                }}
                block
                disabled={product.stockQuantity === 0}
                style={{ color: '#ff6b35', borderColor: '#ff6b35' }}
              >
                Buy Now
              </Button>
            </Space>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}
    >
      <NavBar />
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header and Filters */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col>
              {/* <Title level={2} style={{ margin: 0 }}>
                Products ({products.length})
              </Title> */}
            </Col>
            <Col>
              <Space>
                {compareList.length > 0 && (
                  <Badge count={compareList.length}>
                    <Button icon={<SwapOutlined />}>
                      Compare
                    </Button>
                  </Badge>
                )}
              </Space>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Filters */}
          <Row gutter={16}>
            <Col xs={24} sm={8} md={6}>
              <Search 
                placeholder="Search products" 
                allowClear
                onSearch={(value) => {/* implement search */}}
              />
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Select
                defaultValue="all"
                style={{ width: '100%' }}
                onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <Select.Option value="all">All Categories</Select.Option>
                {/* Add categories dynamically */}
              </Select>
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Select
                defaultValue="all"
                style={{ width: '100%' }}
                onChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
              >
                <Select.Option value="all">All Prices</Select.Option>
                <Select.Option value="0-1000">Under ₹1,000</Select.Option>
                <Select.Option value="1000-5000">₹1,000 - ₹5,000</Select.Option>
                <Select.Option value="5000+">Above ₹5,000</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Select
                defaultValue="name"
                style={{ width: '100%' }}
                onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <Select.Option value="name">Name</Select.Option>
                <Select.Option value="price_low">Price: Low to High</Select.Option>
                <Select.Option value="price_high">Price: High to Low</Select.Option>
                <Select.Option value="rating">Rating</Select.Option>
                <Select.Option value="newest">Newest First</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Select
                defaultValue="all"
                style={{ width: '100%' }}
                onChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
              >
                <Select.Option value="all">All Ratings</Select.Option>
                <Select.Option value="4+">4★ & above</Select.Option>
                <Select.Option value="3+">3★ & above</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <Row gutter={[16, 16]}>
            {loading ? (
              <div style={{ width: '100%', textAlign: 'center', padding: 40 }}>Loading...</div>
            ) : (
              products.map(product => (
                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={product._id}>
                  <ProductCard product={product} />
                </Col>
              ))
            )}
          </Row>
        </motion.div>

        {/* Load More Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button size="large" style={{ minWidth: '200px' }}>
            Load More Products
          </Button>
        </div>
      </Space>
    </motion.div>
  );
};

export default Products;