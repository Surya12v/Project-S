import React from "react";
import {
  Modal,
  Tabs,
  Upload,
  Typography,
  Divider,
  Alert,
  Button,
  Input,
  Space,
} from "antd";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const JsonImportModal = ({
  jsonModalVisible,
  setJsonModalVisible,
  jsonPreview,
  setJsonPreview,
  jsonInput,
  setJsonInput,
  productJsonTemplate,
  handleJsonUpload,
  handleDirectJsonInput,
  handleJsonImport,
}) => (
  <Modal
    title="Import Products"
    open={jsonModalVisible}
    onCancel={() => {
      setJsonModalVisible(false);
      setJsonPreview(null);
      setJsonInput(productJsonTemplate);
    }}
    onOk={handleJsonImport}
    okText="Import Products"
    width={800}
    okButtonProps={{ disabled: !jsonPreview }}
  >
    <Tabs defaultActiveKey="upload">
      {/* Uncomment and use if you want to enable paste JSON tab
      <TabPane tab="Paste JSON" key="paste">
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message="Required Fields"
            description="name, sku, price, category, description"
            type="info"
            showIcon
          />
          <TextArea
            rows={14}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste product JSON here"
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
      */}
      <TabPane tab="Upload File" key="upload">
        <Upload.Dragger
          accept=".json"
          beforeUpload={handleJsonUpload}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag JSON file to upload</p>
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
          <pre
            style={{
              maxHeight: "400px",
              overflow: "auto",
              padding: "16px",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(jsonPreview, null, 2)}
          </pre>
        </div>
      </>
    )}
  </Modal>
);

export default JsonImportModal;
