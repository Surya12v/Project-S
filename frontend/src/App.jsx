import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Spin, Button, Badge } from "antd";
import { BellOutlined } from '@ant-design/icons';
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
import Wishlist from "./pages/Wishlist/Wishlist";
import Account from "./pages/Account/Account";
import { UserProvider } from './contexts/UserContext';
import AdminUsers from "./pages/Admin/Users/AdminUsers";
import UserDetails from "./pages/Admin/Users/UserDetails";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import EmiOrderPayment from "./components/Emi/EmiOrderPayment";
import NotificationCenter from "./components/Notification/NotificationCenter";
import { useSelector, useDispatch } from "react-redux";
import { markRead, clearNotifications } from "./store/slices/notificationSlice";
import AdminEmiPanel from "./pages/Admin/Emi/AdminEmiPanel";
import OrderSummary from "./pages/Orders/OrderSummary";

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
  const [notifVisible, setNotifVisible] = React.useState(false);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <UserProvider>
            <ReduxApp notifVisible={notifVisible} setNotifVisible={setNotifVisible} />
          </UserProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

// Move all Redux hooks and NotificationCenter logic into a child component
function ReduxApp({ notifVisible, setNotifVisible }) {
  // Fix: handle undefined notifications state
  const notifications = useSelector(state => state.notifications?.items || []);
  const dispatch = useDispatch();

  // Fix: Only one <Routes> per <AnimatePresence>, and move /admin/emi route inside <Routes>
  return (
    <>
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
          <Route
            path="/emi/order-payment"
            element={
              <ProtectedRoute>
                <EmiOrderPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/emi"
            element={
              <AdminRoute>
                <AdminEmiPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/orders/summary/:orderId"
            element={
              <ProtectedRoute>
                <OrderSummary />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
      <Button
        type="primary"
        shape="circle"
        icon={<BellOutlined />}
        style={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000 }}
        onClick={() => setNotifVisible(v => !v)}
      >
        {notifications.some(n => !n.read) && <Badge dot />}
      </Button>
      {notifVisible && (
        <div style={{ position: "fixed", bottom: 80, right: 32, zIndex: 1001 }}>
          <NotificationCenter
            notifications={notifications}
            onMarkRead={id => dispatch(markRead(id))}
            onClear={() => dispatch(clearNotifications())}
          />
        </div>
      )}
    </>
  );
}

export default App;