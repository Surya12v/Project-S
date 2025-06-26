import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Badge, message } from 'antd';
import { 
  HomeOutlined, ShopOutlined, ShoppingCartOutlined,
  UserOutlined, HeartOutlined, OrderedListOutlined,
  MenuOutlined, DashboardOutlined, SettingOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/constants';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';

const { Header, Content } = Layout;

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

//   useEffect(() => {
//     if (user) {
//       console.log('Layout - Current user:', user);
//     }
//   }, [user]);

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/check-session`, { withCredentials: true });
      const data = res.data;
      setIsAuthenticated(data.authenticated);
      setIsAdmin(data?.user?.role === 'admin');
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      if (res.status === 200) {
        setIsAuthenticated(false);
        navigate('/');
      }
    } catch (error) {
      message.error('Logout failed');
    }
  };

  const adminMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users'
    },
    {
      key: '/admin/products',
      icon: <ShopOutlined />,
      label: 'Products'
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: 'Orders'
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    }
  ];

  const userMenuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: 'Home'
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: 'Products'
    },
    {
      key: '/orders',
      icon: <OrderedListOutlined />,
      label: 'Orders'
    },
    {
      key: '/wishlist',
      icon: <HeartOutlined />,
      label: 'Wishlist'
    }
  ];

  // Array of public routes where menu shouldn't show
  const publicRoutes = ['/', '/auth/callback', '/reset-password'];
  const shouldShowMenu = !publicRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <Layout className="layout">
      {shouldShowMenu && isAuthenticated && (
        <Header 
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1, 
            width: '100%', 
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo" style={{ marginRight: 40 }}>
              <h1 style={{ margin: 0, fontSize: 24 }}>
                {isAdmin ? 'Admin Dashboard' : 'Store'}
              </h1>
            </div>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={isAdmin ? adminMenuItems : userMenuItems}
              onClick={({ key }) => navigate(key)}
              style={{ flex: 1, minWidth: 600 }}
            />
          </div>
          <Space>
            {!isAdmin && (
              <>
                <Badge count={cartCount}>
                  <Button 
                    icon={<ShoppingCartOutlined />} 
                    onClick={() => navigate('/cart')}
                  >
                    Cart
                  </Button>
                </Badge>
                <Button 
                  icon={<UserOutlined />}
                  onClick={() => navigate('/account')}
                >
                  Account
                </Button>
              </>
            )}
            <Button 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              danger
            >
              Logout
            </Button>
          </Space>
        </Header>
      )}
      <Content style={{ 
        padding: shouldShowMenu && isAuthenticated ? '0 24px' : 0,
        minHeight: 'calc(100vh - 64px)'
      }}>
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;
