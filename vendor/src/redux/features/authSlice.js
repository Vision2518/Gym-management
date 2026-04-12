//auth slice
import { indexSlice } from "./indexSlice";

export const authAPIs = indexSlice.injectEndpoints({
  endpoints: (builder) => ({
    vendorLogin: builder.mutation({
      query: (data) => ({
        url: "/vendor/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    signout: builder.mutation({
      query: () => ({
        url: "/auth/signout",
        method: "POST",
      }),
      invalidatesTags: ["auth"],
    }),
    verifyToken: builder.query({
      query: () => ({
        url: "/auth/verify-token",
        method: "GET",
      }),
      providesTags: ["auth"],
    }),
    getDashboardStats: builder.query({
      query: () => ({ url: "/vendor/stats", method: "GET" }),
      providesTags: ["auth"],
    }),
    getVendorProfile: builder.query({
      query: () => ({ url: "/vendor/profile", method: "GET" }),
      providesTags: ["vendor-profile"],
    }),
    updateVendorProfile: builder.mutation({
      query: (data) => ({ url: "/vendor/profile", method: "PATCH", body: data }),
      invalidatesTags: ["vendor-profile"],
    }),
  }),
});

export const {
  useVendorLoginMutation,
  useSignoutMutation,
  useVerifyTokenQuery,
  useGetDashboardStatsQuery,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
} = authAPIs;