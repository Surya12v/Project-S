import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Spin } from "antd";
import AuthPages from "./pages/AuthPages/AuthPages";
import Home from "./pages/Home/Home";
import Callback from "./components/Callback/Callback";
import { API_URL } from "./config/constants";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import Products from "./pages/Products/Products";
import AdminProducts from "./pages/Admin/Products/AdminProducts";
import Orders from "./pages/Orders/Orders";
import AdminOrders from "./pages/Admin/Orders/AdminOrders";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import ProductView from "./pages/ProductView/ProductView";
import MainLayout from "./components/Layout/MainLayout";
import Wishlist from "./pages/Wishlist/Wishlist";
import Account from "./pages/Account/Account";
import { UserProvider } from './contexts/UserContext';
import AdminUsers from "./pages/Admin/Users/AdminUsers";
import UserDetails from "./pages/Admin/Users/UserDetails";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import Dashboard from "./pages/Admin/Dashboard/Dashboard";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/check-session`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate('/', { replace: true });
        }
      } catch {
        setIsAuthenticated(false);
        navigate('/', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  return isAuthenticated ? children : null;
};

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  if (isAdmin === null) return null;
  return isAdmin ? children : <Navigate to="/home" />;
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <UserProvider>
            <MainLayout>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<AuthPages />} />
                  <Route path="/auth/callback" element={<Callback />} />
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <Products />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <AdminRoute>
                        <AdminProducts />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/product/:id" element={<ProductView />} />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users/:id"
                    element={
                      <AdminRoute>
                        <UserDetails />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminRoute>
                        <Dashboard />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </MainLayout>
          </UserProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

export default App;