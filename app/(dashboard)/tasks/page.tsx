"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import DataTable, { type Column } from "../../components/DataTable";
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
} from "../../services/api";
import type { RootState } from "../../store/store";
import type { Task } from "../../types/task";
import { TASK_PRIORITIES, TASK_STATUSES } from "../../types/task";
import { decodeToken } from "../../utils/jwt";

function statusLabel(status: number) {
  return TASK_STATUSES.find((item) => item.value === status)?.label ?? "Todo";
}

function priorityLabel(priority: number) {
  return (
    TASK_PRIORITIES.find((item) => item.value === priority)?.label ?? "Medium"
  );
}

export default function TasksPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = token ? decodeToken(token) : null;
  const role = currentUser?.role ?? null;
  const canSeeAllTasks = role === "Admin" || role === "Manager";

  const { data: tasks = [], isLoading, error } = useGetTasksQuery(undefined, {
    skip: !token,
  });
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      await deleteTask({ taskId: task.id, projectId: task.projectId }).unwrap();
    } catch {
      window.alert("Could not delete task. Please try again.");
    }
  };

  const columns: Column<Task>[] = [
    {
      header: "Task",
      cell: (task) => <span className="font-medium">{task.title}</span>,
    },
    {
      header: "Project",
      cell: (task) => (
        <Link
          href={`/projects/${task.projectId}`}
          className="text-(--primary) hover:underline"
        >
          {task.projectName}
        </Link>
      ),
    },
    {
      header: "Assignee",
      className: "whitespace-nowrap text-(--text-secondary)",
      cell: (task) => task.assigneeName,
    },
    {
      header: "Stage",
      className: "whitespace-nowrap text-(--text-secondary)",
      cell: (task) => task.stageName,
    },
    {
      header: "Status",
      className: "whitespace-nowrap",
      cell: (task) => statusLabel(task.status),
    },
    {
      header: "Priority",
      className: "whitespace-nowrap",
      cell: (task) => priorityLabel(task.priority),
    },
    {
      header: "Updated",
      className: "whitespace-nowrap text-(--text-secondary)",
      cell: (task) => new Date(task.updatedAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (task) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDelete(task);
          }}
          disabled={isDeleting}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Tasks</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">
            {canSeeAllTasks
              ? "Showing all tasks across projects."
              : "Showing tasks assigned to you."}
          </p>
        </div>
        <Link
          href="/projects"
          className="rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark)"
        >
          Open Projects
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Tasks could not be loaded. Make sure the backend is running.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-(--card-background)">
          <DataTable
            columns={columns}
            data={tasks}
            getRowKey={(task) => task.id}
            isLoading={isLoading}
            loadingText="Loading tasks..."
            emptyTitle="No tasks found"
            emptyMessage="Create a task from a project kanban board."
            onRowClick={(task) => router.push(`/projects/${task.projectId}`)}
          />
        </div>
      )}
    </section>
  );
}
