import React, { useState, useEffect } from 'react';
import { 
  Card, Tabs, Timeline, Space, Typography, Button, Tag,
  Statistic, Row, Col, Avatar, List, Badge, Modal, Table,
  Descriptions, Empty, Alert, message, Skeleton, Image, Select
} from 'antd';
import { 
  UserOutlined, ShoppingOutlined, HeartOutlined,
  HistoryOutlined, SettingOutlined, CrownOutlined,
  LockOutlined, UnlockOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/constants';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users/${id}`, { withCredentials: true });
      const data = response.data;
      console.log('User Details Response:', data);
      
      if (data.user) {
        setUser({
          ...data.user,
          orderCount: data.activity?.stats?.orderCount || 0,
          cartCount: data.activity?.stats?.cartCount || 0,
          wishlistCount: data.activity?.stats?.wishlistCount || 0,
          totalSpent: data.activity?.stats?.totalSpent || 0,
          orders: data.activity?.orders || [],
          cart: data.activity?.cart?.items || [],
          wishlist: data.activity?.wishlist?.products || []
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      message.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/admin/users/${id}/role`, {
        role: selectedRole
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      const data = response.data;
      if (data) {
        setUser(prev => ({ ...prev, role: data.role }));
        message.success('User role updated successfully');
        setRoleModalVisible(false);
      }
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  const handleStatusToggle = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/admin/users/${id}/status`, {
        isActive: !user.isActive
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      const data = response.data;
      if (data) {
        setUser(prev => ({ ...prev, isActive: data.isActive }));
        message.success(`User account ${data.isActive ? 'enabled' : 'disabled'} successfully`);
        setStatusModalVisible(false);
      }
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  // Update timelineItems to use actual data
  const generateTimelineItems = () => {
    const items = [];
    if (user?.createdAt) {
      items.push({
        children: 'Created account',
        color: 'blue',
        dot: <UserOutlined />,
        timestamp: new Date(user.createdAt).toLocaleString()
      });
    }
    user?.orders?.forEach(order => {
      items.push({
        children: `Ordered ${order.items.length} items - ₹${order.totalAmount}`,
        color: 'green',
        dot: <ShoppingOutlined />,
        timestamp: new Date(order.createdAt).toLocaleString()
      });
    });
    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const timelineItems = generateTimelineItems();

  if (loading) {
    return <Skeleton active />;
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="User not found" type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* User Header Card */}
        <Card>
          <Row gutter={24} align="middle">
            <Col>
              <Avatar 
                size={100} 
                src={user?.image ? user.image : undefined}
                icon={!user?.image && <UserOutlined />}
              />
            </Col>
            <Col flex="auto">
              <Space direction="vertical">
                <Space align="center">
                  <Title level={2} style={{ margin: 0 }}>
                    {user?.displayName}
                  </Title>
                  <Tag color={user?.role === 'admin' ? 'gold' : 'blue'}>
                    {(user?.role || 'user').toUpperCase()}
                  </Tag>
                </Space>
                <Text type="secondary">{user?.email}</Text>
                <Space>
                  <Tag icon={<HistoryOutlined />}>
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                  </Tag>
                  <Badge 
                    status={user?.isActive ? 'success' : 'error'}
                    text={user?.isActive ? 'Active' : 'Inactive'}
                  />
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary"
                  icon={<CrownOutlined />}
                  onClick={() => {
                    setSelectedRole(user?.role || 'user');
                    setRoleModalVisible(true);
                  }}
                >
                  Change Role
                </Button>
                <Button
                  icon={user?.isActive ? <LockOutlined /> : <UnlockOutlined />}
                  danger={user?.isActive}
                  onClick={() => setStatusModalVisible(true)}
                >
                  {user?.isActive ? 'Disable Account' : 'Enable Account'}
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Role Change Modal */}
        <Modal
          title="Change User Role"
          open={roleModalVisible}
          onOk={handleRoleUpdate}
          onCancel={() => setRoleModalVisible(false)}
          okText="Change Role"
          okButtonProps={{ disabled: !selectedRole || selectedRole === user?.role }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Are you sure you want to change the user's role?"
              type="warning"
              showIcon
            />
            <Select
              value={selectedRole}
              style={{ width: '100%' }}
              onChange={setSelectedRole}
            >
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Space>
        </Modal>

        {/* Status Toggle Modal */}
        <Modal
          title={user?.isActive ? "Disable User Account" : "Enable User Account"}
          open={statusModalVisible}
          onOk={handleStatusToggle}
          onCancel={() => setStatusModalVisible(false)}
          okText={user?.isActive ? "Disable" : "Enable"}
          okButtonProps={{ danger: user?.isActive }}
        >
          <Alert
            message={
              user?.isActive
                ? "Are you sure you want to disable this user? They will not be able to login until enabled."
                : "Enable this user account? The user will regain access."
            }
            type={user?.isActive ? "error" : "info"}
            showIcon
          />
        </Modal>

        {/* Stats Cards */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Total Orders"
                value={user?.orderCount || 0}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Items in Cart"
                value={user?.cartCount || 0}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Wishlist Items"
                value={user?.wishlistCount || 0}
                prefix={<HeartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Total Spent"
                value={user?.totalSpent || 0}
                prefix="₹"
                precision={2}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Content */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Activity Timeline" key="1">
              <Timeline
                items={timelineItems.map(item => ({
                  ...item,
                  label: <span style={{ fontSize: 12 }}>{item.timestamp}</span>
                }))}
              />
            </TabPane>

            <TabPane tab={`Orders (${user?.orders?.length || 0})`} key="2">
              <Table
                dataSource={user?.orders}
                columns={[
                  {
                    title: 'Order ID',
                    dataIndex: '_id',
                    render: id => id?.substr(-8)?.toUpperCase()
                  },
                  {
                    title: 'Items',
                    dataIndex: 'items',
                    render: items => items?.map(i => (
                      <div key={i.productId?._id || i.productId}>
                        {i.productId?.name || 'Product'} x {i.quantity}
                      </div>
                    ))
                  },
                  {
                    title: 'Total',
                    dataIndex: 'totalAmount',
                    render: amount => `₹${amount}`
                  },
                  {
                    title: 'Status',
                    dataIndex: 'orderStatus',
                    render: status => (
                      <Tag color={
                        status === 'DELIVERED' ? 'success' :
                        status === 'CANCELLED' ? 'error' : 'processing'
                      }>
                        {status}
                      </Tag>
                    )
                  }
                ]}
                rowKey="_id"
                locale={{ emptyText: 'No orders found' }}
              />
            </TabPane>

            <TabPane tab="Cart & Wishlist" key="3">
              <Row gutter={24}>
                <Col span={12}>
                  <Card title={`Cart Items (${user?.cart?.length || 0})`}>
                    <List
                      dataSource={user?.cart}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Image
                                width={50}
                                src={item.productId?.images?.[0] || 'https://via.placeholder.com/50'}
                                alt={item.productId?.name}
                              />
                            }
                            title={item.productId?.name}
                            description={`Quantity: ${item.quantity}`}
                          />
                          <div>₹{item.productId?.price}</div>
                        </List.Item>
                      )}
                      locale={{ emptyText: 'Cart is empty' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title={`Wishlist (${user?.wishlist?.length || 0})`}>
                    <List
                      dataSource={user?.wishlist}
                      renderItem={product => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Image
                                width={50}
                                src={product?.images?.[0] || 'https://via.placeholder.com/50'}
                                alt={product?.name}
                              />
                            }
                            title={product?.name}
                            description={`₹${product?.price}`}
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: 'Wishlist is empty' }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Account Settings" key="4">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">{user?.displayName}</Descriptions.Item>
                <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>
                <Descriptions.Item label="Status">{user?.isActive ? 'Active' : 'Inactive'}</Descriptions.Item>
                <Descriptions.Item label="Joined">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</Descriptions.Item>
                <Descriptions.Item label="Last Login">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        </Card>
      </Space>
    </div>
  );
};

export default UserDetails;
  