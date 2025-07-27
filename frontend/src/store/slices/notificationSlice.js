import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: []
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
    },
    markRead: (state, action) => {
      const notif = state.items.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    clearNotifications: (state) => {
      state.items = [];
    }
  }
});

export const { addNotification, markRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
