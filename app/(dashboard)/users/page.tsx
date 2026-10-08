"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import DataTable, { type Column } from "../../components/DataTable";
import { useGetUsersQuery, useUpdateUserRoleMutation } from "../../services/api";
import type { RootState } from "../../store/store";
import type { User, UserRole } from "../../types/user";
import { decodeToken } from "../../utils/jwt";

const roles: UserRole[] = ["User", "Manager", "Admin"];

const roleStyles: Record<string, string> = {
  Admin: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Manager: "border-sky-200 bg-sky-50 text-sky-700",
  User: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function UsersPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = token ? decodeToken(token) : null;
  const role = currentUser?.role ?? null;
  const currentUserId = currentUser ? Number(currentUser.userId) : 0;
  const isAdmin = role === "Admin";

  const { data: users = [], isLoading, error } = useGetUsersQuery(undefined, {
    skip: !token || !isAdmin,
  });
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token && !isAdmin) {
      router.replace("/");
    }
  }, [token, isAdmin, router]);

  const handleRoleChange = async (user: User, newRole: string) => {
    if (user.role === newRole) return;

    setMessage(null);
    setUpdatingUserId(user.id);

    try {
      await updateUserRole({ userId: user.id, role: newRole }).unwrap();
      setMessage(`${user.name}'s role updated to ${newRole}.`);
    } catch {
      setMessage("Could not update role. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const columns: Column<User>[] = [
    {
      header: "Name",
      cell: (user) => <span className="font-medium">{user.name}</span>,
    },
    {
      header: "Email",
      className: "text-(--text-secondary)",
      cell: (user) => user.email,
    },
    {
      header: "Role",
      cell: (user) =>
        user.id === currentUserId ? (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
              roleStyles[user.role] ?? roleStyles.User
            }`}
          >
            {user.role}
          </span>
        ) : (
          <div className="relative inline-flex min-w-32">
            <select
              value={user.role}
              disabled={updatingUserId === user.id}
              onChange={(event) => handleRoleChange(user, event.target.value)}
              className={`w-full appearance-none rounded-full border py-1.5 pl-3 pr-8 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-(--primary)/20 disabled:cursor-wait disabled:opacity-60 ${
                roleStyles[user.role] ?? roleStyles.User
              }`}
            >
              {roles.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-current opacity-60">
              ▾
            </span>
          </div>
        ),
    },
    {
      header: "Joined",
      className: "whitespace-nowrap text-(--text-secondary)",
      cell: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  if (!token || !isAdmin) {
    return (
      <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
        <p className="text-sm text-(--text-secondary)">Admin access only.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary)">Users</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          View users and update their roles.
        </p>
      </div>

      {message && (
        <p className="mt-4 text-sm text-(--text-secondary)">{message}</p>
      )}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Users could not be loaded. Make sure you are logged in as Admin.
        </div>
      ) : (
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={users}
            getRowKey={(user) => user.id}
            isLoading={isLoading}
            loadingText="Loading users..."
            emptyTitle="No users found"
            emptyMessage="Registered users will show up here."
          />
        </div>
      )}
    </section>
  );
}
