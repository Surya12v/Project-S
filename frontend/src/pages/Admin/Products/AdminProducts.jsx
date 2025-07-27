import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Typography,
  Card,
  Row,
  Col,
  Tabs,
  Tag,
  Image,
  Switch,
  DatePicker,
  Rate,
  Divider,
  Collapse,
  TreeSelect,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  CopyOutlined,
  ExportOutlined,
  ImportOutlined,
  FileImageOutlined,
  TagsOutlined,
  DollarOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
  GlobalOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { API_URL } from "../../../config/constants";
import axios from "axios";
import dayjs from "dayjs";
import productJsonTemplate from "./productJsonTemplate";
import { getCsrfToken } from "../../../utils/csrf";
import ProductForm from "./ProductForm";
import ProductPreview from "./ProductPreview";
import JsonImportModal from "./JsonImportModal";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAdminProducts,
  addAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "../../../store/slices/adminProductSlice";
import Navbar from "../../../components/NavBar/NavBar";
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;


const AdminProducts = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonPreview, setJsonPreview] = useState(null);
  const csrfToken = await getCsrfToken();
  const [jsonInput, setJsonInput] = useState(productJsonTemplate);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    product: null,
  });
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector(
    (state) => state.adminProducts
  );

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (editingProduct) {
      form.setFieldsValue({
        ...editingProduct,
        isActive: !!editingProduct.isActive,
        keyFeatures: editingProduct.keyFeatures?.join("\n") || "",
        tags: editingProduct.tags?.join(", ") || "",
        seoKeywords: editingProduct.seoKeywords?.join(", ") || "",
        availableFrom: editingProduct.availableFrom
          ? dayjs(editingProduct.availableFrom)
          : null,
        availableUntil: editingProduct.availableUntil
          ? dayjs(editingProduct.availableUntil)
          : null,
        category:
          editingProduct.category && categoriesTree.some(
            cat =>
              cat.value === editingProduct.category ||
              (cat.children && cat.children.some(child => child.value === editingProduct.category))
          )
            ? editingProduct.category
            : undefined,
      });
    }
  }, [editingProduct, form]);

  // Sample categories tree structure
  const categoriesTree = [
    {
      title: "Electronics",
      value: "electronics",
      children: [
        { title: "Smartphones", value: "smartphones" },
        { title: "Laptops", value: "laptops" },
        { title: "Tablets", value: "tablets" },
        { title: "Accessories", value: "accessories" },
      ],
    },
    {
      title: "Fashion",
      value: "fashion",
      children: [
        { title: "Men's Clothing", value: "mens-clothing" },
        { title: "Women's Clothing", value: "womens-clothing" },
        { title: "Footwear", value: "footwear" },
        { title: "Accessories", value: "fashion-accessories" },
      ],
    },
    {
      title: "Home & Garden",
      value: "home-garden",
      children: [
        { title: "Furniture", value: "furniture" },
        { title: "Kitchen", value: "kitchen" },
        { title: "Decor", value: "decor" },
      ],
    },
  ];

  const handleSubmit = async (values) => {
    console.log("Form values:", values);
    try {
      // Destructure images and galleryImages to ensure they're passed as-is
      const {
        images = [],
        galleryImages = [],
        ...rest
      } = values;

      const formData = {
        ...rest,
        images,
        galleryImages,
        specifications: values.specifications,
        keyFeatures:
          typeof values.keyFeatures === "string"
            ? values.keyFeatures.split("\n").filter((f) => f.trim())
            : values.keyFeatures || [],
        tags:
          typeof values.tags === "string"
            ? values.tags.split(",").map((t) => t.trim()).filter((t) => t)
            : values.tags || [],
        seoKeywords:
          typeof values.seoKeywords === "string"
            ? values.seoKeywords.split(",").map((k) => k.trim()).filter((k) => k)
            : values.seoKeywords || [],
        availableFrom: values.availableFrom
          ? values.availableFrom.toISOString()
          : null,
        availableUntil: values.availableUntil
          ? values.availableUntil.toISOString()
          : null,
      };
      if (editingProduct) {
        await dispatch(
          updateAdminProduct({ id: editingProduct._id, product: formData })
        ).unwrap();
        message.success("Product updated successfully");
      } else {
        await dispatch(addAdminProduct(formData)).unwrap();
        message.success("Product created successfully");
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAdminProduct(id)).unwrap();
      message.success("Product deleted successfully");
    } catch (error) {
      message.error("Error deleting product");
    }
    setDeleteModal({ visible: false, product: null });
  };

  const handlePreview = (product) => {
    setPreviewProduct(product);
    setPreviewVisible(true);
  };

  const handleDuplicate = (product) => {
    // Deep clone and remove _id and Ant Design keys
    const cleanProduct = JSON.parse(JSON.stringify(product));
    delete cleanProduct._id;
    delete cleanProduct.key;
    // Remove keys from nested arrays if present
    if (Array.isArray(cleanProduct.images)) {
      cleanProduct.images = cleanProduct.images.map((img) =>
        typeof img === "object" ? { ...img, key: undefined } : img
      );
    }
    if (Array.isArray(cleanProduct.specifications)) {
      cleanProduct.specifications = cleanProduct.specifications.map((spec) => {
        const { key, ...rest } = spec || {};
        return rest;
      });
    }
    // Set new name and sku
    cleanProduct.name = `${product.name} (Copy)`;
    cleanProduct.sku = `${product.sku}-copy`;

    setEditingProduct(null);
    form.setFieldsValue(cleanProduct);
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
        message.error("Invalid JSON file");
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
      console.log("Parsed JSON:", parsed);

      // Validate required fields
      const validateProduct = (product) => {
        const required = ["name", "sku", "price", "category", "description"];
        const missing = required.filter((field) => !product[field]);
        console.log("Missing fields:", missing);
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(", ")}`);
        }
        return true;
      };

      // Handle both single product and array of products
      const products = Array.isArray(parsed) ? parsed : [parsed];
      console.log("Products to validate:", products);
      products.forEach(validateProduct);

      // Set preview if validation passes
      setJsonPreview(parsed);
      message.success("JSON validation successful");
    } catch (error) {
      message.error(`Invalid JSON: ${error.message}`);
    }
  };

  const handleJsonImport = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/products/bulk`,
        jsonPreview,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Import response:", response.data);

      if (response.status !== 200 && response.status !== 201)
        throw new Error("Failed to import products");

      message.success("Products imported successfully");
      setJsonModalVisible(false);
      setJsonPreview(null);
      dispatch(fetchAdminProducts());
    } catch (error) {
      message.error("Error importing products");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      width: 80,
      render: (images) => (
        <Image
          width={50}
          height={50}
          src={images?.[0] || "https://via.placeholder.com/50"}
          style={{ objectFit: "cover", borderRadius: "4px" }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: "Product Info",
      key: "info",
      width: 300,
      render: (_, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary">{record.brand}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            SKU: {record.sku}
          </Text>
          <br />
          <Space size="small" style={{ marginTop: "4px" }}>
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [...new Set(products.map((p) => p.category))].map((cat) => ({
        text: cat,
        value: cat,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Pricing",
      key: "pricing",
      render: (_, record) => (
        <div>
          <Text strong style={{ color: "#1890ff" }}>
            ₹{record.price?.toLocaleString()}
          </Text>
          {record.originalPrice && record.originalPrice > record.price && (
            <>
              <br />
              <Text delete type="secondary">
                ₹{record.originalPrice.toLocaleString()}
              </Text>
              <br />
              <Text style={{ color: "#52c41a", fontSize: "12px" }}>
                {Math.round(
                  ((record.originalPrice - record.price) /
                    record.originalPrice) *
                    100
                )}
                % OFF
              </Text>
            </>
          )}
        </div>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (stock) => (
        <span
          style={{
            color: stock < 10 ? "#ff4d4f" : stock < 50 ? "#fa8c16" : "#52c41a",
          }}
        >
          {stock}
          {stock < 10 && (
            <Text type="danger" style={{ display: "block", fontSize: "10px" }}>
              Low Stock
            </Text>
          )}
        </span>
      ),
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating, record) => (
        <div>
          <Rate
            disabled
            defaultValue={rating || 0}
            style={{ fontSize: "12px" }}
          />
          <br />
          <Text type="secondary" style={{ fontSize: "10px" }}>
            ({record.reviewCount || 0} reviews)
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            >
            Preview
            </Button>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingProduct(record);
                const formData = {
                  ...record,
                  keyFeatures: record.keyFeatures?.join("\n") || "",
                  tags: record.tags?.join(", ") || "",
                  seoKeywords: record.seoKeywords?.join(", ") || "",
                };
                form.setFieldsValue(formData);
                setModalVisible(true);
              }}
            > Edit
              </Button>
            {/* <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            /> */}
             <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModal({ visible: true, product: record })}
          >
            Remove
          </Button>
          </Space>
         
        </Space>
      ),
    },
  ];

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
              src={
                previewProduct.images?.[0] || "https://via.placeholder.com/400"
              }
              alt={previewProduct.name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Col>
          <Col span={12}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <div>
                <Text type="secondary">{previewProduct.brand}</Text>
                <Title level={2}>{previewProduct.name}</Title>
                <Text
                  style={{
                    fontSize: "24px",
                    color: "#1890ff",
                    fontWeight: "bold",
                  }}
                >
                  ₹{previewProduct.price?.toLocaleString()}
                </Text>
                {previewProduct.originalPrice && (
                  <Text delete style={{ marginLeft: "8px", color: "#999" }}>
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
                <Text
                  style={{
                    color:
                      previewProduct.stockQuantity > 0 ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {previewProduct.stockQuantity > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      )}
    </Modal>
  );

  // Reset jsonInput to template every time modal is opened
  const openJsonModal = () => {
    setJsonInput(productJsonTemplate);
    setJsonPreview(null);
    setJsonModalVisible(true);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Navbar />
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Manage Products
              </Title>
              <Text type="secondary">Total: {products.length} products</Text>
            </div>
            <Space>
              <Button
                icon={<ImportOutlined />}
                onClick={openJsonModal} // Use the new openJsonModal function
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
                `${range[0]}-${range[1]} of ${total} products`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteModal.visible}
          title="Delete Product"
          onOk={() => handleDelete(deleteModal.product?._id)}
          onCancel={() => setDeleteModal({ visible: false, product: null })}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          Are you sure you want to delete <b>{deleteModal.product?.name}</b>?
        </Modal>

        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingOutlined />
              {editingProduct ? "Edit Product" : "Add New Product"}
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
          <ProductForm
            form={form}
            editingProduct={editingProduct}
            setModalVisible={setModalVisible}
            handleSubmit={handleSubmit}
            categoriesTree={categoriesTree}
          />
        </Modal>

        <ProductPreview
          previewVisible={previewVisible}
          setPreviewVisible={setPreviewVisible}
          previewProduct={previewProduct}
        />
        <JsonImportModal
          jsonModalVisible={jsonModalVisible}
          setJsonModalVisible={setJsonModalVisible}
          jsonPreview={jsonPreview}
          setJsonPreview={setJsonPreview}
          jsonInput={jsonInput}
          setJsonInput={setJsonInput}
          productJsonTemplate={productJsonTemplate}
          handleJsonUpload={handleJsonUpload}
          handleDirectJsonInput={handleDirectJsonInput}
          handleJsonImport={handleJsonImport}
        />
      </Space>
    </div>
  );
};

export default AdminProducts;

