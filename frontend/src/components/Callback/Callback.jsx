import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/constants';
import axios from 'axios';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/check-session`, { withCredentials: true });
        const data = response.data;

        if (data.authenticated && data.user) {
          // Do NOT store user in localStorage
          navigate('/home');
        } else {
          setError('Authentication failed');
          navigate('/');
        }
      } catch (err) {
        navigate('/');
      }
    };

    verifyAuth();
  }, [navigate]);

  if (error) return <div>Authentication failed. Redirecting...</div>;
  return <div>Authenticating...</div>;
};

export default Callback;

