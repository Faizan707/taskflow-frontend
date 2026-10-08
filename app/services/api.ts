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
import type { Assignee, UpdateRoleResponse, User } from "../types/user";
import type {
  KanbanStage,
  KanbanStageFormData,
  KanbanStageResponse,
} from "../types/kanban";
import type {
  TaskFormData,
  TaskResponse,
  TaskUpdateData,
} from "../types/task";
import type { DashboardSummary } from "../types/dashboard";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Project", "User", "KanbanStage", "Task", "Dashboard"],

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
    getDashboard: builder.query<DashboardSummary, void>({
      query: () => "/Dashboard",
      providesTags: [{ type: "Dashboard", id: "SUMMARY" }],
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
    getAssignees: builder.query<Assignee[], void>({
      query: () => "/User/assignees",
      providesTags: [{ type: "User", id: "ASSIGNEES" }],
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
    getProjects: builder.query<Project[], string>({
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
      invalidatesTags: [
        { type: "Project", id: "LIST" },
        { type: "Dashboard", id: "SUMMARY" },
      ],
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
        { type: "Dashboard", id: "SUMMARY" },
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
        { type: "Dashboard", id: "SUMMARY" },
      ],
    }),
    getProjectStages: builder.query<KanbanStage[], number>({
      query: (projectId) => `/KanbanStage/project/${projectId}`,
      providesTags: (_result, _error, projectId) => [
        { type: "KanbanStage", id: projectId },
        { type: "Task", id: `PROJECT-${projectId}` },
      ],
    }),
    createKanbanStage: builder.mutation<
      KanbanStageResponse,
      KanbanStageFormData
    >({
      query: (stage) => ({
        url: "/KanbanStage",
        method: "POST",
        body: stage,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "KanbanStage", id: projectId },
      ],
    }),
    createTask: builder.mutation<TaskResponse, TaskFormData>({
      query: (task) => ({
        url: "/Task",
        method: "POST",
        body: task,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "KanbanStage", id: projectId },
        { type: "Task", id: `PROJECT-${projectId}` },
        { type: "Dashboard", id: "SUMMARY" },
      ],
    }),
    updateTask: builder.mutation<
      TaskResponse,
      { taskId: number; projectId: number; task: TaskUpdateData }
    >({
      query: ({ taskId, task }) => ({
        url: `/Task/${taskId}`,
        method: "PUT",
        body: task,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "KanbanStage", id: projectId },
        { type: "Task", id: `PROJECT-${projectId}` },
        { type: "Dashboard", id: "SUMMARY" },
      ],
    }),
    moveTask: builder.mutation<
      TaskResponse,
      { taskId: number; projectId: number; stageId: number }
    >({
      query: ({ taskId, stageId }) => ({
        url: `/Task/${taskId}/move`,
        method: "PUT",
        body: { stageId },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "KanbanStage", id: projectId },
        { type: "Task", id: `PROJECT-${projectId}` },
        { type: "Dashboard", id: "SUMMARY" },
      ],
    }),
    deleteTask: builder.mutation<
      { message: string },
      { taskId: number; projectId: number }
    >({
      query: ({ taskId }) => ({
        url: `/Task/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "KanbanStage", id: projectId },
        { type: "Task", id: `PROJECT-${projectId}` },
        { type: "Dashboard", id: "SUMMARY" },
      ],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetDashboardQuery,
  useGetUsersQuery,
  useGetAssigneesQuery,
  useUpdateUserRoleMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectStagesQuery,
  useCreateKanbanStageMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useDeleteTaskMutation,
} = api;
