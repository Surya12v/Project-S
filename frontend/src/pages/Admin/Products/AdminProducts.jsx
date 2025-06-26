import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, 
  InputNumber, Select, Upload, message, 
  Typography, Card, Row, Col, Tabs, Tag, Image, Switch,
  DatePicker, Rate, Divider, Collapse, TreeSelect, Alert
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  EyeOutlined, CopyOutlined, ExportOutlined, ImportOutlined,
  FileImageOutlined, TagsOutlined, DollarOutlined,
  ShoppingOutlined, BarcodeOutlined, GlobalOutlined, InboxOutlined
} from '@ant-design/icons';
import { API_URL } from '../../../config/constants';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonPreview, setJsonPreview] = useState(null);
  const [jsonInput, setJsonInput] = useState('');

  // Sample categories tree structure
  const categoriesTree = [
    {
      title: 'Electronics',
      value: 'electronics',
      children: [
        { title: 'Smartphones', value: 'smartphones' },
        { title: 'Laptops', value: 'laptops' },
        { title: 'Tablets', value: 'tablets' },
        { title: 'Accessories', value: 'accessories' }
      ]
    },
    {
      title: 'Fashion',
      value: 'fashion',
      children: [
        { title: 'Men\'s Clothing', value: 'mens-clothing' },
        { title: 'Women\'s Clothing', value: 'womens-clothing' },
        { title: 'Footwear', value: 'footwear' },
        { title: 'Accessories', value: 'fashion-accessories' }
      ]
    },
    {
      title: 'Home & Garden',
      value: 'home-garden',
      children: [
        { title: 'Furniture', value: 'furniture' },
        { title: 'Kitchen', value: 'kitchen' },
        { title: 'Decor', value: 'decor' }
      ]
    }
  ];

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/products`, { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to fetch products');
      const data = response.data;
      setProducts(data);
    } catch (error) {
      message.error('Error fetching products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (values) => {
    try {
      // Process form data
      const formData = {
        ...values,
        specifications: values.specifications || {},
        keyFeatures: values.keyFeatures?.split('\n').filter(f => f.trim()) || [],
        tags: values.tags?.split(',').map(t => t.trim()).filter(t => t) || [],
        seoKeywords: values.seoKeywords?.split(',').map(k => k.trim()).filter(k => k) || []
      };

      const url = editingProduct 
        ? `${API_URL}/api/admin/products/${editingProduct._id}`
        : `${API_URL}/api/admin/products`;
      
      const response = editingProduct
        ? await axios.put(url, formData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          })
        : await axios.post(url, formData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          });

      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to save product');
      
      message.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`);
      setModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      message.error('Error saving product');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/admin/products/${id}`, { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to delete product');
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Error deleting product');
      console.error(error);
    }
  };

  const handlePreview = (product) => {
    setPreviewProduct(product);
    setPreviewVisible(true);
  };

  const handleDuplicate = (product) => {
    const duplicatedProduct = {
      ...product,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-copy`,
      _id: undefined
    };
    setEditingProduct(null);
    form.setFieldsValue(duplicatedProduct);
    setModalVisible(true);
  };

  const handleJsonUpload = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setJsonPreview(jsonData);
        setJsonModalVisible(true);
      } catch (error) {
        message.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    return false; // Prevent automatic upload
  };

  const handleDirectJsonInput = (value) => {
    try {
      // Clear previous preview
      setJsonPreview(null);
      
      // Try to parse the JSON
      const parsed = JSON.parse(value);
      
      // Validate required fields
      const validateProduct = (product) => {
        const required = ['name', 'sku', 'price', 'category', 'description'];
        const missing = required.filter(field => !product[field]);
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        return true;
      };

      // Handle both single product and array of products
      const products = Array.isArray(parsed) ? parsed : [parsed];
      products.forEach(validateProduct);

      // Set preview if validation passes
      setJsonPreview(parsed);
      message.success('JSON validation successful');
    } catch (error) {
      message.error(`Invalid JSON: ${error.message}`);
    }
  };

  const handleJsonImport = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/products/bulk`, jsonPreview, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to import products');
      
      message.success('Products imported successfully');
      setJsonModalVisible(false);
      setJsonPreview(null);
      fetchProducts();
    } catch (error) {
      message.error('Error importing products');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images) => (
        <Image
          width={50}
          height={50}
          src={images?.[0] || 'https://via.placeholder.com/50'}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: 'Product Info',
      key: 'info',
      width: 300,
      render: (_, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary">{record.brand}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            SKU: {record.sku}
          </Text>
          <br />
          <Space size="small" style={{ marginTop: '4px' }}>
            {record.isActive ? (
              <Tag color="green">Active</Tag>
            ) : (
              <Tag color="red">Inactive</Tag>
            )}
            {record.isFeatured && <Tag color="blue">Featured</Tag>}
            {record.isNew && <Tag color="orange">New</Tag>}
          </Space>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        ...new Set(products.map(p => p.category))
      ].map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Pricing',
      key: 'pricing',
      render: (_, record) => (
        <div>
          <Text strong style={{ color: '#1890ff' }}>
            ₹{record.price?.toLocaleString()}
          </Text>
          {record.originalPrice && record.originalPrice > record.price && (
            <>
              <br />
              <Text delete type="secondary">
                ₹{record.originalPrice.toLocaleString()}
              </Text>
              <br />
              <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                {Math.round(((record.originalPrice - record.price) / record.originalPrice) * 100)}% OFF
              </Text>
            </>
          )}
        </div>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (stock) => (
        <span style={{ color: stock < 10 ? '#ff4d4f' : stock < 50 ? '#fa8c16' : '#52c41a' }}>
          {stock}
          {stock < 10 && <Text type="danger" style={{ display: 'block', fontSize: '10px' }}>Low Stock</Text>}
        </span>
      ),
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating, record) => (
        <div>
          <Rate disabled defaultValue={rating || 0} style={{ fontSize: '12px' }} />
          <br />
          <Text type="secondary" style={{ fontSize: '10px' }}>
            ({record.reviewCount || 0} reviews)
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingProduct(record);
                const formData = {
                  ...record,
                  keyFeatures: record.keyFeatures?.join('\n') || '',
                  tags: record.tags?.join(', ') || '',
                  seoKeywords: record.seoKeywords?.join(', ') || ''
                };
                form.setFieldsValue(formData);
                setModalVisible(true);
              }}
            />
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Space>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Product',
                content: `Are you sure you want to delete ${record.name}?`,
                okText: 'Yes',
                okButtonProps: { danger: true },
                cancelText: 'No',
                onOk: () => handleDelete(record._id)
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const ProductForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        isActive: true,
        isFeatured: false,
        isNew: false,
        allowReviews: true,
        trackQuantity: true,
        requiresShipping: true,
        paymentModes: ['Full', 'COD']
      }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Basic Info" key="1">
          {/* Add status switch at the top */}
          <Form.Item 
            name="isActive" 
            valuePropName="checked"
            initialValue={true}
          >
            <div style={{ 
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <Space>
                <Switch />
                <Text strong>Product Status</Text>
                <Tag color={form.getFieldValue('isActive') ? 'success' : 'error'}>
                  {form.getFieldValue('isActive') ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
              </Space>
            </div>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: 'Please enter SKU' }]}
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
                rules={[{ required: true, message: 'Please enter brand' }]}
              >
                <Input placeholder="Enter brand name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <TreeSelect
                  treeData={categoriesTree}
                  placeholder="Select category"
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Short Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Enter short product description" />
          </Form.Item>

          <Form.Item
            name="detailedDescription"
            label="Detailed Description"
          >
            <TextArea rows={6} placeholder="Enter detailed product description (supports HTML)" />
          </Form.Item>

          <Form.Item
            name="keyFeatures"
            label="Key Features"
            extra="Enter each feature on a new line"
          >
            <TextArea rows={4} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
          </Form.Item>
        </TabPane>

        <TabPane tab="Pricing & Inventory" key="2">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Selling Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  addonBefore="₹"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="originalPrice"
                label="Original Price (MRP)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  addonBefore="₹"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="costPrice"
                label="Cost Price"
              >
                <InputNumber
                  style={{ width: '100%' }}
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
                name="stockQuantity"
                label="Stock Quantity"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minStockLevel"
                label="Minimum Stock Level"
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxOrderQuantity"
                label="Max Order Quantity"
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="paymentModes"
            label="Payment Modes"
            rules={[{ required: true, message: 'Please select payment modes' }]}
          >
            <Select mode="multiple" placeholder="Select payment modes">
              <Select.Option value="Full">Full Payment</Select.Option>
              <Select.Option value="COD">Cash on Delivery</Select.Option>
              <Select.Option value="EMI">EMI</Select.Option>
              <Select.Option value="Wallet">Wallet</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
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
                            name={[name, 'key']}
                            rules={[{ required: true, message: 'Missing specification name' }]}
                          >
                            <Input placeholder="Specification name" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: 'Missing specification value' }]}
                          >
                            <Input placeholder="Specification value" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button type="text" danger onClick={() => remove(name)}>
                            <DeleteOutlined />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
                <InputNumber style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="length" label="Length (cm)">
                <InputNumber style={{ width: '100%' }} min={0} precision={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="width" label="Width (cm)">
                <InputNumber style={{ width: '100%' }} min={0} precision={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="height" label="Height (cm)">
                <InputNumber style={{ width: '100%' }} min={0} precision={1} />
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
          >
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item name="videoUrl" label="Product Video URL">
            <Input placeholder="Enter YouTube or Vimeo URL" />
          </Form.Item>

          <Form.Item name="galleryImages" label="Gallery Images">
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
            >
              <div>
                <FileImageOutlined />
                <div style={{ marginTop: 8 }}>Gallery</div>
              </div>
            </Upload>
          </Form.Item>
        </TabPane>

        <TabPane tab="SEO & Marketing" key="5">
          <Form.Item name="seoTitle" label="SEO Title">
            <Input placeholder="Enter SEO title (max 60 characters)" maxLength={60} />
          </Form.Item>

          <Form.Item name="seoDescription" label="SEO Description">
            <TextArea rows={3} placeholder="Enter SEO description (max 160 characters)" maxLength={160} />
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

          <Form.Item name="availableFrom" label="Available From">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="availableUntil" label="Available Until">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="shippingClass" label="Shipping Class">
            <Select placeholder="Select shipping class">
              <Select.Option value="standard">Standard</Select.Option>
              <Select.Option value="express">Express</Select.Option>
              <Select.Option value="overnight">Overnight</Select.Option>
              <Select.Option value="free">Free Shipping</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="taxClass" label="Tax Class">
            <Select placeholder="Select tax class">
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
            {editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
          <Button size="large" onClick={() => {
            setModalVisible(false);
            form.resetFields();
          }}>
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

  const ProductPreview = () => (
    <Modal
      title="Product Preview"
      open={previewVisible}
      onCancel={() => setPreviewVisible(false)}
      width="80%"
      footer={null}
    >
      {previewProduct && (
        <Row gutter={24}>
          <Col span={12}>
            <Image
              src={previewProduct.images?.[0] || 'https://via.placeholder.com/400'}
              alt={previewProduct.name}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Col>
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">{previewProduct.brand}</Text>
                <Title level={2}>{previewProduct.name}</Title>
                <Text style={{ fontSize: '24px', color: '#1890ff', fontWeight: 'bold' }}>
                  ₹{previewProduct.price?.toLocaleString()}
                </Text>
                {previewProduct.originalPrice && (
                  <Text delete style={{ marginLeft: '8px', color: '#999' }}>
                    ₹{previewProduct.originalPrice.toLocaleString()}
                  </Text>
                )}
              </div>
              
              <Paragraph>{previewProduct.description}</Paragraph>
              
              {previewProduct.keyFeatures && (
                <div>
                  <Title level={4}>Key Features</Title>
                  <ul>
                    {previewProduct.keyFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <Text strong>Stock: </Text>
                <Text style={{ color: previewProduct.stockQuantity > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {previewProduct.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      )}
    </Modal>
  );

  const JsonImportModal = () => (
    <Modal
      title="Import Products"
      open={jsonModalVisible}
      onCancel={() => {
        setJsonModalVisible(false);
        setJsonPreview(null);
        setJsonInput('');
      }}
      onOk={handleJsonImport}
      okText="Import Products"
      width={800}
      okButtonProps={{ disabled: !jsonPreview }}
    >
      <Tabs defaultActiveKey="paste">
        <TabPane tab="Paste JSON" key="paste">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="Required Fields"
              description="name, sku, price, category, description"
              type="info"
              showIcon
            />
            <TextArea
              rows={10}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{
  "name": "Product Name",
  "sku": "SKU-001",
  "price": 99.99,
  "category": "category/subcategory",
  "description": "Product description"
}`}
            />
            <Button 
              type="primary"
              onClick={() => handleDirectJsonInput(jsonInput)}
              icon={<PlusOutlined />}
            >
              Validate JSON
            </Button>
          </Space>
        </TabPane>
        
        <TabPane tab="Upload File" key="upload">
          <Upload.Dragger
            accept=".json"
            beforeUpload={handleJsonUpload}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag JSON file to upload
            </p>
          </Upload.Dragger>
        </TabPane>
      </Tabs>

      {jsonPreview && (
        <>
          <Divider />
          <div>
            <Title level={4}>Preview</Title>
            <Alert 
              message="Validation Successful"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <pre style={{ 
              maxHeight: '400px', 
              overflow: 'auto',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '4px'
            }}>
              {JSON.stringify(jsonPreview, null, 2)}
            </pre>
          </div>
        </>
      )}
    </Modal>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>Manage Products</Title>
              <Text type="secondary">Total: {products.length} products</Text>
            </div>
            <Space>
              <Button 
                icon={<ImportOutlined />}
                onClick={() => setJsonModalVisible(true)}
              >
                Import JSON
              </Button>
              <Button icon={<ExportOutlined />}>Export</Button>
              <Button 
                type="primary" 
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProduct(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                Add Product
              </Button>
            </Space>
          </div>
        </Card>

        <Card>
          <Table 
            columns={columns} 
            dataSource={products}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} products`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingOutlined />
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          width="90%"
          style={{ top: 20 }}
          footer={null}
        >
          <ProductForm />
        </Modal>

        <ProductPreview />
        <JsonImportModal />
      </Space>
    </div>
  );
};

export default AdminProducts;