"use client";

import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  isLoading?: boolean;
  loadingText?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  loadingText = "Loading...",
  emptyTitle = "No data found",
  emptyMessage = "There is nothing to show yet.",
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-(--card-background) p-8 text-center text-sm text-(--text-secondary)">
        {loadingText}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-(--card-background) p-8 text-center">
        <h2 className="text-lg font-semibold text-(--text-primary)">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-(--text-secondary)">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-(--card-background)">
      <table className="w-full min-w-150 text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-(--text-secondary)">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={`px-5 py-4 font-semibold ${column.headerClassName ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={`text-(--text-primary) ${
                onRowClick
                  ? "cursor-pointer transition hover:bg-gray-50"
                  : ""
              }`}
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={`px-5 py-4 ${column.className ?? ""}`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
