import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    clearUser: (state) => {
      state.email = null;
      state.role = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;