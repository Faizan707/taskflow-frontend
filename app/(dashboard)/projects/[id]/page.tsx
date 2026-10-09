"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import KanbanBoard from "../../../components/KanbanBoard";
import {
  useCreateKanbanStageMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAssigneesQuery,
  useGetProjectStagesQuery,
  useGetProjectsQuery,
  useMoveTaskMutation,
  useUpdateTaskMutation,
} from "../../../services/api";
import type { RootState } from "../../../store/store";
import type { KanbanStage } from "../../../types/kanban";
import type { Task, TaskPriority, TaskStatus } from "../../../types/task";
import { TASK_PRIORITIES } from "../../../types/task";
import { decodeToken } from "../../../utils/jwt";

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = token ? decodeToken(token) : null;
  const userId = currentUser?.userId ?? "";
  const currentUserId = currentUser ? Number(currentUser.userId) : 0;

  const { data: projects = [] } = useGetProjectsQuery(userId, {
    skip: !token || !userId,
  });
  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projects, projectId]
  );

  const {
    data: stages = [],
    isLoading,
    error,
  } = useGetProjectStagesQuery(projectId, {
    skip: !token || !projectId,
  });

  const { data: assignees = [] } = useGetAssigneesQuery(undefined, {
    skip: !token,
  });

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [createStage, { isLoading: isCreatingStage }] =
    useCreateKanbanStageMutation();
  const [moveTask] = useMoveTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [selectedStage, setSelectedStage] = useState<KanbanStage | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: 2 as TaskPriority,
    assigneeId: currentUserId,
    stageId: 0,
    status: 1 as TaskStatus,
  });
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageName, setStageName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const openTaskDrawer = (stage: KanbanStage) => {
    setEditingTask(null);
    setSelectedStage(stage);
    setTaskForm({
      title: "",
      description: "",
      priority: 2,
      assigneeId: currentUserId,
      stageId: stage.id,
      status: 1,
    });
    setMessage(null);
    setIsTaskDrawerOpen(true);
  };

  const openEditTaskDrawer = (task: Task) => {
    const stage =
      stages.find((item) => item.id === task.stageId) ?? stages[0] ?? null;
    setEditingTask(task);
    setSelectedStage(stage);
    setTaskForm({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      assigneeId: task.assigneeId,
      stageId: task.stageId,
      status: task.status,
    });
    setMessage(null);
    setIsTaskDrawerOpen(true);
  };

  const closeTaskDrawer = () => {
    setIsTaskDrawerOpen(false);
    setSelectedStage(null);
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      priority: 2,
      assigneeId: currentUserId,
      stageId: 0,
      status: 1,
    });
  };

  const handleSaveTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const stageId = editingTask ? taskForm.stageId : selectedStage?.id;
    if (!stageId) return;

    setMessage(null);

    try {
      if (editingTask) {
        await updateTask({
          taskId: editingTask.id,
          projectId,
          task: {
            title: taskForm.title,
            description: taskForm.description,
            stageId,
            assigneeId: taskForm.assigneeId,
            priority: taskForm.priority,
            status: taskForm.status,
          },
        }).unwrap();
        setMessage("Task updated successfully.");
      } else {
        await createTask({
          title: taskForm.title,
          description: taskForm.description,
          projectId,
          stageId,
          assigneeId: taskForm.assigneeId,
          priority: taskForm.priority,
        }).unwrap();
        setMessage("Task created successfully.");
      }
      closeTaskDrawer();
    } catch {
      setMessage(
        editingTask
          ? "Could not update task. Please try again."
          : "Could not create task. Please try again."
      );
    }
  };

  const handleCreateStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    try {
      await createStage({ name: stageName, projectId }).unwrap();
      setStageName("");
      setIsStageModalOpen(false);
      setMessage("Kanban stage created successfully.");
    } catch {
      setMessage("Could not create stage. Please try again.");
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setMessage(null);

    try {
      await deleteTask({ taskId: task.id, projectId }).unwrap();
      setMessage("Task deleted successfully.");
    } catch {
      setMessage("Could not delete task. Please try again.");
    }
  };

  const handleMoveTask = async (task: Task, stageId: number) => {
    setMessage(null);

    try {
      await moveTask({ taskId: task.id, projectId, stageId }).unwrap();
    } catch {
      setMessage("Could not move task. Please try again.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-[90rem] px-6 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="text-sm font-medium text-(--primary) hover:underline"
          >
            ← Back to projects
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-(--text-primary)">
            {project?.name ?? `Project #${projectId}`}
          </h1>
          <p className="mt-2 text-sm text-(--text-secondary)">
            {project?.description ||
              "Manage tasks on the kanban board for this project."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setStageName("");
              setIsStageModalOpen(true);
              setMessage(null);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-(--text-primary) transition hover:bg-gray-50"
          >
            Add Stage
          </button>
          <button
            type="button"
            onClick={() => {
              if (stages[0]) openTaskDrawer(stages[0]);
            }}
            disabled={!stages.length}
            className="rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark) disabled:opacity-60"
          >
            Add Task
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm text-(--text-secondary)">{message}</p>
      )}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Kanban board could not be loaded. Make sure the backend is running.
        </div>
      ) : isLoading ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-(--card-background) p-8 text-center text-sm text-(--text-secondary)">
          Loading kanban board...
        </div>
      ) : (
        <div className="mt-6">
          <KanbanBoard
            stages={stages}
            onAddTask={openTaskDrawer}
            onEditTask={openEditTaskDrawer}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
          />
        </div>
      )}

      {isTaskDrawerOpen && (editingTask || selectedStage) && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close task form"
            onClick={closeTaskDrawer}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden bg-(--card-background) shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-6 pb-5 pt-6">
              <div>
                <h2 className="text-xl font-bold text-(--text-primary)">
                  {editingTask ? "Edit Task" : "Add Task"}
                </h2>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  {editingTask
                    ? "Update details, stage, or assignee."
                    : `Creating in stage: ${selectedStage?.name}`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTaskDrawer}
                className="rounded-md px-2 py-1 text-xl text-(--text-secondary) hover:bg-gray-100"
              >
                x
              </button>
            </div>

            <form
              onSubmit={handleSaveTask}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="task-title"
                    className="text-sm font-medium text-(--text-primary)"
                  >
                    Title
                  </label>
                  <input
                    id="task-title"
                    required
                    value={taskForm.title}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, title: event.target.value })
                    }
                    placeholder="e.g. Design login page"
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="task-description"
                    className="text-sm font-medium text-(--text-primary)"
                  >
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    value={taskForm.description}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        description: event.target.value,
                      })
                    }
                    rows={4}
                    placeholder="What needs to be done?"
                    className="resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
                  />
                </div>
                {editingTask && (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="task-stage"
                      className="text-sm font-medium text-(--text-primary)"
                    >
                      Stage
                    </label>
                    <select
                      id="task-stage"
                      required
                      value={taskForm.stageId || ""}
                      onChange={(event) =>
                        setTaskForm({
                          ...taskForm,
                          stageId: Number(event.target.value),
                        })
                      }
                      className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
                    >
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="task-assignee"
                    className="text-sm font-medium text-(--text-primary)"
                  >
                    Assignee
                  </label>
                  <select
                    id="task-assignee"
                    required
                    value={taskForm.assigneeId || ""}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        assigneeId: Number(event.target.value),
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
                  >
                    <option value="" disabled>
                      Select a user
                    </option>
                    {assignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="task-priority"
                    className="text-sm font-medium text-(--text-primary)"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={taskForm.priority}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        priority: Number(event.target.value) as TaskPriority,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-(--card-background) px-6 py-5">
                <button
                  type="button"
                  onClick={closeTaskDrawer}
                  className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-(--text-primary)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask || isUpdatingTask}
                  className="rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark) disabled:opacity-60"
                >
                  {editingTask
                    ? isUpdatingTask
                      ? "Saving..."
                      : "Save Changes"
                    : isCreatingTask
                      ? "Creating..."
                      : "Create Task"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {isStageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close stage form"
            onClick={() => setIsStageModalOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <div className="relative w-full max-w-md rounded-xl bg-(--card-background) p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-(--text-primary)">
              Add Kanban Stage
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Create a new column for this board.
            </p>
            <form onSubmit={handleCreateStage} className="mt-5 flex flex-col gap-4">
              <input
                required
                value={stageName}
                onChange={(event) => setStageName(event.target.value)}
                placeholder="e.g. Review"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-(--text-primary)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStage}
                  className="rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark) disabled:opacity-60"
                >
                  {isCreatingStage ? "Creating..." : "Create Stage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
