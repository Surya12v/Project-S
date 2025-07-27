import React, { useEffect } from 'react';
import { Table, Tag, Typography, Space, Card, message, Button } from 'antd';
import {
  UserOutlined, LockOutlined, SettingOutlined, MailOutlined, PhoneOutlined, EditOutlined, UploadOutlined, DeleteOutlined, CreditCardOutlined, HomeOutlined, HeartOutlined, BellOutlined, HistoryOutlined, LogoutOutlined, ExclamationCircleOutlined, ShoppingCartOutlined, CheckCircleOutlined, ClockCircleOutlined, TruckOutlined, StarOutlined, GiftOutlined, QuestionCircleOutlined, SafetyOutlined, WalletOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/constants';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';
import axios from 'axios';
import NavBar from '../../components/NavBar/NavBar';

const { Title } = Typography;

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: orders, loading, error } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleCardClick = (e, orderId) => {
    navigate(`/orders/summary/${orderId}`);
  };

  const columns = [
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {items?.map((item, index) => (
            <li key={index}>
              {item.productId?.name} x {item.quantity}
            </li>
          ))}
        </ul>
      )
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => (
        <Tag color={
          status === 'DELIVERED' ? 'green' :
          status === 'SHIPPED' ? 'blue' :
          status === 'CANCELLED' ? 'red' : 'gold'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'PAID' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions', 
      render: (_, order) => (
        <Space>
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => handleCardClick(null, order._id)}
          >
            View Details
          </Button>
          <Button size="small" icon={<TruckOutlined />}>
            Track
          </Button>
          {order.orderStatus === 'DELIVERED' && (
            <Button size="small" icon={<StarOutlined />}>
              Review
            </Button>
          )}
        </Space>
      )
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <NavBar />
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={2}>My Orders</Title>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <Card>
          <Table 
            columns={columns} 
            dataSource={orders}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} orders`
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default Orders;
