import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config/constants';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
  try {
    const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
    const data = res.data;

    // Only consider it a valid user if essential fields exist
    if (data && data.displayName && data.email && data.role) {
      const safeUser = {
        displayName: data.displayName,
        email: data.email,
        role: data.role,
      };

      setUser(safeUser);

      console.log('User Session:', {
        name: safeUser.displayName,
        role: safeUser.role,
        loginTime: new Date().toLocaleString()
      });
    } else {
      // No valid user data
      setUser(null);
    }
  } catch (error) {
    console.error('Authentication Error:', error.message);
    setUser(null);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

