import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import adminProductReducer from './slices/adminProductSlice';
import wishlistReducer from './slices/wishlistSlice'; // <-- Add this line

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'] // Only persist auth and cart state
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(persistConfig, authReducer),
    cart: persistReducer(persistConfig, cartReducer),
    products: productReducer,
    orders: orderReducer,
    users: userReducer,
    adminProducts: adminProductReducer,
    wishlist: wishlistReducer // <-- Add this line
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);
