import React, { useEffect } from 'react';
import { 
  Table, Card, Button, Space, Tag, Avatar, Typography,
  Badge, Tooltip, Input, Select, Modal, message, Menu 
} from 'antd';
import { 
  UserOutlined, SearchOutlined, FilterOutlined,
  ShoppingOutlined, HeartOutlined, ShoppingCartOutlined,
  LockOutlined, UnlockOutlined, CrownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/constants';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminUsers, toggleUserStatus } from '../../../store/slices/userSlice';
import Navbar from '../../../components/NavBar/NavBar';
const { Title, Text } = Typography;

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { items: users, loading, error } = useSelector(state => state.users);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // Use slice for status toggle
  const handleToggleStatus = (userId) => {
    dispatch(toggleUserStatus(userId))
      .unwrap()
      .then(() => {
        message.success('User status updated');
      })
      .catch(() => {
        message.error('Failed to update user status');
      });
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, user) => (
        <Space>
          <Avatar 
            src={user.image ? user.image : undefined} 
            icon={!user.image && <UserOutlined />} 
          />
          <Space direction="vertical" size={0}>
            <Text strong>{user.displayName}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {user.email}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, user) => (
        <Space>
          <Badge status={user?.isActive ? 'success' : 'error'} />
          <Tag color={user?.role === 'admin' ? 'gold' : 'blue'}>
            {(user?.role || 'user').toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Activity',
      key: 'activity',
      render: (_, user) => (
        <Space>
          <Tooltip title="Orders">
            <Badge count={user.orderCount || 0} showZero>
              <ShoppingCartOutlined style={{ fontSize: '20px' }} />
            </Badge>
          </Tooltip>
          <Tooltip title="Wishlist">
            <Badge count={user.wishlistCount || 0} showZero>
              <HeartOutlined style={{ fontSize: '20px' }} />
            </Badge>
          </Tooltip>
          <Tooltip title="Cart">
            <Badge count={user.cartCount || 0} showZero>
              <ShoppingOutlined style={{ fontSize: '20px' }} />
            </Badge>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <Space>
          <Button 
            type="primary"
            onClick={() => navigate(`/admin/users/${user._id}`)}
          >
            View Details
          </Button>
          <Button 
            icon={user.isActive ? <LockOutlined /> : <UnlockOutlined />}
            danger={user.isActive}
            onClick={() => handleToggleStatus(user._id)}
          >
            {user.isActive ? 'Disable' : 'Enable'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Navbar />
      <Card>
        {/* Admin Menu */}
        {/* Uncomment the Menu below if you want the admin navigation */}
        {/* 
        <Menu
          mode="horizontal"
          selectedKeys={['/admin/users']}
          items={adminMenuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginBottom: 24 }}
        />
        */}
        {/* No dashboard stats or Dashboard component here, so no 404 or JSON error */}
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space justify="space-between" style={{ width: '100%' }}>
            <Title level={2}>Manage Users</Title>
            <Space>
              <Input 
                placeholder="Search users" 
                prefix={<SearchOutlined />} 
                style={{ width: 200 }}
              />
              <Select 
                defaultValue="all" 
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'admin', label: 'Admins' },
                  { value: 'user', label: 'Users' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </Space>
          </Space>
          {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
          <Table 
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} users`
            }}
          />
        </Space>
      </Card>
    </div>
  );
};


export default AdminUsers;
