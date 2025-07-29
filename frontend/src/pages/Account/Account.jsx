import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Typography,Checkbox , Button, Form, Input, Avatar, message, Spin, Upload, List, Tag, Row, Col, Modal, Space, Divider, Table, Switch, Alert, Select, Badge, Progress, Statistic
} from 'antd';
import {
  UserOutlined, LockOutlined, SettingOutlined, MailOutlined, PhoneOutlined, EditOutlined, UploadOutlined, DeleteOutlined, CreditCardOutlined, HomeOutlined, HeartOutlined, BellOutlined, HistoryOutlined, LogoutOutlined, ExclamationCircleOutlined, ShoppingCartOutlined, CheckCircleOutlined, ClockCircleOutlined, TruckOutlined, StarOutlined, GiftOutlined, QuestionCircleOutlined, SafetyOutlined, WalletOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { API_URL,VITE_URL } from '../../config/constants';
import {updateUser,fetchUserByIdAccount} from '../../store/slices/userSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { fetchCart, addToCart } from '../../store/slices/cartSlice';
import { checkAuth, logout } from '../../store/slices/authSlice';
import { useUser } from '../../contexts/UserContext';
import { calculateFinalPrice } from '../../utils/priceUtils';
import EmiModule from '../../components/Emi/emi';
import NavBar from '../../components/NavBar/NavBar';
import ProductView from '../ProductView/ProductView';
import { payEmiInstallment } from '../../store/slices/orderSlice';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [form] = Form.useForm();
  const { items: orders = [], loading: ordersLoading } = useSelector(state => state.orders);
  // //console.log('prodid',orders?.items?._id);
  const { items: wishlist = [], loading: wishlistLoading } = useSelector(state => state.wishlist);
  const { items: cartItems = [], loading: cartLoading } = useSelector(state => state.cart);
  const [profileForm] = Form.useForm();
  const [editProfile, setEditProfile] = useState(true);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [addressModal, setAddressModal] = useState({ visible: false, address: null });
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentModal, setPaymentModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [emiPlans, setEmiPlans] = useState([]);
  const [emiModal, setEmiModal] = useState(false);
  const [payingEmi, setPayingEmi] = useState(false);
  const googleId = user?.googleId || '';
  console.log("Google ID:", googleId);
  // Fetch user, orders, wishlist, cart, addresses, payment methods, notifications, EMI, etc.
  useEffect(() => {
    console.log("testing 3 account");
    dispatch(checkAuth());
    dispatch(fetchOrders());
    dispatch(fetchWishlist());
    dispatch(fetchCart());
    fetchAddresses();
    fetchPaymentMethods();
    fetchNotifications();
    fetchEmiPlans();
    fetchActivityLog();
    // eslint-disable-next-line
  }, [dispatch]);


  useEffect(() => {
  if (addressModal.visible) {
    if (addressModal.address) {
      form.setFieldsValue(addressModal.address);
    } else {
      form.resetFields();
    }
  }
}, [addressModal, form]);


  // Fetch addresses (simulate API or use user.addresses if available)
// Account.jsx
const fetchAddresses = async () => {
  try {
    const address = await dispatch(fetchUserByIdAccount(user._id)).unwrap(); // ✅ FIXED HERE
    //console.log("Fetched user addresses:", address);
    setAddresses(address?.address || []);
  } catch (error) {
    console.error("Failed to fetch user addresses", error);
  }
};

  // Fetch payment methods (simulate API)
  const fetchPaymentMethods = async () => {
    setPaymentMethods(user?.paymentMethods || []);
  };

  // Fetch notifications (simulate API)
  const fetchNotifications = async () => {
    setNotifications(user?.notifications || []);
  };

  // Fetch EMI plans (simulate API)
  const fetchEmiPlans = async () => {
    setEmiPlans(user?.emiPlans || []);
  };

  // Fetch activity log (simulate API)
  const fetchActivityLog = async () => {
    setActivityLog(user?.activityLog || []);
  };

  // Profile picture upload handler (simulate)
  const handleProfilePicUpload = async (info) => {
    setProfilePicUploading(true);
    setTimeout(() => {
      message.success('Profile picture updated successfully!');
      setProfilePicUploading(false);
    }, 1000);
  };

  // Profile update handler
  const handleProfileUpdate = async (values) => {
    const updatedUser = {
      ...user,
      ...values
    };
    // Remove incorrect references to 'user' inside updateUser thunk call
    await dispatch(updateUser({ userId: user._id, userData: updatedUser })).unwrap();
    message.success('Profile updated successfully!');
    setEditProfile(false);
  };

  const handleAddressChange = async (values) => {
  const existingAddresses = user.address || [];

  let updatedAddresses;
  if (addressModal.address) {
    // Editing: replace the old address with the updated one
    updatedAddresses = existingAddresses.map(addr =>
      addr.id === addressModal.address.id ? { ...addressModal.address, ...values } : addr
    );
  } else {
    // Adding new
    updatedAddresses = [...existingAddresses, values];
  }

  const updatedUser = {
    address: updatedAddresses,
  };

  try {
    await dispatch(updateUser({ userId: user._id, userData: updatedUser })).unwrap();
    message.success("Address saved successfully");
    setAddressModal({ visible: false, address: null });
    form.resetFields(); // important
    fetchAddresses(); // refresh addresses
  } catch (err) {
    console.error("Failed to update user with new address:", err);
    message.error("Failed to save address.");
  }
};


  // Change password handler
  const handleChangePassword = async (values) => {
    message.success('Password changed successfully!');
  };

  // Add/edit/remove address handlers
  const handleSaveAddress = (address) => {
    setAddressModal({ visible: false, address: null });
    message.success('Address saved successfully!');
  };
  const handleDeleteAddress = (addressId) => {
    setAddresses(prev => prev.filter(a => a.id !== addressId));
    message.success('Address deleted successfully!');
  };

  // Add/delete payment method handlers
  const handleAddPaymentMethod = (method) => {
    setPaymentModal(false);
    message.success('Payment method added successfully!');
  };
  const handleDeletePaymentMethod = (methodId) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
    message.success('Payment method deleted successfully!');
  };

  // Logout handler
  const handleLogout = async () => {
    await dispatch(logout());
    navigate(`${VITE_URL}`);
  };

  // Delete account handler
  const handleDeleteAccount = () => {
    confirm({
      title: 'Are you sure you want to delete your account?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is irreversible. All your data will be deleted permanently.',
      okText: 'Delete Account',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success('Account deleted successfully!');
        handleLogout();
      }
    });
  };

  // Order status color mapping
  const getOrderStatusColor = (status) => {
    const colors = {
      'PLACED': 'blue',
      'CONFIRMED': 'cyan',
      'SHIPPED': 'orange',
      'DELIVERED': 'green',
      'CANCELLED': 'red',
      'REFUNDED': 'purple'
    };
    return colors[status] || 'default';
  };
  const handleCardClick = (e, productId) => {
    //console.log("Clicked product ID:", productId);
    // You can navigate or fetch data based on this ID
    navigate(`/product/${productId}`);
    
  };


  // Profile completion percentage
  const getProfileCompletionPercentage = () => {
    const fields = [user?.displayName, user?.email, user?.phone, user?.gender, user?.dob];
    const completed = fields.filter(field => field).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Handler for manual EMI payment using redux slice
  const handlePayEmi = async (emiOrder, installmentNumber) => {
    setPayingEmi(true);
    try {
      await dispatch(payEmiInstallment({
        orderId: emiOrder._id,
        installmentNumber,
        paymentDetails: { method: 'ONLINE' }
      })).unwrap();
      message.success('EMI installment paid!');
      // Optionally refresh EMI plans/orders here
    } catch (err) {
      message.error('Failed to pay EMI');
    } finally {
      setPayingEmi(false);
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ padding: '24px', margin: '0 auto' }}>
        {/* Header Section */}
        <Card 
          style={{ 
            marginBottom: '24px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px'
          }}
        >
          <Row align="middle" gutter={24}>
            <Col>
              <Badge count={user?.emailVerified ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: '#faad14' }} />}>
                <Avatar 
                  size={80} 
                  src={user?.image && typeof user.image === 'string' && user.image.startsWith('https') ? user.image : undefined}
                  
                  style={{ border: '4px solid rgba(255,255,255,0.3)' }}
                />
              </Badge>
            </Col>
            <Col flex="1">
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Welcome back, {user?.displayName || 'User'}!
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                {user?.email}
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Profile Completion: {getProfileCompletionPercentage()}%
                </Text>
                <Progress 
                  percent={getProfileCompletionPercentage()} 
                  size="small" 
                  style={{ marginTop: '4px' }}
                  strokeColor="#52c41a"
                />
              </div>
            </Col>
            <Col>
              <Space>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Orders</span>}
                  value={orders.length} 
                  valueStyle={{ color: 'white' }}
                />
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Wishlist Items</span>}
                  value={wishlist.length} 
                  valueStyle={{ color: 'white' }}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main Content */}
        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Tabs 
            defaultActiveKey="profile" 
            size="large"
            tabBarStyle={{ 
              marginBottom: '32px',
              borderBottom: '2px solid #f0f0f0'
            }}
          >
            {/* 1. Profile Info */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserOutlined /> Profile
                </span>
              } 
              key="profile"
            >
              <Row gutter={32}>
                <Col xs={24} md={8}>
                  <Card 
                    style={{ 
                      textAlign: 'center',
                      borderRadius: '8px',
                      background: 'linear-gradient(45deg, #f0f9ff, #e0f2fe)'
                    }}
                  >
                    <Avatar
                      size={120}
                      src={user?.image}
                      icon={<UserOutlined />}
                      style={{ 
                        marginBottom: '16px',
                        border: '4px solid #1890ff'
                      }}
                    />
                    <Upload
                      showUploadList={false}
                      customRequest={handleProfilePicUpload}
                      beforeUpload={() => false}
                      disabled={profilePicUploading}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={profilePicUploading}
                        style={{ marginBottom: '16px' }}
                        type="primary"
                        ghost
                      >
                        Change Picture
                      </Button>
                    </Upload>
                    <div>
                      <Tag 
                        color={user?.emailVerified ? 'green' : 'orange'} 
                        style={{ marginBottom: '8px', display: 'block' }}
                      >
                        {user?.emailVerified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                      </Tag>
                      <Tag 
                        color={user?.phoneVerified ? 'green' : 'orange'}
                        style={{ display: 'block' }}
                      >
                        {user?.phoneVerified ? '✓ Phone Verified' : '⚠ Phone Not Verified'}
                      </Tag>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={16}>
                  <Card title="Personal Information" style={{ borderRadius: '8px' }}>
                    <Form
                      form={profileForm}
                      layout="vertical"
                      initialValues={{
                        name: user?.displayName,
                        email: user?.email,
                        phone: user?.phone,
                        gender: user?.gender,
                        dob: user?.dob
                      }}
                      onFinish={handleProfileUpdate}
                     
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined />} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                            <Input prefix={<MailOutlined />} disabled size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Phone" name="phone">
                            <Input prefix={<PhoneOutlined />} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Gender" name="gender">
                            <Select size="large" placeholder="Select gender">
                              <Select.Option value="male">Male</Select.Option>
                              <Select.Option value="female">Female</Select.Option>
                              <Select.Option value="other">Other</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Date of Birth" name="dob">
                            <Input type="date" size="large" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item style={{ marginTop: '24px' }}>
                        {editProfile ? (
                          <Space>
                            <Button type="primary" htmlType="submit" size="large">
                              Save Changes
                            </Button>
                            <Button onClick={() => setEditProfile(false)} size="large">
                              Cancel
                            </Button>
                          </Space>
                        ) : (
                          <Button 
                            icon={<EditOutlined />} 
                            onClick={() => setEditProfile(true)}
                            type="primary"
                            size="large"
                          >
                            Edit Profile
                          </Button>
                        )}
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* 2. Order History */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCartOutlined /> Orders
                </span>
              } 
              key="orders"
            >
              <Card title="Order History" style={{ borderRadius: '8px' }}
              >
                <Table
                  dataSource={orders}
                  loading={ordersLoading}
                  rowKey="_id"
                  size="large"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { 
                      title: 'Order ID', 
                      dataIndex: '_id', 
                      render: id => (
                        <Text strong>#{id?.substr(-8)?.toUpperCase()}</Text>
                      )
                    },
                    { 
                      title: 'Date', 
                      dataIndex: 'createdAt', 
                      render: d => new Date(d).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    },
                    { 
                      title: 'Amount', 
                      dataIndex: 'totalAmount', 
                      render: a => <Text strong style={{ color: '#1890ff' }}>₹{a?.toLocaleString()}</Text>
                    },
                    { 
                      title: 'Status', 
                      dataIndex: 'orderStatus', 
                      render: s => (
                        <Tag color={getOrderStatusColor(s)} style={{ fontWeight: 'bold' }}>
                          {s}
                        </Tag>
                      )
                    },
                    {
                      title: 'Actions',
                      render: (_, order) => (
                        <Space>
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            onClick={(e) =>
                              handleCardClick(
                                e,
                                order.items?.map((item) => item.productId?._id) || []
                              )
                            }
                          >
                            View Details
                          </Button>
                          <Button size="small" icon={<TruckOutlined />}>
                            Track
                          </Button>
                          {order.orderStatus === 'DELIVERED' && (
                            <Button size="small" icon={<StarOutlined />}>
                              Review
                            </Button>
                          )}
                        </Space>
                      )
                    }

                  ]}
                />
              </Card>
            </TabPane>

            {/* 3. Payment Methods */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCardOutlined /> Payment Methods
                </span>
              } 
              key="payments"
            >
              <Card title="Payment Methods" style={{ borderRadius: '8px' }}>
                <List
                  dataSource={paymentMethods}
                  renderItem={method => (
                    <List.Item
                      style={{ 
                        padding: '16px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}
                      actions={[
                        <Button type="text" danger onClick={() => handleDeletePaymentMethod(method.id)}>
                          <DeleteOutlined /> Delete
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                        title={
                          <div>
                            {method.type === 'card'
                              ? `•••• •••• •••• ${method.last4}`
                              : `${method.upiId}`}
                            {method.isDefault && <Tag color="green" style={{ marginLeft: '8px' }}>Default</Tag>}
                          </div>
                        }
                        description={method.type === 'card' ? method.brand : 'UPI'}
                      />
                    </List.Item>
                  )}
                />
                <Button 
                  type="dashed" 
                  onClick={() => setPaymentModal(true)}
                  size="large"
                  block
                  style={{ marginTop: '16px' }}
                >
                  <CreditCardOutlined /> Add Payment Method
                </Button>
                <Modal
                  open={paymentModal}
                  onCancel={() => setPaymentModal(false)}
                  footer={null}
                  title="Add Payment Method"
                  width={600}
                >
                  <Alert message="Payment method form will be implemented here" type="info" />
                </Modal>
              </Card>
            </TabPane>

            {/* 4. Address Book */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HomeOutlined /> Address Book
                </span>
              } 
              key="addresses"
            >
              <Card title="Saved Addresses" style={{ borderRadius: '8px' }}>
                <List
                  dataSource={addresses}
                  renderItem={address => (
                    <List.Item
                      style={{ 
                        padding: '16px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}
                      actions={[
                        <Button type="text" onClick={() => setAddressModal({ visible: true, address })}>
                          <EditOutlined /> Edit
                        </Button>,
                        <Button type="text" danger onClick={() => handleDeleteAddress(address.id)}>
                          <DeleteOutlined /> Delete
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<HomeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                        title={
                          <div>
                            {address.name}
                            {address.isDefault && <Tag color="green" style={{ marginLeft: '8px' }}>Default</Tag>}
                          </div>
                        }
                        description={`${address.address}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`}
                      />
                    </List.Item>
                  )}
                />
                <Button 
                  type="dashed" 
                  onClick={() => setAddressModal({ visible: true, address: null })}
                  size="large"
                  block
                  style={{ marginTop: '16px' }}
                >
                  <HomeOutlined /> Add New Address
                </Button>
                <Modal
                  open={addressModal.visible}
                  onCancel={() => setAddressModal({ visible: false, address: null })}
                
                  footer={null}
                  title={addressModal.address ? "Edit Address" : "Add New Address"}
                  width={800}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddressChange}
                  >

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="address" label="Street Address" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="city" label="City" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="state" label="State/Province" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="pincode" label="Postal Code" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="shippingClass" label="Shipping Method">
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} style={{ marginBottom: 16 }}>
                        <Checkbox >
                          Billing address same as shipping
                        </Checkbox>
                      </Col>
                    </Row>
                    <Row justify="end">
                      <Col>
                        <Button type="primary" htmlType="submit">
                          Save Address
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Modal>

              </Card>
            </TabPane>

            {/* 5. Wishlist */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HeartOutlined /> Wishlist
                </span>
              } 
              key="wishlist"
            >
              <Card title="My Wishlist" style={{ borderRadius: '8px' }}>
                <List
                  dataSource={wishlist}
                  loading={wishlistLoading}
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
                  renderItem={item => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <img 
                            alt={item.name} 
                            src={item.images?.[0] || "https://via.placeholder.com/200"} 
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        }
                        actions={[
                          <Button 
                            type="primary" 
                            onClick={() => dispatch(addToCart({ productId: item._id, quantity: 1 }))}
                            disabled={item.stockQuantity === 0}
                          >
                            Add to Cart
                          </Button>,
                          <Button 
                            danger 
                            onClick={() => dispatch(removeFromWishlist(item._id))}
                          >
                            Remove
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          title={item.name}
                          description={
                            <div>
                              <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                ₹{item.price?.toLocaleString()}
                              </Text>
                              {item.stockQuantity === 0 && (
                                <Tag color="red" style={{ marginLeft: '8px' }}>Out of Stock</Tag>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>

            {/* 6. Account Settings */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SettingOutlined /> Settings
                </span>
              } 
              key="settings"
            >
              <Row gutter={24}>
             <Col xs={24} md={12}>
                {/* Preferences - Always shown */}
                <Card title="Preferences" style={{ borderRadius: '8px', marginBottom: '24px' }}>
                  <Form layout="vertical">
                    <Form.Item label="Enable Notifications" name="notifications" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item label="Communication Preferences">
                      <Select mode="multiple" defaultValue={['email', 'sms']} size="large">
                        <Select.Option value="email">Email</Select.Option>
                        <Select.Option value="sms">SMS</Select.Option>
                        <Select.Option value="push">Push Notifications</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Two-Factor Authentication" name="twofa" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item label="Marketing Emails" name="marketing" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              {/* Security Settings - Only show if NOT using Google login */}
              {!googleId && (
                <Col xs={24} md={12}>
                  <Card title="Security Settings" style={{ borderRadius: '8px', marginBottom: '24px' }}>
                    <Form layout="vertical" onFinish={handleChangePassword}>
                      <Form.Item label="Current Password" name="currentPassword">
                        <Input.Password size="large" />
                      </Form.Item>
                      <Form.Item label="New Password" name="newPassword">
                        <Input.Password size="large" />
                      </Form.Item>
                      <Form.Item label="Confirm Password" name="confirmPassword">
                        <Input.Password size="large" />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" size="large">
                          Change Password
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              )}
              </Row>
            </TabPane>

            {/* 7. Notifications */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge count={notifications.length} size="small">
                    <BellOutlined /> Notifications
                  </Badge>
                </span>
              } 
              key="notifications"
            >
              <Card title="Recent Notifications" style={{ borderRadius: '8px', marginBottom: '24px' }}>
                <List
                  dataSource={notifications}
                  renderItem={notif => (
                    <List.Item
                      style={{ 
                        padding: '16px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}
                      actions={[
                        <Button type="text">Mark as Read</Button>,
                        <Button type="text" danger>Delete</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<BellOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                        title={notif.title}
                        description={notif.description}
                      />
                      <Text type="secondary">
                        {notif.date ? new Date(notif.date).toLocaleString() : ''}
                      </Text>
                    </List.Item>
                  )}
                />
              </Card>
              
              <Card title="Activity Log" style={{ borderRadius: '8px' }}>
                <List
                  dataSource={activityLog}
                  renderItem={log => (
                    <List.Item style={{ padding: '12px 0' }}>
                      <List.Item.Meta
                        avatar={<HistoryOutlined style={{ color: '#52c41a' }} />}
                        title={log.action}
                        description={log.date ? new Date(log.date).toLocaleString() : ''}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>

            {/* 8. EMI & Wallet */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <WalletOutlined /> EMI & Wallet
                </span>
              } 
              key="emi"
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Card title="EMI Plans" style={{ borderRadius: '8px', marginBottom: '24px' }}>
                    <List
                      dataSource={emiPlans}
                      renderItem={plan => (
                        <List.Item
                          style={{ 
                            padding: '16px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            marginBottom: '12px'
                          }}
                          actions={[
                            // Render a button for each installment
                            ...(plan.installments
                              ? plan.installments.map((inst, idx) => (
                                  <Button
                                    key={idx}
                                    type="primary"
                                    loading={payingEmi}
                                    disabled={inst.paid}
                                    onClick={() => handlePayEmi(plan, idx + 1)}
                                  >
                                    {inst.paid ? 'Paid' : `Pay EMI #${idx + 1}`}
                                  </Button>
                                ))
                              : [
                                  <Button
                                    type="primary"
                                    onClick={() => setEmiModal(true)}
                                  >
                                    Pay EMI
                                  </Button>
                                ])
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                            title={`EMI for ${plan.productName || 'Product'}`}
                            description={`Next Due: ${plan.nextDueDate ? new Date(plan.nextDueDate).toLocaleDateString() : 'N/A'}`}
                          />
                          <Tag color="blue">{plan.status}</Tag>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Wallet Balance" style={{ borderRadius: '8px', marginBottom: '24px' }}>
                    <Statistic
                      title="Available Balance"
                      value={user?.walletBalance || 0}
                      precision={2}
                      valueStyle={{ color: '#3f8600' }}
                      prefix="₹"
                    />
                    <Button type="primary" size="large" style={{ marginTop: '16px' }}>
                      Add Money
                    </Button>
                  </Card>
                </Col>
              </Row>
              
              <Modal
                open={emiModal}
                onCancel={() => setEmiModal(false)}
                footer={null}
                title="EMI Payment"
                width={800}
              >
                <EmiModule showSchedule emiOrder={emiPlans[0]} />
              </Modal>
            </TabPane>

            {/* 9. Help & Support */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QuestionCircleOutlined /> Help & Support
                </span>
              }
              key="support"
            >
              <Card title="Help & Support" style={{ borderRadius: '8px' }}>
                <Alert message="Raise a support ticket, chat with support, or view FAQs here." type="info" />
                <Divider />
                <Space>
                  <Button type="primary">Raise Support Ticket</Button>
                  <Button>Chat with Support</Button>
                  <Button>FAQs</Button>
                  <Button>Return/Refund Request</Button>
                </Space>
              </Card>
            </TabPane>

            {/* 10. Logout / Delete Account */}
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogoutOutlined /> Logout / Delete
                </span>
              }
              key="logout"
            >
              <Card title="Account Actions" style={{ borderRadius: '8px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                  </Button>
                  <Button type="default" danger icon={<DeleteOutlined />} onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </Space>
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Account;