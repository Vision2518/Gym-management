//indexslice
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_DEV_BACKEND_URL,
  credentials: "include",
});
export const indexSlice = createApi({
  baseQuery,
  tagTypes: ["auth", "province", "district", "branch", "manager", "vendor", "company"],
  endpoints: () => ({}),
});