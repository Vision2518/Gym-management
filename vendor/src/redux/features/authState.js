import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: null,
  role: null,
  username: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.username = action.payload.username || null;
    },
    clearUser: (state) => {
      state.email = null;
      state.role = null;
      state.username = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;