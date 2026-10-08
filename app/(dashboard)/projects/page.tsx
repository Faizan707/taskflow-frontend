"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import DataTable, { type Column } from "../../components/DataTable";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from "../../services/api";
import type { RootState } from "../../store/store";
import type { Project } from "../../types/project";
import { decodeToken } from "../../utils/jwt";

const emptyProject = { name: "", description: "" };

export default function ProjectsPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = token ? decodeToken(token) : null;
  const role = currentUser?.role ?? null;
  const userId = currentUser?.userId ?? "";
  const canSeeAllProjects = role === "Admin" || role === "Manager";
  const { data: projects = [], isLoading, error } = useGetProjectsQuery(userId, {
    skip: !token || !userId,
  });
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [form, setForm] = useState(emptyProject);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProject(null);
    setForm(emptyProject);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    try {
      if (editingProject) {
        await updateProject({ id: editingProject.id, project: form }).unwrap();
        setMessage("Project updated successfully.");
      } else {
        await createProject(form).unwrap();
        setMessage("Project created successfully.");
      }

      closeDrawer();
    } catch {
      setMessage("Could not save the project. Please try again.");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setForm({ name: project.name, description: project.description ?? "" });
    setMessage(null);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.name}"?`)) return;

    setMessage(null);

    try {
      await deleteProject(project.id).unwrap();
      setMessage("Project deleted successfully.");
    } catch {
      setMessage("Could not delete the project. Please try again.");
    }
  };

  const columns: Column<Project>[] = [
    {
      header: "Project",
      cell: (project) => <span className="font-medium">{project.name}</span>,
    },
    {
      header: "Created By",
      className: "whitespace-nowrap text-(--text-secondary)",
      cell: (project) => project.createdBy || "—",
    },
    {
      header: "Description",
      className: "max-w-100 truncate text-(--text-secondary)",
      cell: (project) => project.description || "—",
    },
    {
      header: "Updated",
      className: "whitespace-nowrap text-(--text-secondary)",
      cell: (project) => new Date(project.updatedAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "whitespace-nowrap text-right",
      cell: (project) => (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(project);
            }}
            className="mr-3 font-medium text-(--primary) hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(project);
            }}
            disabled={isDeleting}
            className="font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Projects</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">
            {canSeeAllProjects
              ? "Showing all projects from every user."
              : "Showing only projects you created."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyProject);
            setEditingProject(null);
            setMessage(null);
            setIsDrawerOpen(true);
          }}
          className="rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark)"
        >
          Add Project
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-(--text-secondary)">{message}</p>
      )}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Projects could not be loaded. Please make sure the backend is running
          and you are logged in.
        </div>
      ) : (
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={projects}
            getRowKey={(project) => project.id}
            isLoading={isLoading}
            loadingText="Loading projects..."
            emptyTitle="No projects yet"
            emptyMessage="Create your first project using the Add Project button."
            onRowClick={(project) => router.push(`/projects/${project.id}`)}
          />
        </div>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close project form"
            onClick={closeDrawer}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-(--card-background) p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
              <div>
                <h2 className="text-xl font-bold text-(--text-primary)">
                  {editingProject ? "Edit Project" : "Add Project"}
                </h2>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  {editingProject
                    ? "Update your project details."
                    : "Add a new project to your workspace."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-md px-2 py-1 text-xl text-(--text-secondary) hover:bg-gray-100"
                aria-label="Close drawer"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="project-name" className="text-sm font-medium text-(--text-primary)">
                  Project name
                </label>
                <input
                  id="project-name"
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Website redesign"
                  className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="project-description" className="text-sm font-medium text-(--text-primary)">
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="What is this project about?"
                  rows={5}
                  className="resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
                />
              </div>
              <div className="mt-auto flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-(--text-primary)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark) disabled:opacity-60"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editingProject
                      ? "Update Project"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </section>
  );
}
