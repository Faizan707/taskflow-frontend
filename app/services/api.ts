import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  LoginForm,
  LoginResponse,
  RegisterForm,
  RegisterResponse,
} from "../types/auth";
import type { RootState } from "../store/store";
import type {
  Project,
  ProjectFormData,
  ProjectResponse,
} from "../types/project";
import type { UpdateRoleResponse, User } from "../types/user";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:7264/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Project", "User"],

  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterForm>({
      query: (user) => ({
        url: "/User/register",
        method: "POST",
        body: user,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginForm>({
      query: (credentials) => ({
        url: "/User/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getUsers: builder.query<User[], void>({
      query: () => "/User",
      providesTags: (users) =>
        users
          ? [
              ...users.map((user) => ({
                type: "User" as const,
                id: user.id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    updateUserRole: builder.mutation<
      UpdateRoleResponse,
      { userId: number; role: string }
    >({
      query: ({ userId, role }) => ({
        url: `/User/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
      ],
    }),
    getProjects: builder.query<Project[], void>({
      query: () => "/Project",
      providesTags: (projects) =>
        projects
          ? [
              ...projects.map((project) => ({
                type: "Project" as const,
                id: project.id,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),
    createProject: builder.mutation<ProjectResponse, ProjectFormData>({
      query: (project) => ({
        url: "/Project",
        method: "POST",
        body: project,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    updateProject: builder.mutation<
      ProjectResponse,
      { id: number; project: ProjectFormData }
    >({
      query: ({ id, project }) => ({
        url: `/Project/${id}`,
        method: "PUT",
        body: project,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),
    deleteProject: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/Project/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),
  }),
});
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = api;
