import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector(state => state.auth);

  // Fetch user from slice (calls backend if needed)
  const fetchUser = async () => {
    await dispatch(checkAuth());
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      setUser: () => {}, // Not needed, but for compatibility
      loading,
      fetchUser,
      isAuthenticated
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);


