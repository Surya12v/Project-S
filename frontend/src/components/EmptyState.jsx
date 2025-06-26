import React from 'react';
import Lottie from 'lottie-react';
import emptyAnimation from '../assets/empty-animation.json';
import { Typography, Space } from 'antd';

const { Text } = Typography;

const EmptyState = ({ message }) => {
  return (
    <Space direction="vertical" align="center" style={{ width: '100%' }}>
      <div style={{ width: 200, margin: '0 auto' }}>
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
      <Text type="secondary">{message}</Text>
    </Space>
  );
};

export default EmptyState;
