import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, message, Space, Spin, Typography, Empty, Layout } from "antd";
import { useDispatch } from "react-redux";
import { payEmiInstallment } from "../../store/slices/orderSlice";
import axios from "axios";
import { API_URL } from "../../config/constants";
import NavBar from "../NavBar/NavBar";
import PaymentOptions from "../Payment/PaymentOptions";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { createRazorpayOrder } from "../../services/payment";
const { Title } = Typography;
const { Header, Content } = Layout;

// Standalone component: Displays all EMI orders for the logged-in user
const EmiOrderPayment = () => {
  const dispatch = useDispatch();
  const [emiOrders, setEmiOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState({}); // { [emiOrderId]: idx }
  const [paymentModal, setPaymentModal] = useState({ visible: false, emiOrder: null, idx: null });

  // Fetch all EMI orders for the logged-in user
  const fetchEmiOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/emi/my`, { withCredentials: true });
      setEmiOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      setEmiOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmiOrders();
  }, []);

  const handlePay = async (emiOrderId, idx) => {
    // Find the EMI order and installment amount
    const emiOrder = emiOrders.find(e => e._id === emiOrderId);
    const installment = emiOrder?.schedule?.[idx];
    if (!emiOrder || !installment) return;

    setPaying((prev) => ({ ...prev, [emiOrderId]: idx }));

    try {
      // 1. Create Razorpay order for this installment
      const razorpayOrder = await createRazorpayOrder(installment.amount, {
        emiOrderId,
        installment: idx + 1,
        product: emiOrder.productId?.name,
      });

      // 2. Open Razorpay modal
      setPaymentModal({ visible: true, emiOrder, idx });

      openRazorpayCheckout(
        razorpayOrder,
        {
          name: emiOrder.productId?.name || "EMI Installment",
          email: "", // Optionally pass user email
          phone: "", // Optionally pass user phone
        },
        {
          onSuccess: async (response) => {
            try {
              // 3. Mark installment as paid in backend
              await dispatch(
                payEmiInstallment({
                  orderId: emiOrderId,
                  userId: emiOrder.userId,
                  installmentNumber: idx + 1,
                  paymentDetails: {
                    method: "ONLINE",
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                })
              ).unwrap();
              message.success("EMI installment paid!");
              fetchEmiOrders();
            } catch {
              message.error("Payment succeeded but failed to update EMI status.");
            } finally {
              setPaying((prev) => ({ ...prev, [emiOrderId]: null }));
              setPaymentModal({ visible: false, emiOrder: null, idx: null });
            }
          },
          onFailure: () => {
            message.error("Payment failed or cancelled");
            setPaying((prev) => ({ ...prev, [emiOrderId]: null }));
            setPaymentModal({ visible: false, emiOrder: null, idx: null });
          },
        }
      );
    } catch {
      message.error("Failed to initiate payment");
      setPaying((prev) => ({ ...prev, [emiOrderId]: null }));
      setPaymentModal({ visible: false, emiOrder: null, idx: null });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", margin: "48px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!emiOrders.length) {
    return (
         <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
     <Header style={{ padding: 0, background: 'transparent' }}>
        <NavBar />
      </Header>
      <Card style={{ margin: 24 }}>
        <Empty description="No EMI orders found." />
      </Card>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Header style={{ padding: 0, background: 'transparent' }}>
        <NavBar />
      </Header>
      <div style={{ margin: 24 }}>
        <Title level={3} style={{ marginBottom: 24 }}>My EMI Orders</Title>
        {emiOrders.map((emiOrder) => {
          const columns = [
            { title: "Installment", dataIndex: "installment", key: "installment" },
            { title: "Due Date", dataIndex: "dueDate", key: "dueDate", render: d => new Date(d).toLocaleDateString() },
            { title: "Amount", dataIndex: "amount", key: "amount", render: a => `₹${a}` },
            { 
              title: "Status", 
              dataIndex: "status", 
              key: "status", 
              render: s => <Tag color={s === "PAID" ? "green" : s === "LATE" ? "red" : "orange"}>{s}</Tag> 
            },
            {
              title: "Action",
              key: "action",
              render: (_, record, idx) =>
                record.status === "DUE" ? (
                  <Button
                    type="primary"
                    size="small"
                    loading={paying[emiOrder._id] === idx}
                    onClick={() => handlePay(emiOrder._id, idx)}
                  >
                    Pay Now
                  </Button>
                ) : null,
            },
          ];

          return (
            <Card
              key={emiOrder._id}
              title={
                <Space>
                  EMI for <b>{emiOrder.productId?.name || "Product"}</b>
                  <Tag color={emiOrder.status === "COMPLETED" ? "green" : "blue"}>{emiOrder.status}</Tag>
                </Space>
              }
              style={{ marginBottom: 32 }}
              extra={
                <Space>
                  <span>
                    Total: <b>₹{emiOrder.totalAmount?.toLocaleString()}</b>
                  </span>
                  <span>
                    Monthly: <b>₹{emiOrder.monthlyAmount?.toLocaleString()}</b>
                  </span>
                </Space>
              }
            >
              <Table
                dataSource={emiOrder.schedule.map((item, idx) => ({
                  ...item,
                  installment: idx + 1,
                  rowStyle: item.status === "PAID" ? { textDecoration: "line-through", opacity: 0.6 } : {},
                }))}
                columns={columns}
                rowKey={(row) => row.dueDate + row.installment}
                pagination={false}
                rowClassName={row => row.status === "PAID" ? "emi-row-paid" : ""}
              />
            </Card>
          );
        })}
      </div>
      {/* Optionally, you can show a modal or overlay here if needed */}
    </Layout>
  );
};

export default EmiOrderPayment;

// Add this style (can be in a CSS/SCSS file or in a <style> tag)
<style>
{`
  .emi-row-paid td {
    text-decoration: line-through;
    opacity: 0.6;
  }
`}
</style>
