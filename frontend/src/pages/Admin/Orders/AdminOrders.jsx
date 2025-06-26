import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Select, Typography, Card, message } from 'antd';
import axios from 'axios';
import { API_URL } from '../../../config/constants';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const columns = [
    {
      title: 'Order Number',
      dataIndex: '_id',
      width: 200,
      render: (id) => `ORDER-${id.substr(-6).toUpperCase()}` // Only show last 6 chars
    },
    {
      title: 'Customer',
      dataIndex: 'userId',
      render: (user) => (
        <span>{user?.displayName || 'Anonymous'}</span>
      )
    },
    {
      title: 'Items',
      dataIndex: 'items',
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
      title: 'Amount',
      dataIndex: 'totalAmount',
      render: (amount) => `₹${amount?.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      render: (status) => (
        <Tag color={
          status === 'DELIVERED' ? 'green' :
          status === 'SHIPPED' ? 'blue' :
          status === 'PLACED' ? 'gold' :
          status === 'CANCELLED' ? 'red' : 'orange'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'PAID' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary"
          disabled={record.orderStatus === 'CANCELLED'}
          onClick={() => {
            setSelectedOrder(record);
            setModalVisible(true);
          }}
        >
          Update Status
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/all`, { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to fetch orders');
      const data = response.data;
      
      // Mask sensitive data before setting to state
      const maskedOrders = data.map(order => ({
        ...order,
        _id: order._id, // Will be masked by render function
        userId: {
          ...order.userId,
          _id: undefined, // Remove user ID from display
          email: order.userId?.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
        }
      }));
      
      setOrders(Array.isArray(data) ? maskedOrders : []);
    } catch (error) {
      message.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/api/orders/admin/${selectedOrder._id}/status`, { status: newStatus }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.status !== 200) throw new Error('Failed to update status');

      message.success('Order status updated successfully');
      fetchOrders();
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={2}>Manage Orders</Title>
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

        <Modal
          title="Update Order Status"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Current Status: </Text>
              <Tag color={
                selectedOrder?.orderStatus === 'DELIVERED' ? 'green' :
                selectedOrder?.orderStatus === 'SHIPPED' ? 'blue' :
                selectedOrder?.orderStatus === 'CANCELLED' ? 'red' : 'gold'
              }>
                {selectedOrder?.orderStatus}
              </Tag>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="Select new status"
              onChange={handleStatusUpdate}
            >
              <Option value="PLACED">PLACED</Option>
              <Option value="CONFIRMED">CONFIRMED</Option>
              <Option value="SHIPPED">SHIPPED</Option>
              <Option value="DELIVERED">DELIVERED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
            </Select>
          </Space>
        </Modal>
      </Space>
    </div>
  );
};

export default AdminOrders;

