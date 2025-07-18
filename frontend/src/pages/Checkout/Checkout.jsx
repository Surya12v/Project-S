import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Steps, Card, Radio, Space,
  Typography, Divider, message, List, Checkbox, Row, Col, Select, Spin, Modal
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { createRazorpayOrder } from '../../services/payment';
import { calculateFinalPrice } from '../../utils/priceUtils';
import NavBar from '../../components/NavBar/NavBar';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../../store/slices/orderSlice';
import EmiModule from '../../components/Emi/emi';

const { Title, Text } = Typography;
const { Step } = Steps;

const SHIPPING_CLASSES = [
  { value: 'standard', label: 'Standard Shipping', cost: 50, eta: '3-5 days' },
  { value: 'express', label: 'Express Shipping', cost: 120, eta: '1-2 days' },
  { value: 'pickup', label: 'Store Pickup', cost: 0, eta: 'Same day' }
];

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

const Checkout = () => {
  const [current, setCurrent] = useState(0);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [shippingClass, setShippingClass] = useState(SHIPPING_CLASSES[0].value);
  const [shippingCost, setShippingCost] = useState(SHIPPING_CLASSES[0].cost);
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [billingSame, setBillingSame] = useState(true);
  const [billingAddress, setBillingAddress] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedEmiPlan, setSelectedEmiPlan] = useState(null);
  const [emiModalVisible, setEmiModalVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const orderState = useSelector(state => state.orders);

  // Fetch cart and set selected items
  useEffect(() => {
    fetchCart();
    if (location.state && location.state.buyNowProduct) {
      setSelectedItems([location.state.buyNowProduct]);
    }
  }, [location.state]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
      setCart(response.data);
      if (!location.state || !location.state.buyNowProduct) {
        setSelectedItems(response.data.items.map(item => item.productId._id));
      }
    } catch (error) {
      message.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  // Get all payment modes available for selected products
  const getAvailablePaymentModes = () => {
    let modes = [];
    if (location.state && location.state.buyNowProduct) {
      modes = location.state.buyNowProduct.paymentModes || [];
    } else {
      // Intersect paymentModes of all selected products
      const selected = cart.items.filter(item => selectedItems.includes(item.productId._id));
      if (selected.length === 0) return [];
      modes = selected[0].productId.paymentModes || [];
      for (let i = 1; i < selected.length; i++) {
        modes = modes.filter(mode => (selected[i].productId.paymentModes || []).includes(mode));
      }
    }
    return modes.length ? modes : ['Full', 'COD'];
  };

  // Calculate totals for selected items only
  const calculateSummary = () => {
    let subtotal = 0, tax = 0;
    let items = [];
    if (location.state && location.state.buyNowProduct) {
      items = [location.state.buyNowProduct];
    } else {
      items = cart.items.filter(item => selectedItems.includes(item.productId._id));
    }
    items.forEach(item => {
      const product = item.productId || item;
      const qty = item.quantity || 1;
      const { finalPrice, priceAfterTax } = calculateFinalPrice({
        price: product.price,
        taxClass: product.taxClass,
        taxRate: product.taxRate,
        isTaxInclusive: product.isTaxInclusive
      });
      subtotal += finalPrice * qty;
      tax += (finalPrice - priceAfterTax) * qty;
    });
    let discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
    let total = subtotal + shippingCost - discount;
    return { subtotal, tax, discount, total };
  };

  const { subtotal, tax, discount, total } = calculateSummary();

  // Promo code handler
  const handleApplyPromo = () => {
    setApplyingPromo(true);
    setTimeout(() => {
      if (promo === 'DISCOUNT10') {
        setAppliedPromo({ code: 'DISCOUNT10', discount: 0.1 });
        message.success('Promo applied!');
      } else {
        setAppliedPromo(null);
        message.error('Invalid promo code');
      }
      setApplyingPromo(false);
    }, 800);
  };

  // Shipping class handler
  const handleShippingClassChange = (value) => {
    setShippingClass(value);
    const found = SHIPPING_CLASSES.find(s => s.value === value);
    setShippingCost(found ? found.cost : 0);
  };

  // Checkbox handler for selecting cart items
  const handleSelectItem = (checked, productId) => {
    setSelectedItems(prev =>
      checked
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  // Address forms
  const [shippingForm] = Form.useForm();

  const handleAddressSubmit = (values) => {
    setOrderDetails(prev => ({ ...prev, shippingAddress: values }));
    setCurrent(2); // Move to Payment tab (should be 2, not 1)
  };

  const handleBillingAddressSubmit = (values) => {
    setBillingAddress(values);
    setCurrent(2);
  };

  const handlePaymentSubmit = (values) => {
    setOrderDetails(prev => ({ ...prev, paymentMode: values.paymentMode }));
    setCurrent(3);
  };

  // Find EMI-eligible product and its plans (for single buy-now or cart)
  const getEmiEligibleProduct = () => {
    if (location.state && location.state.buyNowProduct) {
      const p = location.state.buyNowProduct;
      return p.paymentModes?.includes('EMI') && Array.isArray(p.emiPlans) && p.emiPlans.length > 0
        ? { product: p, emiPlans: p.emiPlans }
        : null;
    }
    // For cart, only support EMI if one product is selected and it supports EMI
    const selected = cart.items.filter(item => selectedItems.includes(item.productId._id));
    if (selected.length === 1) {
      const p = selected[0].productId;
      return p.paymentModes?.includes('EMI') && Array.isArray(p.emiPlans) && p.emiPlans.length > 0
        ? { product: p, emiPlans: p.emiPlans }
        : null;
    }
    return null;
  };

  const emiEligible = getEmiEligibleProduct();

  // Place order
  const placeOrderHandler = async () => {
    setPlacingOrder(true);
    const transactionId = `trn-${Date.now()}`;
    let items = [];
    if (location.state && location.state.buyNowProduct) {
      const item = location.state.buyNowProduct;
      items = [{
        productId: item._id,
        quantity: item.quantity || 1,
        price: item.price
      }];
    } else {
      items = cart.items
        .filter(item => selectedItems.includes(item.productId._id))
        .map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price
        }));
    }
    const shippingAddress = orderDetails.shippingAddress;
    const billing = billingSame ? shippingAddress : billingAddress;
    const orderPayload = {
      shippingAddress,
      billingAddress: billing,
      paymentMode: orderDetails.paymentMode,
      items,
      totalAmount: total,
      shippingClass,
      shippingCost,
      promo: appliedPromo?.code,
      transactionId
    };

    // --- EMI: Add emiPlan to payload if EMI selected ---
    if (orderDetails.paymentMode === 'EMI' && selectedEmiPlan && emiEligible) {
      orderPayload.emiPlan = {
        productId: emiEligible.product._id,
        ...selectedEmiPlan
      };
    }

    if (orderDetails.paymentMode === 'ONLINE') {
      try {
        const razorpayOrder = await createRazorpayOrder(total, {
          transaction_id: transactionId,
          name: shippingAddress?.fullName,
          address: shippingAddress?.address,
          phone: shippingAddress?.phone
        });

        openRazorpayCheckout(
          razorpayOrder,
          {
            name: shippingAddress?.fullName,
            email: shippingAddress?.email,
            phone: shippingAddress?.phone
          },
          {
            onSuccess: async (response) => {
              try {
                const finalOrder = {
                  ...orderPayload,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                };
                await dispatch(placeOrder(finalOrder)).unwrap();
                message.success('Order placed successfully!');
                navigate('/orders');
              } catch (err) {
                message.error('Failed to place order');
              }
            },
            onFailure: (err) => {
              message.error('Payment failed or cancelled');
            }
          }
        );
      } catch (err) {
        message.error('Failed to initiate payment');
      } finally {
        setPlacingOrder(false);
      }
    } else {
      // COD or other
      try {
        await dispatch(placeOrder(orderPayload)).unwrap();
        message.success('Order placed successfully!');
        navigate('/orders');
      } catch (error) {
        message.error('Order failed');
      } finally {
        setPlacingOrder(false);
      }
    }
  };

  // Steps
  const steps = [
    {
      title: 'Cart Summary',
      content: (
        <Card>
          <List
            dataSource={
              location.state && location.state.buyNowProduct
                ? [location.state.buyNowProduct]
                : cart.items
            }
            renderItem={item => {
              const product = item.productId || item;
              const qty = item.quantity || 1;
              const { finalPrice } = calculateFinalPrice({
                price: product.price,
                taxClass: product.taxClass,
                taxRate: product.taxRate,
                isTaxInclusive: product.isTaxInclusive
              });
              if (location.state && location.state.buyNowProduct) {
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<img src={product.images?.[0] || "https://via.placeholder.com/50"} alt={product.name} style={{ width: 50, borderRadius: 4 }} />}
                      title={product.name}
                      description={`Quantity: ${qty}`}
                    />
                    <Text>₹{(finalPrice * qty).toLocaleString()}</Text>
                  </List.Item>
                );
              }
              return (
                <List.Item>
                  <Checkbox
                    checked={selectedItems.includes(product._id)}
                    onChange={e => handleSelectItem(e.target.checked, product._id)}
                    style={{ marginRight: 8 }}
                  />
                  <List.Item.Meta
                    avatar={<img src={product.images?.[0] || "https://via.placeholder.com/50"} alt={product.name} style={{ width: 50, borderRadius: 4 }} />}
                    title={product.name}
                    description={`Quantity: ${qty}`}
                  />
                  <Text>₹{(finalPrice * qty).toLocaleString()}</Text>
                </List.Item>
              );
            }}
          />
          <Divider />
          <Row>
            <Col flex="auto"><Text strong>Subtotal</Text></Col>
            <Col><Text>₹{subtotal.toLocaleString()}</Text></Col>
          </Row>
          <Divider />
          <Button type="primary" onClick={() => setCurrent(1)} disabled={
            (!location.state?.buyNowProduct && selectedItems.length === 0)
          }>
            Continue to Shipping
          </Button>
        </Card>
      )
    },
    {
      title: 'Shipping Details',
      content: (
        <Card>
          <Form
            form={shippingForm}
            layout="vertical"
            onFinish={handleAddressSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ type: 'email', required: false }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="address" label="Street Address" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="city" label="City" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="state" label="State/Province" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                  <Select options={COUNTRIES.map(c => ({ value: c, label: c }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item>
                  <Checkbox checked={billingSame} onChange={e => setBillingSame(e.target.checked)}>
                    Billing address same as shipping
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            {!billingSame && (
              <Row>
                <Col span={24}>
                  <Divider>Billing Address</Divider>
                  <Form layout="vertical" onFinish={handleBillingAddressSubmit}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ type: 'email', required: false }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="address" label="Street Address" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="city" label="City" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="state" label="State/Province" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                          <Select options={COUNTRIES.map(c => ({ value: c, label: c }))} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button type="primary" htmlType="submit">
                      Save Billing Address
                    </Button>
                  </Form>
                </Col>
              </Row>
            )}
            <Divider />
            <Row>
              <Col span={12}>
                <Form.Item name="shippingClass" label="Shipping Method" initialValue={shippingClass}>
                  <Select
                    options={SHIPPING_CLASSES.map(s => ({
                      value: s.value,
                      label: `${s.label} (${s.eta}) - ₹${s.cost}`
                    }))}
                    onChange={handleShippingClassChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                <Text>
                  Estimated Delivery: <b>{SHIPPING_CLASSES.find(s => s.value === shippingClass)?.eta}</b>
                </Text>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit">
              Continue to Payment
            </Button>
          </Form>
        </Card>
      )
    },
    {
      title: 'Payment',
      content: (
        <Card>
          <Form layout="vertical" onFinish={handlePaymentSubmit}>
            <Form.Item
              name="paymentMode"
              label="Select Payment Method"
              rules={[{ required: true, message: 'Please select a payment method' }]}
            >
              <Radio.Group
                size="large"
                onChange={e => {
                  setSelectedEmiPlan(null);
                  // If EMI selected, open modal and reset paymentMode to undefined
                  if (e.target.value === 'EMI' && emiEligible) {
                    setEmiModalVisible(true);
                    // Optionally reset paymentMode so form doesn't proceed
                    setOrderDetails(prev => ({ ...prev, paymentMode: undefined }));
                  }
                }}
              >
                <Space direction="vertical">
                  {getAvailablePaymentModes().map(mode => (
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
                  icon={<ReloadOutlined />}
                  onClick={() => { setAppliedPromo(null); setPromo(''); }}
                >
                  Remove
                </Button>
              )}
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              Review Order
            </Button>
          </Form>
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
                  // Set paymentMode to EMI after plan selection
                  setOrderDetails(prev => ({ ...prev, paymentMode: 'EMI' }));
                }}
                selectedPlan={selectedEmiPlan}
                disabled={false}
              />
            </Modal>
          )}
        </Card>
      )
    },
    {
      title: 'Order Summary',
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card title="Order Summary">
            <List
              dataSource={
                location.state && location.state.buyNowProduct
                  ? [location.state.buyNowProduct]
                  : cart.items.filter(item => selectedItems.includes(item.productId._id))
              }
              renderItem={item => {
                const product = item.productId || item;
                const qty = item.quantity || 1;
                const { finalPrice } = calculateFinalPrice({
                  price: product.price,
                  taxClass: product.taxClass,
                  taxRate: product.taxRate,
                  isTaxInclusive: product.isTaxInclusive
                });
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<img src={product.images?.[0] || "https://via.placeholder.com/50"} alt={product.name} style={{ width: 50, borderRadius: 4 }} />}
                      title={product.name}
                      description={`Quantity: ${qty}`}
                    />
                    <Text>₹{(finalPrice * qty).toLocaleString()}</Text>
                  </List.Item>
                );
              }}
            />
            <Divider />
            <Row>
              <Col flex="auto"><Text>Subtotal</Text></Col>
              <Col><Text>₹{subtotal.toLocaleString()}</Text></Col>
            </Row>
            <Row>
              <Col flex="auto"><Text>Shipping</Text></Col>
              <Col><Text>₹{shippingCost.toLocaleString()}</Text></Col>
            </Row>
            <Row>
              <Col flex="auto"><Text>Tax</Text></Col>
              <Col><Text>₹{tax.toLocaleString()}</Text></Col>
            </Row>
            {appliedPromo && (
              <Row>
                <Col flex="auto"><Text type="success">Discount ({appliedPromo.code})</Text></Col>
                <Col><Text type="success">-₹{discount.toLocaleString()}</Text></Col>
              </Row>
            )}
            <Divider />
            <Row>
              <Col flex="auto"><Text strong>Total</Text></Col>
              <Col><Text strong style={{ fontSize: 18 }}>₹{total.toLocaleString()}</Text></Col>
            </Row>
          </Card>

          <Card title="Shipping Details">
            <p><strong>Name:</strong> {orderDetails.shippingAddress?.fullName}</p>
            <p><strong>Address:</strong> {orderDetails.shippingAddress?.address}</p>
            <p><strong>Phone:</strong> {orderDetails.shippingAddress?.phone}</p>
            <p><strong>Email:</strong> {orderDetails.shippingAddress?.email}</p>
            <p><strong>City:</strong> {orderDetails.shippingAddress?.city}</p>
            <p><strong>State:</strong> {orderDetails.shippingAddress?.state}</p>
            <p><strong>Postal Code:</strong> {orderDetails.shippingAddress?.postalCode}</p>
            <p><strong>Country:</strong> {orderDetails.shippingAddress?.country}</p>
            <p><strong>Shipping Method:</strong> {SHIPPING_CLASSES.find(s => s.value === shippingClass)?.label}</p>
          </Card>

          <Card title="Billing Details">
            {billingSame ? (
              <Text type="secondary">Same as shipping address</Text>
            ) : (
              <>
                <p><strong>Name:</strong> {billingAddress?.fullName}</p>
                <p><strong>Address:</strong> {billingAddress?.address}</p>
                <p><strong>Phone:</strong> {billingAddress?.phone}</p>
                <p><strong>Email:</strong> {billingAddress?.email}</p>
                <p><strong>City:</strong> {billingAddress?.city}</p>
                <p><strong>State:</strong> {billingAddress?.state}</p>
                <p><strong>Postal Code:</strong> {billingAddress?.postalCode}</p>
                <p><strong>Country:</strong> {billingAddress?.country}</p>
              </>
            )}
          </Card>

          <Form.Item>
            <Checkbox checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}>
              I accept the terms and conditions
            </Checkbox>
          </Form.Item>

          <Button
            type="primary"
            onClick={placeOrderHandler}
            size="large"
            block
            disabled={
              placingOrder ||
              (!location.state?.buyNowProduct && selectedItems.length === 0) ||
              !acceptTerms
            }
            loading={placingOrder}
          >
            Place Order
          </Button>
        </Space>
      )
    }
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <NavBar />
      <Steps current={current} style={{ marginBottom: 24 }}>
        {steps.map(item => <Step key={item.title} title={item.title} />)}
      </Steps>
      <Card>{steps[current].content}</Card>
    </div>
  );
};

export default Checkout;
