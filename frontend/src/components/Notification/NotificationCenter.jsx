import React from "react";
import { List, Badge, Button, Typography, Tag } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const NotificationCenter = ({ notifications = [], onMarkRead, onClear }) => {
  const navigate = useNavigate();

  return (
    <div style={{ width: 400, maxHeight: 500, overflowY: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #00000022", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span>
          <BellOutlined style={{ fontSize: 20, marginRight: 8 }} />
          <Text strong>Notifications</Text>
        </span>
        <Button size="small" onClick={onClear}>Clear All</Button>
      </div>
      <List
        dataSource={notifications}
        locale={{ emptyText: "No notifications" }}
        renderItem={notif => (
          <List.Item
            style={{
              background: notif.read ? "#fafafa" : "#e6f7ff",
              borderRadius: 6,
              marginBottom: 8,
              cursor: notif.link ? "pointer" : "default"
            }}
            onClick={() => {
              if (notif.link) navigate(notif.link);
              if (onMarkRead) onMarkRead(notif.id);
            }}
          >
            <List.Item.Meta
              title={
                <span>
                  {notif.type && <Tag color={notif.type === "EMI" ? "blue" : notif.type === "ORDER" ? "green" : notif.type === "PAYMENT" ? "purple" : "gold"}>{notif.type}</Tag>}
                  <Text strong>{notif.title}</Text>
                </span>
              }
              description={
                <span>
                  <Text>{notif.message}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{notif.date ? new Date(notif.date).toLocaleString() : ""}</Text>
                </span>
              }
            />
            {!notif.read && <Badge status="processing" />}
          </List.Item>
        )}
      />
    </div>
  );
};

export default NotificationCenter;
