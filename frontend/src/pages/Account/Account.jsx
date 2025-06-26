import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Button, Form, Input, Avatar, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { API_URL } from '../../config/constants';

const { Title } = Typography;
const { TabPane } = Tabs;

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>My Account</Title>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Profile" key="1" icon={<UserOutlined />}>
            <Form layout="vertical" initialValues={user}>
              <Form.Item label="Name" name="name">
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Update Profile</Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Security" key="2" icon={<LockOutlined />}>
            <Form layout="vertical">
              <Form.Item label="Current Password" name="currentPassword">
                <Input.Password />
              </Form.Item>
              <Form.Item label="New Password" name="newPassword">
                <Input.Password />
              </Form.Item>
              <Form.Item label="Confirm Password" name="confirmPassword">
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Change Password</Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Settings" key="3" icon={<SettingOutlined />}>
            {/* Add account settings here */}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Account;
