import { indexSlice } from "./indexSlice";

export const authAPIs = indexSlice.injectEndpoints({
  endpoints: (builder) => ({
    vendorLogin: builder.mutation({
      query: (data) => ({ url: "/vendor/login", method: "POST", body: data }),
      invalidatesTags: ["auth"],
    }),
    signout: builder.mutation({
      query: () => ({ url: "/auth/signout", method: "POST" }),
      invalidatesTags: ["auth"],
    }),
    getVendorStats: builder.query({
      query: () => ({ url: "/vendor/stats" }),
      providesTags: ["auth"],
    }),

    // Plans
    getPlansByCompany: builder.query({
      query: () => ({ url: "/vendor/getplan-company" }),
      providesTags: ["plans"],
    }),
    addPlan: builder.mutation({
      query: (data) => ({ url: "/vendor/addplan", method: "POST", body: data }),
      invalidatesTags: ["plans"],
    }),
    updatePlan: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/vendor/updateplan/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["plans"],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({ url: `/vendor/deleteplan/${id}`, method: "DELETE" }),
      invalidatesTags: ["plans"],
    }),

    // Members
    getMembersByCompany: builder.query({
      query: () => ({ url: "/member/getmemberbycompany" }),
      providesTags: ["members"],
    }),
    addMember: builder.mutation({
      query: (data) => ({ url: "/member/add-member", method: "POST", body: data }),
      invalidatesTags: ["members"],
    }),
    updateMember: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/member/updatemember/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["members"],
    }),
    deleteMember: builder.mutation({
      query: (id) => ({ url: `/member/deletemember/${id}`, method: "DELETE" }),
      invalidatesTags: ["members"],
    }),

    // Schedules
    getSchedulesByCompany: builder.query({
      query: () => ({ url: "/member/getschedulebycompany/" }),
      providesTags: ["schedules"],
    }),
    addSchedule: builder.mutation({
      query: (data) => ({ url: "/member/addschedule", method: "POST", body: data }),
      invalidatesTags: ["schedules"],
    }),
    updateSchedule: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/member/updateschedule/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["schedules"],
    }),
    deleteSchedule: builder.mutation({
      query: (id) => ({ url: `/member/deleteschedule/${id}`, method: "DELETE" }),
      invalidatesTags: ["schedules"],
    }),

    // Payments
    getAllPayments: builder.query({
      query: ({ page = 1, limit = 10, filter = "all", search = "" } = {}) => ({
        url: "/payment/getpayments",
        params: { page, limit, filter, search },
      }),
      providesTags: ["payments"],
    }),
    addPayment: builder.mutation({
      query: (data) => ({ url: "/payment/addpayment", method: "POST", body: data }),
      invalidatesTags: ["payments"],
    }),
    updatePayment: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/payment/updatepayment/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["payments"],
    }),
    deletePayment: builder.mutation({
      query: (id) => ({ url: `/payment/deletepayment/${id}`, method: "DELETE" }),
      invalidatesTags: ["payments"],
    }),
    getPaymentHistory: builder.query({
      query: (member_id) => ({ url: `/payment/history/${member_id}` }),
      providesTags: ["payments"],
    }),
  }),
});

export const {
  useVendorLoginMutation,
  useSignoutMutation,
  useGetVendorStatsQuery,
  useGetPlansByCompanyQuery,
  useAddPlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useGetMembersByCompanyQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useGetSchedulesByCompanyQuery,
  useAddScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetAllPaymentsQuery,
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useGetPaymentHistoryQuery,
} = authAPIs;
