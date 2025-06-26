import React, { useEffect, useState } from 'react';
import { Button, Layout, Typography, Card, Avatar, Row, Col, Statistic, Badge, Space, Divider, Spin, Menu } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  MailOutlined, 
  FieldTimeOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  SettingOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AUTH_ROUTES, API_URL } from '../../config/constants';
import axios from 'axios';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        const data = res.data;
        if (data) setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    window.location.href = AUTH_ROUTES.LOGOUT;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMenuClick = (key) => {
    switch (key) {
      case 'products':
        navigate('/products');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'admin-users':
        navigate('/admin/users');
        break;
      case 'admin-products':
        navigate('/admin/products');
        break;
      case 'admin-orders':
        navigate('/admin/orders');
        break;
        case 'dashboard':
        navigate('/admin/dashboard');
      default:
        break;
    }
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Products',
    },
    {
      key: 'orders',
      icon: <UnorderedListOutlined />,
      label: 'My Orders',
    },
    // Only show admin menu if user is admin
    ...(isAdmin ? [
      {
        key: 'admin',
        icon: <AppstoreOutlined />,
        label: 'Admin',
        children: [
          {
            key: 'admin-users',
            icon: <UserOutlined />,
            label: 'All Users',
          },
          {
            key: 'admin-products',
            icon: <ShoppingCartOutlined />,
            label: 'Manage Products',
          },
          {
            key: 'admin-orders',
            icon: <UnorderedListOutlined />,
            label: 'Manage Orders',
          },
        ],
      },
    ] : []),
  ];

  // Add role indicator in profile section
  const getRoleBadge = () => (
    <div style={{ 
      background: isAdmin ? 'rgba(82,196,26,0.2)' : 'rgba(255,255,255,0.2)', 
      borderRadius: '20px', 
      padding: '8px 16px',
      display: 'inline-block'
    }}>
      <Text style={{ color: 'white', fontSize: '14px' }}>
        <StarOutlined style={{ marginRight: 8 }} />
        {isAdmin ? 'Admin' : 'Customer'}
      </Text>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Header style={{ 
        padding: 0,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '0 24px'
        }}>
          {/* <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <TrophyOutlined style={{ color: 'white', fontSize: '20px' }} />
          </div> */}
          {/* <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 300 }}>
            Dashboard
          </Title> */}
        </div>

        <Menu
          mode="horizontal"
          onClick={({ key }) => handleMenuClick(key)}
          items={menuItems}
          style={{
            flex: 1,
            background: 'transparent',
            borderBottom: 'none',
            color: 'white'
          }}
          theme="dark"
        />

        <Space style={{ padding: '0 24px' }}>
          <Button
            type="text"
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate('/cart')}
            style={{ 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.3)',
              marginRight: 8 
            }}
          />
          {/* <Button
            type="text"
            icon={<SettingOutlined />}
            style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Settings
          </Button> */}
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ 
              borderRadius: '20px',
              background: 'linear-gradient(45deg, #ff416c, #ff4b2b)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(255,65,108,0.4)'
            }}
          >
            Logout
          </Button>
        </Space>
      </Header>
      
      <Content style={{ padding: '32px', background: 'transparent' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', marginBottom: 8, fontWeight: 300 }}>
            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'there'}! 👋
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Welcome back to your dashboard. Here's what's happening today.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* User Profile Card */}
          <Col xs={24} lg={10}>
            <Card
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              {/* Profile Header with Gradient Background */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '-32px -32px 24px -32px',
                padding: '32px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <Badge 
                  count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                  offset={[-10, 10]}
                >
                  <Avatar
                    size={120}
                    src={user?.image}
                    icon={!user?.image && <UserOutlined />}
                    style={{ 
                      border: '4px solid white',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                    }}
                  />
                </Badge>
                <Title level={3} style={{ color: 'white', marginTop: 16, marginBottom: 8 }}>
                  {user?.displayName || 'User'}
                </Title>
                {getRoleBadge()}
              </div>

              {/* Profile Details */}
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Email Address
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <Text style={{ fontSize: '16px' }}>{user?.email}</Text>
                  </div>
                </div>

                <div>
                  <Text strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Member Since
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <FieldTimeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <Text style={{ fontSize: '16px' }}>
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Last Login
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    <Text style={{ fontSize: '16px' }}>
                      {user?.lastLogin ? formatDate(user.lastLogin) : 'Today'}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Statistics Section */}
          <Col xs={24} lg={14}>
            <Row gutter={[24, 24]}>
              {/* Quick Stats Row */}
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={12}>
                    <Card
                      style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 10px 30px rgba(102,126,234,0.3)'
                      }}
                      bodyStyle={{ padding: '20px', textAlign: 'center' }}
                    >
                      <div style={{ color: 'white' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {formatDate(user?.createdAt)}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          Member Since
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} sm={12}>
                    <Card
                      style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        border: 'none',
                        boxShadow: '0 10px 30px rgba(168,237,234,0.3)'
                      }}
                      bodyStyle={{ padding: '20px', textAlign: 'center' }}
                    >
                      <div style={{ color: '#333' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {user?.googleId ? 'Google' : 'Email'}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>
                          Login Method
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* User Info Card */}
              <Col span={24}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      <span>User Information</span>
                    </div>
                  }
                  style={{
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Statistic
                      title="Email"
                      value={user?.email}
                      prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                    />
                    <Statistic
                      title="Account Status"
                      value="Active"
                      prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    />
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Home;