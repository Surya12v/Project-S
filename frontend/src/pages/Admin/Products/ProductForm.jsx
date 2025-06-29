import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Switch,
  Row,
  Col,
  Tabs,
  Tag,
  Space,
  DatePicker,
  Divider,
  Collapse,
  TreeSelect,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  FileImageOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { uploadImageToFirebase, deleteImageFromFirebase } from "../../../utils/firebaseImage";
import { calculateDiscountPercent, calculateFinalPrice } from "../../../utils/priceUtils";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text } = Typography;

const ProductForm = ({
  form,
  editingProduct,
  setModalVisible,
  handleSubmit,
  categoriesTree,
}) => {
  // State for image upload
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Pricing preview state
  const [pricingPreview, setPricingPreview] = useState({
    discount: 0,
    finalPrice: 0,
    priceAfterTax: 0,
  });

  // Handle main product image upload
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const url = await uploadImageToFirebase(file, "products/images/");
      // Set the images field in the form (array of URLs)
      const prev = form.getFieldValue("images") || [];
      form.setFieldsValue({ images: [...prev, url] });
      onSuccess("ok");
      message.success("Image uploaded!");
    } catch (err) {
      onError(err);
      message.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Remove image from Firebase and update form
  const handleImageRemove = async (file) => {
    try {
      if (file.url) await deleteImageFromFirebase(file.url);
      const prev = form.getFieldValue("images") || [];
      form.setFieldsValue({ images: prev.filter((img) => img !== file.url) });
    } catch {
      message.error("Failed to remove image");
    }
  };

  // Handle gallery image upload
  const handleGalleryUpload = async ({ file, onSuccess, onError }) => {
    setGalleryUploading(true);
    try {
      const url = await uploadImageToFirebase(file, "products/gallery/");
      const prev = form.getFieldValue("galleryImages") || [];
      form.setFieldsValue({ galleryImages: [...prev, url] });
      onSuccess("ok");
      message.success("Gallery image uploaded!");
    } catch (err) {
      onError(err);
      message.error("Gallery image upload failed");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleGalleryRemove = async (file) => {
    try {
      if (file.url) await deleteImageFromFirebase(file.url);
      const prev = form.getFieldValue("galleryImages") || [];
      form.setFieldsValue({ galleryImages: prev.filter((img) => img !== file.url) });
    } catch {
      message.error("Failed to remove gallery image");
    }
  };

  // Convert image URLs to Upload file list
  const getFileList = (urls) =>
    (urls || []).map((url, idx) => ({
      uid: idx,
      name: url.split("/").pop(),
      status: "done",
      url,
    }));

  // Ensure form is initialized with correct image URLs when editing
  React.useEffect(() => {
    if (editingProduct) {
      form.setFieldsValue({
        ...editingProduct,
        images: editingProduct.images || [],
        galleryImages: editingProduct.galleryImages || [],
      });
    }
  }, [editingProduct, form]);

  // Watch pricing fields and update preview
  Form.useWatch(["price", "originalPrice", "taxClass", "taxRate", "isTaxInclusive"], form);

  React.useEffect(() => {
    const values = form.getFieldsValue([
      "price",
      "originalPrice",
      "taxClass",
      "taxRate",
      "isTaxInclusive",
    ]);
    const discount = calculateDiscountPercent(values.originalPrice, values.price);
    const { finalPrice, priceAfterTax } = calculateFinalPrice({
      price: values.price,
      taxClass: values.taxClass,
      taxRate: values.taxRate,
      isTaxInclusive: values.isTaxInclusive,
    });
    setPricingPreview({ discount, finalPrice, priceAfterTax });
  }, [
    form,
    form.getFieldValue("price"),
    form.getFieldValue("originalPrice"),
    form.getFieldValue("taxClass"),
    form.getFieldValue("taxRate"),
    form.getFieldValue("isTaxInclusive"),
  ]);

  // When submitting, send all values as-is to the parent
  const onFinish = (values) => {
    handleSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        isActive: true,
        isFeatured: false,
        isNew: false,
        allowReviews: true,
        trackQuantity: true,
        requiresShipping: true,
        paymentModes: ["Full", "COD"],
        category: undefined,
        isTaxInclusive: true,
        taxClass: "standard",
      }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Basic Info" key="1">
          {/* Add status switch at the top */}
          <Form.Item
            name="isActive"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <div
              style={{
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <Space>
                <Switch />
                <Text strong>Product Status</Text>
                <Form.Item
                  shouldUpdate={(prev, curr) => prev.isActive !== curr.isActive}
                  noStyle
                >
                  {({ getFieldValue }) => (
                    <Tag color={getFieldValue("isActive") ? "success" : "error"}>
                      {getFieldValue("isActive") ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                  )}
                </Form.Item>
              </Space>
            </div>
          </Form.Item>
        
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[
                  { required: true, message: "Please enter product name" },
                ]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: "Please enter SKU" }]}
              >
                <Input placeholder="Enter unique SKU" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="Brand"
                rules={[{ required: true, message: "Please enter brand" }]}
              >
                <Input placeholder="Enter brand name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <TreeSelect
                  treeData={categoriesTree}
                  placeholder="Select category"
                  treeDefaultExpandAll
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Short Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={3} placeholder="Enter short product description" />
          </Form.Item>

          <Form.Item name="detailedDescription" label="Detailed Description">
            <TextArea
              rows={6}
              placeholder="Enter detailed product description (supports HTML)"
            />
          </Form.Item>

          <Form.Item
            name="keyFeatures"
            label="Key Features"
            extra="Enter each feature on a new line"
          >
            <TextArea
              rows={4}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </Form.Item>
        </TabPane>

        <TabPane tab="Pricing & Inventory" key="2">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="costPrice"
                label="Cost Price (Internal)"
                tooltip="Internal cost to acquire the product"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  addonBefore="₹"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="originalPrice" label="Original Price (MRP)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  addonBefore="₹"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Selling Price"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  addonBefore="₹"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="taxClass"
                label="Tax Class"
                tooltip="Select tax class for this product"
                initialValue="standard"
              >
                <Select>
                  <Select.Option value="standard">Standard (18%)</Select.Option>
                  <Select.Option value="reduced">Reduced (5%)</Select.Option>
                  <Select.Option value="exempt">Exempt (0%)</Select.Option>
                  <Select.Option value="custom">Custom</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="taxRate"
                label="Tax Rate (%)"
                tooltip="Override tax rate (leave blank for default)"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  precision={2}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isTaxInclusive"
                label="Is Tax Inclusive?"
                valuePropName="checked"
                tooltip="Is tax included in the price?"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* Discount and Final Price Preview */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Text type="secondary">
                Discount:{" "}
                <span style={{ color: "#fa541c", fontWeight: 600 }}>
                  {pricingPreview.discount > 0 ? `-${pricingPreview.discount}%` : "0%"}
                </span>
              </Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">
                Final Price (with tax):{" "}
                <span style={{ color: "#52c41a", fontWeight: 600 }}>
                  ₹{pricingPreview.finalPrice}
                </span>
              </Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">
                Price After Tax:{" "}
                <span style={{ color: "#1890ff", fontWeight: 600 }}>
                  ₹{pricingPreview.priceAfterTax}
                </span>
              </Text>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stockQuantity"
                label="Stock Quantity"
                rules={[
                  { required: true, message: "Please enter stock quantity" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minStockLevel" label="Minimum Stock Level">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxOrderQuantity" label="Max Order Quantity">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="paymentModes"
            label="Payment Modes"
            rules={[{ required: true, message: "Please select payment modes" }]}
          >
            <Select mode="multiple" placeholder="Select payment modes">
              <Select.Option value="Full">Full Payment</Select.Option>
              <Select.Option value="COD">Cash on Delivery</Select.Option>
              <Select.Option value="EMI">EMI</Select.Option>
              <Select.Option value="Wallet">Wallet</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
              <Select.Option value="ONLINE">Online</Select.Option>
              <Select.Option value="Net Banking">Net Banking</Select.Option>
            </Select>
          </Form.Item>
        </TabPane>

        <TabPane tab="Specifications" key="3">
          <Collapse>
            <Panel header="Product Specifications" key="1">
              <Form.List name="specifications">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={16} align="middle">
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, "key"]}
                            rules={[
                              {
                                required: true,
                                message: "Missing specification name",
                              },
                            ]}
                          >
                            <Input placeholder="Specification name" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "value"]}
                            rules={[
                              {
                                required: true,
                                message: "Missing specification value",
                              },
                            ]}
                          >
                            <Input placeholder="Specification value" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button
                            type="text"
                            danger
                            onClick={() => remove(name)}
                          >
                            <DeleteOutlined />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Specification
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Panel>
          </Collapse>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="weight" label="Weight (kg)">
                <InputNumber style={{ width: "100%" }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="length" label="Length (cm)">
                <InputNumber style={{ width: "100%" }} min={0} precision={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="width" label="Width (cm)">
                <InputNumber style={{ width: "100%" }} min={0} precision={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="height" label="Height (cm)">
                <InputNumber style={{ width: "100%" }} min={0} precision={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="color" label="Color">
                <Input placeholder="Enter color" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="material" label="Material">
                <Input placeholder="Enter material" />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Images & Media" key="4">
          <Form.Item
            name="images"
            label="Product Images"
            extra="Upload high-quality product images. First image will be the main image."
            valuePropName="images"
            getValueFromEvent={() => form.getFieldValue("images")}
          >
            <Upload
              listType="picture-card"
              customRequest={handleImageUpload}
              fileList={getFileList(form.getFieldValue("images"))}
              onRemove={handleImageRemove}
              showUploadList={{ showRemoveIcon: true }}
              multiple
              accept="image/*"
            >
              {uploading ? (
                <LoadingOutlined />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="videoUrl" label="Product Video URL">
            <Input placeholder="Enter YouTube or Vimeo URL" />
          </Form.Item>

          <Form.Item name="galleryImages" label="Gallery Images"
            valuePropName="galleryImages"
            getValueFromEvent={() => form.getFieldValue("galleryImages")}
          >
            <Upload
              listType="picture-card"
              customRequest={handleGalleryUpload}
              fileList={getFileList(form.getFieldValue("galleryImages"))}
              onRemove={handleGalleryRemove}
              showUploadList={{ showRemoveIcon: true }}
              multiple
              accept="image/*"
            >
              {galleryUploading ? (
                <LoadingOutlined />
              ) : (
                <div>
                  <FileImageOutlined />
                  <div style={{ marginTop: 8 }}>Gallery</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </TabPane>

        <TabPane tab="SEO & Marketing" key="5">
          <Form.Item name="seoTitle" label="SEO Title">
            <Input
              placeholder="Enter SEO title (max 60 characters)"
              maxLength={60}
            />
          </Form.Item>

          <Form.Item name="seoDescription" label="SEO Description">
            <TextArea
              rows={3}
              placeholder="Enter SEO description (max 160 characters)"
              maxLength={160}
            />
          </Form.Item>

          <Form.Item name="seoKeywords" label="SEO Keywords">
            <Input placeholder="Enter keywords separated by commas" />
          </Form.Item>

          <Form.Item name="tags" label="Product Tags">
            <Input placeholder="Enter tags separated by commas" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isFeatured" valuePropName="checked">
                <Switch /> Featured Product
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isNew" valuePropName="checked">
                <Switch /> New Product
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isBestseller" valuePropName="checked">
                <Switch /> Bestseller
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isDiscounted" valuePropName="checked">
                <Switch /> On Sale
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Settings" key="6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isActive" valuePropName="checked">
                <Switch /> Active
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="allowReviews" valuePropName="checked">
                <Switch /> Allow Reviews
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trackQuantity" valuePropName="checked">
                <Switch /> Track Quantity
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="requiresShipping" valuePropName="checked">
                <Switch /> Requires Shipping
              </Form.Item>
            </Col>
          </Row>

          {/* Fix: Ensure all Select fields have a default value of undefined */}
          <Form.Item name="availableFrom" label="Available From" initialValue={undefined}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="availableUntil" label="Available Until" initialValue={undefined}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="shippingClass" label="Shipping Class" initialValue={undefined}>
            <Select placeholder="Select shipping class" allowClear>
              <Select.Option value="standard">Standard</Select.Option>
              <Select.Option value="express">Express</Select.Option>
              <Select.Option value="overnight">Overnight</Select.Option>
              <Select.Option value="free">Free Shipping</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="taxClass" label="Tax Class" initialValue={undefined}>
            <Select placeholder="Select tax class" allowClear>
              <Select.Option value="standard">Standard</Select.Option>
              <Select.Option value="reduced">Reduced Rate</Select.Option>
              <Select.Option value="zero">Zero Rate</Select.Option>
              <Select.Option value="exempt">Tax Exempt</Select.Option>
            </Select>
          </Form.Item>
        </TabPane>
      </Tabs>
      <Divider />
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" size="large">
            {editingProduct ? "Update Product" : "Create Product"}
          </Button>
          <Button
            size="large"
            onClick={() => {
              setModalVisible(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>
          {editingProduct && (
            <Button type="default" onClick={() => form.resetFields()}>
              Reset
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;