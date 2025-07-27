import React from 'react';
import { Layout, Typography, } from 'antd';
import NavBar from '../../components/NavBar/NavBar';
import EmiOrderPayment from '../../components/Emi/EmiOrderPayment';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const user = null; // Or fetch user if you want to show profile

  // Dummy EMI order for demonstration; replace with real data/fetch logic as needed
  const selectedEmiOrder = null; // Or fetch from API/Redux
  const fetchEmiOrderDetails = () => {}; // No-op or real refresh function

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Header style={{ padding: 0, background: 'transparent' }}>
        <NavBar />
      </Header>
      <Content style={{ padding: '32px', background: 'transparent' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', marginBottom: 8, fontWeight: 300 }}>
            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'there'}! 👋
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Welcome back.
          </Text>

        </div>
        
      </Content>
      {/* Only render EMI payment if selectedEmiOrder is defined */}
     
    </Layout>
  );
};

export default Home;