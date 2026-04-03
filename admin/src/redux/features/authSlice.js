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
      //providetag when query and get
    }),
    signout: builder.mutation({
        query: () => ({
          url: "/auth/signout",
          method: "POST",
        }),
        invalidatesTags: ["auth"],
      }),
      verifyToken:builder.query({
        query:()=>({
          url:"/auth/verify-token",
          method:"GET",
        }),
        invalidatesTags:["auth"],
      }) 

  }),
});
export const { useLoginMutation,useSignoutMutation,useVerifyTokenQuery} = authAPIs;