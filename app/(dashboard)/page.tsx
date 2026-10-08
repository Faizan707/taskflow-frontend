"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DataTable, { type Column } from "../components/DataTable";
import { useGetDashboardQuery } from "../services/api";
import type { RootState } from "../store/store";
import type { Task } from "../types/task";
import { TASK_PRIORITIES, TASK_STATUSES } from "../types/task";
import { decodeToken } from "../utils/jwt";

const STATUS_COLORS = ["#94a3b8", "#6366f1", "#22c55e", "#ef4444"];
const PRIORITY_COLORS = ["#94a3b8", "#0ea5e9", "#f97316", "#dc2626"];

function statusLabel(status: number) {
  return TASK_STATUSES.find((item) => item.value === status)?.label ?? "Todo";
}

function priorityLabel(priority: number) {
  return (
    TASK_PRIORITIES.find((item) => item.value === priority)?.label ?? "Medium"
  );
}

export default function DashboardPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = token ? decodeToken(token) : null;

  const { data, isLoading, error } = useGetDashboardQuery(undefined, {
    skip: !token,
  });

  const statusChartData = useMemo(
    () =>
      data
        ? [
            { name: "Todo", value: data.todoCount },
            { name: "In Progress", value: data.inProgressCount },
            { name: "Done", value: data.doneCount },
            { name: "Blocked", value: data.blockedCount },
          ]
        : [],
    [data]
  );

  const priorityChartData = useMemo(
    () =>
      data
        ? [
            { name: "Low", value: data.lowPriorityCount },
            { name: "Medium", value: data.mediumPriorityCount },
            { name: "High", value: data.highPriorityCount },
            { name: "Critical", value: data.criticalPriorityCount },
          ]
        : [],
    [data]
  );

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
      cell: (task) => task.assigneeName,
    },
    {
      header: "Stage",
      cell: (task) => task.stageName,
    },
    {
      header: "Status",
      cell: (task) => statusLabel(task.status),
    },
    {
      header: "Priority",
      cell: (task) => priorityLabel(task.priority),
    },
  ];

  const stats = [
    {
      label: "Projects",
      value: data?.totalProjects ?? 0,
      href: "/projects",
    },
    {
      label: "Total Tasks",
      value: data?.totalTasks ?? 0,
    },
    {
      label: "In Progress",
      value: data?.inProgressCount ?? 0,
    },
    {
      label: "Done",
      value: data?.doneCount ?? 0,
    },
    {
      label: "Todo",
      value: data?.todoCount ?? 0,
    },
    {
      label: "High / Critical",
      value:
        (data?.highPriorityCount ?? 0) + (data?.criticalPriorityCount ?? 0),
    },
    ...(data?.totalUsers != null
      ? [
          {
            label: "Users",
            value: data.totalUsers,
            href: "/users",
          },
        ]
      : []),
  ];

  const hasChartData = (data?.totalTasks ?? 0) > 0;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Dashboard</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">
            {user?.name
              ? `Welcome back, ${user.name}. Here is your work overview.`
              : "Overview of your projects and tasks."}
          </p>
        </div>
        <Link
          href="/projects"
          className="rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark)"
        >
          View Projects
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Dashboard could not be loaded. Make sure the backend is running.
        </div>
      ) : isLoading || !data ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-(--card-background) p-8 text-center text-sm text-(--text-secondary)">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stats.map((stat) => {
              const content = (
                <>
                  <p className="text-sm text-(--text-secondary)">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-(--text-primary)">
                    {stat.value}
                  </p>
                </>
              );

              if (stat.href) {
                return (
                  <Link
                    key={stat.label}
                    href={stat.href}
                    className="rounded-xl border border-gray-200 bg-(--card-background) p-5 transition hover:border-(--primary)/40 hover:shadow-sm"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-200 bg-(--card-background) p-5"
                >
                  {content}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-(--card-background) p-5">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                Tasks by Status
              </h2>
              <p className="mt-1 text-xs text-(--text-secondary)">
                Distribution across Todo, In Progress, Done, and Blocked
              </p>
              {hasChartData ? (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-10 text-center text-sm text-(--text-secondary)">
                  No task data to chart yet.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-(--card-background) p-5">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                Tasks by Priority
              </h2>
              <p className="mt-1 text-xs text-(--text-secondary)">
                Count of Low, Medium, High, and Critical tasks
              </p>
              {hasChartData ? (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {priorityChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              PRIORITY_COLORS[index % PRIORITY_COLORS.length]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-10 text-center text-sm text-(--text-secondary)">
                  No task data to chart yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                Recent Tasks
              </h2>
              <p className="text-xs text-(--text-secondary)">
                {data.blockedCount} blocked · {data.todoCount} todo
              </p>
            </div>

            {data.recentTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-(--card-background) p-8 text-center text-sm text-(--text-secondary)">
                No tasks yet. Create a project and add your first task.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-(--card-background)">
                <DataTable
                  columns={columns}
                  data={data.recentTasks}
                  getRowKey={(task) => task.id}
                />
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
