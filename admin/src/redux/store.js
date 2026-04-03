import { configureStore } from "@reduxjs/toolkit";
import { indexSlice } from "./features/indexSlice";

export const store = configureStore({
  reducer: {
    [indexSlice.reducerPath]: indexSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(indexSlice.middleware),
});