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
import { AUTH_ROUTES } from '../../config/constants';

const { Title, Text, Link } = Typography;

const ForgotPassword = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_ROUTES.GOOGLE.replace('/google', '')}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Reset link generated successfully'
        });
        // For development: show the reset link
        if (data.dev?.resetLink) {
          setResetLink(data.dev.resetLink);
        }
      } else {
        notification.error({
          message: 'Error',
          description: data.message || 'Something went wrong'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to connect to server'
      });
    }
    setLoading(false);
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

        {resetLink && (
          <Alert
            message="Development Mode"
            description={
              <div>
                Reset Link (Development Only):<br/>
                <Link href={resetLink} target="_blank">{resetLink}</Link>
              </div>
            }
            type="info"
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
