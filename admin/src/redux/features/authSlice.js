//auth slice
import { indexSlice } from "./indexSlice";

export const authAPIs = indexSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
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
      query: () => ({ url: "/auth/stats", method: "GET" }),
      providesTags: ["auth"],
    }),
    getVendors: builder.query({
      query: () => ({ url: "/auth/getvendor", method: "GET" }),
      providesTags: ["vendor"],
    }),
    getCompanies: builder.query({
      query: () => ({ url: "/auth/getcompany", method: "GET" }),
      providesTags: ["company"],
    }),
    addVendor: builder.mutation({
      query: (data) => ({ url: "/auth/addvendor", method: "POST", body: data }),
      invalidatesTags: ["vendor"],
    }),
    updateVendor: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/auth/updatevendor/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["vendor"],
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({ url: `/auth/deletevendor/${id}`, method: "DELETE" }),
      invalidatesTags: ["vendor"],
    }),
  }),
});
export const { useLoginMutation, useVendorLoginMutation, useSignoutMutation, useVerifyTokenQuery, useGetDashboardStatsQuery, useGetVendorsQuery, useGetCompaniesQuery, useAddVendorMutation, useUpdateVendorMutation, useDeleteVendorMutation } =
  authAPIs;
