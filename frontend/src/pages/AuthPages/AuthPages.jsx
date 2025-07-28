/**
 * Authentication Page Component
 * 
 * Provides user interface for:
 * - Google OAuth authentication
 * - Email/password login
 * - User registration
 * 
 * Features:
 * - Responsive design using Material-UI
 * - Form validation
 * - Loading states
 * - Password visibility toggle
 * - Smooth transitions between login/signup
 * 
 * Uses environment variables for API configuration
 */

import React, { useState } from 'react';
import 'antd/dist/reset.css'; // Add this line
import {
  Card,
  Form,
  Input,
  Button,
  Divider,
  Typography,
  Avatar,
  Spin,
  notification,
  Progress,
  Checkbox,
  Space,
  message
} from 'antd';
import {
  GoogleOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowLeftOutlined,
  GithubOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AUTH_ROUTES } from '../../config/constants';
import axios from 'axios';
import { getCsrfToken } from '../../utils/csrf';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, loginThunk, signupThunk } from '../../store/slices/authSlice';
import ForgotPassword from './ForgotPassword';
const { Title, Text, Paragraph } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const AuthPages = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);
  const { loading: authLoading, user, isAuthenticated, error } = authState;

  const showNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
    });
  };

  const handleGoogleAuth = async () => {
    // No API call, just redirect
    window.location.href = AUTH_ROUTES.GOOGLE;
  };

const handleSubmit = async (values) => {
  try {
    if (currentPage === 'signup') {
      await dispatch(signupThunk(values)).unwrap();
    } else {
      await dispatch(loginThunk(values)).unwrap();
    }

    await dispatch(checkAuth()).unwrap();

    showNotification('success', 'Success!', 'You have successfully logged in.');
    window.location.href = '/home';
  } catch (error) {
    showNotification('error', 'Error', error.message || 'Something went wrong');
  }
};



  const LoginPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          margin: '0 auto',
          padding: '32px 24px',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Avatar size={80} icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#1890ff',
              boxShadow: '0 4px 12px rgba(24,144,255,0.3)'
            }} 
          />
          <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>Welcome Back</Title>
          <Paragraph type="secondary">Sign in to continue to your account</Paragraph>
        </div>

        <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 24 }}>
          <Button
            block
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleAuth}
            loading={loading}
            style={{ 
              height: 46,
              borderRadius: 8,
              backgroundColor: '#fff',
              borderColor: '#ddd'
            }}
          >
            Continue with Google
          </Button>
         
        </Space>

        <Divider style={{ margin: '24px 0' }}>or continue with email</Divider>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined className="text-primary" />}
              placeholder="Email"
              style={{ borderRadius: 8, height: 46 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-primary" />}
              placeholder="Password"
              style={{ borderRadius: 8, height: 46 }}
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Button 
              type="link" 
              onClick={() => setCurrentPage('forgot-password')} 
              style={{ padding: 0 }}
            >
              Forgot Password?
            </Button>
          </Space>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ height: 46, borderRadius: 8 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Button type="link" onClick={() => setCurrentPage('signup')} style={{ padding: 0 }}>
            Sign up here
          </Button>
        </Text>
      </Card>
    </motion.div>
  );

  const SignupPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          margin: '0 auto',
          padding: '32px 24px',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => setCurrentPage('login')}
          style={{ marginBottom: 24 }}
          type="link"
        >
          Back to Login
        </Button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#52c41a',
              boxShadow: '0 4px 12px rgba(82,196,26,0.3)'
            }} 
          />
          <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>Create Account</Title>
          <Paragraph type="secondary">Join us today and get started</Paragraph>
        </div>

        <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 24 }}>
          <Button
            block
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleAuth}
            loading={loading}
            style={{ 
              height: 46,
              borderRadius: 8,
              backgroundColor: '#fff',
              borderColor: '#ddd'
            }}
          >
            Sign up with Google
          </Button>
          
        </Space>

        <Divider style={{ margin: '24px 0' }}>or sign up with email</Divider>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: 'Required' }]}
              style={{ flex: 1 }}
            >
              <Input 
                size="large"
                placeholder="First Name"
                style={{ borderRadius: 8, height: 46 }}
              />
            </Form.Item>
            <Form.Item
              name="lastName"
              rules={[{ required: true, message: 'Required' }]}
              style={{ flex: 1 }}
            >
              <Input 
                size="large"
                placeholder="Last Name"
                style={{ borderRadius: 8, height: 46 }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined className="text-primary" />}
              placeholder="Email"
              style={{ borderRadius: 8, height: 46 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              {
                pattern: /[A-Z]/,
                message: 'Password must contain at least one uppercase letter!'
              },
              {
                pattern: /[0-9]/,
                message: 'Password must contain at least one number!'
              },
              {
                pattern: /[^A-Za-z0-9]/,
                message: 'Password must contain at least one special character!'
              }
            ]}
            extra={
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Password must:
                  <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                    <li>Be at least 8 characters long</li>
                    <li>Contain at least one uppercase letter</li>
                    <li>Contain at least one number</li>
                    <li>Contain at least one special character</li>
                  </ul>
                </Text>
              </div>
            }
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-primary" />}
              placeholder="Password"
              style={{ borderRadius: 8, height: 46 }}
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-primary" />}
              placeholder="Confirm Password"
              style={{ borderRadius: 8, height: 46 }}
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ height: 46, borderRadius: 8 }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Already have an account?{' '}
          <Button type="link" onClick={() => setCurrentPage('login')} style={{ padding: 0 }}>
            Sign in here
          </Button>
        </Text>
      </Card>
    </motion.div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Spin size="large" />
        </div>
      )}
      {currentPage === 'login' ? (
        <LoginPage />
      ) : currentPage === 'signup' ? (
        <SignupPage />
      ) : (
        <ForgotPassword onBack={() => setCurrentPage('login')} />
      )}
    </div>
  );
};

export default AuthPages;