import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Space, 
  Button, 
  Card, 
  message, 
  Modal, 
  Tooltip,
  Typography,
  Row,
  Col,
  Input,
  Badge,
  Dropdown,
  Menu,
  Empty,
  Spin,
  Avatar,
  Tag
} from 'antd';
import { 
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  TableOutlined,
  ExportOutlined,
  FilterOutlined,
  EyeOutlined,
  CalendarOutlined,
  NumberOutlined,
  MailOutlined,
  FormOutlined,
  UnorderedListOutlined,
  DatabaseOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const DynamicTable = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    fetchSchema();
    fetchData();
  }, [collectionName]);

  useEffect(() => {
    // Filter data based on search text
    if (searchText) {
      const filtered = data.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  const fetchSchema = async () => {
    try {
      const response = await axios.get(`${config.endpoints.formBuilder}/${collectionName}`);
      setSchema(response.data.schema || []);
    } catch (error) {
      message.error('Failed to fetch schema');
      setSchema([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.endpoints.dynamic}/${collectionName}`);
      setData(response.data || []);
    } catch (error) {
      message.error('Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    
        try {
          await axios.delete(`${config.endpoints.dynamic}/${collectionName}/${id}`);
          message.success({
            content: 'Record deleted successfully!',
            duration: 3,
            style: { marginTop: '20px' }
          });
          fetchData();
        } catch (error) {
          message.error('Failed to delete record');
        }
      
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select records to delete');
      return;
    }

    try {
      await Promise.all(
        selectedRowKeys.map(id => 
          axios.delete(`${config.endpoints.dynamic}/${collectionName}/${id}`)
        )
      );
      message.success(`${selectedRowKeys.length} records deleted successfully!`);
      setSelectedRowKeys([]);
      fetchData();
    } catch (error) {
      message.error('Failed to delete some records');
    }
  };

  const handleEdit = (record) => {
    navigate(`/dynamic/${collectionName}/${record._id}`);
  };

  const handleView = (record) => {
    Modal.info({
      title: `View Record Details`,
      width: 600,
      content: (
        <div style={{ marginTop: '20px' }}>
          {schema.map(field => (
            <Row key={field.field} style={{ marginBottom: '12px' }}>
              <Col span={8}>
                <Text strong>{field.label}:</Text>
              </Col>
              <Col span={16}>
                <Text>
                  {field.type === 'date' && record[field.field]
                    ? dayjs(record[field.field]).format('MMM DD, YYYY')
                    : record[field.field] || '-'
                  }
                </Text>
              </Col>
            </Row>
          ))}
        </div>
      ),
      centered: true
    });
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case 'number':
        return <NumberOutlined style={{ color: '#1890ff' }} />;
      case 'date':
        return <CalendarOutlined style={{ color: '#52c41a' }} />;
      case 'email':
        return <MailOutlined style={{ color: '#722ed1' }} />;
      case 'select':
        return <UnorderedListOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <FormOutlined style={{ color: '#13c2c2' }} />;
    }
  };

  const getColumns = () => {
    const columns = schema.map(field => ({
      title: (
        <Space>
          {getFieldIcon(field.type)}
          <Text strong>{field.label}</Text>
        </Space>
      ),
      dataIndex: field.field,
      key: field.field,
      sorter: (a, b) => {
        if (field.type === 'number') {
          return (a[field.field] || 0) - (b[field.field] || 0);
        }
        if (field.type === 'date') {
          return new Date(a[field.field] || 0) - new Date(b[field.field] || 0);
        }
        return (a[field.field] || '').toString().localeCompare((b[field.field] || '').toString());
      },
      render: (text, record) => {
        if (field.type === 'date' && text) {
          return (
            <Tag color="blue" icon={<CalendarOutlined />}>
              {dayjs(text).format('MMM DD, YYYY')}
            </Tag>
          );
        }
        if (field.type === 'email' && text) {
          return <Text code copyable>{text}</Text>;
        }
        if (field.type === 'number' && text !== null && text !== undefined) {
          return (
            <Tag color="green" icon={<NumberOutlined />}>
              {text.toLocaleString()}
            </Tag>
          );
        }
        if (field.type === 'select' && text) {
          return <Tag color="purple">{text}</Tag>;
        }
        return text || <Text type="secondary">-</Text>;
      },
      ellipsis: {
        showTitle: false,
      },
      width: field.type === 'email' ? 200 : undefined
    }));

    // Actions column
    columns.push({
      title: <Text strong>Actions</Text>,
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        // Use Ant Design v5+ Dropdown API with items array
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Record',
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: <span style={{ color: 'red' }}>Delete Record</span>,
            danger: true,
          },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === 'view') handleView(record);
          else if (key === 'edit') handleEdit(record);
          else if (key === 'delete') handleDelete(record._id);
        };

        return (
          <Space>
            <Tooltip title="Quick Edit">
              <Button 
                type="primary" 
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ borderRadius: '6px' }}
              />
            </Tooltip>
            <Dropdown
              menu={{
                items: menuItems,
                onClick: handleMenuClick,
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button 
                size="small"
                icon={<MoreOutlined />}
                style={{ borderRadius: '6px' }}
              />
            </Dropdown>
          </Space>
        );
      }
    });

    return columns;
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      name: record._id,
    }),
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card 
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <div style={{
                      background: 'linear-gradient(45deg, #52c41a, #1890ff)',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DatabaseOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <div>
                      <Title level={2} style={{ margin: 0, color: '#262626' }}>
                        {collectionName?.charAt(0).toUpperCase() + collectionName?.slice(1)} Records
                      </Title>
                      <Text type="secondary" style={{ fontSize: '16px' }}>
                        Manage and view all {collectionName} records
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => navigate(`/dynamic/${collectionName}`)}
                      style={{ 
                        borderRadius: '8px',
                        height: '40px',
                        background: 'linear-gradient(45deg, #1890ff, #722ed1)',
                        border: 'none'
                      }}
                    >
                      New Record
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Main Table Section */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              {/* Table Controls */}
              <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="Search records..."
                    allowClear
                    size="large"
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={16}>
                  <Row justify="end" gutter={[8, 8]}>
                    <Col>
                      <Badge count={filteredData.length} showZero>
                        <Button 
                          icon={<TableOutlined />}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        >
                          Total Records
                        </Button>
                      </Badge>
                    </Col>
                    {selectedRowKeys.length > 0 && (
                      <Col>
                        <Button 
                          danger
                          icon={<DeleteOutlined />}
                          size="large"
                          onClick={handleBulkDelete}
                          style={{ borderRadius: '8px' }}
                        >
                          Delete Selected ({selectedRowKeys.length})
                        </Button>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>

              {/* Data Table */}
              {filteredData.length === 0 && !loading ? (
                <Empty 
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '16px' }}>
                        {searchText ? 'No records match your search' : 'No records found'}
                      </Text>
                      <br />
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/dynamic/${collectionName}`)}
                        style={{ marginTop: '16px', borderRadius: '8px' }}
                      >
                        Create First Record
                      </Button>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '60px 0' }}
                />
              ) : (
                <Table
                  loading={loading}
                  columns={getColumns()}
                  dataSource={filteredData}
                  rowKey="_id"
                  rowSelection={rowSelection}
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} of ${total} records`,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  scroll={{ x: 1200 }}
                  style={{ 
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                  rowClassName={(record, index) => 
                    index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                  }
                  size="middle"
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <style>
        {`
          .table-row-light {
            background-color: #fafafa;
          }
          .table-row-dark {
            background-color: #ffffff;
          }
          .ant-table-thead > tr > th {
            background-color: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
            font-weight: 600;
          }
          .ant-table-tbody > tr:hover > td {
            background-color: #e8f4fd !important;
          }
          .ant-table-row-selected > td {
            background-color: #e6f7ff !important;
          }
          .ant-table-row-selected:hover > td {
            background-color: #bae7ff !important;
          }
          .ant-input:focus,
          .ant-input-focused {
            border-color: #722ed1;
            box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.2);
          }
          .ant-table-selection-column {
            width: 60px;
          }
        `}
      </style>
    </div>
  );
};

export default DynamicTable;