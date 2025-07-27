import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Tag, Space, Statistic, Modal, Button, List } from "antd";
import axios from "axios";
import { API_URL } from "../../../config/constants";

const { Title, Text } = Typography;

const AdminEmiPanel = () => {
  const [emiOrders, setEmiOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmi, setSelectedEmi] = useState(null);

  useEffect(() => {
    fetchEmiOrders();
  }, []);

  const fetchEmiOrders = async () => {
    setLoading(true);
    const res = await axios.get(`${API_URL}/api/emi/admin/orders`, { withCredentials: true });
    setEmiOrders(res.data || []);
    setLoading(false);
  };

  // Overall calculations
  const totalEmi = emiOrders.length;
  const totalAmount = emiOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPaid = emiOrders.reduce((sum, o) =>
    sum + (o.schedule?.filter(s => s.status === "PAID").reduce((a, s) => a + s.amount, 0) || 0), 0
  );

  const columns = [
    { title: "EMI Order ID", dataIndex: "_id", key: "_id" },
    { title: "User", dataIndex: "userId", key: "userId", render: u => u?.displayName || u?.email || "User" },
    { title: "Product", dataIndex: "productId", key: "productId", render: p => p?.name || "Product" },
    { title: "Total Amount", dataIndex: "totalAmount", key: "totalAmount", render: a => `₹${a}` },
    { title: "Monthly", dataIndex: "monthlyAmount", key: "monthlyAmount", render: a => `₹${a}` },
    { title: "Status", dataIndex: "status", key: "status", render: s => <Tag color={s === "COMPLETED" ? "green" : "blue"}>{s}</Tag> },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button size="small" onClick={() => setSelectedEmi(record)}>
          Details
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Admin EMI Control Panel</Title>
      <Space size="large" style={{ marginBottom: 24 }}>
        <Statistic title="Total EMI Orders" value={totalEmi} />
        <Statistic title="Total EMI Amount" value={totalAmount} prefix="₹" />
        <Statistic title="Total Paid" value={totalPaid} prefix="₹" />
      </Space>
      <Card>
        <Table
          columns={columns}
          dataSource={emiOrders}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        open={!!selectedEmi}
        onCancel={() => setSelectedEmi(null)}
        footer={null}
        width={800}
        title="EMI Order Details"
      >
        {selectedEmi && (
          <div>
            <Title level={4}>EMI Order #{selectedEmi._id}</Title>
            <Text>User: {selectedEmi.userId?.displayName || selectedEmi.userId?.email}</Text>
            <br />
            <Text>Product: {selectedEmi.productId?.name}</Text>
            <br />
            <Text>Total Amount: ₹{selectedEmi.totalAmount}</Text>
            <br />
            <Text>Status: <Tag color={selectedEmi.status === "COMPLETED" ? "green" : "blue"}>{selectedEmi.status}</Tag></Text>
            <Divider />
            <Title level={5}>Installment Schedule</Title>
            <List
              dataSource={selectedEmi.schedule}
              renderItem={(item, idx) => (
                <List.Item>
                  <Space>
                    <Text>#{idx + 1}</Text>
                    <Text>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
                    <Text>Amount: ₹{item.amount}</Text>
                    <Tag color={item.status === "PAID" ? "green" : item.status === "LATE" ? "red" : "orange"}>{item.status}</Tag>
                  </Space>
                </List.Item>
              )}
            />
            <Divider />
            <Title level={5}>EMI Payment History</Title>
            <List
              dataSource={selectedEmi.payments || []}
              renderItem={p => (
                <List.Item>
                  <Space>
                    <Text>Installment #{p.scheduleIndex + 1}</Text>
                    <Text>Paid: {p.paidAt ? new Date(p.paidAt).toLocaleString() : "-"}</Text>
                    <Text>Amount: ₹{p.amount}</Text>
                    <Tag color={p.status === "SUCCESS" ? "green" : "red"}>{p.status}</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminEmiPanel;
