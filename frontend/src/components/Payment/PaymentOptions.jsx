import React, { useState } from "react";
import { Form, Radio, Space, Divider, Input, Button, Modal } from "antd";
import EmiModule from "../Emi/emi";

const PaymentOptions = ({
  paymentModes = [],
  paymentMode,
  setPaymentMode,
  promo,
  setPromo,
  appliedPromo,
  setAppliedPromo,
  applyingPromo,
  handleApplyPromo,
  selectedEmiPlan,
  setSelectedEmiPlan,
  emiEligible,
  emiModalVisible,
  setEmiModalVisible,
  onReviewOrder,
}) => {
  return (
    <Form layout="vertical" onFinish={onReviewOrder}>
      <Form.Item
        name="paymentMode"
        label="Select Payment Method"
        rules={[{ required: true, message: "Please select a payment method" }]}
      >
        <Radio.Group
          size="large"
          onChange={e => {
            setSelectedEmiPlan?.(null);
            setPaymentMode(e.target.value);
            if (e.target.value === "EMI" && emiEligible) {
              setEmiModalVisible?.(true);
            }
          }}
          value={paymentMode}
        >
          <Space direction="vertical">
            {paymentModes.map(mode => (
              <Radio value={mode} key={mode}>{mode}</Radio>
            ))}
          </Space>
        </Radio.Group>
      </Form.Item>
      <Divider />
      <Form.Item label="Promo Code">
        <Input
          placeholder="Enter promo code"
          value={promo}
          onChange={e => setPromo(e.target.value)}
          disabled={!!appliedPromo}
          style={{ width: 200, marginRight: 8 }}
        />
        <Button
          type="primary"
          loading={applyingPromo}
          disabled={!!appliedPromo}
          onClick={handleApplyPromo}
        >
          Apply
        </Button>
        {appliedPromo && (
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => { setAppliedPromo(null); setPromo(""); }}
          >
            Remove
          </Button>
        )}
      </Form.Item>
      <Button type="primary" htmlType="submit" size="large">
        Review Order
      </Button>
      {/* EMI Modal */}
      {emiEligible && (
        <Modal
          open={emiModalVisible}
          onCancel={() => setEmiModalVisible(false)}
          footer={null}
          title="Select EMI Plan"
          destroyOnClose
        >
          <EmiModule
            productId={emiEligible.product._id}
            price={emiEligible.product.price}
            plans={emiEligible.emiPlans}
            onSelectEmiPlan={plan => {
              setSelectedEmiPlan(plan);
              setEmiModalVisible(false);
              setPaymentMode("EMI");
            }}
            selectedPlan={selectedEmiPlan}
            disabled={false}
          />
        </Modal>
      )}
    </Form>
  );
};

export default PaymentOptions;
