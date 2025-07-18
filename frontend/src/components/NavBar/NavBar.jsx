import React, { useEffect } from 'react';
import { Menu, Button, Space } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  ShoppingOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { AUTH_ROUTES } from '../../config/constants';
import { Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, logout } from '../../store/slices/authSlice';

const NavBar = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const isAdmin = user?.role === 'admin';

  const handleMenuClick = ({ key }) => {
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
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    window.location.href = AUTH_ROUTES.LOGOUT;
  };

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
    ...(isAdmin
      ? [
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
        ]
      : []),
  ];

  return (
    <div
      style={{
        padding: 0,
        background: 'rgb(0, 0, 0)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Typography.Title
          level={3}
          style={{ color: 'white', margin: 0 }}
          onClick={() => navigate('/home')}
        >
          HOME
        </Typography.Title>
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
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
          icon={<HeartOutlined />}
          onClick={() => navigate('/wishlist')}
          style={{
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            marginRight: 8
          }}
        />
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
        <Button
          type="text"
          icon={<UserOutlined />}
          onClick={() => navigate('/account')}
          style={{
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            marginRight: 8
          }}
        />
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
    </div>
  );
};

export default NavBar;
