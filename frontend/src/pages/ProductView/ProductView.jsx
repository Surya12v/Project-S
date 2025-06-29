import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Typography, Button, Space, Image,
  Tabs, Card, List, Tag, Rate, message, Spin, Result,
  Breadcrumb, InputNumber, Divider, Progress
} from 'antd';
import {
  ShoppingCartOutlined, HeartOutlined, ShareAltOutlined,
  ThunderboltOutlined, CheckCircleOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import Navbar from '../../components/NavBar/NavBar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products = [], loading: productsLoading } = useSelector(state => state.products) || {};
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const product = products.find(p => p._id === id);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      message.success('Added to cart');
    } catch {
      message.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      await handleAddToCart();
      navigate('/checkout');
    } catch {
      message.error('Failed to process order');
    }
  };

  const getDiscountPercentage = (originalPrice, price) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (productsLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Result
          status="404"
          title="Product Not Found"
          subTitle="Sorry, the product you are looking for does not exist."
          extra={
            <Button type="primary" onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Navbar />
      <Row gutter={[24, 24]}>
        {/* Left Column - Images */}
        <Col xs={24} md={12}>
          <Card>
            <Image.PreviewGroup>
              <Image
                src={product.images?.[0] || 'https://via.placeholder.com/500'}
                alt={product.name}
                style={{ width: '100%', borderRadius: '8px' }}
              />
              <Row gutter={[8, 8]} style={{ marginTop: '16px' }}>
                {product.images?.slice(1).map((img, index) => (
                  <Col span={6} key={index}>
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      style={{ borderRadius: '4px' }}
                    />
                  </Col>
                ))}
              </Row>
            </Image.PreviewGroup>

            {product.videoUrl && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>Product Video</Title>
                <Button icon={<PlayCircleOutlined />} block>
                  Watch Video
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column - Product Details */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Breadcrumb>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>{product.category}</Breadcrumb.Item>
              <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
            </Breadcrumb>

            <Space direction="vertical" size="small">
              <Tag color={product.isActive ? 'success' : 'error'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Tag>
              <Text type="secondary">{product.brand}</Text>
              <Title level={2} style={{ margin: 0 }}>{product.name}</Title>
              <Text type="secondary">SKU: {product.sku}</Text>
            </Space>

            {/* Ratings */}
            {product.ratings && (
              <Space align="center">
                <Rate disabled defaultValue={product.ratings.average} />
                <Text>({product.ratings.count} reviews)</Text>
              </Space>
            )}

            {/* Price Section */}
            <Card>
              <Space direction="vertical">
                <Space align="baseline" size="large">
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    ₹{product.price?.toLocaleString()}
                  </Title>
                  {product.originalPrice && (
                    <>
                      <Text delete>₹{product.originalPrice?.toLocaleString()}</Text>
                      <Tag color="red">
                        {getDiscountPercentage(product.originalPrice, product.price)}% OFF
                      </Tag>
                    </>
                  )}
                </Space>
                <Text type="secondary">Inclusive of all taxes</Text>
              </Space>
            </Card>

            {/* Key Features */}
            <Card title="Key Features">
              <List
                dataSource={product.keyFeatures}
                renderItem={feature => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {feature}
                  </List.Item>
                )}
              />
            </Card>

            {/* Stock & Delivery */}
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* Stock Status */}
                <Space>
                  {product.stockQuantity > 0 ? (
                    <>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text strong>In Stock</Text>
                      <Text type="secondary">
                        ({product.stockQuantity} units available)
                      </Text>
                    </>
                  ) : (
                    <Text type="danger">Out of Stock</Text>
                  )}
                </Space>

                {/* Payment Methods */}
                <div>
                  <Text strong>Accepted Payment Methods:</Text>
                  <div style={{ marginTop: 8 }}>
                    {product.paymentModes?.map(mode => (
                      <Tag key={mode} color="blue" style={{ margin: 4 }}>
                        {mode}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>Quantity:</Text>
                  <InputNumber
                    min={1}
                    max={product.maxOrderQuantity || product.stockQuantity}
                    value={quantity}
                    onChange={setQuantity}
                    style={{ width: 200 }}
                  />
                  {product.maxOrderQuantity && (
                    <Text type="secondary">
                      Maximum {product.maxOrderQuantity} units per order
                    </Text>
                  )}
                </Space>
              </Space>
            </Card>

            {/* Action Buttons */}
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  block
                  size="large"
                >
                  Add to Cart
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="default"
                  icon={<ThunderboltOutlined />}
                  onClick={handleBuyNow}
                  block
                  size="large"
                  style={{
                    backgroundColor: '#ff6b35',
                    borderColor: '#ff6b35',
                    color: 'white'
                  }}
                >
                  Buy Now
                </Button>
              </Col>
            </Row>
          </Space>
        </Col>
      </Row>

      {/* Tabs Section */}
      <Card style={{ marginTop: 24 }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Description" key="1">
            <Space direction="vertical">
              <Paragraph>{product.description}</Paragraph>
              <div dangerouslySetInnerHTML={{ __html: product.detailedDescription }} />
            </Space>
          </TabPane>

          <TabPane tab="Specifications" key="2">
            <List
              dataSource={Object.entries(product.specifications || {})}
              renderItem={([key, value]) => (
                <List.Item>
                  <Row style={{ width: '100%' }}>
                    <Col span={8}>
                      <Text strong style={{ textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </Text>
                    </Col>
                    <Col span={16}>{value}</Col>
                  </Row>
                </List.Item>
              )}
            />

            <Divider>Physical Specifications</Divider>

            <List
              dataSource={Object.entries(product.dimensions || {})}
              renderItem={([key, value]) => (
                <List.Item>
                  <Row style={{ width: '100%' }}>
                    <Col span={8}>
                      <Text strong style={{ textTransform: 'capitalize' }}>
                        {key}:
                      </Text>
                    </Col>
                    <Col span={16}>
                      {value} {key === 'weight' ? 'kg' : 'cm'}
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab={`Reviews (${product.ratings?.count || 0})`} key="3">
            {product.ratings && (
              <Row gutter={24}>
                <Col span={8}>
                  <Card>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <Title level={1}>{product.ratings.average.toFixed(1)}</Title>
                      <Rate disabled defaultValue={product.ratings.average} />
                      <Text>{product.ratings.count} reviews</Text>
                    </Space>
                  </Card>
                </Col>
                <Col span={16}>
                  {Object.entries(product.ratings.distribution || {})
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([stars, count]) => (
                      <Row key={stars} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={4}>
                          <Rate disabled defaultValue={Number(stars)} />
                        </Col>
                        <Col span={16}>
                          <Progress
                            percent={(count / product.ratings.count) * 100}
                            showInfo={false}
                          />
                        </Col>
                        <Col span={4} style={{ textAlign: 'right' }}>
                          {count}
                        </Col>
                      </Row>
                    ))}
                </Col>
              </Row>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProductView;