import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Typography, Tag, Space, Button, Divider, Table, Progress, Row, Col, Modal, 
  Steps, Timeline, Tooltip, Badge, Alert, Rate, Input, message, Drawer, Avatar,
  Collapse, Statistic, Image, notification
} from 'antd';
import {
  TruckOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  PhoneOutlined,
  MailOutlined,
  DownloadOutlined,
  StarOutlined,
  RetweetOutlined,
  CustomerServiceOutlined,
  SyncOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  GiftOutlined,
  WarningOutlined,
  CopyOutlined,
  WhatsAppOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { fetchOrders } from '../../store/slices/orderSlice';
import { fetchPaymentsByOrder } from '../../store/slices/paymentSlice';
import { API_URL } from '../../config/constants';
import NavBar from '../../components/NavBar/NavBar';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;
const { TextArea } = Input;

const ORDER_STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: <ShoppingCartOutlined />, color: '#52c41a' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: <CheckCircleOutlined />, color: '#1890ff' },
  { key: 'SHIPPED', label: 'Shipped', icon: <TruckOutlined />, color: '#722ed1' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: <ClockCircleOutlined />, color: '#fa8c16' },
  { key: 'DELIVERED', label: 'Delivered', icon: <CheckCircleOutlined />, color: '#52c41a' }
];

const statusToStep = status => {
  const idx = ORDER_STATUS_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
};

const OrderSummary = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: orders, loading: ordersLoading } = useSelector(state => state.orders);
  const { items: payments, loading: paymentsLoading } = useSelector(state => state.payments);
  const [emiOrder, setEmiOrder] = useState(null);
  const [emiModal, setEmiModal] = useState(false);
  const [trackingDrawer, setTrackingDrawer] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!orders || orders.length === 0) dispatch(fetchOrders());
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (orderId) dispatch(fetchPaymentsByOrder(orderId));
  }, [orderId, dispatch]);

  const order = orders.find(o => o._id === orderId);

  useEffect(() => {
    const fetchEmi = async () => {
      if (order && order.emiOrderId) {
        const res = await fetch(`${API_URL}/api/emi/order/${order.emiOrderId}`, { credentials: 'include' });
        const data = await res.json();
        setEmiOrder(data);
      }
    };
    fetchEmi();
  }, [order]);

  const copyTrackingId = () => {
    navigator.clipboard.writeText(order.trackingId);
    message.success('Tracking ID copied to clipboard!');
  };

  const shareOrder = () => {
    const shareData = {
      title: `Order #${order._id?.slice(-8).toUpperCase()}`,
      text: `Check out my order status`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('Order link copied to clipboard!');
    }
  };

  const downloadInvoice = () => {
    message.success('Invoice download started!');
    // Your invoice download logic here
  };

  const trackOrder = () => {
    setTrackingDrawer(true);
  };

  const submitReview = () => {
    if (rating === 0) {
      message.error('Please provide a rating');
      return;
    }
    message.success('Review submitted successfully!');
    setReviewModal(false);
    setRating(0);
    setReview('');
  };

  if (ordersLoading || paymentsLoading || !order) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <NavBar />
        <Card style={{ marginTop: 40 }}>
          <div style={{ padding: 40 }}>
            <SyncOutlined spin style={{ fontSize: 24, marginBottom: 16 }} />
            <Text>Loading order details...</Text>
          </div>
        </Card>
      </div>
    );
  }

  const stepIdx = statusToStep(order.orderStatus);
  const currentStep = ORDER_STATUS_STEPS[stepIdx];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px 0'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <NavBar />
        
        {/* Order Header with Enhanced Design */}
        <Card 
          style={{ 
            marginTop: 24,
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            border: 'none'
          }}
        >
          <Row gutter={24} align="middle">
            <Col span={2}>
              <Avatar 
                size={64} 
                icon={<ShoppingCartOutlined />} 
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                }} 
              />
            </Col>
            <Col span={14}>
              <Space direction="vertical" size="small">
                <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Order #{order._id?.slice(-8).toUpperCase()}
                </Title>
                <Space wrap>
                  <Badge.Ribbon text={order.orderStatus} color={currentStep?.color}>
                    <Tag icon={<CalendarOutlined />} color="blue">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Tag>
                  </Badge.Ribbon>
                  <Tag icon={<CreditCardOutlined />} color={order.paymentMode === 'EMI' ? 'purple' : 'green'}>
                    {order.paymentMode}
                  </Tag>
                  <Tag icon={<DollarOutlined />} color="gold">
                    ₹{order.totalAmount?.toLocaleString()}
                  </Tag>
                </Space>
                {order.trackingId && (
                  <Space>
                    <Text strong>Tracking:</Text>
                    <Text code copyable={{ onCopy: copyTrackingId }}>
                      {order.trackingId}
                    </Text>
                    <Tag color="blue">{order.courierName}</Tag>
                  </Space>
                )}
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<EyeOutlined />} 
                  onClick={trackOrder}
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 8
                  }}
                >
                  Track Order
                </Button>
                <Space>
                  <Button icon={<DownloadOutlined />} onClick={downloadInvoice}>
                    Invoice
                  </Button>
                  <Button icon={<ShareAltOutlined />} onClick={shareOrder}>
                    Share
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Order Progress with Modern Timeline */}
        <Card 
          style={{ 
            marginTop: 24,
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Title level={4} style={{ marginBottom: 24 }}>
            <TruckOutlined style={{ marginRight: 8 }} />
            Order Progress
          </Title>
          <Steps 
            current={stepIdx} 
            size="small"
            style={{ marginBottom: 24 }}
          >
            {ORDER_STATUS_STEPS.map((step) => (
              <Step 
                key={step.key} 
                title={step.label} 
                icon={step.icon}
              />
            ))}
          </Steps>
          
          {order.expectedDeliveryDate && (
            <Alert
              message={
                <Space>
                  <ClockCircleOutlined />
                  <Text strong>Expected Delivery: </Text>
                  <Text>{new Date(order.expectedDeliveryDate).toLocaleDateString()}</Text>
                </Space>
              }
              type="info"
              showIcon={false}
              style={{ borderRadius: 8 }}
            />
          )}
        </Card>

        {/* Addresses with Modern Cards */}
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card 
              title={
                <Space>
                  <HomeOutlined />
                  <span>Shipping Address</span>
                </Space>
              }
              style={{ 
                borderRadius: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: 'none',
                height: '100%'
              }}
            >
              <Space direction="vertical" size="small">
                <Text strong style={{ fontSize: 16 }}>{order.shippingAddress?.fullName}</Text>
                <Text>{order.shippingAddress?.address}</Text>
                <Text>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</Text>
                <Text>{order.shippingAddress?.country}</Text>
                <Space>
                  <PhoneOutlined />
                  <Text>{order.shippingAddress?.phone}</Text>
                </Space>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  <span>Billing Address</span>
                </Space>
              }
              style={{ 
                borderRadius: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: 'none',
                height: '100%'
              }}
            >
              {order.billingAddress ? (
                <Space direction="vertical" size="small">
                  <Text strong style={{ fontSize: 16 }}>{order.billingAddress?.fullName}</Text>
                  <Text>{order.billingAddress?.address}</Text>
                  <Text>{order.billingAddress?.city}, {order.billingAddress?.state} {order.billingAddress?.postalCode}</Text>
                  <Text>{order.billingAddress?.country}</Text>
                  <Space>
                    <PhoneOutlined />
                    <Text>{order.billingAddress?.phone}</Text>
                  </Space>
                </Space>
              ) : (
                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                  Same as shipping address
                </Text>
              )}
            </Card>
          </Col>
        </Row>

        {/* Enhanced Product List */}
        <Card 
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>Ordered Items</span>
              <Badge count={order.items.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          style={{ 
            marginTop: 24,
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Table
            dataSource={order.items.map((item, idx) => ({
              key: idx,
              image: item.productId?.images?.[0],
              name: item.productId?.name,
              variant: item.productId?.variant || '-',
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            }))}
            columns={[
              {
                title: 'Product',
                dataIndex: 'image',
                render: (img, record) => (
                  <Space>
                    {img ? (
                      <Image 
                        src={img} 
                        alt={record.name}
                        width={64} 
                        height={64}
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                        preview={false}
                      />
                    ) : (
                      <div style={{ 
                        width: 64, 
                        height: 64, 
                        background: '#f0f0f0', 
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <GiftOutlined style={{ fontSize: 24, color: '#ccc' }} />
                      </div>
                    )}
                    <Space direction="vertical" size="small">
                      <Text strong>{record.name}</Text>
                      <Text type="secondary">{record.variant}</Text>
                    </Space>
                  </Space>
                )
              },
              { 
                title: 'Quantity', 
                dataIndex: 'quantity',
                render: qty => <Badge count={qty} style={{ backgroundColor: '#1890ff' }} />
              },
              { 
                title: 'Unit Price', 
                dataIndex: 'price', 
                render: p => <Text strong>₹{p?.toLocaleString()}</Text> 
              },
              { 
                title: 'Subtotal', 
                dataIndex: 'subtotal', 
                render: s => <Text strong style={{ color: '#52c41a' }}>₹{s?.toLocaleString()}</Text>
              },
            ]}
            pagination={false}
            size="middle"
          />
          {order.paymentMode === 'EMI' && (
            <div style={{ marginTop: 16 }}>
              <Tag color="purple" style={{ padding: '4px 12px', fontSize: 14 }}>
                <CreditCardOutlined style={{ marginRight: 4 }} />
                Purchased via EMI
              </Tag>
            </div>
          )}
        </Card>

        {/* Enhanced EMI Details */}
        {order.paymentMode === 'EMI' && emiOrder && (
          <Card 
            title={
              <Space>
                <CreditCardOutlined />
                <span>EMI Details</span>
                <Tag color={emiOrder.status === 'COMPLETED' ? 'green' : 'blue'}>
                  {emiOrder.status}
                </Tag>
              </Space>
            }
            style={{ 
              marginTop: 24,
              borderRadius: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none'
            }}
          >
            <Row gutter={24}>
              <Col span={6}>
                <Statistic
                  title="Monthly EMI"
                  value={emiOrder.monthlyAmount}
                  prefix="₹"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Payable"
                  value={emiOrder.totalAmount}
                  prefix="₹"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Duration"
                  value={emiOrder.schedule?.length}
                  suffix="months"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Interest Rate"
                  value={emiOrder.interestRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Space wrap>
              <Text strong>Next Due Date:</Text>
              <Text>
                {emiOrder.schedule?.find(s => s.status === 'DUE')
                  ? new Date(emiOrder.schedule.find(s => s.status === 'DUE').dueDate).toLocaleDateString()
                  : 'All Paid'}
              </Text>
              <Divider type="vertical" />
              <Text strong>Auto-Pay:</Text>
              <Tag color={emiOrder.autoPaymentMethod ? 'green' : 'orange'}>
                {emiOrder.autoPaymentMethod ? 'Enabled' : 'Disabled'}
              </Tag>
            </Space>
            
            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                onClick={() => setEmiModal(true)}
                style={{ borderRadius: 8 }}
              >
                View Payment Schedule
              </Button>
            </div>
          </Card>
        )}

        {/* Enhanced Payment Summary */}
        <Card 
          title={
            <Space>
              <DollarOutlined />
              <span>Payment History</span>
              <Badge count={payments.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          style={{ 
            marginTop: 24,
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Table
            dataSource={payments.map((p, idx) => ({
              key: idx,
              date: p.paidAt ? new Date(p.paidAt).toLocaleString() : '-',
              amount: p.amount,
              type: p.paymentType,
              status: p.status,
              mode: p.method,
            }))}
            columns={[
              { 
                title: 'Date & Time', 
                dataIndex: 'date',
                render: date => (
                  <Space direction="vertical" size="small">
                    <Text>{date.split(',')[0]}</Text>
                    <Text type="secondary">{date.split(',')[1]}</Text>
                  </Space>
                )
              },
              { 
                title: 'Amount', 
                dataIndex: 'amount', 
                render: a => <Text strong style={{ color: '#52c41a' }}>₹{a?.toLocaleString()}</Text> 
              },
              { title: 'Payment Type', dataIndex: 'type' },
              { 
                title: 'Status', 
                dataIndex: 'status', 
                render: s => (
                  <Tag 
                    color={s === 'SUCCESS' ? 'green' : s === 'FAILED' ? 'red' : 'orange'}
                    icon={s === 'SUCCESS' ? <CheckCircleOutlined /> : s === 'FAILED' ? <WarningOutlined /> : <ClockCircleOutlined />}
                  >
                    {s}
                  </Tag>
                )
              },
              { title: 'Mode', dataIndex: 'mode' },
            ]}
            pagination={false}
            size="middle"
          />
        </Card>

        {/* Enhanced Action Buttons */}
        <Card 
          style={{ 
            marginTop: 24,
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Space wrap size="large">
            {order.orderStatus === 'PLACED' && (
              <Button 
                danger 
                size="large"
                icon={<WarningOutlined />}
                style={{ borderRadius: 8 }}
              >
                Cancel Order
              </Button>
            )}
            {order.orderStatus === 'DELIVERED' && (
              <>
                <Button 
                  size="large"
                  icon={<RetweetOutlined />}
                  style={{ borderRadius: 8 }}
                >
                  Return / Replace
                </Button>
                <Button 
                  type="primary"
                  size="large"
                  icon={<StarOutlined />}
                  onClick={() => setReviewModal(true)}
                  style={{ 
                    background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                    border: 'none',
                    borderRadius: 8
                  }}
                >
                  Write Review
                </Button>
              </>
            )}
            <Button 
              size="large"
              icon={<CustomerServiceOutlined />}
              onClick={() => setSupportModal(true)}
              style={{ borderRadius: 8 }}
            >
              Contact Support
            </Button>
            <Button 
              size="large"
              icon={<SyncOutlined />}
              style={{ borderRadius: 8 }}
            >
              Reorder
            </Button>
          </Space>
        </Card>

        {/* EMI Schedule Modal */}
        <Modal
          open={emiModal}
          onCancel={() => setEmiModal(false)}
          footer={null}
          title={
            <Space>
              <CreditCardOutlined />
              <span>EMI Payment Schedule</span>
            </Space>
          }
          width={800}
          style={{ borderRadius: 16 }}
        >
          <Table
            dataSource={emiOrder?.schedule?.map((item, idx) => ({
              key: idx + 1,
              installment: idx + 1,
              dueDate: new Date(item.dueDate).toLocaleDateString(),
              amount: item.amount,
              status: item.status,
            }))}
            columns={[
              { title: 'Installment #', dataIndex: 'installment' },
              { title: 'Due Date', dataIndex: 'dueDate' },
              { 
                title: 'Amount', 
                dataIndex: 'amount',
                render: amount => <Text strong>₹{amount?.toLocaleString()}</Text>
              },
              { 
                title: 'Status', 
                dataIndex: 'status', 
                render: s => (
                  <Tag 
                    color={s === 'PAID' ? 'green' : s === 'LATE' ? 'red' : 'orange'}
                    icon={s === 'PAID' ? <CheckCircleOutlined /> : s === 'LATE' ? <WarningOutlined /> : <ClockCircleOutlined />}
                  >
                    {s}
                  </Tag>
                )
              },
            ]}
            pagination={false}
            size="small"
          />
        </Modal>

        {/* Order Tracking Drawer */}
        <Drawer
          title={
            <Space>
              <TruckOutlined />
              <span>Track Your Order</span>
            </Space>
          }
          placement="right"
          onClose={() => setTrackingDrawer(false)}
          open={trackingDrawer}
          width={400}
        >
          <Timeline>
            {ORDER_STATUS_STEPS.slice(0, stepIdx + 1).map((step, idx) => (
              <Timeline.Item
                key={step.key}
                color={step.color}
                dot={step.icon}
              >
                <Text strong>{step.label}</Text>
                <br />
                <Text type="secondary">
                  {idx === stepIdx ? 'Current Status' : 'Completed'}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
          
          {order.trackingId && (
            <Card style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Tracking Information</Text>
                <Text>Tracking ID: {order.trackingId}</Text>
                <Text>Courier: {order.courierName}</Text>
                <Button type="link" style={{ padding: 0 }}>
                  Track on {order.courierName} website
                </Button>
              </Space>
            </Card>
          )}
        </Drawer>

        {/* Support Modal */}
        <Modal
          title={
            <Space>
              <CustomerServiceOutlined />
              <span>Contact Support</span>
            </Space>
          }
          open={supportModal}
          onCancel={() => setSupportModal(false)}
          footer={null}
          width={500}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="Need help with your order?"
              description="Our customer support team is here to assist you 24/7"
              type="info"
              showIcon
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Button 
                  type="primary" 
                  icon={<PhoneOutlined />} 
                  block 
                  size="large"
                  style={{ borderRadius: 8 }}
                >
                  Call Support
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  icon={<WhatsAppOutlined />} 
                  block 
                  size="large"
                  style={{ 
                    background: '#25D366', 
                    borderColor: '#25D366', 
                    color: 'white',
                    borderRadius: 8
                  }}
                >
                  WhatsApp
                </Button>
              </Col>
            </Row>
            
            <Button 
              icon={<MailOutlined />} 
              block 
              size="large"
              style={{ borderRadius: 8 }}
            >
              Email Support
            </Button>
          </Space>
        </Modal>

        {/* Review Modal */}
        <Modal
          title={
            <Space>
              <StarOutlined />
              <span>Write a Review</span>
            </Space>
          }
          open={reviewModal}
          onCancel={() => setReviewModal(false)}
          onOk={submitReview}
          okText="Submit Review"
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Rate your experience:</Text>
              <br />
              <Rate 
                value={rating} 
                onChange={setRating} 
                style={{ fontSize: 24, marginTop: 8 }}
              />
            </div>
            
            <div>
              <Text strong>Share your thoughts:</Text>
              <TextArea
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about your experience with this product..."
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        </Modal>
      </div>
    </div>
  );
};

export default OrderSummary;