import { configureStore } from "@reduxjs/toolkit";
import { indexSlice } from "./features/indexSlice";
import authReducer from "./features/authState"; // Import the auth reducer

export const store = configureStore({
  reducer: {
    [indexSlice.reducerPath]: indexSlice.reducer,
    auth: authReducer, // Add auth state reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(indexSlice.middleware),
});
