import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, notification } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AUTH_ROUTES } from '../../config/constants';
import axios from 'axios';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post(
        `${AUTH_ROUTES.GOOGLE.replace('/google', '')}/reset-password/${token}`,
        { password: values.password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      
      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Password has been reset successfully'
        });
        navigate('/');
      } else {
        notification.error({
          message: 'Error',
          description: data.message || 'Failed to reset password'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to connect to server'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card style={{
        width: '100%',
        maxWidth: 450,
        margin: '0 auto',
        padding: '32px 24px',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        <Title level={2} style={{ textAlign: 'center' }}>Reset Password</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Enter your new password
        </Text>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              size="large"
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
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
};

export default ResetPassword;
