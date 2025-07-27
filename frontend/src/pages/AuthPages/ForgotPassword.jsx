import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  notification,
  Alert
} from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../store/slices/authSlice';

const { Title, Text, Link } = Typography;

const ForgotPassword = ({ onBack }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading, forgotPasswordSuccess, error } = useSelector(state => state.auth);

  const handleSubmit = async (values) => {
    try {
      await dispatch(forgotPassword({ email: values.email })).unwrap();
      notification.success({
        message: 'Success',
        description: 'Password reset link sent to your email.'
      });
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err || 'Something went wrong'
      });
    }
  };

  return (
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
          onClick={onBack}
          style={{ marginBottom: 24 }}
          type="link"
        >
          Back to Login
        </Button>

        <Title level={2} style={{ textAlign: 'center' }}>Forgot Password</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Enter your email to receive a password reset link
        </Text>

        {forgotPasswordSuccess && (
          <Alert
            message="Success"
            description="If your email exists, a reset link has been sent."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              style={{ borderRadius: 8, height: 46 }}
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
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
};

export default ForgotPassword;

