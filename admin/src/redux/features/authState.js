import { createSlice } from "@reduxjs/toolkit";

// Initial state for auth
const initialState = {
  email: "",
  role: "",
  isAuth: false,
};

// Auth state slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isAuth = !!action.payload;
    },
    clearUser: (state) => {
      state.email = "";
      state.role = "";
      state.isAuth = false;
    },
  },
});

// Export actions and reducer
export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
