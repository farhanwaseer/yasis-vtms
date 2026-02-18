import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Designation", "Employee"],
  endpoints: (builder) => ({
    loginEmployee: builder.mutation({
      query: (credentials) => ({
        url: "/auth/employee/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getDesignations: builder.query({
      query: () => "/admin/designations",
      providesTags: (result) => {
        const items = result?.data?.items || [];
        return [
          { type: "Designation", id: "LIST" },
          ...items.map((item) => ({ type: "Designation", id: item._id })),
        ];
      },
    }),
    getPermissionKeys: builder.query({
      query: () => "/admin/permissions",
    }),
    createDesignation: builder.mutation({
      query: (payload) => ({
        url: "/admin/designations",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Designation", id: "LIST" }],
    }),
    updateDesignation: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/designations/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "Designation", id: "LIST" },
        { type: "Designation", id: args.id },
      ],
    }),
    deleteDesignation: builder.mutation({
      query: (id) => ({
        url: `/admin/designations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Designation", id: "LIST" }],
    }),
    getEmployees: builder.query({
      query: ({ page = 1, perPage = 20, q = "" } = {}) => ({
        url: "/admin/employees",
        params: {
          page,
          perPage,
          ...(q ? { q } : {}),
        },
      }),
      providesTags: (result) => {
        const items = result?.data?.items || [];
        return [
          { type: "Employee", id: "LIST" },
          ...items.map((item) => ({ type: "Employee", id: item._id })),
        ];
      },
    }),
    createEmployee: builder.mutation({
      query: (payload) => ({
        url: "/admin/employees",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/employees/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: args.id },
      ],
    }),
  }),
});

export const {
  useLoginEmployeeMutation,
  useGetDesignationsQuery,
  useGetPermissionKeysQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} = api;
