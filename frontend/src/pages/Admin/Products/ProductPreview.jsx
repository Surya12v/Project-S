import React from "react";
import { Modal, Row, Col, Image, Typography, Space } from "antd";
const { Title, Text, Paragraph } = Typography;

const ProductPreview = ({ previewVisible, setPreviewVisible, previewProduct }) => (
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
            src={previewProduct.images?.[0] || "https://via.placeholder.com/400"}
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

export default ProductPreview;
