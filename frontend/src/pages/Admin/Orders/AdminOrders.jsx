import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Select, Typography, Card, message } from 'antd';
import NavBar from '../../../components/NavBar/NavBar';
import { useDispatch, useSelector } from 'react-redux';
// Use adminOrderSlice instead of orderSlice
import { fetchAllOrders, updateOrderStatus } from '../../../store/slices/adminOrderSlice';
import { useUser } from '../../../contexts/UserContext';
const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrders = () => {
  console.log("AdminOrders component rendered");
  const dispatch = useDispatch();
  const { items: orders = [], loading, updating } = useSelector(state => state.adminOrders) || {};  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user, loading: userLoading } = useUser(); 

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
    if (!userLoading && user && user.role === 'admin') {
      dispatch(fetchAllOrders());
    }
  }, [dispatch, user, userLoading]);

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      await dispatch(updateOrderStatus({ orderId: selectedOrder._id, status: newStatus })).unwrap();
      message.success('Order status updated successfully');
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <NavBar />
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={2}>Manage Orders</Title>
        <Card>
          <Table 
            columns={columns} 
            dataSource={orders}
            loading={loading || updating}
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
              disabled={updating}
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



