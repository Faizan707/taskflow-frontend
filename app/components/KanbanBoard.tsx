"use client";

import { DragEvent, useState } from "react";
import type { KanbanStage } from "../types/kanban";
import type { Task } from "../types/task";
import { TASK_PRIORITIES } from "../types/task";

interface KanbanBoardProps {
  stages: KanbanStage[];
  onAddTask: (stage: KanbanStage) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (task: Task, stageId: number) => void;
}

function priorityLabel(priority: number) {
  return TASK_PRIORITIES.find((item) => item.value === priority)?.label ?? "Medium";
}

function priorityClass(priority: number) {
  if (priority >= 4) return "bg-red-50 text-red-700 border-red-200";
  if (priority === 3) return "bg-orange-50 text-orange-700 border-orange-200";
  if (priority === 2) return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export default function KanbanBoard({
  stages,
  onAddTask,
  onDeleteTask,
  onMoveTask,
}: KanbanBoardProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<number | null>(null);

  const handleDragStart = (event: DragEvent<HTMLElement>, task: Task) => {
    event.dataTransfer.setData("text/plain", String(task.id));
    event.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverStageId(null);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, stageId: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverStageId(stageId);
  };

  const handleDragLeave = (stageId: number) => {
    setDragOverStageId((current) => (current === stageId ? null : current));
  };

  const handleDrop = (event: DragEvent<HTMLElement>, stage: KanbanStage) => {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData("text/plain"));
    const task = stages
      .flatMap((item) => item.tasks)
      .find((item) => item.id === taskId);

    setDraggingTaskId(null);
    setDragOverStageId(null);

    if (!task || task.stageId === stage.id) return;

    onMoveTask(task, stage.id);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <section
          key={stage.id}
          onDragOver={(event) => handleDragOver(event, stage.id)}
          onDragLeave={() => handleDragLeave(stage.id)}
          onDrop={(event) => handleDrop(event, stage)}
          className={`flex w-72 shrink-0 flex-col rounded-xl border bg-gray-50 transition ${
            dragOverStageId === stage.id
              ? "border-(--primary) bg-(--primary)/5"
              : "border-gray-200"
          }`}
        >
          <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-(--text-primary)">
                {stage.name}
              </h2>
              <p className="text-xs text-(--text-secondary)">
                {stage.tasks.length} task{stage.tasks.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddTask(stage)}
              className="rounded-md px-2 py-1 text-lg font-medium text-(--primary) hover:bg-white"
              title={`Add task to ${stage.name}`}
            >
              +
            </button>
          </header>

          <div className="flex flex-1 flex-col gap-3 p-3">
            {stage.tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-6 text-center text-xs text-(--text-secondary)">
                Drop tasks here
              </p>
            ) : (
              stage.tasks.map((task) => (
                <article
                  key={task.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, task)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm active:cursor-grabbing ${
                    draggingTaskId === task.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-(--text-primary)">
                      {task.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  {task.description && (
                    <p className="mt-2 line-clamp-3 text-xs text-(--text-secondary)">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityClass(
                        task.priority
                      )}`}
                    >
                      {priorityLabel(task.priority)}
                    </span>
                    <span className="text-[11px] text-(--text-secondary)">
                      {task.assigneeName}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
