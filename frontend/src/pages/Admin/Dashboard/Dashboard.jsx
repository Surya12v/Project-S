import React, { useEffect, useState } from 'react';
import { 
  Card, Row, Col, Statistic, Typography, Space, Menu,
  Progress, Table, Button, Tag, Timeline
} from 'antd';
import { 
  UserOutlined, ShoppingCartOutlined, DollarOutlined,
  ShopOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CrownOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/constants';

const { Title, Text } = Typography;

const adminMenuItems = [
  {
    key: '/admin/dashboard',
    icon: <CrownOutlined />,
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
    icon: <UnorderedListOutlined />,
    label: 'Orders'
  }
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0 },
    products: { total: 0, active: 0 },
    orders: { total: 0, pending: 0 },
    revenue: { total: 0, today: 0 }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Dashboard stats:', data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Card that shows overview statistics
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card hoverable loading={loading}>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
      {subtitle && <Text type="secondary">{subtitle}</Text>}
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* <Menu
          mode="horizontal"
          selectedKeys={['/admin/dashboard']}
          items={adminMenuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginBottom: 24 }}
        /> */}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Dashboard Overview</Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Users"
                value={stats.userCount}
                icon={<UserOutlined />}
                color="#1890ff"
                subtitle={`${stats.userCount} users`}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Products"
                value={stats.productCount}
                icon={<ShopOutlined />}
                color="#52c41a"
                subtitle={`${stats.productCount} products`}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Orders"
                value={stats.orderCount}
                icon={<ShoppingCartOutlined />}
                color="#722ed1"
                subtitle={`${stats.orderCount} orders`}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Revenue"
                value={stats.revenue}
                icon={<DollarOutlined />}
                color="#fa8c16"
                subtitle={`₹${stats.revenue} today`}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Recent Orders */}
            <Col xs={24} lg={12}>
              <Card title="Recent Orders" extra={<Button type="link">View All</Button>}>
                <Timeline
                  items={[
                    {
                      color: 'green',
                      children: 'Order #123 completed'
                    },
                    {
                      color: 'blue',
                      children: 'Order #124 shipped'
                    },
                    {
                      color: 'red',
                      children: 'Order #125 cancelled'
                    }
                  ]}
                />
              </Card>
            </Col>

            {/* Stock Alerts */}
            <Col xs={24} lg={12}>
              <Card title="Low Stock Alerts" extra={<Button type="link">View All</Button>}>
                <Table 
                  dataSource={[
                    { id: 1, name: 'Product 1', stock: 5 },
                    { id: 2, name: 'Product 2', stock: 3 }
                  ]}
                  columns={[
                    { title: 'Product', dataIndex: 'name' },
                    { 
                      title: 'Stock', 
                      dataIndex: 'stock',
                      render: (stock) => (
                        <Tag color={stock < 5 ? 'red' : 'orange'}>{stock} units</Tag>
                      )
                    }
                  ]}
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Performance Metrics */}
            <Col xs={24}>
              <Card title="Performance Metrics">
                <Row gutter={16}>
                  <Col span={8}>
                    <Progress 
                      type="dashboard"
                      percent={75}
                      format={() => '75%'}
                      title="Order Completion Rate"
                    />
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text strong>Order Completion</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Progress
                      type="dashboard"
                      percent={88}
                      format={() => '88%'}
                      strokeColor="#52c41a"
                    />
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text strong>Customer Satisfaction</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Progress
                      type="dashboard"
                      percent={92}
                      format={() => '92%'}
                      strokeColor="#722ed1"
                    />
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text strong>Delivery Success</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;
