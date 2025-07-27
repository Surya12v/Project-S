import React, { useState, useEffect } from "react";
import { Card, Select, InputNumber, Typography, Table, Tag, Button, Space, message, Modal } from "antd";
import { calculateEMI } from "../../utils/emiUtils";
import axios from "axios";
import { API_URL } from "../../config/constants";

const { Title, Text } = Typography;
const { Option } = Select;

const EmiModule = ({
  productId,
  price,
  onSelectEmiPlan,
  selectedPlan,
  disabled,
  showSchedule = false,
  emiOrder,
  plans: propPlans // <-- Accept plans as prop
}) => {
  const [plans, setPlans] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState();
  const [selectedRate, setSelectedRate] = useState();
  const [monthly, setMonthly] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [emiSchedule, setEmiSchedule] = useState([]);

  // Fetch EMI plans for this product
  useEffect(() => {
    if (!productId) return;
    const fetchPlans = async () => {
      if (Array.isArray(propPlans) && propPlans.length > 0) {
        setPlans(propPlans);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/emi/plans/${productId}`, { withCredentials: true });
        console.log(`Fetched EMI plans for product ${productId}:`, res.data);
        if (Array.isArray(res.data?.emiPlans)) {
          setPlans(res.data.emiPlans);
        } else if (Array.isArray(res.data?.durations)) {
          setPlans(res.data.durations);
        } else {
          setPlans([]);
        }
        // console.log(`Fetched EMI plans for product ${productId}:`, res.data);
      } catch {
        setPlans([]);
      }
    };
    fetchPlans();
  }, [productId, propPlans]);

  // Calculate EMI when plan changes
  useEffect(() => {
    if (selectedDuration && selectedRate) {
      setMonthly(calculateEMI(price, selectedDuration, selectedRate));
    }
  }, [selectedDuration, selectedRate, price]);

  // Handle plan selection
  const handlePlanChange = (value) => {
    const [months, interestRate] = value.split("-").map(Number);
    setSelectedDuration(months);
    setSelectedRate(interestRate);
    const planObj = plans.find(
      (p) => p.months === months && p.interestRate === interestRate
    );
    if (onSelectEmiPlan) {
      onSelectEmiPlan({
        months,
        interestRate,
        monthly: calculateEMI(price, months, interestRate),
        ...planObj
      });
    }
  };

  // Fetch EMI schedule for user EMI order (if needed)
  useEffect(() => {
    if (emiOrder && emiOrder._id) {
      setEmiSchedule(emiOrder.schedule || []);
    }
  }, [emiOrder]);

  // Table columns for EMI schedule
  const scheduleColumns = [
    { title: "Installment", dataIndex: "installment", key: "installment" },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate", render: d => new Date(d).toLocaleDateString() },
    { title: "Amount", dataIndex: "amount", key: "amount", render: a => `₹${a}` },
    { title: "Status", dataIndex: "status", key: "status", render: s => <Tag color={s === "PAID" ? "green" : s === "LATE" ? "red" : "orange"}>{s}</Tag> },
    {
      title: "Action",
      key: "action",
      render: (_, record, idx) =>
        record.status === "DUE" ? (
          <Button type="primary" size="small" onClick={() => handlePayInstallment(idx)}>
            Pay Now
          </Button>
        ) : null,
    },
  ];

  // Pay EMI installment (simulate API)
  const handlePayInstallment = async (idx) => {
    try {
      await axios.post(`${API_URL}/api/emi/${emiOrder._id}/pay/${idx}`, {}, { withCredentials: true });
      message.success("Payment successful");
      // Refresh schedule (in real app, refetch from backend)
      setEmiSchedule((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, status: "PAID", paidAt: new Date() } : item))
      );
    } catch {
      message.error("Payment failed");
    }
  };

  // Admin EMI management (for admin panel)
  // You can add admin-specific props and controls as needed

  return (
    <Card title="EMI Options" style={{ marginBottom: 24 }}>
      {plans.length === 0 ? (
        <Text type="secondary">No EMI plans available for this product.</Text>
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            <Text strong>Select EMI Plan:</Text>
            <Select
              style={{ width: 300, marginLeft: 16 }}
              placeholder="Choose duration"
              onChange={handlePlanChange}
              disabled={disabled}
              value={selectedDuration && selectedRate ? `${selectedDuration}-${selectedRate}` : undefined}
            >
              {plans.map((plan) => (
                <Option key={`${plan.months}-${plan.interestRate}`} value={`${plan.months}-${plan.interestRate}`}>
                  {plan.months} months @ {plan.interestRate}% p.a.
                </Option>
              ))}
            </Select>
          </div>
          {selectedDuration && selectedRate && (
            <div>
              <Text>
                <b>Monthly EMI:</b> ₹{monthly} &nbsp; | &nbsp;
                <b>Tenure:</b> {selectedDuration} months &nbsp; | &nbsp;
                <b>Total Payable:</b> ₹{(monthly * selectedDuration).toLocaleString()}
              </Text>
            </div>
          )}
          {showSchedule && emiSchedule.length > 0 && (
            <>
              <Button onClick={() => setShowScheduleModal(true)}>View EMI Schedule</Button>
              <Modal
                open={showScheduleModal}
                onCancel={() => setShowScheduleModal(false)}
                footer={null}
                title="EMI Payment Schedule"
                width={700}
              >
                <Table
                  dataSource={emiSchedule.map((item, idx) => ({
                    ...item,
                    installment: idx + 1,
                  }))}
                  columns={scheduleColumns}
                  rowKey="dueDate"
                  pagination={false}
                />
              </Modal>
            </>
          )}
        </Space>
      )}
    </Card>
  );
};

export default EmiModule;
